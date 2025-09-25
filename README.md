# SMS Gateway Tatanggi

Sistem SMS Gateway fullstack dengan Next.js yang memiliki fitur multi-client, sistem pembayaran, dan dashboard admin yang lengkap.

## Fitur Utama

### 🚀 Fitur Umum

- **Multi-Client System**: Kelola banyak klien dalam satu platform
- **Authentication**: Sistem login/register dengan NextAuth.js
- **Role-based Access**: Admin dan Client dengan akses berbeda
- **Responsive Design**: UI modern dengan Tailwind CSS

### 💳 Sistem Pembayaran

- **Mock Payment Gateway**: Sistem pembayaran untuk testing
- **Top Up Saldo**: Klien dapat menambah saldo
- **Riwayat Transaksi**: Tracking semua transaksi
- **Status Pembayaran**: Real-time status pembayaran

### 📱 SMS Management

- **Mock SMS Data**: Data SMS yang dapat diatur admin
- **SMS Logs**: Riwayat pengiriman SMS
- **Cost Tracking**: Tracking biaya per SMS
- **Status Monitoring**: Monitor status pengiriman

### 👨‍💼 Dashboard Admin

- **Generate Tagihan**: Buat tagihan SMS untuk klien
- **Client Management**: Kelola semua klien
- **Transaction Monitoring**: Monitor semua transaksi
- **SMS Analytics**: Analisis pengiriman SMS
- **Revenue Tracking**: Tracking pendapatan

### 👤 Dashboard Client

- **Saldo Management**: Lihat dan kelola saldo
- **Top Up**: Tambah saldo dengan payment gateway
- **Transaction History**: Riwayat transaksi pribadi
- **SMS Logs**: Riwayat SMS yang dikirim
- **Billing**: Lihat tagihan yang perlu dibayar

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL dengan Prisma ORM
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Payment**: Mock Payment Gateway

## Setup dan Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd sms-gateway-tatanggi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env.local` berdasarkan `env.example`:

```bash
cp env.example .env.local
```

Edit `.env.local` dengan konfigurasi database Anda:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sms_gateway_tatanggi"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Payment Gateway (Mock)
PAYMENT_GATEWAY_URL="https://api.mock-payment.com"
PAYMENT_GATEWAY_KEY="mock-api-key"

# SMS Provider (Mock)
SMS_PROVIDER_URL="https://api.mock-sms.com"
SMS_PROVIDER_KEY="mock-sms-key"
```

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema ke database
npm run db:push

# Setup admin user
npm run setup:admin

# Seed sample data (opsional)
npm run db:seed
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## Akun Default

### Admin

- **Email**: admin@smsgateway.com
- **Password**: admin123

### Client (Sample Data)

- **Email**: john@company1.com
- **Password**: password123
- **Company**: PT. Company One

## Struktur Project

```
sms-gateway-tatanggi/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── client/            # Client dashboard pages
│   ├── auth/              # Authentication pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── payment.ts        # Mock payment gateway
├── prisma/               # Database schema
│   └── schema.prisma
├── scripts/              # Setup scripts
│   ├── setup-admin.js    # Create admin user
│   └── seed-data.js      # Seed sample data
├── types/                # TypeScript types
└── middleware.ts         # Route protection
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register client
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Payment

- `POST /api/payment/create` - Create payment
- `POST /api/payment/status` - Check payment status

### Admin APIs

- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/clients` - Get all clients
- `POST /api/admin/generate-billing` - Generate billing
- `GET /api/admin/transactions` - Get all transactions
- `GET /api/admin/sms-logs` - Get all SMS logs

### Client APIs

- `GET /api/client/dashboard/stats` - Client dashboard stats
- `GET /api/client/transactions` - Client transactions
- `GET /api/client/sms-logs` - Client SMS logs

## Fitur Mock Payment

Sistem menggunakan mock payment gateway untuk testing:

1. **Create Payment**: Buat payment dengan amount tertentu
2. **Payment URL**: Dapatkan URL untuk simulasi pembayaran
3. **Status Check**: Cek status pembayaran (80% success rate)
4. **Auto Complete**: Admin dapat manually complete payment

## Fitur Mock SMS

Admin dapat generate SMS logs untuk testing:

1. **Generate Billing**: Buat tagihan SMS dengan jumlah tertentu
2. **Auto SMS Logs**: Sistem otomatis buat SMS logs sesuai tagihan
3. **Cost Calculation**: Rp 500 per SMS
4. **Status Tracking**: Track status pengiriman SMS

## Development

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Reset database
npx prisma db push --force-reset

# View database
npx prisma studio
```

### Build untuk Production

```bash
npm run build
npm start
```

## Contributing

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## License

MIT License

## Support

Untuk pertanyaan atau support, silakan buat issue di repository ini.
