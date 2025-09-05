import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { leads, campaigns, leadInteractions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: leadId } = await params;

    // Fetch lead details with campaign information
    const [leadDetails] = await db
      .select({
        id: leads.id,
        name: leads.name,
        email: leads.email,
        company: leads.company,
        position: leads.position,
        phone: leads.phone,
        linkedinUrl: leads.linkedinUrl,
        status: leads.status,
        notes: leads.notes,
        lastContactDate: leads.lastContactDate,
        campaignId: leads.campaignId,
        campaignName: campaigns.name,
        campaignDescription: campaigns.description,
        userId: leads.userId,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
      })
      .from(leads)
      .leftJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(and(eq(leads.id, leadId), eq(leads.userId, session.user.id)));

    if (!leadDetails) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Fetch lead interactions
    const interactions = await db
      .select()
      .from(leadInteractions)
      .where(eq(leadInteractions.leadId, leadId))
      .orderBy(leadInteractions.createdAt);

    const response = {
      ...leadDetails,
      interactions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching lead details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: leadId } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["pending", "contacted", "responded", "converted", "rejected"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(", ") },
        { status: 400 }
      );
    }

    // Update lead status
    const [updatedLead] = await db
      .update(leads)
      .set({ 
        status: status,
        updatedAt: new Date(),
      })
      .where(and(eq(leads.id, leadId), eq(leads.userId, session.user.id)))
      .returning();

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: leadId,
      status,
      updatedAt: updatedLead.updatedAt,
      message: "Lead status updated successfully",
    });
  } catch (error) {
    console.error("Error updating lead status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
