import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toBodySignFromJson(jsonString: string, appSecret: string): string {
  // jsonString harus tanpa escape slash
  const normalized = jsonString.replace(/\\\//g, "/");
  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha256", appSecret);
  hmac.update(normalized, "utf8");
  const base64 = hmac.digest("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_");
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      month,
      year,
      amount,
      customer_name,
      email,
      phone_number,
      address,
      city,
      province_state,
      country,
      postal_code,
    } = await request.json();
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

    // Ambil data klien untuk phoneNumber / nama
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { clientProfile: true },
    });

    // Simpan transaksi PAYMENT (PENDING)
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

    // Panggil payment gateway Redision
    const baseUrl =
      process.env.REDISION_BASE_URL || "https://sandbox-payment.redision.com";
    const appkey = process.env.REDISION_APPKEY as string;
    const appid = process.env.REDISION_APPID as string;
    const appsecret = process.env.REDISION_APPSECRET as string;

    if (!appkey || !appid || !appsecret) {
      return NextResponse.json(
        { message: "Konfigurasi payment gateway tidak lengkap" },
        { status: 500 }
      );
    }

    const redirectUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/client/summary`;
    const notifyUrl =
      process.env.REDISION_NOTIFY_URL ||
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/api/payment/notify`;

    // SUSUN PAYLOAD FINAL dengan urutan key yang konsisten (sesuai contoh curl)
    const userIdField = dbUser?.email || session.user.email || session.user.id;
    const userMdnField = dbUser?.clientProfile?.phoneNumber || userIdField;
    const customerName =
      customer_name || dbUser?.name || session.user.name || "Client";

    // Parse phone number to separate country code and number
    const phoneParts = phone_number ? phone_number.split(" ") : ["+62", ""];
    const countryCode = phoneParts[0] || "+62";
    const phoneNumber = phoneParts.slice(1).join(" ") || "";

    console.log("🔍 PHONE PARSING DEBUG:");
    console.log("  Input:", phone_number);
    console.log("  → countryCode:", countryCode);
    console.log("  → phoneNumber:", phoneNumber);

    const requestBodyObj: Record<string, any> = {
      redirect_url: redirectUrl,
      user_id: userIdField,
      user_mdn: userMdnField,
      merchant_transaction_id: referenceId,
      payment_method: "visa_master",
      currency: "IDR",
      amount: amount,
      item_name: "SMS Billing",
      customer_name: customerName,
      email: email || session.user.email,
      country_code: countryCode,
      phone_number: phoneNumber,
      address: address || "",
      city: city || "",
      province_state: province_state || "",
      country: country || "Indonesia",
      postal_code: postal_code || "",
      notification_url: notifyUrl,
    };

    // Stringify tanpa escape slash (kemudian normalisasi sebelum sign)
    const requestBodyJson = JSON.stringify(requestBodyObj);
    console.log("📤 PAYMENT GATEWAY PAYLOAD:");
    console.log("  phone_number:", requestBodyObj.phone_number);
    console.log("  country_code:", requestBodyObj.country_code);
    console.log("bodyjson", requestBodyJson);
    const bodysign = toBodySignFromJson(requestBodyJson, appsecret);

    const resp = await fetch(`${baseUrl}/api/transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        appkey,
        appid,
        bodysign,
      } as any,
      body: requestBodyJson,
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        {
          message:
            data?.message ||
            data?.error ||
            "Gagal membuat transaksi pembayaran",
          providerResponse: data,
        },
        { status: 400 }
      );
    }

    const paymentUrl =
      data?.payment_url ||
      data?.redirect_url ||
      data?.data?.payment_url ||
      data?.data?.redirect_url;

    return NextResponse.json({
      success: true,
      paymentUrl,
      providerResponse: data,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        referenceId: transaction.referenceId,
        status: transaction.status,
      },
      parsedData: {
        countryCode,
        phoneNumber,
        originalPhoneNumber: phone_number,
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
