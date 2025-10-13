"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  CreditCard,
  MessageSquare,
  TrendingUp,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface ClientStats {
  totalTransactions: number;
  totalSmsSent: number;
  pendingBills: number;
  totalSpent: number;
  totalBilledAllTime?: number;
  lastTransaction: string | null;
  billedThisMonth: number;
  paidThisMonth: number;
  outstandingThisMonth: number;
}

export default function ClientDashboard() {
  const { data: session } = useSession();
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<ClientStats>({
    totalTransactions: 0,
    totalSmsSent: 0,
    pendingBills: 0,
    totalSpent: 0,
    totalBilledAllTime: 0,
    lastTransaction: null,
    billedThisMonth: 0,
    paidThisMonth: 0,
    outstandingThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientStats();
  }, []);

  const fetchClientStats = async () => {
    try {
      const response = await fetch("/api/client/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching client stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t.clientDashboard.title}
          </h1>
          <LanguageSwitcher />
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: language === "id" ? "Total Transaksi" : "Total Transactions",
      value: stats.totalTransactions,
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: t.clientDashboard.stats.sentSms,
      value: stats.totalSmsSent,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      name: language === "id" ? "Tagihan Pending" : "Pending Bills",
      value: stats.pendingBills,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      name: t.clientDashboard.stats.outstandingThisMonth,
      value: `Rp ${stats.outstandingThisMonth.toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      name: t.clientDashboard.stats.paidThisMonth,
      value: `Rp ${stats.paidThisMonth.toLocaleString("id-ID")}`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: t.clientDashboard.stats.totalBilled,
      value: `Rp ${(stats.totalBilledAllTime || 0).toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t.clientDashboard.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {language === "id" ? "Selamat datang" : "Welcome"},{" "}
              {session?.user?.name}
            </p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {language === "id" ? "Aksi Cepat" : "Quick Actions"}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/client/summary"
            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow">
            <div>
              <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                <DollarSign className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium">
                <span className="absolute inset-0" aria-hidden="true" />
                {language === "id"
                  ? "Ringkasan & Pembayaran"
                  : "Summary & Payment"}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {language === "id"
                  ? "Lihat total tagihan bulan ini dan lakukan pembayaran"
                  : "View this month's bill and make a payment"}
              </p>
            </div>
          </Link>

          <Link
            href="/client/sms-logs"
            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow">
            <div>
              <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                <MessageSquare className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium">
                <span className="absolute inset-0" aria-hidden="true" />
                {t.navigation.smsLogs}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {language === "id"
                  ? "Lihat riwayat pengiriman SMS"
                  : "View SMS delivery history"}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
