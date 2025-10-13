export type Language = "id" | "en";

export interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    refresh: string;
    close: string;
    confirm: string;
    yes: string;
    no: string;
    total: string;
    amount: string;
    date: string;
    status: string;
    action: string;
    description: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    address: string;
    price: string;
    quantity: string;
    subtotal: string;
    tax: string;
    grandTotal: string;
    paid: string;
    unpaid: string;
    pending: string;
    completed: string;
    failed: string;
    sent: string;
    delivered: string;
    undelivered: string;
    currency: string;
  };

  // Navigation
  navigation: {
    dashboard: string;
    clients: string;
    transactions: string;
    smsLogs: string;
    generateBilling: string;
    summary: string;
    settings: string;
    logout: string;
    login: string;
    register: string;
  };

  // Homepage
  homepage: {
    title: string;
    subtitle: string;
    description: string;
    getStarted: string;
    features: {
      smsGateway: {
        title: string;
        description: string;
      };
      multiClient: {
        title: string;
        description: string;
      };
      paymentGateway: {
        title: string;
        description: string;
      };
      adminDashboard: {
        title: string;
        description: string;
      };
    };
  };

  // Auth
  auth: {
    login: {
      title: string;
      email: string;
      password: string;
      rememberMe: string;
      forgotPassword: string;
      loginButton: string;
      noAccount: string;
      registerLink: string;
    };
    register: {
      title: string;
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      companyName: string;
      phoneNumber: string;
      registerButton: string;
      hasAccount: string;
      loginLink: string;
    };
  };

  // Admin Dashboard
  adminDashboard: {
    title: string;
    stats: {
      totalClients: string;
      totalRevenue: string;
      totalPaid: string;
      billedThisMonth: string;
      paidThisMonth: string;
      outstandingThisMonth: string;
    };
  };

  // Client Dashboard
  clientDashboard: {
    title: string;
    stats: {
      outstandingThisMonth: string;
      paidThisMonth: string;
      totalSms: string;
      sentSms: string;
      totalBilled: string;
    };
  };

  // SMS Logs
  smsLogs: {
    title: string;
    phoneNumber: string;
    message: string;
    cost: string;
    sentAt: string;
    createdAt: string;
    noLogs: string;
    filterByStatus: string;
    itemsPerPage: string;
    page: string;
    of: string;
  };

  // Transactions
  transactions: {
    title: string;
    type: string;
    amount: string;
    referenceId: string;
    createdAt: string;
    noTransactions: string;
    filterByType: string;
    filterByStatus: string;
  };

  // Generate Billing
  generateBilling: {
    title: string;
    selectClient: string;
    smsCount: string;
    unitPrice: string;
    timeRange: string;
    startTime: string;
    endTime: string;
    percentages: string;
    delivered: string;
    undelivered: string;
    failed: string;
    generateButton: string;
    summary: {
      title: string;
      totalSms: string;
      delivered: string;
      undelivered: string;
      failed: string;
      unitPrice: string;
      totalCost: string;
    };
  };

  // Summary
  summary: {
    title: string;
    selectPeriod: string;
    month: string;
    year: string;
    stats: {
      totalSms: string;
      sent: string;
      failed: string;
      totalCost: string;
      totalBilledExcTax: string;
      paidInPeriod: string;
      outstanding: string;
    };
    payment: {
      payFull: string;
      payPartial: string;
      partialAmount: string;
      exportInvoice: string;
    };
  };

  // Clients
  clients: {
    title: string;
    name: string;
    email: string;
    company: string;
    phone: string;
    transactions: string;
    sms: string;
    status: string;
    active: string;
    inactive: string;
    toggleStatus: string;
    noClients: string;
  };
}

export const translations: Record<Language, Translations> = {
  id: {
    common: {
      loading: "Memuat...",
      error: "Terjadi kesalahan",
      success: "Berhasil",
      save: "Simpan",
      cancel: "Batal",
      delete: "Hapus",
      edit: "Edit",
      view: "Lihat",
      back: "Kembali",
      next: "Selanjutnya",
      previous: "Sebelumnya",
      search: "Cari",
      filter: "Filter",
      export: "Ekspor",
      import: "Impor",
      refresh: "Refresh",
      close: "Tutup",
      confirm: "Konfirmasi",
      yes: "Ya",
      no: "Tidak",
      total: "Total",
      amount: "Jumlah",
      date: "Tanggal",
      status: "Status",
      action: "Aksi",
      description: "Deskripsi",
      name: "Nama",
      email: "Email",
      phone: "Telepon",
      company: "Perusahaan",
      address: "Alamat",
      price: "Harga",
      quantity: "Jumlah",
      subtotal: "Subtotal",
      tax: "Pajak",
      grandTotal: "Total Keseluruhan",
      paid: "Terbayar",
      unpaid: "Belum Bayar",
      pending: "Menunggu",
      completed: "Selesai",
      failed: "Gagal",
      sent: "Terkirim",
      delivered: "Terkirim",
      undelivered: "Tidak Terkirim",
      currency: "Mata Uang",
    },
    navigation: {
      dashboard: "Dashboard",
      clients: "Klien",
      transactions: "Transaksi",
      smsLogs: "Log SMS",
      generateBilling: "Generate Billing",
      summary: "Summary",
      settings: "Pengaturan",
      logout: "Logout",
      login: "Login",
      register: "Daftar",
    },
    homepage: {
      title: "SMS Gateway Terpercaya",
      subtitle: "SMS Gateway",
      description:
        "Platform SMS Gateway dengan sistem multi-client, manajemen tagihan otomatis, dan dashboard admin yang lengkap untuk mengelola bisnis SMS Anda.",
      getStarted: "Mulai Sekarang",
      features: {
        smsGateway: {
          title: "SMS Gateway",
          description: "Kirim SMS dengan mudah dan cepat",
        },
        multiClient: {
          title: "Multi-Client",
          description: "Kelola banyak client dalam satu platform",
        },
        paymentGateway: {
          title: "Payment Gateway",
          description: "Sistem pembayaran terintegrasi",
        },
        adminDashboard: {
          title: "Dashboard Admin",
          description: "Monitor dan kelola semua aktivitas",
        },
      },
    },
    auth: {
      login: {
        title: "Masuk ke Akun Anda",
        email: "Email",
        password: "Password",
        rememberMe: "Ingat saya",
        forgotPassword: "Lupa password?",
        loginButton: "Masuk",
        noAccount: "Belum punya akun?",
        registerLink: "Daftar di sini",
      },
      register: {
        title: "Buat Akun Baru",
        name: "Nama Lengkap",
        email: "Email",
        password: "Password",
        confirmPassword: "Konfirmasi Password",
        companyName: "Nama Perusahaan",
        phoneNumber: "Nomor Telepon",
        registerButton: "Daftar",
        hasAccount: "Sudah punya akun?",
        loginLink: "Masuk di sini",
      },
    },
    adminDashboard: {
      title: "Dashboard Admin",
      stats: {
        totalClients: "Total Klien",
        totalRevenue: "Total Revenue",
        totalPaid: "Tagihan Terbayar",
        billedThisMonth: "Ditagih Bulan Ini",
        paidThisMonth: "Terbayar Bulan Ini",
        outstandingThisMonth: "Sisa Tagihan Bulan Ini",
      },
    },
    clientDashboard: {
      title: "Dashboard Klien",
      stats: {
        outstandingThisMonth: "Sisa Tagihan Bulan Ini",
        paidThisMonth: "Terbayar Bulan Ini",
        totalSms: "Total SMS",
        sentSms: "SMS Terkirim",
        totalBilled: "Total Tagihan (all time)",
      },
    },
    smsLogs: {
      title: "Log SMS",
      phoneNumber: "Nomor Telepon",
      message: "Pesan",
      cost: "Biaya",
      sentAt: "Dikirim Pada",
      createdAt: "Dibuat Pada",
      noLogs: "Tidak ada log SMS",
      filterByStatus: "Filter berdasarkan status",
      itemsPerPage: "Item per halaman",
      page: "Halaman",
      of: "dari",
    },
    transactions: {
      title: "Riwayat Transaksi",
      type: "Tipe",
      amount: "Jumlah",
      referenceId: "ID Referensi",
      createdAt: "Dibuat Pada",
      noTransactions: "Tidak ada transaksi",
      filterByType: "Filter berdasarkan tipe",
      filterByStatus: "Filter berdasarkan status",
    },
    generateBilling: {
      title: "Generate Billing",
      selectClient: "Pilih Klien",
      smsCount: "Jumlah SMS",
      unitPrice: "Harga per SMS (Rp)",
      timeRange: "Rentang Waktu (menit)",
      startTime: "Waktu Mulai",
      endTime: "Waktu Selesai",
      percentages:
        "Persentase Status (boleh desimal, total akan dinormalisasi ke 100%)",
      delivered: "DELIVERED (%)",
      undelivered: "UNDELIVERED (%)",
      failed: "FAILED (%)",
      generateButton: "Generate SMS",
      summary: {
        title: "Ringkasan",
        totalSms: "Total SMS",
        delivered: "Delivered",
        undelivered: "Undelivered",
        failed: "Failed",
        unitPrice: "Harga per SMS",
        totalCost: "Total Biaya",
      },
    },
    summary: {
      title: "Summary",
      selectPeriod: "Pilih Periode",
      month: "Bulan",
      year: "Tahun",
      stats: {
        totalSms: "Total SMS",
        sent: "Terkirim",
        failed: "Gagal",
        totalCost: "Total Biaya",
        totalBilledExcTax: "Total Tagihan EXC TAX",
        paidInPeriod: "Terbayar Periode Ini",
        outstanding: "Sisa Tagihan",
      },
      payment: {
        payFull: "Bayar Penuh",
        payPartial: "Bayar Parsial",
        partialAmount: "Jumlah Parsial",
        exportInvoice: "Export Invoice PDF",
      },
    },
    clients: {
      title: "Kelola Klien",
      name: "Nama",
      email: "Email",
      company: "Perusahaan",
      phone: "Telepon",
      transactions: "Transaksi",
      sms: "SMS",
      status: "Status",
      active: "Aktif",
      inactive: "Tidak Aktif",
      toggleStatus: "Ubah Status",
      noClients: "Tidak ada klien",
    },
  },
  en: {
    common: {
      loading: "Loading...",
      error: "An error occurred",
      success: "Success",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      back: "Back",
      next: "Next",
      previous: "Previous",
      search: "Search",
      filter: "Filter",
      export: "Export",
      import: "Import",
      refresh: "Refresh",
      close: "Close",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
      total: "Total",
      amount: "Amount",
      date: "Date",
      status: "Status",
      action: "Action",
      description: "Description",
      name: "Name",
      email: "Email",
      phone: "Phone",
      company: "Company",
      address: "Address",
      price: "Price",
      quantity: "Quantity",
      subtotal: "Subtotal",
      tax: "Tax",
      grandTotal: "Grand Total",
      paid: "Paid",
      unpaid: "Unpaid",
      pending: "Pending",
      completed: "Completed",
      failed: "Failed",
      sent: "Sent",
      delivered: "Delivered",
      undelivered: "Undelivered",
      currency: "Currency",
    },
    navigation: {
      dashboard: "Dashboard",
      clients: "Clients",
      transactions: "Transactions",
      smsLogs: "SMS Logs",
      generateBilling: "Generate Billing",
      summary: "Summary",
      settings: "Settings",
      logout: "Logout",
      login: "Login",
      register: "Register",
    },
    homepage: {
      title: "Trusted SMS Gateway",
      subtitle: "SMS Gateway",
      description:
        "SMS Gateway platform with multi-client system, automatic billing management, and comprehensive admin dashboard to manage your SMS business.",
      getStarted: "Get Started",
      features: {
        smsGateway: {
          title: "SMS Gateway",
          description: "Send SMS easily and quickly",
        },
        multiClient: {
          title: "Multi-Client",
          description: "Manage multiple clients in one platform",
        },
        paymentGateway: {
          title: "Payment Gateway",
          description: "Integrated payment system",
        },
        adminDashboard: {
          title: "Admin Dashboard",
          description: "Monitor and manage all activities",
        },
      },
    },
    auth: {
      login: {
        title: "Sign in to your account",
        email: "Email",
        password: "Password",
        rememberMe: "Remember me",
        forgotPassword: "Forgot password?",
        loginButton: "Sign In",
        noAccount: "Don't have an account?",
        registerLink: "Register here",
      },
      register: {
        title: "Create new account",
        name: "Full Name",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        companyName: "Company Name",
        phoneNumber: "Phone Number",
        registerButton: "Register",
        hasAccount: "Already have an account?",
        loginLink: "Sign in here",
      },
    },
    adminDashboard: {
      title: "Admin Dashboard",
      stats: {
        totalClients: "Total Clients",
        totalRevenue: "Total Revenue",
        totalPaid: "Total Paid",
        billedThisMonth: "Billed This Month",
        paidThisMonth: "Paid This Month",
        outstandingThisMonth: "Outstanding This Month",
      },
    },
    clientDashboard: {
      title: "Client Dashboard",
      stats: {
        outstandingThisMonth: "Outstanding This Month",
        paidThisMonth: "Paid This Month",
        totalSms: "Total SMS",
        sentSms: "Sent SMS",
        totalBilled: "Total Billed (all time)",
      },
    },
    smsLogs: {
      title: "SMS Logs",
      phoneNumber: "Phone Number",
      message: "Message",
      cost: "Cost",
      sentAt: "Sent At",
      createdAt: "Created At",
      noLogs: "No SMS logs",
      filterByStatus: "Filter by status",
      itemsPerPage: "Items per page",
      page: "Page",
      of: "of",
    },
    transactions: {
      title: "Transaction History",
      type: "Type",
      amount: "Amount",
      referenceId: "Reference ID",
      createdAt: "Created At",
      noTransactions: "No transactions",
      filterByType: "Filter by type",
      filterByStatus: "Filter by status",
    },
    generateBilling: {
      title: "Generate Billing",
      selectClient: "Select Client",
      smsCount: "SMS Count",
      unitPrice: "Price per SMS (Rp)",
      timeRange: "Time Range (minutes)",
      startTime: "Start Time",
      endTime: "End Time",
      percentages:
        "Status percentages (decimals allowed, total will be normalized to 100%)",
      delivered: "DELIVERED (%)",
      undelivered: "UNDELIVERED (%)",
      failed: "FAILED (%)",
      generateButton: "Generate SMS",
      summary: {
        title: "Summary",
        totalSms: "Total SMS",
        delivered: "Delivered",
        undelivered: "Undelivered",
        failed: "Failed",
        unitPrice: "Price per SMS",
        totalCost: "Total Cost",
      },
    },
    summary: {
      title: "Summary",
      selectPeriod: "Select Period",
      month: "Month",
      year: "Year",
      stats: {
        totalSms: "Total SMS",
        sent: "Sent",
        failed: "Failed",
        totalCost: "Total Cost",
        totalBilledExcTax: "Total Billed EXC TAX",
        paidInPeriod: "Paid in Period",
        outstanding: "Outstanding",
      },
      payment: {
        payFull: "Pay Full",
        payPartial: "Pay Partial",
        partialAmount: "Partial Amount",
        exportInvoice: "Export Invoice PDF",
      },
    },
    clients: {
      title: "Manage Clients",
      name: "Name",
      email: "Email",
      company: "Company",
      phone: "Phone",
      transactions: "Transactions",
      sms: "SMS",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      toggleStatus: "Toggle Status",
      noClients: "No clients",
    },
  },
};
