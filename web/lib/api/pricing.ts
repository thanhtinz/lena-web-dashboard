import { db } from "../db";
import { pricingPlans } from "../schema";
import { eq } from "drizzle-orm";

export async function getAllPricingPlans() {
  return await db
    .select()
    .from(pricingPlans)
    .where(eq(pricingPlans.isVisible, true))
    .orderBy(pricingPlans.priceUsd);
}

export async function getPricingPlanById(id: string) {
  const [plan] = await db
    .select()
    .from(pricingPlans)
    .where(eq(pricingPlans.id, id))
    .limit(1);
  return plan;
}

export async function createPricingPlan(data: typeof pricingPlans.$inferInsert) {
  const [plan] = await db
    .insert(pricingPlans)
    .values(data)
    .returning();
  return plan;
}

export async function updatePricingPlan(id: string, data: Partial<typeof pricingPlans.$inferInsert>) {
  const [plan] = await db
    .update(pricingPlans)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pricingPlans.id, id))
    .returning();
  return plan;
}

export async function deletePricingPlan(id: string) {
  await db
    .delete(pricingPlans)
    .where(eq(pricingPlans.id, id));
}
