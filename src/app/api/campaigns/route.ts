import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { campaigns, leads } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First, get campaigns
    const userCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, session.user.id))
      .orderBy(campaigns.createdAt);

    // Then get lead counts for each campaign
    const campaignsWithCounts = await Promise.all(
      userCampaigns.map(async (campaign) => {
        // Get total leads count
        const [totalLeadsResult] = await db
          .select({ count: count() })
          .from(leads)
          .where(eq(leads.campaignId, campaign.id));

        // Get successful leads count (converted or responded)
        const [successfulLeadsResult] = await db
          .select({ count: count() })
          .from(leads)
          .where(
            sql`${leads.campaignId} = ${campaign.id} AND ${leads.status} IN ('converted', 'responded')`
          );

        const totalLeads = totalLeadsResult?.count || 0;
        const successfulLeads = successfulLeadsResult?.count || 0;
        const responseRate = totalLeads > 0 ? Math.round((successfulLeads / totalLeads) * 100) : 0;

        return {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          status: campaign.status,
          totalLeads,
          successfulLeads,
          responseRate,
          progressPercentage: responseRate,
          createdAt: campaign.createdAt,
          updatedAt: campaign.updatedAt,
        };
      })
    );

    return NextResponse.json({ campaigns: campaignsWithCounts });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
