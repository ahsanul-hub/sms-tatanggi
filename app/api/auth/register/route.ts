import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, companyName, phoneNumber, address } = body;

    // Validasi input
    if (!name || !email || !password || !companyName) {
      return NextResponse.json(
        { message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // Cek apakah email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat user dan client profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CLIENT",
        clientProfile: {
          create: {
            companyName,
            phoneNumber: phoneNumber || null,
            address: address || null,
            balance: 0,
            isActive: true,
          },
        },
      },
      include: {
        clientProfile: true,
      },
    });

    // Hapus password dari response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "Akun berhasil dibuat",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
