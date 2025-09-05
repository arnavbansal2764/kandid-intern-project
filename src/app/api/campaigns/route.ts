import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch campaigns for the authenticated user
    const userCampaigns = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        status: campaigns.status,
        totalLeads: campaigns.totalLeads,
        successfulLeads: campaigns.successfulLeads,
        responseRate: campaigns.responseRate,
      })
      .from(campaigns)
      .where(eq(campaigns.userId, session.user.id))
      .orderBy(campaigns.createdAt);

    return NextResponse.json({ campaigns: userCampaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
