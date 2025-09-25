import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MockPaymentGateway } from "@/lib/payment";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, description } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: "Amount harus lebih dari 0" },
        { status: 400 }
      );
    }

    // Generate reference ID
    const referenceId = `TXN_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount,
        type: "PAYMENT",
        status: "PENDING",
        description: description || "Top up saldo",
        referenceId,
      },
    });

    // Create payment with mock gateway
    const paymentGateway = MockPaymentGateway.getInstance();
    const paymentResponse = await paymentGateway.createPayment({
      amount,
      description: description || "Top up saldo",
      userId: session.user.id,
      referenceId,
    });

    if (!paymentResponse.success) {
      // Update transaction status to failed
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
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        referenceId: transaction.referenceId,
        status: transaction.status,
      },
      payment: {
        transactionId: paymentResponse.transactionId,
        paymentUrl: paymentResponse.paymentUrl,
        status: paymentResponse.status,
      },
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
