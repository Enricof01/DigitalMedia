import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
      select: { id: true, name: true },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to load users", error);

    return NextResponse.json(
      { error: "Users could not be loaded." },
      { status: 503 },
    );
  }
}
