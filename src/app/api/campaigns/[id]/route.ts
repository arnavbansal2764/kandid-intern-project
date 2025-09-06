import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { status } = await request.json();

    // Validate status
    const validStatuses = ["draft", "active", "paused", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update campaign status
    const updatedCampaign = await db
      .update(campaigns)
      .set({ 
        status: status,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(campaigns.id, id),
          eq(campaigns.userId, session.user.id)
        )
      )
      .returning();

    if (updatedCampaign.length === 0) {
      return NextResponse.json(
        { error: "Campaign not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      campaign: updatedCampaign[0] 
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Delete campaign (this will cascade delete related leads due to foreign key)
    const deletedCampaign = await db
      .delete(campaigns)
      .where(
        and(
          eq(campaigns.id, id),
          eq(campaigns.userId, session.user.id)
        )
      )
      .returning();

    if (deletedCampaign.length === 0) {
      return NextResponse.json(
        { error: "Campaign not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Campaign deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
