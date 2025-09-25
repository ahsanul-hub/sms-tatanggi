import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, isActive } = body;

    if (!clientId) {
      return NextResponse.json(
        { message: "Client ID diperlukan" },
        { status: 400 }
      );
    }

    // Update client status
    const updatedClient = await prisma.clientProfile.update({
      where: { userId: clientId },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      message: `Klien berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}`,
      client: updatedClient,
    });
  } catch (error) {
    console.error("Toggle client status error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
