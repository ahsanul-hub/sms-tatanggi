"use client";

import { useEffect, useMemo, useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function BinCheckPage() {
  const [cardInput, setCardInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  // Format kartu: 4440 1234 5678 9010
  const formattedCard = useMemo(() => {
    const digits = cardInput.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }, [cardInput]);

  const canCheck = useMemo(
    () => cardInput.replace(/\D/g, "").length >= 4,
    [cardInput]
  );

  const onCheck = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);
      const digits = cardInput.replace(/\D/g, "");
      const res = await fetch(`/api/payment/bin?card=${digits}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || "Failed to check BIN");
        return;
      }

      // Normalisasi bentuk respons: bisa berupa obj {success, bin}, atau array langsung
      const payload = json?.bin ?? json;
      const data = Array.isArray(payload)
        ? payload[0] || null
        : payload?.data ?? payload ?? null;

      setResult({ raw: payload, data });
    } catch (e) {
      setError("Failed to check BIN");
    } finally {
      setLoading(false);
    }
  };

  // Derived values
  const derived = useMemo(() => {
    console.log("result", result);
    const data = result?.data || {};
    const status = String(result?.status || data?.status || "").toUpperCase();
    const type = data?.type || data?.cardType || "";
    const brand = data?.brand || data?.scheme || "";
    const issuingBank =
      data?.issuingBank ||
      data?.issuingbank ||
      data?.issuing_bank ||
      data?.bank ||
      data?.bankName ||
      "";
    return { status, type, brand, issuingBank };
  }, [result]);

  const showSuccess = useMemo(() => {
    if (!result?.data) return false;
    if (!derived.status) return true; // jika ada data tapi tanpa status, anggap sukses
    return derived.status === "SUCCESS";
  }, [derived.status, result]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-16">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Header with logo */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-32 h-32 flex items-center justify-center">
                    <img
                      src="/redpay logo.png"
                      alt="redpay"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      BIN Checker
                    </h2>
                    <p className="text-xs text-gray-500">
                      Check credit card BIN information
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={formattedCard}
                onChange={(e) => setCardInput(e.target.value)}
                placeholder="4440 1234 5678 9010"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <button
                onClick={onCheck}
                disabled={!canCheck || loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Checking..." : "Check BIN"}
              </button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Result */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">BIN Result</h3>
              {showSuccess && (
                <span className="inline-flex items-center text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1 text-xs font-medium">
                  <span className="mr-1">✓</span> SUCCESS
                </span>
              )}
            </div>
            {!result ? (
              <p className="text-sm text-gray-500">
                Enter a card number then press Check to see BIN information.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Info label="Type" value={derived.type} />
                  <Info label="Brand" value={derived.brand} />
                  <Info label="Issuing Bank" value={derived.issuingBank} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between border rounded px-3 py-2">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 truncate max-w-[60%] text-right">
        {value || "-"}
      </span>
    </div>
  );
}
