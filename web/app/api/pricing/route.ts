import { NextResponse } from "next/server";
import { getAllPricingPlans, createPricingPlan } from "@/lib/api/pricing";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const plans = await getAllPricingPlans();
    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Check admin permission
  const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(",") || [];
  if (!session || !ADMIN_USER_IDS.includes(session.user.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const plan = await createPricingPlan(data);
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error creating pricing plan:", error);
    return NextResponse.json(
      { error: "Failed to create pricing plan" },
      { status: 500 }
    );
  }
}
