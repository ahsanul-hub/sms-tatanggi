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
      unitPrice = 500, // harga per SMS, default 500
      timeRange = {
        startMinutes: 0, // Default: sekarang
        endMinutes: 20, // Default: 20 menit ke depan
      },
      failedPercentage = 0, // persentase gagal (0-100) - legacy
      percentages = { delivered: 80, undelivered: 20, failed: 0 }, // persentase baru
    } = body;

    if (!clientId || !smsCount || smsCount <= 0) {
      return NextResponse.json(
        { message: "Data tidak valid" },
        { status: 400 }
      );
    }

    // Validasi unitPrice
    if (unitPrice <= 0) {
      return NextResponse.json(
        { message: "Harga per SMS harus lebih dari 0" },
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

    // Gunakan percentages.failed sebagai prioritas utama, fallback ke failedPercentage
    const actualFailedPct =
      percentages?.failed !== undefined ? percentages.failed : failedPercentage;
    const normalizedFailedPct = Math.min(
      Math.max(Number(actualFailedPct) || 0, 0),
      100
    );
    const targetFailed = Math.round((normalizedFailedPct / 100) * smsCount);

    // Debug log
    console.log("Generate billing debug:", {
      percentages,
      failedPercentage,
      actualFailedPct,
      normalizedFailedPct,
      targetFailed,
      smsCount,
      unitPrice,
    });

    const failedIndexSet = new Set<number>();
    // Pastikan kita tidak mencoba menambahkan lebih dari smsCount
    const maxFailed = Math.min(targetFailed, smsCount);
    while (failedIndexSet.size < maxFailed) {
      const randomIndex = Math.floor(Math.random() * smsCount);
      failedIndexSet.add(randomIndex);
    }

    console.log(
      "Failed index set size:",
      failedIndexSet.size,
      "Target:",
      targetFailed,
      "Max failed:",
      maxFailed
    );

    for (let i = 0; i < smsCount; i++) {
      const randomTime = new Date(
        startDate.getTime() +
          Math.random() * (endDate.getTime() - startDate.getTime())
      );

      const randomPhone = `+628${Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, "0")}`;

      // Generate random OTP (5-6 digits)
      const otpLength = Math.random() < 0.5 ? 5 : 6;
      const otp = Math.floor(Math.random() * Math.pow(10, otpLength))
        .toString()
        .padStart(otpLength, "0");

      const randomMessage = `OTP anda adalah ${otp}`;

      const isFailed = failedIndexSet.has(i);
      const status = isFailed ? "FAILED" : "SENT";
      if (isFailed) failedTotal += 1;
      else sentTotal += 1;

      smsLogs.push({
        userId: clientId,
        phoneNumber: randomPhone,
        message: `${randomMessage} - ${randomTime.toLocaleString("id-ID")}`,
        status,
        cost: isFailed ? 0 : unitPrice,
        sentAt: randomTime,
        createdAt: randomTime,
      });
    }

    await prisma.smsLog.createMany({ data: smsLogs });

    // Verifikasi hasil
    const actualFailed = smsLogs.filter(
      (log) => log.status === "FAILED"
    ).length;
    const actualSent = smsLogs.filter((log) => log.status === "SENT").length;
    console.log("Final verification:", {
      actualFailed,
      actualSent,
      total: smsLogs.length,
      expectedFailed: targetFailed,
    });

    return NextResponse.json({
      success: true,
      message: "SMS berhasil dibuat",
      summary: {
        requested: smsCount,
        sent: sentTotal,
        failed: failedTotal,
        failedPercentage: normalizedFailedPct,
        unitPrice: unitPrice,
        totalCost: sentTotal * unitPrice,
        timeRange,
        percentages: {
          delivered: percentages?.delivered || 0,
          undelivered: percentages?.undelivered || 0,
          failed: percentages?.failed || 0,
        },
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
