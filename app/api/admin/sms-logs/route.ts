import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const clientId = searchParams.get("clientId");

    console.log("SMS Logs Filter Input:", {
      startDate,
      endDate,
      clientId,
      url: request.url,
    });

    const where: any = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        where.createdAt = {
          gte: start,
          lte: new Date(end.setHours(23, 59, 59, 999)),
        };
      } else {
        console.error("Invalid date format:", { startDate, endDate });
      }
    }

    if (
      clientId &&
      clientId !== "ALL" &&
      clientId !== "null" &&
      clientId !== "undefined"
    ) {
      where.userId = clientId;
    }

    console.log("Prisma Query Where:", JSON.stringify(where, null, 2));

    const queryOptions: any = {
      where,
      include: {
        user: {
          include: {
            clientProfile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    };

    // Only apply limit if no date filter is present
    if (!startDate || !endDate) {
      queryOptions.take = 500;
    }

    const smsLogs = await prisma.smsLog.findMany(queryOptions);

    return NextResponse.json(smsLogs);
  } catch (error) {
    console.error("Get admin SMS logs error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
