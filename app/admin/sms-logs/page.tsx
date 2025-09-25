"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Phone,
  Users,
  Filter,
} from "lucide-react";

interface SmsLog {
  id: string;
  phoneNumber: string;
  message: string;
  status: "PENDING" | "SENT" | "FAILED" | "DELIVERED";
  cost: number;
  sentAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    clientProfile: {
      companyName: string;
    };
  };
}

export default function AdminSmsLogsPage() {
  const { data: session } = useSession();
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "SENT" | "FAILED" | "PENDING">(
    "ALL"
  );
  const [clientFilter, setClientFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchSmsLogs();
  }, []);

  const fetchSmsLogs = async () => {
    try {
      const response = await fetch("/api/admin/sms-logs");
      if (response.ok) {
        const data = await response.json();
        setSmsLogs(data);
      }
    } catch (error) {
      console.error("Error fetching SMS logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SENT":
      case "DELIVERED":
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
      case "SENT":
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredSmsLogs = smsLogs.filter((log) => {
    const statusMatch = filter === "ALL" || log.status === filter;
    const clientMatch = clientFilter === "ALL" || log.user.id === clientFilter;
    return statusMatch && clientMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSmsLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSmsLogs = filteredSmsLogs.slice(startIndex, endIndex);

  const totalCost = filteredSmsLogs.reduce((sum, log) => sum + log.cost, 0);
  const uniqueClients = Array.from(new Set(smsLogs.map((log) => log.user.id)));

  // Reset to first page when filters or itemsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, clientFilter, itemsPerPage]);

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
            <h1 className="text-2xl font-bold text-gray-900">SMS Logs Admin</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor semua pengiriman SMS dari semua klien
            </p>
            {filteredSmsLogs.length > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                {filteredSmsLogs.length} total SMS • Halaman {currentPage} dari{" "}
                {totalPages}
              </p>
            )}
          </div>
          <button
            onClick={fetchSmsLogs}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Status:</span>
            {[
              { key: "ALL", label: "Semua" },
              { key: "SENT", label: "Terkirim" },
              { key: "PENDING", label: "Pending" },
              { key: "FAILED", label: "Gagal" },
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  filter === filterOption.key
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Klien:</span>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ALL">Semua Klien</option>
              {uniqueClients.map((clientId) => {
                const client = smsLogs.find(
                  (log) => log.user.id === clientId
                )?.user;
                return (
                  <option key={clientId} value={clientId}>
                    {client?.clientProfile.companyName} ({client?.name})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              Per halaman:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* SMS Logs List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {paginatedSmsLogs.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Tidak ada SMS logs
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Belum ada SMS yang dikirim.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {paginatedSmsLogs.map((log) => (
              <li key={log.id}>
                <div className="px-4 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {log.phoneNumber}
                          </p>
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              log.status
                            )}`}>
                            {log.status}
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {log.message}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <p>
                            Klien: {log.user.clientProfile.companyName} (
                            {log.user.name})
                          </p>
                          <span className="mx-2">•</span>
                          <p>
                            Dibuat:{" "}
                            {new Date(log.createdAt).toLocaleString("id-ID")}
                          </p>
                          {log.sentAt && (
                            <>
                              <span className="mx-2">•</span>
                              <p>
                                Dikirim:{" "}
                                {new Date(log.sentAt).toLocaleString("id-ID")}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Rp {log.cost.toLocaleString("id-ID")}
                        </p>
                        <div className="flex items-center mt-1">
                          {getStatusIcon(log.status)}
                          <span className="ml-1 text-xs text-gray-500">
                            {log.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Sebelumnya
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Selanjutnya
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Menampilkan{" "}
                <span className="font-medium">
                  {filteredSmsLogs.length === 0 ? 0 : startIndex + 1}
                </span>{" "}
                sampai{" "}
                <span className="font-medium">
                  {Math.min(endIndex, filteredSmsLogs.length)}
                </span>{" "}
                dari{" "}
                <span className="font-medium">{filteredSmsLogs.length}</span>{" "}
                hasil
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="sr-only">Sebelumnya</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and pages around current page
                    const shouldShow =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!shouldShow) {
                      // Show ellipsis for gaps
                      if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}>
                        {page}
                      </button>
                    );
                  }
                )}

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="sr-only">Selanjutnya</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {filteredSmsLogs.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Ringkasan</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500">Total SMS</p>
              <p className="text-lg font-medium text-gray-900">
                {filteredSmsLogs.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Terkirim</p>
              <p className="text-lg font-medium text-green-600">
                {
                  filteredSmsLogs.filter(
                    (log) => log.status === "SENT" || log.status === "DELIVERED"
                  ).length
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-lg font-medium text-yellow-600">
                {
                  filteredSmsLogs.filter((log) => log.status === "PENDING")
                    .length
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-lg font-medium text-gray-900">
                Rp {totalCost.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
