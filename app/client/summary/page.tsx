"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { FileDown, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface SummaryData {
  period: { month: number; year: number; start: string; end: string };
  totals: {
    sms: number;
    sent: number;
    failed: number;
    cost: number;
    billed: number;
    billedFromTransactions?: number;
    paidInPeriod?: number;
    outstanding?: number;
  };
}

export default function ClientSummaryPage() {
  const { t, language } = useLanguage();
  const now = dayjs();
  const [month, setMonth] = useState(now.month() + 1); // 1-12
  const [year, setYear] = useState(now.year());
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/client/summary?month=${month}&year=${year}`
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportPdf = () => {
    window.open(
      `/api/client/summary/invoice?month=${month}&year=${year}`,
      "_blank"
    );
  };

  const pay = async (amount: number) => {
    try {
      setPaying(true);
      setMessage("");
      const res = await fetch("/api/client/summary/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, amount }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.message || "Gagal membuat pembayaran");
        return;
      }
      // console.log(json);
      // Buka tab baru untuk payment
      window.open(json.paymentUrl, "_blank");
    } catch (e) {
      setMessage("Terjadi kesalahan saat membuat pembayaran");
    } finally {
      setPaying(false);
    }
  };

  const months =
    language === "id"
      ? [
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ]
      : [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

  const billed = data?.totals.billed || 0;
  const paidInPeriod = data?.totals.paidInPeriod || 0;
  const outstanding =
    data?.totals.outstanding || Math.max(billed - paidInPeriod, 0);
  const partialAmount = Number(customAmount.replace(/[^0-9]/g, "")) || 0;

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t.summary.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {language === "id"
              ? "Ringkasan tagihan bulanan berdasarkan transaksi dan biaya SMS."
              : "Monthly billing summary based on transactions and SMS costs."}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <button
            onClick={fetchSummary}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <RefreshCw className="h-4 w-4 mr-2" />{" "}
            {language === "id" ? "Muat Ulang" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t.summary.month}
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              {months.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t.summary.year}
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || year)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={fetchSummary}
              className="inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              {language === "id" ? "Tampilkan" : "Show"}
            </button>
            <button
              onClick={exportPdf}
              className="inline-flex justify-center items-center px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800">
              <FileDown className="h-4 w-4 mr-2" />{" "}
              {t.summary.payment.exportInvoice}
            </button>
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">{t.common.loading}</p>}

      {message && <div className="mb-4 text-sm text-red-600">{message}</div>}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">
                {t.summary.stats.totalSms}
              </p>
              <p className="text-xl font-semibold">{data.totals.sms}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">{t.summary.stats.sent}</p>
              <p className="text-xl font-semibold text-green-600">
                {data.totals.sent}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">{t.summary.stats.failed}</p>
              <p className="text-xl font-semibold text-red-600">
                {data.totals.failed}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">
                {t.summary.stats.totalCost}
              </p>
              <p className="text-xl font-semibold">
                Rp {data.totals.cost.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {t.summary.stats.totalBilledExcTax}
                </p>
                <p className="text-xl font-semibold">
                  Rp {billed.toLocaleString("id-ID")}
                </p>
                {typeof data.totals.billedFromTransactions === "number" && (
                  <p className="text-xs text-gray-500 mt-1">
                    (Ref transaksi DEBIT periode ini: Rp{" "}
                    {data.totals.billedFromTransactions.toLocaleString("id-ID")}
                    )
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {t.summary.stats.paidInPeriod}
                </p>
                <p className="text-xl font-semibold text-green-600">
                  Rp {paidInPeriod.toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {t.summary.stats.outstanding}
                </p>
                <p className="text-xl font-semibold text-yellow-600">
                  Rp {outstanding.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          {/* Pembayaran */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {language === "id"
                ? "Bayar Tagihan Bulan Ini"
                : "Pay This Month's Bill"}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-3 space-y-3 sm:space-y-0">
              <button
                disabled={paying || outstanding <= 0}
                onClick={() => pay(outstanding)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
                {t.summary.payment.payFull} (Rp{" "}
                {outstanding.toLocaleString("id-ID")})
              </button>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={t.summary.payment.partialAmount}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm w-52"
                />
                <button
                  disabled={
                    paying || partialAmount <= 0 || partialAmount > outstanding
                  }
                  onClick={() => pay(partialAmount)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {t.summary.payment.payPartial}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {language === "id"
                ? "Anda akan diarahkan ke halaman pembayaran. Status transaksi akan dibuat sebagai PENDING dan diperbarui melalui notifikasi webhook."
                : "You will be redirected to the payment page. Transaction status will be created as PENDING and updated via webhook notification."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
