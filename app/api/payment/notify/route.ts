import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const referenceId =
      body?.merchant_transaction_id || body?.reference_id || body?.referenceId;

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

    await prisma.transaction.update({
      where: { id: tx.id },
      data: {
        status: newStatus,
        description:
          tx.description && extraInfo.length > 0
            ? `${tx.description} | ${extraInfo.join(" ")}`
            : tx.description,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Payment notify error:", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
