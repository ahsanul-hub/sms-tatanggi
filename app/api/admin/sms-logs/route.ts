import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const smsLogs = await prisma.smsLog.findMany({
      include: {
        user: {
          include: {
            clientProfile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500, // Limit to last 500 SMS logs
    });

    return NextResponse.json(smsLogs);
  } catch (error) {
    console.error("Get admin SMS logs error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
