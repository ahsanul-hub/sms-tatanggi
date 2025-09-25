"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CreditCard, DollarSign, CheckCircle, AlertCircle } from "lucide-react";

interface TopUpData {
  amount: number;
  description: string;
}

export default function TopUpPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [topUpData, setTopUpData] = useState<TopUpData>({
    amount: 0,
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");

  const handleAmountChange = (amount: number) => {
    setTopUpData((prev) => ({
      ...prev,
      amount,
      description: `Top up saldo sebesar Rp ${amount.toLocaleString("id-ID")}`,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(topUpData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("Payment berhasil dibuat!");
        setPaymentUrl(data.payment.paymentUrl);
      } else {
        const data = await response.json();
        setMessage(data.message || "Terjadi kesalahan");
      }
    } catch (error) {
      setMessage("Terjadi kesalahan saat membuat payment");
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Top Up Saldo</h1>
        <p className="mt-1 text-sm text-gray-500">
          Tambah saldo untuk layanan SMS Anda
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div
              className={`p-4 rounded-md ${
                message.includes("berhasil")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {message.includes("berhasil") ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{message}</p>
                  {paymentUrl && (
                    <div className="mt-2">
                      <a
                        href={paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:text-green-500 underline">
                        Klik di sini untuk melanjutkan pembayaran
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700">
              Jumlah Top Up
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="amount"
                min="10000"
                step="1000"
                value={topUpData.amount || ""}
                onChange={(e) =>
                  handleAmountChange(parseInt(e.target.value) || 0)
                }
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md sm:text-sm"
                placeholder="Masukkan jumlah top up"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Minimum top up: Rp 10.000
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700">
              Deskripsi (Opsional)
            </label>
            <textarea
              id="description"
              value={topUpData.description}
              onChange={(e) =>
                setTopUpData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Deskripsi top up (opsional)"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || topUpData.amount < 10000}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Membuat Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Buat Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Amount Selection */}
      <div className="mt-12">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Pilih Jumlah Cepat
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleAmountChange(amount)}
              className={`p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors ${
                topUpData.amount === amount
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200"
              }`}>
              <div className="text-lg font-medium">
                Rp {amount.toLocaleString("id-ID")}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Informasi Pembayaran
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Pembayaran menggunakan mock payment gateway</li>
          <li>• Saldo akan ditambahkan setelah pembayaran berhasil</li>
          <li>• Anda akan diarahkan ke halaman pembayaran mock</li>
          <li>• Status pembayaran dapat dicek di riwayat transaksi</li>
        </ul>
      </div>
    </div>
  );
}
