import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = (searchParams.get("card") || "").replace(/\D/g, "");

    // Ambil hanya 4 atau 6 digit pertama dari input kartu
    let bin = "";
    if (raw.length >= 6) bin = raw.slice(0, 6);
    else if (raw.length >= 4) bin = raw.slice(0, 4);

    if (!bin) {
      return NextResponse.json(
        { message: "Parameter card harus minimal 4 digit" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.REDISION_BASE_URL || "http://localhost:4000";
    const appkey = process.env.REDISION_APPKEY || "";
    const appid = process.env.REDISION_APPID || "";

    if (!appkey || !appid) {
      return NextResponse.json(
        { message: "Konfigurasi payment gateway tidak lengkap (APPKEY/APPID)" },
        { status: 500 }
      );
    }

    const endpoint = `${baseUrl}/api/credit-card-bin/${bin}`;

    const resp = await fetch(endpoint, {
      method: "GET",
      headers: {
        appkey,
        appid,
      },
      cache: "no-store",
    });

    const text = await resp.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!resp.ok) {
      return NextResponse.json(
        {
          message: data?.message || data?.error || "Gagal cek BIN",
          providerResponse: data,
          statusCode: resp.status,
          endpoint,
        },
        { status: resp.status || 400 }
      );
    }

    return NextResponse.json({ success: true, bin: data, endpoint });
  } catch (e: any) {
    console.error("BIN check error:", e);
    return NextResponse.json(
      { message: e?.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
