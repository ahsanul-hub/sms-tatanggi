import Link from 'next/link'
import { ArrowRight, MessageSquare, Users, CreditCard, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">SMS Gateway Tatanggi</h1>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/auth/login" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/auth/register" 
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            SMS Gateway
            <span className="text-blue-600"> Terpercaya</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Platform SMS Gateway dengan sistem multi-client, manajemen tagihan otomatis, 
            dan dashboard admin yang lengkap untuk mengelola bisnis SMS Anda.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/auth/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Mulai Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">SMS Gateway</h3>
                  <p className="text-sm text-gray-500">Kirim SMS dengan mudah dan cepat</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Multi-Client</h3>
                  <p className="text-sm text-gray-500">Kelola banyak client dalam satu platform</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Payment Gateway</h3>
                  <p className="text-sm text-gray-500">Sistem pembayaran terintegrasi</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Dashboard Admin</h3>
                  <p className="text-sm text-gray-500">Monitor dan kelola semua aktivitas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
