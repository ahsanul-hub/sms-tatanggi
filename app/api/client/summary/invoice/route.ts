export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "CLIENT") {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(
      searchParams.get("month") || `${dayjs().month() + 1}`
    );
    const year = parseInt(searchParams.get("year") || `${dayjs().year()}`);
    if (Number.isNaN(month) || Number.isNaN(year) || month < 1 || month > 12) {
      return new Response("Parameter bulan/tahun tidak valid", { status: 400 });
    }

    const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).startOf(
      "month"
    );
    const end = start.endOf("month");

    const [client, smsLogs, debitAgg] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        include: { clientProfile: true },
      }),
      prisma.smsLog.findMany({
        where: {
          userId: session.user.id,
          createdAt: { gte: start.toDate(), lte: end.toDate() },
        },
        select: {
          id: true,
          message: true,
          cost: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: "DEBIT",
          createdAt: { gte: start.toDate(), lte: end.toDate() },
        },
        _sum: { amount: true },
      }),
    ]);

    if (!client) {
      return new Response("Client tidak ditemukan", { status: 404 });
    }

    const totalBilled = Math.abs(debitAgg._sum.amount || 0);
    const totalCost = smsLogs.reduce((s, x) => s + (x.cost || 0), 0);
    const company =
      client.clientProfile?.companyName || client.name || "Client";

    // Buat PDF menggunakan pdf-lib (tanpa file font eksternal)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait
    const { width } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let y = 800;
    const line = (text: string, size = 12, color = rgb(0, 0, 0)) => {
      page.drawText(text, { x: 50, y, size, font, color });
      y -= size + 6;
    };

    // Header
    page.drawText("Invoice Tagihan SMS", {
      x: width / 2 - font.widthOfTextAtSize("Invoice Tagihan SMS", 18) / 2,
      y,
      size: 18,
      font,
    });
    y -= 28;
    const periode = `Periode: ${start.format("MMMM YYYY")}`;
    page.drawText(periode, {
      x: width / 2 - font.widthOfTextAtSize(periode, 10) / 2,
      y,
      size: 10,
      font,
    });
    y -= 30;

    // Client info
    line(`Klien: ${company}`);
    line(`Email: ${client.email}`);
    y -= 6;

    // Summary
    line("Ringkasan:", 12);
    line(`Total SMS: ${smsLogs.length}`);
    line(`Total Biaya (sum cost): Rp ${totalCost.toLocaleString("id-ID")}`);
    line(`Total Tagihan (DEBIT): Rp ${totalBilled.toLocaleString("id-ID")}`);
    y -= 10;

    // Detail terbatas (maks 100 baris)
    const maxItems = Math.min(smsLogs.length, 100);
    line(`Detail SMS (maks ${maxItems} baris):`);
    for (let i = 0; i < maxItems && y > 60; i++) {
      const log = smsLogs[i];
      const row = `${i + 1}. ${dayjs(log.createdAt).format(
        "DD/MM HH:mm"
      )} | ${log.status.padEnd(8)} | Rp ${log.cost.toLocaleString(
        "id-ID"
      )} | ${log.message.slice(0, 60)}`;
      page.drawText(row, { x: 50, y, size: 9, font });
      y -= 14;
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice_${year}_${String(
          month
        ).padStart(2, "0")}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("Invoice export error:", err);
    return new Response(`Gagal membuat PDF: ${err?.message || "unknown"}`, {
      status: 500,
    });
  }
}
