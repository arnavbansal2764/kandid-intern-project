import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { leads, campaigns } from "@/db/schema";
import { eq, and, or, ilike, desc, asc, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const campaign = searchParams.get("campaign") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build the query conditions
    const conditions = [eq(leads.userId, session.user.id)];

    // Add search filter
    if (search) {
      conditions.push(
        or(
          ilike(leads.name, `%${search}%`),
          ilike(leads.email, `%${search}%`),
          ilike(leads.company, `%${search}%`)
        )!
      );
    }

    // Add status filter
    if (status) {
      conditions.push(eq(leads.status, status as any));
    }

    // Add campaign filter
    if (campaign) {
      conditions.push(eq(leads.campaignId, campaign));
    }

    // Determine sort column and order
    const sortColumn = sortBy === "campaignName" ? campaigns.name : 
                      sortBy === "lastContactDate" ? leads.lastContactDate :
                      sortBy === "status" ? leads.status :
                      sortBy === "name" ? leads.name :
                      leads.createdAt;

    const sortDirection = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

    // Get total count for pagination
    const [totalResult] = await db
      .select({ count: count() })
      .from(leads)
      .leftJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(and(...conditions));

    const total = totalResult.count;

    // Fetch leads with pagination
    const offset = (page - 1) * limit;
    const leadsData = await db
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
        userId: leads.userId,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
      })
      .from(leads)
      .leftJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(and(...conditions))
      .orderBy(sortDirection)
      .limit(limit)
      .offset(offset);

    const hasMore = offset + limit < total;

    return NextResponse.json({
      leads: leadsData,
      pagination: {
        page,
        limit,
        total,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
