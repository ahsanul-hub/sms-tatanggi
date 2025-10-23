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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [customerData, setCustomerData] = useState({
    customer_name: "",
    email: "",
    phone_number: "",
    address: "",
    city: "",
    province_state: "",
    country: "",
    postal_code: "",
  });

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

  const openPaymentModal = (amount: number) => {
    setPaymentAmount(amount);
    setShowPaymentModal(true);
  };

  const pay = async () => {
    try {
      setPaying(true);
      setMessage("");
      const payload = {
        month,
        year,
        amount: paymentAmount,
        ...customerData,
      };

      const res = await fetch("/api/client/summary/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.message || "Gagal membuat pembayaran");
        return;
      }
      // console.log(json);
      // Buka tab baru untuk payment
      window.open(json.paymentUrl, "_blank");
      setShowPaymentModal(false);
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
                onClick={() => openPaymentModal(outstanding)}
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
                  onClick={() => openPaymentModal(partialAmount)}
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {language === "id"
                  ? "Data Customer untuk Pembayaran"
                  : "Customer Data for Payment"}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === "id" ? "Nama" : "Name"} *
                    </label>
                    <input
                      type="text"
                      value={customerData.customer_name}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          customer_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerData.email}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === "id" ? "Nomor Telepon" : "Phone Number"} *
                    </label>
                    <div className="flex">
                      <select
                        value={customerData.phone_number.split(" ")[0] || "+62"}
                        onChange={(e) => {
                          const currentNumber = customerData.phone_number
                            .split(" ")
                            .slice(1)
                            .join(" ");
                          setCustomerData({
                            ...customerData,
                            phone_number:
                              `${e.target.value} ${currentNumber}`.trim(),
                          });
                        }}
                        className="w-28 px-2 py-2 border border-gray-300 rounded-l-md text-sm bg-gray-50 border-r-0 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        {/* Asia Pacific */}
                        <option value="+62">🇮🇩 +62</option>
                        <option value="+86">🇨🇳 +86</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+82">🇰🇷 +82</option>
                        <option value="+60">🇲🇾 +60</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+66">🇹🇭 +66</option>
                        <option value="+84">🇻🇳 +84</option>
                        <option value="+63">🇵🇭 +63</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+64">🇳🇿 +64</option>
                        <option value="+886">🇹🇼 +886</option>
                        <option value="+852">🇭🇰 +852</option>
                        <option value="+853">🇲🇴 +853</option>
                        <option value="+880">🇧🇩 +880</option>
                        <option value="+94">🇱🇰 +94</option>
                        <option value="+977">🇳🇵 +977</option>
                        <option value="+975">🇧🇹 +975</option>
                        <option value="+960">🇲🇻 +960</option>
                        <option value="+673">🇧🇳 +673</option>
                        <option value="+856">🇱🇦 +856</option>
                        <option value="+855">🇰🇭 +855</option>
                        <option value="+95">🇲🇲 +95</option>
                        <option value="+670">🇹🇱 +670</option>
                        <option value="+675">🇵🇬 +675</option>
                        <option value="+679">🇫🇯 +679</option>
                        <option value="+685">🇼🇸 +685</option>
                        <option value="+676">🇹🇴 +676</option>
                        <option value="+678">🇻🇺 +678</option>
                        <option value="+687">🇳🇨 +687</option>
                        <option value="+689">🇵🇫 +689</option>
                        <option value="+690">🇹🇰 +690</option>
                        <option value="+691">🇫🇲 +691</option>
                        <option value="+692">🇲🇭 +692</option>
                        <option value="+686">🇰🇮 +686</option>
                        <option value="+688">🇹🇻 +688</option>
                        <option value="+677">🇸🇧 +677</option>
                        <option value="+674">🇳🇷 +674</option>
                        <option value="+683">🇳🇺 +683</option>
                        <option value="+680">🇵🇼 +680</option>

                        {/* Europe */}
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+39">🇮🇹 +39</option>
                        <option value="+34">🇪🇸 +34</option>
                        <option value="+31">🇳🇱 +31</option>
                        <option value="+32">🇧🇪 +32</option>
                        <option value="+41">🇨🇭 +41</option>
                        <option value="+43">🇦🇹 +43</option>
                        <option value="+45">🇩🇰 +45</option>
                        <option value="+46">🇸🇪 +46</option>
                        <option value="+47">🇳🇴 +47</option>
                        <option value="+358">🇫🇮 +358</option>
                        <option value="+48">🇵🇱 +48</option>
                        <option value="+420">🇨🇿 +420</option>
                        <option value="+421">🇸🇰 +421</option>
                        <option value="+36">🇭🇺 +36</option>
                        <option value="+40">🇷🇴 +40</option>
                        <option value="+359">🇧🇬 +359</option>
                        <option value="+385">🇭🇷 +385</option>
                        <option value="+386">🇸🇮 +386</option>
                        <option value="+381">🇷🇸 +381</option>
                        <option value="+382">🇲🇪 +382</option>
                        <option value="+387">🇧🇦 +387</option>
                        <option value="+389">🇲🇰 +389</option>
                        <option value="+355">🇦🇱 +355</option>
                        <option value="+30">🇬🇷 +30</option>
                        <option value="+351">🇵🇹 +351</option>
                        <option value="+353">🇮🇪 +353</option>
                        <option value="+354">🇮🇸 +354</option>
                        <option value="+370">🇱🇹 +370</option>
                        <option value="+371">🇱🇻 +371</option>
                        <option value="+372">🇪🇪 +372</option>
                        <option value="+7">🇷🇺 +7</option>
                        <option value="+380">🇺🇦 +380</option>
                        <option value="+375">🇧🇾 +375</option>
                        <option value="+376">🇦🇩 +376</option>
                        <option value="+377">🇲🇨 +377</option>
                        <option value="+378">🇸🇲 +378</option>
                        <option value="+423">🇱🇮 +423</option>
                        <option value="+352">🇱🇺 +352</option>
                        <option value="+356">🇲🇹 +356</option>
                        <option value="+357">🇨🇾 +357</option>

                        {/* Americas */}
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+1">🇨🇦 +1</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+55">🇧🇷 +55</option>
                        <option value="+54">🇦🇷 +54</option>
                        <option value="+56">🇨🇱 +56</option>
                        <option value="+57">🇨🇴 +57</option>
                        <option value="+51">🇵🇪 +51</option>
                        <option value="+58">🇻🇪 +58</option>
                        <option value="+593">🇪🇨 +593</option>
                        <option value="+591">🇧🇴 +591</option>
                        <option value="+595">🇵🇾 +595</option>
                        <option value="+598">🇺🇾 +598</option>
                        <option value="+592">🇬🇾 +592</option>
                        <option value="+597">🇸🇷 +597</option>
                        <option value="+590">🇬🇵 +590</option>
                        <option value="+596">🇲🇶 +596</option>
                        <option value="+594">🇬🇫 +594</option>
                        <option value="+508">🇵🇲 +508</option>
                        <option value="+1">🇧🇧 +1</option>
                        <option value="+1">🇯🇲 +1</option>
                        <option value="+1">🇹🇹 +1</option>
                        <option value="+1">🇧🇸 +1</option>
                        <option value="+1">🇧🇿 +1</option>
                        <option value="+1">🇦🇬 +1</option>
                        <option value="+1">🇩🇲 +1</option>
                        <option value="+1">🇬🇩 +1</option>
                        <option value="+1">🇰🇳 +1</option>
                        <option value="+1">🇱🇨 +1</option>
                        <option value="+1">🇻🇨 +1</option>
                        <option value="+1">🇻🇬 +1</option>
                        <option value="+1">🇻🇮 +1</option>
                        <option value="+1">🇦🇮 +1</option>
                        <option value="+1">🇧🇲 +1</option>
                        <option value="+1">🇰🇾 +1</option>
                        <option value="+1">🇲🇸 +1</option>
                        <option value="+1">🇹🇨 +1</option>
                        <option value="+1">🇵🇷 +1</option>
                        <option value="+1">🇩🇴 +1</option>
                        <option value="+1">🇭🇹 +1</option>
                        <option value="+1">🇨🇺 +1</option>
                        <option value="+1">🇯🇲 +1</option>
                        <option value="+1">🇧🇧 +1</option>
                        <option value="+1">🇱🇨 +1</option>
                        <option value="+1">🇻🇨 +1</option>
                        <option value="+1">🇦🇬 +1</option>
                        <option value="+1">🇰🇳 +1</option>
                        <option value="+1">🇩🇲 +1</option>
                        <option value="+1">🇬🇩 +1</option>
                        <option value="+1">🇧🇿 +1</option>
                        <option value="+1">🇬🇹 +1</option>
                        <option value="+1">🇧🇿 +1</option>
                        <option value="+1">🇸🇻 +1</option>
                        <option value="+1">🇭🇳 +1</option>
                        <option value="+1">🇳🇮 +1</option>
                        <option value="+1">🇨🇷 +1</option>
                        <option value="+1">🇵🇦 +1</option>

                        {/* Middle East & Africa */}
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+965">🇰🇼 +965 Kuwait</option>
                        <option value="+974">🇶🇦 +974 Qatar</option>
                        <option value="+973">🇧🇭 +973 Bahrain</option>
                        <option value="+968">🇴🇲 +968 Oman</option>
                        <option value="+964">🇮🇶 +964 Iraq</option>
                        <option value="+98">🇮🇷 +98 Iran</option>
                        <option value="+90">🇹🇷 +90 Turkey</option>
                        <option value="+972">🇮🇱 +972 Israel</option>
                        <option value="+970">🇵🇸 +970 Palestine</option>
                        <option value="+961">🇱🇧 +961 Lebanon</option>
                        <option value="+963">🇸🇾 +963 Syria</option>
                        <option value="+962">🇯🇴 +962 Jordan</option>
                        <option value="+20">🇪🇬 +20 Egypt</option>
                        <option value="+218">🇱🇾 +218 Libya</option>
                        <option value="+216">🇹🇳 +216 Tunisia</option>
                        <option value="+213">🇩🇿 +213 Algeria</option>
                        <option value="+212">🇲🇦 +212 Morocco</option>
                        <option value="+222">🇲🇷 +222 Mauritania</option>
                        <option value="+221">🇸🇳 +221 Senegal</option>
                        <option value="+220">🇬🇲 +220 Gambia</option>
                        <option value="+223">🇲🇱 +223 Mali</option>
                        <option value="+224">🇬🇳 +224 Guinea</option>
                        <option value="+225">🇨🇮 +225 Côte d'Ivoire</option>
                        <option value="+226">🇧🇫 +226</option>
                        <option value="+227">🇳🇪 +227 Niger</option>
                        <option value="+228">🇹🇬 +228 Togo</option>
                        <option value="+229">🇧🇯 +229 Benin</option>
                        <option value="+230">🇲🇺 +230 Mauritius</option>
                        <option value="+231">🇱🇷 +231 Liberia</option>
                        <option value="+232">🇸🇱 +232</option>
                        <option value="+233">🇬🇭 +233 Ghana</option>
                        <option value="+234">🇳🇬 +234 Nigeria</option>
                        <option value="+235">🇹🇩 +235 Chad</option>
                        <option value="+236">
                          🇨🇫 +236 Central African Republic
                        </option>
                        <option value="+237">🇨🇲 +237 Cameroon</option>
                        <option value="+238">🇨🇻 +238</option>
                        <option value="+239">
                          🇸🇹 +239 São Tomé and Príncipe
                        </option>
                        <option value="+240">🇬🇶 +240</option>
                        <option value="+241">🇬🇦 +241 Gabon</option>
                        <option value="+242">
                          🇨🇬 +242 Republic of the Congo
                        </option>
                        <option value="+243">
                          🇨🇩 +243 Democratic Republic of the Congo
                        </option>
                        <option value="+244">🇦🇴 +244 Angola</option>
                        <option value="+245">🇬🇼 +245 Guinea-Bissau</option>
                        <option value="+246">
                          🇮🇴 +246 British Indian Ocean Territory
                        </option>
                        <option value="+248">🇸🇨 +248 Seychelles</option>
                        <option value="+249">🇸🇩 +249 Sudan</option>
                        <option value="+250">🇷🇼 +250 Rwanda</option>
                        <option value="+251">🇪🇹 +251 Ethiopia</option>
                        <option value="+252">🇸🇴 +252 Somalia</option>
                        <option value="+253">🇩🇯 +253 Djibouti</option>
                        <option value="+254">🇰🇪 +254 Kenya</option>
                        <option value="+255">🇹🇿 +255 Tanzania</option>
                        <option value="+256">🇺🇬 +256 Uganda</option>
                        <option value="+257">🇧🇮 +257 Burundi</option>
                        <option value="+258">🇲🇿 +258 Mozambique</option>
                        <option value="+260">🇿🇲 +260 Zambia</option>
                        <option value="+261">🇲🇬 +261 Madagascar</option>
                        <option value="+262">🇷🇪 +262 Réunion</option>
                        <option value="+263">🇿🇼 +263 Zimbabwe</option>
                        <option value="+264">🇳🇦 +264 Namibia</option>
                        <option value="+265">🇲🇼 +265 Malawi</option>
                        <option value="+266">🇱🇸 +266 Lesotho</option>
                        <option value="+267">🇧🇼 +267 Botswana</option>
                        <option value="+268">🇸🇿 +268 Eswatini</option>
                        <option value="+269">🇰🇲 +269 Comoros</option>
                        <option value="+27">🇿🇦 +27</option>
                        <option value="+290">🇸🇭 +290</option>
                        <option value="+291">🇪🇷 +291 Eritrea</option>
                        <option value="+297">🇦🇼 +297 Aruba</option>
                        <option value="+298">🇫🇴 +298</option>
                        <option value="+299">🇬🇱 +299 Greenland</option>
                        <option value="+350">🇬🇮 +350 Gibraltar</option>
                        <option value="+351">🇵🇹 +351 Portugal</option>
                        <option value="+352">🇱🇺 +352 Luxembourg</option>
                        <option value="+353">🇮🇪 +353 Ireland</option>
                        <option value="+354">🇮🇸 +354 Iceland</option>
                        <option value="+355">🇦🇱 +355 Albania</option>
                        <option value="+356">🇲🇹 +356 Malta</option>
                        <option value="+357">🇨🇾 +357 Cyprus</option>
                        <option value="+358">🇫🇮 +358 Finland</option>
                        <option value="+359">🇧🇬 +359 Bulgaria</option>
                        <option value="+36">🇭🇺 +36 Hungary</option>
                        <option value="+370">🇱🇹 +370 Lithuania</option>
                        <option value="+371">🇱🇻 +371 Latvia</option>
                        <option value="+372">🇪🇪 +372 Estonia</option>
                        <option value="+373">🇲🇩 +373 Moldova</option>
                        <option value="+374">🇦🇲 +374 Armenia</option>
                        <option value="+375">🇧🇾 +375 Belarus</option>
                        <option value="+376">🇦🇩 +376 Andorra</option>
                        <option value="+377">🇲🇨 +377 Monaco</option>
                        <option value="+378">🇸🇲 +378</option>
                        <option value="+380">🇺🇦 +380 Ukraine</option>
                        <option value="+381">🇷🇸 +381 Serbia</option>
                        <option value="+382">🇲🇪 +382 Montenegro</option>
                        <option value="+383">🇽🇰 +383 Kosovo</option>
                        <option value="+385">🇭🇷 +385 Croatia</option>
                        <option value="+386">🇸🇮 +386 Slovenia</option>
                        <option value="+387">
                          🇧🇦 +387 Bosnia and Herzegovina
                        </option>
                        <option value="+389">🇲🇰 +389</option>
                        <option value="+39">🇮🇹 +39 Italy</option>
                        <option value="+40">🇷🇴 +40 Romania</option>
                        <option value="+41">🇨🇭 +41 Switzerland</option>
                        <option value="+420">🇨🇿 +420</option>
                        <option value="+421">🇸🇰 +421 Slovakia</option>
                        <option value="+423">🇱🇮 +423 Liechtenstein</option>
                        <option value="+500">🇫🇰 +500</option>
                        <option value="+501">🇧🇿 +501</option>
                        <option value="+502">🇬🇹 +502</option>
                        <option value="+503">🇸🇻 +503</option>
                        <option value="+504">🇭🇳 +504</option>
                        <option value="+505">🇳🇮 +505</option>
                        <option value="+506">🇨🇷 +506</option>
                        <option value="+507">🇵🇦 +507</option>
                        <option value="+508">
                          🇵🇲 +508 Saint Pierre and Miquelon
                        </option>
                        <option value="+509">🇭🇹 +509 Haiti</option>
                        <option value="+590">🇬🇵 +590 Guadeloupe</option>
                        <option value="+591">🇧🇴 +591 Bolivia</option>
                        <option value="+592">🇬🇾 +592 Guyana</option>
                        <option value="+593">🇪🇨 +593 Ecuador</option>
                        <option value="+594">🇬🇫 +594</option>
                        <option value="+595">🇵🇾 +595 Paraguay</option>
                        <option value="+596">🇲🇶 +596 Martinique</option>
                        <option value="+597">🇸🇷 +597 Suriname</option>
                        <option value="+598">🇺🇾 +598 Uruguay</option>
                        <option value="+599">
                          🇧🇶 +599 Caribbean Netherlands
                        </option>
                        <option value="+670">🇹🇱 +670 Timor-Leste</option>
                        <option value="+672">🇦🇶 +672 Antarctica</option>
                        <option value="+673">🇧🇳 +673 Brunei</option>
                        <option value="+674">🇳🇷 +674 Nauru</option>
                        <option value="+675">🇵🇬 +675</option>
                        <option value="+676">🇹🇴 +676 Tonga</option>
                        <option value="+677">🇸🇧 +677</option>
                        <option value="+678">🇻🇺 +678 Vanuatu</option>
                        <option value="+679">🇫🇯 +679 Fiji</option>
                        <option value="+680">🇵🇼 +680 Palau</option>
                        <option value="+681">🇼🇫 +681 Wallis and Futuna</option>
                        <option value="+682">🇨🇰 +682</option>
                        <option value="+683">🇳🇺 +683 Niue</option>
                        <option value="+684">🇦🇸 +684</option>
                        <option value="+685">🇼🇸 +685 Samoa</option>
                        <option value="+686">🇰🇮 +686 Kiribati</option>
                        <option value="+687">🇳🇨 +687</option>
                        <option value="+688">🇹🇻 +688 Tuvalu</option>
                        <option value="+689">🇵🇫 +689</option>
                        <option value="+690">🇹🇰 +690 Tokelau</option>
                        <option value="+691">🇫🇲 +691 Micronesia</option>
                        <option value="+692">🇲🇭 +692</option>
                        <option value="+850">🇰🇵 +850</option>
                        <option value="+852">🇭🇰 +852</option>
                        <option value="+853">🇲🇴 +853 Macau</option>
                        <option value="+855">🇰🇭 +855 Cambodia</option>
                        <option value="+856">🇱🇦 +856 Laos</option>
                        <option value="+880">🇧🇩 +880 Bangladesh</option>
                        <option value="+886">🇹🇼 +886 Taiwan</option>
                        <option value="+960">🇲🇻 +960 Maldives</option>
                        <option value="+961">🇱🇧 +961 Lebanon</option>
                        <option value="+962">🇯🇴 +962 Jordan</option>
                        <option value="+963">🇸🇾 +963 Syria</option>
                        <option value="+964">🇮🇶 +964 Iraq</option>
                        <option value="+965">🇰🇼 +965 Kuwait</option>
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+967">🇾🇪 +967 Yemen</option>
                        <option value="+968">🇴🇲 +968 Oman</option>
                        <option value="+970">🇵🇸 +970 Palestine</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+972">🇮🇱 +972 Israel</option>
                        <option value="+973">🇧🇭 +973 Bahrain</option>
                        <option value="+974">🇶🇦 +974 Qatar</option>
                        <option value="+975">🇧🇹 +975 Bhutan</option>
                        <option value="+976">🇲🇳 +976 Mongolia</option>
                        <option value="+977">🇳🇵 +977 Nepal</option>
                        <option value="+992">🇹🇯 +992 Tajikistan</option>
                        <option value="+993">🇹🇲 +993 Turkmenistan</option>
                        <option value="+994">🇦🇿 +994 Azerbaijan</option>
                        <option value="+995">🇬🇪 +995 Georgia</option>
                        <option value="+996">🇰🇬 +996 Kyrgyzstan</option>
                        <option value="+998">🇺🇿 +998 Uzbekistan</option>
                      </select>
                      <input
                        type="tel"
                        value={
                          customerData.phone_number
                            .split(" ")
                            .slice(1)
                            .join(" ") || ""
                        }
                        onChange={(e) => {
                          const countryCode =
                            customerData.phone_number.split(" ")[0] || "+62";
                          setCustomerData({
                            ...customerData,
                            phone_number:
                              `${countryCode} ${e.target.value}`.trim(),
                          });
                        }}
                        placeholder={
                          language === "id" ? "81234567890" : "81234567890"
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === "id" ? "Kode Pos" : "Postal Code"}
                    </label>
                    <input
                      type="text"
                      value={customerData.postal_code}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          postal_code: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "id" ? "Alamat" : "Address"} *
                  </label>
                  <textarea
                    value={customerData.address}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={2}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === "id" ? "Kota" : "City"} *
                    </label>
                    <input
                      type="text"
                      value={customerData.city}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          city: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === "id" ? "Provinsi/State" : "Province/State"}{" "}
                      *
                    </label>
                    <input
                      type="text"
                      value={customerData.province_state}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          province_state: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === "id" ? "Negara" : "Country"} *
                    </label>
                    <input
                      type="text"
                      value={customerData.country}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          country: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>
                      {language === "id"
                        ? "Jumlah Pembayaran:"
                        : "Payment Amount:"}
                    </strong>{" "}
                    Rp {paymentAmount.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                  {language === "id" ? "Batal" : "Cancel"}
                </button>
                <button
                  onClick={pay}
                  disabled={
                    paying ||
                    !customerData.customer_name ||
                    !customerData.email ||
                    !customerData.phone_number ||
                    !customerData.address ||
                    !customerData.city ||
                    !customerData.province_state ||
                    !customerData.country
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
                  {paying
                    ? language === "id"
                      ? "Memproses..."
                      : "Processing..."
                    : language === "id"
                    ? "Lanjutkan Pembayaran"
                    : "Continue Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
