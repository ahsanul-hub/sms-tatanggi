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
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { message: "Transaction ID diperlukan" },
        { status: 400 }
      );
    }

    // Check payment status with mock gateway
    const paymentGateway = MockPaymentGateway.getInstance();
    const paymentStatus = await paymentGateway.checkPaymentStatus(
      transactionId
    );

    if (!paymentStatus) {
      return NextResponse.json(
        { message: "Transaction tidak ditemukan" },
        { status: 404 }
      );
    }

    // Find transaction in database
    const transaction = await prisma.transaction.findFirst({
      where: {
        referenceId: paymentStatus.referenceId,
        userId: session.user.id,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction tidak ditemukan di database" },
        { status: 404 }
      );
    }

    // Update transaction status if payment is completed
    if (
      paymentStatus.status === "completed" &&
      transaction.status === "PENDING"
    ) {
      await prisma.$transaction(async (tx) => {
        // Update transaction status
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: "COMPLETED" },
        });

        // Update user balance
        await tx.clientProfile.update({
          where: { userId: session.user.id },
          data: {
            balance: {
              increment: transaction.amount,
            },
          },
        });
      });
    } else if (
      paymentStatus.status === "failed" &&
      transaction.status === "PENDING"
    ) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });
    }

    // Get updated transaction
    const updatedTransaction = await prisma.transaction.findUnique({
      where: { id: transaction.id },
    });

    return NextResponse.json({
      success: true,
      payment: {
        transactionId: paymentStatus.transactionId,
        status: paymentStatus.status,
        amount: paymentStatus.amount,
      },
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
