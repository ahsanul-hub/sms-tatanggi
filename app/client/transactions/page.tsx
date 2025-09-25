"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: "CREDIT" | "DEBIT" | "PAYMENT" | "REFUND";
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  description: string;
  referenceId: string;
  createdAt: string;
}

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "COMPLETED" | "FAILED"
  >("ALL");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/client/transactions");
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PAYMENT":
      case "CREDIT":
        return <ArrowUpRight className="h-5 w-5 text-green-500" />;
      case "DEBIT":
        return <ArrowDownLeft className="h-5 w-5 text-red-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PAYMENT":
      case "CREDIT":
        return "text-green-600";
      case "DEBIT":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "ALL") return true;
    return transaction.status === filter;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Riwayat Transaksi
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Lihat semua transaksi dan pembayaran Anda
            </p>
          </div>
          <button
            onClick={fetchTransactions}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex space-x-4">
          {[
            { key: "ALL", label: "Semua" },
            { key: "PENDING", label: "Pending" },
            { key: "COMPLETED", label: "Berhasil" },
            { key: "FAILED", label: "Gagal" },
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === filterOption.key
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}>
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Tidak ada transaksi
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Belum ada transaksi yang ditemukan.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <li key={transaction.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getTypeIcon(transaction.type)}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            transaction.status
                          )}`}>
                          {transaction.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <p>ID: {transaction.referenceId}</p>
                        <span className="mx-2">•</span>
                        <p>
                          {new Date(transaction.createdAt).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${getTypeColor(
                          transaction.type
                        )}`}>
                        {transaction.type === "DEBIT" ? "-" : "+"}Rp{" "}
                        {Math.abs(transaction.amount).toLocaleString("id-ID")}
                      </p>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 text-xs text-gray-500">
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Summary */}
      {transactions.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Ringkasan</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Total Transaksi</p>
              <p className="text-lg font-medium text-gray-900">
                {transactions.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Berhasil</p>
              <p className="text-lg font-medium text-green-600">
                {transactions.filter((t) => t.status === "COMPLETED").length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-lg font-medium text-yellow-600">
                {transactions.filter((t) => t.status === "PENDING").length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
