"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  CreditCard,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";

interface DashboardStats {
  totalClients: number;
  totalTransactions: number;
  totalSmsSent: number;
  totalRevenue: number; // total nilai tagihan (DEBIT) absolut
  totalPaid: number; // jumlah pembayaran sukses (PAYMENT COMPLETED)
  pendingTransactions: number;
  activeClients: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalTransactions: 0,
    totalSmsSent: 0,
    totalRevenue: 0,
    totalPaid: 0,
    pendingTransactions: 0,
    activeClients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
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
      name: "Total Klien",
      value: stats.totalClients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Total Transaksi",
      value: stats.totalTransactions,
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "SMS Terkirim",
      value: stats.totalSmsSent,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      name: "Total Revenue",
      value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      name: "Tagihan Terbayar",
      value: `Rp ${stats.totalPaid.toLocaleString("id-ID")}`,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      name: "Transaksi Pending",
      value: stats.pendingTransactions,
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-gray-500">
          Selamat datang, {session?.user?.name}
        </p>
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/generate-billing"
            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow">
            <div>
              <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                <CreditCard className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium">
                <span className="absolute inset-0" aria-hidden="true" />
                Generate Tagihan
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Buat tagihan SMS untuk klien tertentu
              </p>
            </div>
          </a>

          <a
            href="/admin/clients"
            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow">
            <div>
              <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                <Users className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium">
                <span className="absolute inset-0" aria-hidden="true" />
                Kelola Klien
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Lihat dan kelola data klien
              </p>
            </div>
          </a>

          <a
            href="/admin/transactions"
            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow">
            <div>
              <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                <MessageSquare className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium">
                <span className="absolute inset-0" aria-hidden="true" />
                Riwayat Transaksi
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Lihat semua transaksi dan pembayaran
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
