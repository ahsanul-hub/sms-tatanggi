import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPivotPaymentStatus } from "@/lib/pivot-payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const referenceId = body?.merchant_transaction_id;
    const channelTransactionId = body?.reference_id;

    if (!referenceId) {
      return NextResponse.json(
        { message: "referenceId tidak ditemukan" },
        { status: 400 }
      );
    }

    // Prioritaskan status_code jika ada
    let newStatus: "COMPLETED" | "FAILED" | "PENDING" = "PENDING";
    const statusCode = Number(body?.status_code);
    if (!Number.isNaN(statusCode)) {
      if (statusCode === 1000) newStatus = "COMPLETED";
      else if (statusCode === 1005) newStatus = "FAILED";
      else if (statusCode === 1001) newStatus = "PENDING";
    } else {
      // Fallback ke string status
      const status = (body?.status || body?.payment_status || "")
        .toString()
        .toUpperCase();
      const isSuccess =
        status === "SUCCESS" || status === "PAID" || status === "COMPLETED";
      newStatus = isSuccess
        ? "COMPLETED"
        : status === "FAILED"
        ? "FAILED"
        : "PENDING";
    }

    const tx = await prisma.transaction.findUnique({ where: { referenceId } });
    if (!tx) {
      return NextResponse.json(
        { message: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    const extraInfo: string[] = [];
    if (body?.payment_method) extraInfo.push(`method=${body.payment_method}`);
    if (body?.reference_id) extraInfo.push(`provider_ref=${body.reference_id}`);
    if (body?.amount) extraInfo.push(`amount=${body.amount}`);

    // const notifyPaymentUrl =
    //   body?.payment_url ||
    //   body?.redirect_url ||
    //   body?.data?.payment_url ||
    //   body?.data?.redirect_url;

    const updateData: any = {
      status: newStatus,
      description:
        tx.description && extraInfo.length > 0
          ? `${tx.description} | ${extraInfo.join(" ")}`
          : tx.description,
    };

    if (channelTransactionId) {
      updateData.chanelTrxId = channelTransactionId;

      // Check payment status dari Pivot Payment API jika ada chanelTrxId
      try {
        const pivotStatus = await checkPivotPaymentStatus(channelTransactionId);
        if (pivotStatus) {
          // Update status berdasarkan response dari Pivot Payment
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

          // Update status dengan status dari Pivot Payment
          updateData.status = newStatus;
        }
      } catch (error) {
        console.error("Error checking Pivot Payment status:", error);
        // Continue dengan update data yang sudah ada
      }
    }

    // if (
    //   newStatus === "COMPLETED" &&
    //   notifyPaymentUrl &&
    //   !updateData.paymentUrl
    // ) {
    //   updateData.paymentUrl = notifyPaymentUrl;
    // }

    await prisma.transaction.update({
      where: { id: tx.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Payment notify error:", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
