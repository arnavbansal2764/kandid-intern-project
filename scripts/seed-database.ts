import { config } from 'dotenv';
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { campaigns, leads, leadInteractions, user } from "@/db/schema";
import { nanoid } from "nanoid";

// Load environment variables
config({ path: '.env' });

// Create a fresh database connection for seeding
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "is set" : "is NOT set");
    
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Create sample users (if needed)
    const sampleUsers = [
      {
        id: nanoid(),
        name: "Demo User",
        email: "demo@linkbird.ai",
        emailVerified: true,
        image: null,
      },
    ];

    console.log("Creating sample users...");
    const insertedUsers = await db.insert(user).values(sampleUsers).returning();
    const demoUser = insertedUsers[0];

    // Create sample campaigns
    const sampleCampaigns = [
      {
        id: nanoid(),
        name: "Tech Leaders Q1 2024",
        description: "Targeting engineering leaders at mid-size tech companies",
        status: "active" as const,
        totalLeads: 15,
        successfulLeads: 8,
        responseRate: 53, // 53%
        userId: demoUser.id,
      },
      {
        id: nanoid(),
        name: "Startup CTOs Outreach",
        description: "Connecting with CTOs at early-stage startups",
        status: "active" as const,
        totalLeads: 12,
        successfulLeads: 5,
        responseRate: 42, // 42%
        userId: demoUser.id,
      },
      {
        id: nanoid(),
        name: "Product Leaders Campaign",
        description: "Reaching out to heads of product and product managers",
        status: "paused" as const,
        totalLeads: 8,
        successfulLeads: 3,
        responseRate: 38, // 38%
        userId: demoUser.id,
      },
      {
        id: nanoid(),
        name: "Enterprise Sales Q2",
        description: "Large enterprise accounts outreach campaign",
        status: "completed" as const,
        totalLeads: 20,
        successfulLeads: 12,
        responseRate: 60, // 60%
        userId: demoUser.id,
      },
      {
        id: nanoid(),
        name: "Developer Relations Initiative",
        description: "Building relationships with developer advocates",
        status: "draft" as const,
        totalLeads: 0,
        successfulLeads: 0,
        responseRate: 0,
        userId: demoUser.id,
      },
    ];

    console.log("Creating sample campaigns...");
    const insertedCampaigns = await db.insert(campaigns).values(sampleCampaigns).returning();

    // Create sample leads
    const sampleLeads = [
      // Tech Leaders Q1 2024 Campaign
      {
        id: nanoid(),
        name: "Sarah Johnson",
        email: "sarah.johnson@techcorp.com",
        company: "TechCorp Solutions",
        position: "VP of Engineering",
        phone: "+1 (555) 123-4567",
        linkedinUrl: "https://linkedin.com/in/sarahjohnson",
        status: "contacted" as const,
        notes: "Highly interested in our platform. Mentioned they're looking to streamline their development workflow. Follow up needed on pricing tiers.",
        lastContactDate: new Date("2024-01-15"),
        campaignId: insertedCampaigns[0].id,
        userId: demoUser.id,
      },
      {
        id: nanoid(),
        name: "Michael Chen",
        email: "m.chen@innovate.io",
        company: "Innovate Labs",
        position: "Senior Engineering Manager",
        phone: "+1 (555) 987-6543",
        linkedinUrl: "https://linkedin.com/in/michaelchen",
        status: "responded" as const,
        notes: "Responded positively to our outreach. Scheduled demo for next week.",
        lastContactDate: new Date("2024-01-20"),
        campaignId: insertedCampaigns[0].id,
        userId: demoUser.id,
      },
      {
        id: nanoid(),
        name: "Amanda Rodriguez",
        email: "amanda@growth-co.com",
        company: "Growth Co",
        position: "Head of Engineering",
        phone: "+1 (555) 456-7890",
        linkedinUrl: "https://linkedin.com/in/amandarodriguez",
        status: "pending" as const,
        notes: "Initial outreach sent. No response yet.",
        lastContactDate: null,
        campaignId: insertedCampaigns[0].id,
        userId: demoUser.id,
      },
      {
        id: nanoid(),
        name: "David Kim",
        email: "david.kim@scaletec.com",
        company: "ScaleTec",
        position: "CTO",
        phone: "+1 (555) 234-5678",
        linkedinUrl: "https://linkedin.com/in/davidkim",
        status: "converted" as const,
        notes: "Successfully converted! Signed annual enterprise contract.",
        lastContactDate: new Date("2024-01-25"),
        campaignId: insertedCampaigns[0].id,
        userId: demoUser.id,
      },
      {
        id: nanoid(),
        name: "Lisa Zhang",
        email: "lisa@futuretech.ai",
        company: "FutureTech AI",
        position: "Director of Engineering",
        status: "rejected" as const,
        notes: "Not interested at this time. Budget allocated elsewhere.",
        lastContactDate: new Date("2024-01-18"),
        campaignId: insertedCampaigns[0].id,
        userId: demoUser.id,
      },

      // Startup CTOs Outreach Campaign
      {
        id: nanoid(),
        name: "Alex Thompson",
        email: "alex@startuphub.io",
        company: "StartupHub",
        position: "CTO & Co-founder",
        phone: "+1 (555) 345-6789",
        linkedinUrl: "https://linkedin.com/in/alexthompson",
        status: "contacted" as const,
        notes: "Interested but needs to discuss with co-founder first.",
        lastContactDate: new Date("2024-01-22"),
        campaignId: insertedCampaigns[1].id,
        userId: demoUser.id,
      },
      {
        id: nanoid(),
        name: "Emma Wilson",
        email: "emma@rapid-growth.com",
        company: "Rapid Growth Inc",
        position: "Technical Lead",
        status: "responded" as const,
        notes: "Very interested. Requested technical deep dive session.",
        lastContactDate: new Date("2024-01-21"),
        campaignId: insertedCampaigns[1].id,
        userId: demoUser.id,
      },
      {
        id: nanoid(),
        name: "James Brown",
        email: "james@disruptive.tech",
        company: "Disruptive Tech",
        position: "VP of Engineering",
        status: "pending" as const,
        notes: "Sent connection request on LinkedIn.",
        lastContactDate: null,
        campaignId: insertedCampaigns[1].id,
        userId: demoUser.id,
      },

      // Product Leaders Campaign
      {
        id: nanoid(),
        name: "Rachel Green",
        email: "rachel@product-first.com",
        company: "Product First",
        position: "Head of Product",
        phone: "+1 (555) 567-8901",
        status: "contacted" as const,
        notes: "Initial email sent. Waiting for response.",
        lastContactDate: new Date("2024-01-16"),
        campaignId: insertedCampaigns[2].id,
        userId: demoUser.id,
      },
      {
        id: nanoid(),
        name: "Tom Anderson",
        email: "tom@agilesoft.com",
        company: "AgileSoft",
        position: "Senior Product Manager",
        status: "responded" as const,
        notes: "Positive response. Interested in product roadmap features.",
        lastContactDate: new Date("2024-01-19"),
        campaignId: insertedCampaigns[2].id,
        userId: demoUser.id,
      },

      // Enterprise Sales Q2
      {
        id: nanoid(),
        name: "Jennifer Davis",
        email: "j.davis@megacorp.com",
        company: "MegaCorp Industries",
        position: "VP of Technology",
        phone: "+1 (555) 678-9012",
        linkedinUrl: "https://linkedin.com/in/jenniferdavis",
        status: "converted" as const,
        notes: "Closed enterprise deal worth $150k annually.",
        lastContactDate: new Date("2024-01-30"),
        campaignId: insertedCampaigns[3].id,
        userId: demoUser.id,
      },
      {
        id: nanoid(),
        name: "Robert Johnson",
        email: "rob@enterprise-solutions.com",
        company: "Enterprise Solutions LLC",
        position: "Chief Technology Officer",
        status: "contacted" as const,
        notes: "In procurement review process. Expected decision in 2 weeks.",
        lastContactDate: new Date("2024-01-28"),
        campaignId: insertedCampaigns[3].id,
        userId: demoUser.id,
      },
    ];

    console.log("Creating sample leads...");
    const insertedLeads = await db.insert(leads).values(sampleLeads).returning();

    // Create sample interactions
    const sampleInteractions = [
      // Sarah Johnson interactions
      {
        id: nanoid(),
        leadId: insertedLeads[0].id, // Sarah Johnson
        type: "email" as const,
        subject: "Introduction to Our Platform",
        content: "Sent initial introduction email with platform demo video and case studies.",
        outcome: "Email opened, clicked on demo link",
        scheduledAt: new Date("2024-01-10"),
        completedAt: new Date("2024-01-10"),
      },
      {
        id: nanoid(),
        leadId: insertedLeads[0].id,
        type: "call" as const,
        subject: "Discovery Call",
        content: "30-minute discovery call to understand their current development workflow and pain points.",
        outcome: "Very positive response, interested in enterprise features",
        scheduledAt: new Date("2024-01-15"),
        completedAt: new Date("2024-01-15"),
      },
      {
        id: nanoid(),
        leadId: insertedLeads[0].id,
        type: "note" as const,
        subject: "Follow-up Required",
        content: "Need to send pricing information for Enterprise tier. Sarah mentioned budget approval process takes 2-3 weeks.",
        outcome: null,
        scheduledAt: null,
        completedAt: new Date("2024-01-15"),
      },

      // Michael Chen interactions
      {
        id: nanoid(),
        leadId: insertedLeads[1].id, // Michael Chen
        type: "email" as const,
        subject: "Platform Demo Request",
        content: "Sent platform overview and requested demo meeting.",
        outcome: "Replied within 2 hours, very interested",
        scheduledAt: new Date("2024-01-18"),
        completedAt: new Date("2024-01-18"),
      },
      {
        id: nanoid(),
        leadId: insertedLeads[1].id,
        type: "meeting" as const,
        subject: "Product Demo Session",
        content: "45-minute comprehensive product demonstration.",
        outcome: "Impressed with features, requested trial access",
        scheduledAt: new Date("2024-01-20"),
        completedAt: new Date("2024-01-20"),
      },

      // David Kim interactions (converted)
      {
        id: nanoid(),
        leadId: insertedLeads[3].id, // David Kim
        type: "email" as const,
        subject: "Initial Outreach",
        content: "Introduction email with company overview and value proposition.",
        outcome: "Positive response, requested more information",
        scheduledAt: new Date("2024-01-12"),
        completedAt: new Date("2024-01-12"),
      },
      {
        id: nanoid(),
        leadId: insertedLeads[3].id,
        type: "call" as const,
        subject: "Qualification Call",
        content: "Discussed current challenges and budget requirements.",
        outcome: "Qualified lead, high purchase intent",
        scheduledAt: new Date("2024-01-15"),
        completedAt: new Date("2024-01-15"),
      },
      {
        id: nanoid(),
        leadId: insertedLeads[3].id,
        type: "meeting" as const,
        subject: "Contract Negotiation",
        content: "Final contract terms discussion and agreement.",
        outcome: "Contract signed, annual enterprise plan",
        scheduledAt: new Date("2024-01-25"),
        completedAt: new Date("2024-01-25"),
      },

      // Alex Thompson interactions
      {
        id: nanoid(),
        leadId: insertedLeads[5].id, // Alex Thompson
        type: "email" as const,
        subject: "Startup CTO Introduction",
        content: "Tailored email for startup context with relevant case studies.",
        outcome: "Email opened, LinkedIn profile viewed",
        scheduledAt: new Date("2024-01-20"),
        completedAt: new Date("2024-01-20"),
      },
      {
        id: nanoid(),
        leadId: insertedLeads[5].id,
        type: "note" as const,
        subject: "Follow-up Strategy",
        content: "Plan to send startup-specific pricing and feature comparison.",
        outcome: null,
        scheduledAt: null,
        completedAt: new Date("2024-01-22"),
      },
    ];

    console.log("Creating sample interactions...");
    await db.insert(leadInteractions).values(sampleInteractions).returning();

    console.log("Database seeding completed successfully!");
    console.log(`Created ${insertedUsers.length} users`);
    console.log(`Created ${insertedCampaigns.length} campaigns`);
    console.log(`Created ${insertedLeads.length} leads`);
    console.log(`Created ${sampleInteractions.length} interactions`);

  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Only run this script directly, not when imported
if (require.main === module) {
  seedDatabase().then(() => {
    console.log("Seeding completed");
    process.exit(0);
  }).catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
}

export { seedDatabase };
