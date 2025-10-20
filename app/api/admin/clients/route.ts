import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check if we're in build time
    if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
      return NextResponse.json(
        { message: "Database not configured" },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clients = await prisma.user.findMany({
      where: { role: "CLIENT" },
      include: {
        clientProfile: true,
        _count: {
          select: {
            transactions: true,
            smsLogs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Get clients error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId, currency } = await request.json();

    if (!userId || !currency) {
      return NextResponse.json(
        { message: "userId dan currency diperlukan" },
        { status: 400 }
      );
    }

    if (!["IDR", "USD"].includes(currency)) {
      return NextResponse.json(
        { message: "Currency harus IDR atau USD" },
        { status: 400 }
      );
    }

    // Update currency di client profile
    const updatedClient = await prisma.clientProfile.update({
      where: { userId },
      data: { currency },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      message: "Currency berhasil diupdate",
      client: updatedClient,
    });
  } catch (error) {
    console.error("Update client currency error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
