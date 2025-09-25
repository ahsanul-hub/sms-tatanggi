// Mock Payment Gateway Service
export interface PaymentRequest {
  amount: number;
  description: string;
  userId: string;
  referenceId: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: "pending" | "completed" | "failed";
  message: string;
  paymentUrl?: string;
}

export interface PaymentStatus {
  transactionId: string;
  status: "pending" | "completed" | "failed";
  amount: number;
  referenceId: string;
}

// Mock payment gateway implementation
export class MockPaymentGateway {
  private static instance: MockPaymentGateway;
  private transactions: Map<string, PaymentStatus> = new Map();

  static getInstance(): MockPaymentGateway {
    if (!MockPaymentGateway.instance) {
      MockPaymentGateway.instance = new MockPaymentGateway();
    }
    return MockPaymentGateway.instance;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const transactionId = `mock_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock payment URL
    const paymentUrl = `https://mock-payment.com/pay/${transactionId}`;

    // Store transaction
    this.transactions.set(transactionId, {
      transactionId,
      status: "pending",
      amount: request.amount,
      referenceId: request.referenceId,
    });

    return {
      success: true,
      transactionId,
      status: "pending",
      message: "Payment berhasil dibuat",
      paymentUrl,
    };
  }

  async checkPaymentStatus(
    transactionId: string
  ): Promise<PaymentStatus | null> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return null;
    }

    // Simulate random payment completion (80% success rate)
    if (transaction.status === "pending") {
      const isSuccess = Math.random() > 0.2;
      transaction.status = isSuccess ? "completed" : "failed";
    }

    return transaction;
  }

  async processPayment(transactionId: string): Promise<PaymentResponse> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return {
        success: false,
        transactionId,
        status: "failed",
        message: "Transaction tidak ditemukan",
      };
    }

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const isSuccess = Math.random() > 0.2;
    transaction.status = isSuccess ? "completed" : "failed";

    return {
      success: isSuccess,
      transactionId,
      status: transaction.status,
      message: isSuccess
        ? "Payment berhasil diproses"
        : "Payment gagal diproses",
    };
  }

  // Admin function to manually complete payments
  async adminCompletePayment(transactionId: string): Promise<PaymentResponse> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return {
        success: false,
        transactionId,
        status: "failed",
        message: "Transaction tidak ditemukan",
      };
    }

    transaction.status = "completed";

    return {
      success: true,
      transactionId,
      status: "completed",
      message: "Payment berhasil diselesaikan oleh admin",
    };
  }

  // Get all transactions (for admin)
  getAllTransactions(): PaymentStatus[] {
    return Array.from(this.transactions.values());
  }
}
