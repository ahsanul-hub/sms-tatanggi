import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const pageSizeParam = parseInt(searchParams.get("pageSize") || "10", 10);
    const statusParam = searchParams.get("status");

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const pageSizeRaw = Number.isFinite(pageSizeParam) ? pageSizeParam : 10;
    const pageSize = Math.min(Math.max(pageSizeRaw, 1), 50); // 1..50
    const skip = (page - 1) * pageSize;

    const where: any = { userId: session.user.id };
    if (
      statusParam &&
      ["PENDING", "COMPLETED", "FAILED", "CANCELLED"].includes(statusParam)
    ) {
      where.status = statusParam;
    }

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.max(Math.ceil(total / pageSize), 1);

    return NextResponse.json({
      items: transactions,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error("Get client transactions error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
