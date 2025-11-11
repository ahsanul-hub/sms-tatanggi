// Pivot Payment API Service
interface AccessTokenResponse {
  code: string;
  message: string;
  data: {
    accessToken: string;
    tokenType: string;
    expiresIn: string;
  };
}

interface PaymentStatusResponse {
  code: string;
  message: string;
  data: {
    id: string;
    clientReferenceId: string;
    amount: {
      value: number;
      currency: string;
    };
    status: string;
    paymentUrl?: string;
    chargeDetails?: Array<{
      status: string;
      failureCode?: string;
      failureMessage?: string;
    }>;
  };
}

// Cache untuk access token
let cachedToken: {
  token: string;
  expiresAt: number;
} | null = null;

/**
 * Mendapatkan access token dari Pivot Payment API
 * Token di-cache selama masa berlaku (900 detik)
 */
async function getAccessToken(): Promise<string> {
  const merchantId = process.env.PIVOT_MERCHANT_ID;
  const merchantSecret = process.env.PIVOT_MERCHANT_SECRET;

  if (!merchantId || !merchantSecret) {
    throw new Error("PIVOT_MERCHANT_ID dan PIVOT_MERCHANT_SECRET harus di-set");
  }

  // Cek cache token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  try {
    const response = await fetch(
      "https://api.pivot-payment.com/v1/access-token",
      {
        method: "POST",
        headers: {
          "X-MERCHANT-ID": merchantId,
          "X-MERCHANT-SECRET": merchantSecret,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grantType: "client_credentials",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data: AccessTokenResponse = await response.json();

    if (data.code !== "00" || !data.data?.accessToken) {
      throw new Error(`Failed to get access token: ${data.message}`);
    }

    // Cache token dengan buffer 30 detik sebelum expire
    const expiresIn = parseInt(data.data.expiresIn) || 900;
    cachedToken = {
      token: data.data.accessToken,
      expiresAt: Date.now() + (expiresIn - 30) * 1000,
    };

    return data.data.accessToken;
  } catch (error) {
    console.error("Error getting Pivot Payment access token:", error);
    throw error;
  }
}

/**
 * Check payment status dari Pivot Payment API menggunakan chanelTrxId
 */
export async function checkPivotPaymentStatus(chanelTrxId: string): Promise<{
  status: string;
  failureCode?: string;
  failureMessage?: string;
  paymentUrl?: string;
} | null> {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(
      `https://api.pivot-payment.com/v2/payments/${chanelTrxId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Failed to check payment status: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data: PaymentStatusResponse = await response.json();

    if (data.code !== "00" || !data.data) {
      console.error(`Payment status check failed: ${data.message}`);
      return null;
    }

    // Ambil failure info dari chargeDetails jika ada
    const chargeDetails = data.data.chargeDetails?.[0];
    const failureCode = chargeDetails?.failureCode;
    const failureMessage = chargeDetails?.failureMessage;

    return {
      status: data.data.status,
      failureCode,
      failureMessage,
      paymentUrl: data.data.paymentUrl,
    };
  } catch (error) {
    console.error("Error checking Pivot Payment status:", error);
    return null;
  }
}
