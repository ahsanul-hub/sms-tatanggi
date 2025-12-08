import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkPivotPaymentStatus } from "@/lib/pivot-payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { transactionId, chanelTrxId } = body;

    if (!transactionId && !chanelTrxId) {
      return NextResponse.json(
        { message: "transactionId atau chanelTrxId diperlukan" },
        { status: 400 }
      );
    }

    // Cari transaksi berdasarkan transactionId atau chanelTrxId
    let transaction;
    if (transactionId) {
      transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });
    } else if (chanelTrxId) {
      transaction = await prisma.transaction.findFirst({
        where: { chanelTrxId },
      });
    }

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cek apakah user memiliki akses ke transaksi ini
    if (
      session.user.role !== "ADMIN" &&
      transaction.userId !== session.user.id
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Jika tidak ada chanelTrxId, tidak bisa check status
    if (!transaction.chanelTrxId) {
      return NextResponse.json(
        { message: "Transaksi belum memiliki chanelTrxId" },
        { status: 400 }
      );
    }

    // Check status dari Pivot Payment API
    const pivotStatus = await checkPivotPaymentStatus(transaction.chanelTrxId);

    if (!pivotStatus) {
      return NextResponse.json(
        { message: "Gagal mendapatkan status dari issuer" },
        { status: 500 }
      );
    }

    // Update status berdasarkan response dari Pivot Payment
    let newStatus: "COMPLETED" | "FAILED" | "PENDING" = "PENDING";
    const pivotStatusUpper = pivotStatus.status.toUpperCase();
    if (
      pivotStatusUpper === "COMPLETED" ||
      pivotStatusUpper === "SUCCESS" ||
      pivotStatusUpper === "PAID"
    ) {
      newStatus = "COMPLETED";
    } else if (
      pivotStatusUpper === "FAILED" ||
      pivotStatusUpper === "CANCELLED" ||
      pivotStatusUpper === "EXPIRED"
    ) {
      newStatus = "FAILED";
    }

    // Update transaction dengan status terbaru
    const updateData: any = {
      status: newStatus,
    };

    // Simpan failure info jika ada
    if (pivotStatus.failureCode) {
      updateData.failureCode = pivotStatus.failureCode;
    }
    if (pivotStatus.failureMessage) {
      updateData.failureMessage = pivotStatus.failureMessage;
    }

    // // Simpan paymentUrl jika ada
    // if (pivotStatus.paymentUrl) {
    //   updateData.paymentUrl = pivotStatus.paymentUrl;
    // }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      pivotStatus: pivotStatus.status,
      failureCode: pivotStatus.failureCode,
      failureMessage: pivotStatus.failureMessage,
    });
  } catch (error) {
    console.error("Check payment status error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server", error: String(error) },
      { status: 500 }
    );
  }
}
