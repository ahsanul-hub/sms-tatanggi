"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  CreditCard,
  Users,
  MessageSquare,
  DollarSign,
  Check,
} from "lucide-react";
import { DatePicker, ConfigProvider } from "antd";
import dayjs from "dayjs";
import "antd/dist/reset.css";

interface Client {
  id: string;
  name: string;
  email: string;
  clientProfile: {
    companyName: string;
    balance: number;
  };
}

interface GenerateResult {
  success: boolean;
  message: string;
  summary?: {
    requested: number;
    sent: number;
    failed: number;
    failedPercentage: number;
    unitPrice: number;
    totalCost: number;
  };
}

interface BillingData {
  clientId: string;
  amount: number; // kept for compatibility but unused now
  description: string;
  smsCount: number;
  timeRange: {
    startDate: dayjs.Dayjs | null;
    endDate: dayjs.Dayjs | null;
  };
  failedPercentage: number; // persentase gagal 0-100
}

export default function GenerateBillingPage() {
  const { data: session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [billingData, setBillingData] = useState<BillingData>({
    clientId: "",
    amount: 0,
    description: "",
    smsCount: 0,
    timeRange: {
      startDate: dayjs(),
      endDate: dayjs().add(2, "minute"),
    },
    failedPercentage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/admin/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    setBillingData((prev) => ({
      ...prev,
      clientId,
    }));
  };

  const handleSmsCountChange = (smsCount: number) => {
    const amount = smsCount * 500; // Rp 500 per SMS (informational)
    setBillingData((prev) => ({
      ...prev,
      smsCount,
      amount,
      description: `Generate SMS ${smsCount} pesan @ Rp 500`,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      // Convert date range to minutes from now
      const now = dayjs();
      const startMinutes = billingData.timeRange.startDate
        ? Math.floor(billingData.timeRange.startDate.diff(now, "minute"))
        : 0;
      const endMinutes = billingData.timeRange.endDate
        ? Math.floor(billingData.timeRange.endDate.diff(now, "minute"))
        : 20;

      const requestData = {
        clientId: billingData.clientId,
        smsCount: billingData.smsCount,
        failedPercentage: billingData.failedPercentage,
        timeRange: { startMinutes, endMinutes },
      };

      const response = await fetch("/api/admin/generate-billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = (await response.json()) as GenerateResult;
      setResult(data);

      if (response.ok) {
        setMessage("SMS berhasil dibuat!");
        setBillingData({
          clientId: "",
          amount: 0,
          description: "",
          smsCount: 0,
          timeRange: {
            startDate: dayjs(),
            endDate: dayjs().add(20, "minute"),
          },
          failedPercentage: 0,
        });
        setSelectedClient("");
      } else {
        setMessage(data.message || "Terjadi kesalahan");
      }
    } catch (error) {
      setMessage("Terjadi kesalahan saat generate SMS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Generate SMS Mock</h1>
        <p className="mt-1 text-sm text-gray-500">
          Buat data SMS untuk keperluan testing/analisis. Ini bukan membuat
          tagihan.
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
              {message}
            </div>
          )}

          <div>
            <label
              htmlFor="client"
              className="block text-sm font-medium text-gray-700">
              Pilih Klien
            </label>
            <select
              id="client"
              value={selectedClient}
              onChange={(e) => handleClientChange(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required>
              <option value="">-- Pilih Klien --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.clientProfile.companyName} ({client.name} -{" "}
                  {client.email})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-md" hidden={!selectedClient}>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {
                    clients.find((c) => c.id === selectedClient)?.clientProfile
                      .companyName
                  }
                </p>
                <p className="text-sm text-blue-700">Klien dipilih</p>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="smsCount"
              className="block text-sm font-medium text-gray-700">
              Jumlah SMS
            </label>
            <input
              type="number"
              id="smsCount"
              min="1"
              value={billingData.smsCount}
              onChange={(e) =>
                handleSmsCountChange(parseInt(e.target.value) || 0)
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Masukkan jumlah SMS"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Harga referensi: Rp 500 per SMS (hanya untuk estimasi).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rentang Waktu SMS
            </label>
            <ConfigProvider
              theme={{ token: { colorPrimary: "#3b82f6", borderRadius: 6 } }}>
              <DatePicker.RangePicker
                showTime={{ format: "HH:mm", minuteStep: 5 }}
                format="DD/MM/YYYY HH:mm"
                value={[
                  billingData.timeRange.startDate,
                  billingData.timeRange.endDate,
                ]}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setBillingData((prev) => ({
                      ...prev,
                      timeRange: { startDate: dates[0], endDate: dates[1] },
                    }));
                  }
                }}
                className="w-full"
                size="large"
              />
            </ConfigProvider>
          </div>

          <div>
            <label
              htmlFor="failedPercentage"
              className="block text-sm font-medium text-gray-700">
              Persentase Gagal (0-100%)
            </label>
            <input
              type="number"
              id="failedPercentage"
              min={0}
              max={100}
              value={billingData.failedPercentage}
              onChange={(e) =>
                setBillingData((prev) => ({
                  ...prev,
                  failedPercentage: Math.min(
                    100,
                    Math.max(0, parseInt(e.target.value) || 0)
                  ),
                }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Misal: 20"
            />
            <p className="mt-1 text-xs text-gray-500">
              Contoh: 20 berarti ~20% SMS akan berstatus gagal.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                loading ||
                !selectedClient ||
                billingData.smsCount <= 0 ||
                !billingData.timeRange.startDate ||
                !billingData.timeRange.endDate
              }
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menggenerate SMS...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Generate SMS
                </>
              )}
            </button>
          </div>
        </form>

        {result?.summary && (
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Ringkasan Hasil
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
              <div>
                <p className="text-sm text-gray-500">Diminta</p>
                <p className="text-lg font-medium">
                  {result.summary.requested}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Terkirim</p>
                <p className="text-lg font-medium text-green-600">
                  {result.summary.sent}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gagal</p>
                <p className="text-lg font-medium text-red-600">
                  {result.summary.failed}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Harga/SMS</p>
                <p className="text-lg font-medium">
                  Rp {result.summary.unitPrice.toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimasi Biaya</p>
                <p className="text-lg font-medium">
                  Rp {result.summary.totalCost.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
