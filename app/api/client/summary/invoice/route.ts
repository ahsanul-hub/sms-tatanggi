export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

// Path absolut ke file dalam public/
// Fungsi sinkron untuk mendapatkan logoImage
function getLogoImageSync(pdfDoc: import("pdf-lib").PDFDocument) {
  const logoPath = path.join(process.cwd(), "public", "tatanggi.png");
  const logoBytes = fs.readFileSync(logoPath);
  return pdfDoc.embedPng(logoBytes);
}

// Pastikan untuk memanggil getLogoImageSync dengan pdfDoc yang sesuai
// Contoh penggunaan di dalam handler async:
// const logoImage = await getLogoImageSync(pdfDoc);

function drawInWordSection(
  page: import("pdf-lib").PDFPage,
  label: string,
  englishText: string,
  indonesianText: string,
  startX: number,
  startY: number,
  labelFont: import("pdf-lib").PDFFont,
  valueFont: import("pdf-lib").PDFFont,
  labelSize: number,
  valueSize: number,
  maxWidth: number
) {
  // Gambar label
  page.drawText(label, {
    x: startX,
    y: startY,
    size: labelSize,
    font: labelFont,
  });

  const labelWidth = labelFont.widthOfTextAtSize(label, labelSize);
  const valueStartX = startX + labelWidth + 5; // sedikit spasi

  // Baris Inggris
  const englishLines = wrapText(
    englishText,
    maxWidth - (valueStartX - startX),
    valueSize,
    valueFont
  );
  englishLines.forEach((line, i) => {
    page.drawText(line, {
      x: valueStartX,
      y: startY - i * (valueSize + 3),
      size: valueSize,
      font: valueFont,
    });
  });

  // Baris Indonesia—mulai di bawah seluruh baris English
  const englishHeight = englishLines.length * (valueSize + 3);
  const indonesianLines = wrapText(
    indonesianText,
    maxWidth - (valueStartX - startX),
    valueSize,
    valueFont
  );
  indonesianLines.forEach((line, i) => {
    page.drawText(line, {
      x: valueStartX + 5,
      y: startY - englishHeight - i * (valueSize + 3),
      size: valueSize,
      font: labelFont,
    });
  });
}

/** Fungsi pembungkus kata sederhana */
function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  font: import("pdf-lib").PDFFont
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? current + " " + word : word;
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Konversi angka ke kata (EN)
function numberToWordsEn(n: number): string {
  if (n === 0) return "Zero";
  const belowTwenty = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const thousands = ["", "Thousand", "Million", "Billion", "Trillion"];

  const chunk = (num: number): string => {
    let res = "";
    if (num >= 100) {
      res += belowTwenty[Math.floor(num / 100)] + " Hundred";
      num %= 100;
      if (num) res += " ";
    }
    if (num >= 20) {
      res += tens[Math.floor(num / 10)];
      num %= 10;
      if (num) res += " " + belowTwenty[num];
    } else if (num > 0) {
      res += belowTwenty[num];
    }
    return res;
  };

  let i = 0;
  let words = "";
  while (n > 0 && i < thousands.length) {
    const part = n % 1000;
    if (part) {
      const partWords = chunk(part) + (thousands[i] ? " " + thousands[i] : "");
      words = partWords + (words ? " " + words : "");
    }
    n = Math.floor(n / 1000);
    i++;
  }
  return words;
}

// Konversi angka ke kata (ID)
function numberToWordsId(n: number): string {
  if (n === 0) return "Nol";
  const belowTwenty = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];

  const toWords = (num: number): string => {
    if (num < 12) return belowTwenty[num];
    if (num < 20) return toWords(num - 10) + " Belas";
    if (num < 100)
      return (
        toWords(Math.floor(num / 10)) +
        " Puluh" +
        (num % 10 ? " " + toWords(num % 10) : "")
      );
    if (num < 200)
      return "Seratus" + (num % 100 ? " " + toWords(num % 100) : "");
    if (num < 1000)
      return (
        toWords(Math.floor(num / 100)) +
        " Ratus" +
        (num % 100 ? " " + toWords(num % 100) : "")
      );
    if (num < 2000)
      return "Seribu" + (num % 1000 ? " " + toWords(num % 1000) : "");
    if (num < 1000000)
      return (
        toWords(Math.floor(num / 1000)) +
        " Ribu" +
        (num % 1000 ? " " + toWords(num % 1000) : "")
      );
    if (num < 1000000000)
      return (
        toWords(Math.floor(num / 1000000)) +
        " Juta" +
        (num % 1000000 ? " " + toWords(num % 1000000) : "")
      );
    if (num < 1000000000000)
      return (
        toWords(Math.floor(num / 1000000000)) +
        " Miliar" +
        (num % 1000000000 ? " " + toWords(num % 1000000000) : "")
      );
    return (
      toWords(Math.floor(num / 1000000000000)) +
      " Triliun" +
      (num % 1000000000000 ? " " + toWords(num % 1000000000000) : "")
    );
  };

  return toWords(n);
}

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

    // Hitung data summary seperti di API summary
    const totalSms = smsLogs.length;
    const sentLogs = smsLogs.filter(
      (s) => s.status === "SENT" || s.status === "DELIVERED"
    );
    const totalSent = sentLogs.length;
    const totalFailed = smsLogs.filter((s) => s.status === "FAILED").length;
    const totalCost = smsLogs.reduce((sum, s) => sum + (s.cost || 0), 0);

    // Ambil currency dari client profile, default IDR
    const clientCurrency = (client.clientProfile as any)?.currency || "IDR";
    const usdToIdrRate = 16650; // Rate konversi USD ke IDR

    // Hitung billed seperti di summary API
    let billed = sentLogs.reduce((sum, s) => sum + (s.cost || 0), 0);
    // Total tagihan selalu dalam IDR, tidak dikonversi ke USD

    const totalBilled = Math.abs(debitAgg._sum.amount || 0);
    const company =
      client.clientProfile?.companyName || client.name || "Client";

    // Buat PDF menggunakan pdf-lib dengan layout seperti contoh
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Header dengan gradient background (simulasi dengan rectangle)
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width: width,
      height: 100,
      color: rgb(0.9, 0.95, 1), // Light blue
    });

    // Logo area (simulasi dengan circle)
    // page.drawCircle({
    //   x: width - 80,
    //   y: height - 50,
    //   size: 20,
    //   color: rgb(0.2, 0.4, 0.8),
    // });
    // page.drawText("A", {
    //   x: width - 90,
    //   y: height - 60,
    //   size: 24,
    //   font: boldFont,
    //   color: rgb(1, 1, 1),
    // });
    const logoImage = await getLogoImageSync(pdfDoc);
    page.drawImage(logoImage, {
      x: width - 90,
      y: height - 90,
      width: 80,
      height: 80,
    });

    // Company name
    // page.drawText("PT AURA TATANGGI INVESTAMA", {
    //   x: width - 200,
    //   y: height - 45,
    //   size: 10,
    //   font: boldFont,
    //   color: rgb(0, 0, 0),
    // });

    // INVOICE title
    page.drawText("INVOICE", {
      x: 50,
      y: height - 120,
      size: 32,
      font: boldFont,
      color: rgb(0, 0, 0.3),
    });

    // Invoice details
    const invoiceNo = `032-ATI-${String(month).padStart(2, "0")}-${year}`;
    const invoiceDate = dayjs().format("DD MMMM YYYY");

    page.drawText("Invoice No", {
      x: width - 200,
      y: height - 140,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(`: ${invoiceNo}`, {
      x: width - 120,
      y: height - 140,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText("Invoice Date", {
      x: width - 200,
      y: height - 155,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(`: ${invoiceDate}`, {
      x: width - 120,
      y: height - 155,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });

    // For section
    page.drawText("For :", {
      x: 50,
      y: height - 180,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Client details
    page.drawText(company, {
      x: 50,
      y: height - 200,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Table header
    const tableY = height - 280;
    const tableWidth = width - 80;
    const colWidths = [30, 220, 60, 40, 80, 80];

    // Table header background
    page.drawRectangle({
      x: 50,
      y: tableY - 20,
      width: tableWidth,
      height: 20,
      color: rgb(0.9, 0.9, 0.9),
    });

    // Table headers
    const headers = [
      "No",
      "Description",
      "Price",
      "Qty",
      // "Disc%",
      "Nett Price",
      "Total Nett Price",
    ];
    let xPos = 50;
    headers.forEach((header, index) => {
      page.drawText(header, {
        x: xPos,
        y: tableY - 15,
        size: 9,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      xPos += colWidths[index];
    });

    // Table data - gunakan data yang sudah dihitung dari summary
    const sentSms = sentLogs; // sudah dihitung di atas

    // Gunakan data dari summary, bukan menghitung ulang
    const totalAmountIdr = billed; // Total dari summary API
    let unitPrice, totalAmount, currencySymbol;

    if (clientCurrency === "USD") {
      // Konversi dari IDR ke USD
      unitPrice = totalAmountIdr / totalSent / usdToIdrRate; // Harga per SMS dalam USD
      totalAmount = totalAmountIdr / usdToIdrRate; // Konversi total dari IDR ke USD
      currencySymbol = "$";

      // Debug log untuk konversi
      console.log("Invoice USD conversion debug:", {
        totalSent,
        totalAmountIdr,
        usdToIdrRate,
        unitPriceUsd: unitPrice,
        totalAmountUsd: totalAmount,
      });
    } else {
      // Default IDR
      unitPrice = totalAmountIdr / totalSent; // Harga per SMS dalam IDR
      totalAmount = totalAmountIdr;
      currencySymbol = "Rp";
    }

    // Data row
    page.drawRectangle({
      x: 50,
      y: tableY - 40,
      width: tableWidth,
      height: 20,
      color: rgb(1, 1, 1),
    });

    xPos = 50;
    const rowData = [
      "1",
      `SMS Gateway, Usage ${start.format("DD MMM")} - ${end.format(
        "DD MMM YYYY"
      )}`,
      `${currencySymbol} ${
        clientCurrency === "USD"
          ? unitPrice.toFixed(4)
          : unitPrice.toLocaleString("id-ID")
      }`,
      totalSent.toString(),
      `${currencySymbol} ${
        clientCurrency === "USD"
          ? unitPrice.toFixed(4)
          : unitPrice.toLocaleString("id-ID")
      }`,
      `${currencySymbol} ${
        clientCurrency === "USD"
          ? totalAmount.toFixed(4)
          : totalAmount.toLocaleString("id-ID")
      }`,
    ];

    rowData.forEach((data, index) => {
      page.drawText(data, {
        x: xPos + 5,
        y: tableY - 35,
        size: 9,
        font: font,
        color: rgb(0, 0, 0),
      });
      xPos += colWidths[index];
    });

    // Summary section
    const summaryY = tableY - 100;
    const summaryX = width - 200;

    page.drawText("Total", {
      x: summaryX,
      y: summaryY,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(
      `${currencySymbol} ${
        clientCurrency === "USD"
          ? totalAmount.toFixed(4)
          : totalAmount.toLocaleString("id-ID")
      }`,
      {
        x: summaryX + 100,
        y: summaryY,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      }
    );

    // DPP & PPN (sesuai ketentuan):
    // - Grand Total = Total + 11%
    // - PPN = 11% dari Total
    // - DPP Lain = Total × 11/12 (hanya ditampilkan, tidak mempengaruhi total)

    // Hitung PPN dan DPP dalam IDR dulu
    const baseTotalIdr = totalAmountIdr;
    const ppnIdr = Math.round(baseTotalIdr * 0.11);
    const grandTotalIdr = baseTotalIdr + ppnIdr;
    const dppLainIdr = Math.round((baseTotalIdr * 11) / 12);

    // Konversi ke USD jika diperlukan
    let baseTotal, ppn, grandTotal, dppLain;

    if (clientCurrency === "USD") {
      // Untuk USD, tidak ada DPP Lain dan PPN
      baseTotal = totalAmount; // sudah dikonversi sebelumnya
      ppn = 0; // Tidak ada PPN untuk USD
      grandTotal = totalAmount; // Grand total sama dengan total untuk USD
      dppLain = 0; // Tidak ada DPP Lain untuk USD
    } else {
      // Untuk IDR, tetap ada DPP Lain dan PPN
      baseTotal = totalAmount; // sudah dalam IDR
      ppn = ppnIdr;
      grandTotal = grandTotalIdr;
      dppLain = dppLainIdr;
    }

    // Hanya tampilkan DPP Lain dan PPN untuk IDR
    if (clientCurrency !== "USD") {
      page.drawText("DPP Lain", {
        x: summaryX,
        y: summaryY - 15,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(`${currencySymbol} ${dppLain.toLocaleString("id-ID")}`, {
        x: summaryX + 100,
        y: summaryY - 15,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });

      page.drawText("PPN", {
        x: summaryX,
        y: summaryY - 30,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(`${currencySymbol} ${ppn.toLocaleString("id-ID")}`, {
        x: summaryX + 100,
        y: summaryY - 30,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
    }

    // Tentukan posisi Grand Total berdasarkan currency
    const grandTotalY =
      clientCurrency === "USD" ? summaryY - 15 : summaryY - 45;

    page.drawText("Grand Total", {
      x: summaryX,
      y: grandTotalY,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(
      `${currencySymbol} ${
        clientCurrency === "USD"
          ? grandTotal.toFixed(4)
          : grandTotal.toLocaleString("id-ID")
      }`,
      {
        x: summaryX + 100,
        y: grandTotalY,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      }
    );

    // Amount in words
    const currencyWord = clientCurrency === "USD" ? "Dollar" : "Rupiah";

    let englishAmount, indonesianAmount;

    if (clientCurrency === "USD") {
      // Untuk USD, handle desimal dengan benar
      const dollars = Math.floor(grandTotal);
      const cents = Math.round((grandTotal - dollars) * 100);

      if (cents === 0) {
        englishAmount = `${numberToWordsEn(dollars)} ${currencyWord}`;
        indonesianAmount = `${numberToWordsId(dollars)} ${currencyWord}`;
      } else {
        englishAmount = `${numberToWordsEn(
          dollars
        )} ${currencyWord} and ${numberToWordsEn(cents)} Cents`;
        indonesianAmount = `${numberToWordsId(
          dollars
        )} ${currencyWord} dan ${numberToWordsId(cents)} Sen`;
      }
    } else {
      // Untuk IDR, tetap menggunakan Math.floor
      englishAmount = `${numberToWordsEn(
        Math.floor(grandTotal)
      )} ${currencyWord}`;
      indonesianAmount = `${numberToWordsId(
        Math.floor(grandTotal)
      )} ${currencyWord}`;
    }

    drawInWordSection(
      page,
      "In Word",
      `: ${englishAmount}`,
      indonesianAmount,
      50, // X start
      summaryY - 80, // Y start
      boldFont, // font label
      font, // font value
      10, // label size
      9, // value size
      width - 100 // max width area
    );

    // Payment details
    const paymentY = summaryY - 150;

    page.drawText("Payment Details:", {
      x: 50,
      y: paymentY,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(
      "Please transfer the payment to the following Bank Account below",
      {
        x: 50,
        y: paymentY - 20,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      }
    );

    const bankDetails = [
      ["BANK NAME", "BANK MANDIRI"],
      ["NAME", "AURA TATANGGI INVESTAMA PT"],
      ["BANK ACCOUNT", "164-00-6001031-3"],
      [
        "BANK CURRENCY",
        clientCurrency === "USD" ? "Dollar (USD)" : "Indonesia Rupiah (IDR)",
      ],
      ["SWIFT CODE", "BMRIIDJA"],
    ];

    bankDetails.forEach(([label, value], index) => {
      page.drawText(label, {
        x: 50,
        y: paymentY - 40 - index * 15,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(`: ${value}`, {
        x: 150,
        y: paymentY - 40 - index * 15,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
    });

    page.drawText(
      "For any payments transferred, please inform to Billing@auratatanggi.com",
      {
        x: 50,
        y: paymentY - 120,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      }
    );

    // Signature section
    page.drawText("Authorized Signature;", {
      x: width - 150,
      y: paymentY - 20,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Signature line
    page.drawLine({
      start: { x: width - 150, y: paymentY - 90 },
      end: { x: width - 60, y: paymentY - 90 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    page.drawText("Artika Alun Firdausi", {
      x: width - 150,
      y: paymentY - 110,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText("Direktur", {
      x: width - 150,
      y: paymentY - 125,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
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
