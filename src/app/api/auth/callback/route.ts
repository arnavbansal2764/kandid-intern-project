import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const callbackURL = url.searchParams.get("callbackURL") || "/dashboard";
  
  // Redirect to the intended destination after successful OAuth
  return NextResponse.redirect(new URL(callbackURL, request.url));
}
