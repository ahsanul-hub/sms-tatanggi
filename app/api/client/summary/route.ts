import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(
      searchParams.get("month") || `${dayjs().month() + 1}`
    ); // 1-12
    const year = parseInt(searchParams.get("year") || `${dayjs().year()}`);

    const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).startOf(
      "month"
    );
    const end = start.endOf("month");

    // Ambil SMS logs bulan tersebut
    const smsLogs = await prisma.smsLog.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: start.toDate(),
          lte: end.toDate(),
        },
      },
      select: { id: true, status: true, cost: true },
    });

    const totalSms = smsLogs.length;
    const totalSent = smsLogs.filter(
      (s) => s.status === "SENT" || s.status === "DELIVERED"
    ).length;
    const totalFailed = smsLogs.filter((s) => s.status === "FAILED").length;
    const totalCost = smsLogs.reduce((sum, s) => sum + (s.cost || 0), 0);

    // Ambil transaksi DEBIT bulan tersebut (tagihan) hanya sebagai referensi historis
    const billingAgg = await prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        type: "DEBIT",
        createdAt: { gte: start.toDate(), lte: end.toDate() },
      },
      _sum: { amount: true },
    });

    const billedFromTransactions = Math.abs(billingAgg._sum.amount || 0);

    // Billed utama mengikuti kebijakan: hanya SMS berhasil yang ditagih
    const billed = totalSent * 500;

    return NextResponse.json({
      period: {
        month,
        year,
        start: start.toISOString(),
        end: end.toISOString(),
      },
      totals: {
        sms: totalSms,
        sent: totalSent,
        failed: totalFailed,
        cost: totalCost,
        billed, // berdasar SMS SENT × 500
        billedFromTransactions, // informasi pembanding
      },
    });
  } catch (e) {
    console.error("Client summary error:", e);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
