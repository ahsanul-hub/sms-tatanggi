import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      clientId,
      smsCount,
      timeRange = {
        startMinutes: 0, // Default: sekarang
        endMinutes: 20, // Default: 20 menit ke depan
      },
      failedPercentage = 0, // persentase gagal (0-100)
    } = body;

    if (!clientId || !smsCount || smsCount <= 0) {
      return NextResponse.json(
        { message: "Data tidak valid" },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      include: { clientProfile: true },
    });

    if (!client || client.role !== "CLIENT") {
      return NextResponse.json(
        { message: "Klien tidak ditemukan" },
        { status: 404 }
      );
    }

    // Calculate time range in minutes
    const now = new Date();
    const startDate = new Date(
      now.getTime() + timeRange.startMinutes * 60 * 1000
    );
    const endDate = new Date(now.getTime() + timeRange.endMinutes * 60 * 1000);

    // Create mock SMS logs only
    let sentTotal = 0;
    let failedTotal = 0;
    const smsLogs: any[] = [];

    const normalizedFailedPct = Math.min(
      Math.max(Number(failedPercentage) || 0, 0),
      100
    );
    const targetFailed = Math.round((normalizedFailedPct / 100) * smsCount);

    const failedIndexSet = new Set<number>();
    while (failedIndexSet.size < targetFailed) {
      failedIndexSet.add(Math.floor(Math.random() * smsCount));
    }

    for (let i = 0; i < smsCount; i++) {
      const randomTime = new Date(
        startDate.getTime() +
          Math.random() * (endDate.getTime() - startDate.getTime())
      );

      const randomPhone = `+628${Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, "0")}`;

      const messages = [
        "Pesan promosi produk terbaru",
        "Notifikasi pembayaran jatuh tempo",
        "Konfirmasi pesanan telah diterima",
        "Reminder jadwal meeting",
        "Update status pengiriman",
        "Pemberitahuan maintenance sistem",
        "Konfirmasi registrasi akun",
        "Notifikasi saldo terbaru",
        "Peringatan keamanan akun",
        "Update informasi produk",
      ];

      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];

      const isFailed = failedIndexSet.has(i);
      const status = isFailed ? "FAILED" : "SENT";
      if (isFailed) failedTotal += 1;
      else sentTotal += 1;

      smsLogs.push({
        userId: clientId,
        phoneNumber: randomPhone,
        message: `${randomMessage} - ${randomTime.toLocaleString("id-ID")}`,
        status,
        cost: isFailed ? 0 : 500,
        sentAt: randomTime,
        createdAt: randomTime,
      });
    }

    await prisma.smsLog.createMany({ data: smsLogs });

    return NextResponse.json({
      success: true,
      message: "SMS berhasil dibuat",
      summary: {
        requested: smsCount,
        sent: sentTotal,
        failed: failedTotal,
        failedPercentage: normalizedFailedPct,
        unitPrice: 500,
        totalCost: sentTotal * 500,
        timeRange,
      },
    });
  } catch (error) {
    console.error("Generate SMS error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
