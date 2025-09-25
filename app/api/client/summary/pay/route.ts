import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MockPaymentGateway } from "@/lib/payment";
import dayjs from "dayjs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { month, year, amount } = await request.json();
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: "Amount tidak valid" },
        { status: 400 }
      );
    }

    const now = dayjs();
    const m = parseInt(month || `${now.month() + 1}`);
    const y = parseInt(year || `${now.year()}`);

    const referenceId = `PAY_${y}${String(m).padStart(2, "0")}_${Date.now()}`;

    // Buat transaksi PAYMENT (pending)
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount,
        type: "PAYMENT",
        status: "PENDING",
        description: `Pembayaran tagihan bulan ${String(m).padStart(
          2,
          "0"
        )}/${y}`,
        referenceId,
      },
    });

    // Buat sesi pembayaran di mock gateway
    const paymentGateway = MockPaymentGateway.getInstance();
    const paymentResponse = await paymentGateway.createPayment({
      amount,
      description: transaction.description || "Pembayaran tagihan",
      userId: session.user.id,
      referenceId,
    });

    if (!paymentResponse.success) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { message: paymentResponse.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResponse.paymentUrl,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        referenceId: transaction.referenceId,
        status: transaction.status,
      },
    });
  } catch (e) {
    console.error("Client pay summary error:", e);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
