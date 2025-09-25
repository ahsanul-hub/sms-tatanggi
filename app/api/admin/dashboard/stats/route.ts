import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get dashboard statistics
    const [
      totalClients,
      totalTransactions,
      totalSmsSent,
      completedPaymentsSum, // total pembayaran yang sukses (CREDIT/COMPLETED)
      pendingTransactions,
      activeClients,
      allBillingSum, // total nilai tagihan (DEBIT) yang dibuat
    ] = await Promise.all([
      prisma.user.count({
        where: { role: "CLIENT" },
      }),
      prisma.transaction.count(),
      prisma.smsLog.count({
        where: { status: "SENT" },
      }),
      prisma.transaction.aggregate({
        where: {
          status: "COMPLETED",
          type: "PAYMENT", // pembayaran masuk (menambah saldo)
        },
        _sum: { amount: true },
      }),
      prisma.transaction.count({
        where: { status: "PENDING" },
      }),
      prisma.clientProfile.count({
        where: { isActive: true },
      }),
      prisma.transaction.aggregate({
        where: { type: "DEBIT" }, // tagihan dibuat (mengurangi saldo klien)
        _sum: { amount: true },
      }),
    ]);

    const totalPaid = completedPaymentsSum._sum.amount || 0;
    const totalRevenue = Math.abs(allBillingSum._sum.amount || 0);

    return NextResponse.json({
      totalClients,
      totalTransactions,
      totalSmsSent,
      totalRevenue,
      totalPaid,
      pendingTransactions,
      activeClients,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
