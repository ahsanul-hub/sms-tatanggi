"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  Mail,
  Building,
  Phone,
  DollarSign,
  RefreshCw,
  Eye,
  UserCheck,
  UserX,
} from "lucide-react";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  clientProfile: {
    companyName: string;
    phoneNumber: string | null;
    address: string | null;
    balance: number;
    isActive: boolean;
  };
  _count?: {
    transactions: number;
    smsLogs: number;
  };
}

export default function AdminClientsPage() {
  const { data: session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const toggleClientStatus = async (
    clientId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch("/api/admin/clients/toggle-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientId, isActive: !currentStatus }),
      });

      if (response.ok) {
        // Update local state
        setClients((prev) =>
          prev.map((client) =>
            client.id === clientId
              ? {
                  ...client,
                  clientProfile: {
                    ...client.clientProfile,
                    isActive: !currentStatus,
                  },
                }
              : client
          )
        );
      }
    } catch (error) {
      console.error("Error toggling client status:", error);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Daftar Klien</h1>
            <p className="mt-1 text-sm text-gray-500">
              Kelola semua klien yang terdaftar
            </p>
          </div>
          <button
            onClick={fetchClients}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Klien
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {clients.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Klien Aktif
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {clients.filter((c) => c.clientProfile.isActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Klien Non-Aktif
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {clients.filter((c) => !c.clientProfile.isActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Saldo
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    Rp{" "}
                    {clients
                      .reduce((sum, c) => sum + c.clientProfile.balance, 0)
                      .toLocaleString("id-ID")}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Tidak ada klien
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Belum ada klien yang terdaftar.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {clients.map((client) => (
              <li key={client.id}>
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            client.clientProfile.isActive
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}>
                          <span
                            className={`text-sm font-medium ${
                              client.clientProfile.isActive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}>
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {client.clientProfile.companyName}
                          </p>
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              client.clientProfile.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                            {client.clientProfile.isActive
                              ? "Aktif"
                              : "Non-Aktif"}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-1" />
                          <p>{client.email}</p>
                          <span className="mx-2">•</span>
                          <Building className="h-4 w-4 mr-1" />
                          <p>{client.name}</p>
                          {client.clientProfile.phoneNumber && (
                            <>
                              <span className="mx-2">•</span>
                              <Phone className="h-4 w-4 mr-1" />
                              <p>{client.clientProfile.phoneNumber}</p>
                            </>
                          )}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <p>
                            Saldo: Rp{" "}
                            {client.clientProfile.balance.toLocaleString(
                              "id-ID"
                            )}
                          </p>
                          <span className="mx-2">•</span>
                          <p>Transaksi: {client._count?.transactions || 0}</p>
                          <span className="mx-2">•</span>
                          <p>SMS: {client._count?.smsLogs || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          toggleClientStatus(
                            client.id,
                            client.clientProfile.isActive
                          )
                        }
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${
                          client.clientProfile.isActive
                            ? "text-red-700 bg-red-100 hover:bg-red-200"
                            : "text-green-700 bg-green-100 hover:bg-green-200"
                        }`}>
                        {client.clientProfile.isActive ? (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Nonaktifkan
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Aktifkan
                          </>
                        )}
                      </button>
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <Eye className="h-3 w-3 mr-1" />
                        Detail
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
