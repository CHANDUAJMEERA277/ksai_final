import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const { id } = await params;
    const contest = await db.contest.findUnique({
      where: { id },
      include: {
        challenges: {
          orderBy: { createdAt: "asc" },
          include: {
            _count: {
              select: { submissions: true },
            },
          },
        },
      },
    });

    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, contest });
  } catch (error) {
    console.error("GET Admin Contest Details Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, status, startTime, endTime } = body;

    const existing = await db.contest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    const updated = await db.contest.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(status ? { status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT" } : {}),
        ...(startTime ? { startTime: new Date(startTime) } : {}),
        ...(endTime ? { endTime: new Date(endTime) } : {}),
      },
    });

    return NextResponse.json({ success: true, contest: updated });
  } catch (error) {
    console.error("PUT Admin Contest Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
