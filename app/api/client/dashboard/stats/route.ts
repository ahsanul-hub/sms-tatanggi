import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const startOfMonth = dayjs().startOf("month").toDate();
    const endOfMonth = dayjs().endOf("month").toDate();

    // Get client statistics
    const [
      totalTransactions,
      totalSmsSent,
      pendingBills,
      totalSpentAgg,
      lastTransaction,
      sentThisMonth,
      paidThisMonthAgg,
    ] = await Promise.all([
      prisma.transaction.count({ where: { userId: session.user.id } }),
      prisma.smsLog.count({
        where: { userId: session.user.id, status: "SENT" },
      }),
      prisma.transaction.count({
        where: {
          userId: session.user.id,
          type: "DEBIT",
          status: "PENDING",
        },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: "DEBIT",
          status: "COMPLETED",
        },
        _sum: { amount: true },
      }),
      prisma.transaction.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.smsLog.count({
        where: {
          userId: session.user.id,
          status: { in: ["SENT", "DELIVERED"] },
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: "PAYMENT",
          status: "COMPLETED",
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    const billedThisMonth = sentThisMonth * 500; // kebijakan: hanya SMS berhasil
    const paidThisMonth = paidThisMonthAgg._sum.amount || 0;

    return NextResponse.json({
      totalTransactions,
      totalSmsSent,
      pendingBills,
      totalSpent: Math.abs(totalSpentAgg._sum.amount || 0),
      lastTransaction: lastTransaction?.createdAt || null,
      billedThisMonth,
      paidThisMonth,
    });
  } catch (error) {
    console.error("Client dashboard stats error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
