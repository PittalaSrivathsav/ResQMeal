import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LOCALITIES } from "@/lib/localities";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seed not allowed in production" }, { status: 403 });
  }

  const now = new Date();
  const hashedPassword = await bcrypt.hash("Demo@12345", 10);

  // ── 1. NGO users + orgs ──────────────────────────────────────────────────
  const ngoData = [
    {
      email: "frpe-ngo1@demo.resqmeal.local",
      displayName: "Asha Foundation",
      orgName: "Asha Foundation Food Bank",
      locality: "Koramangala, Bengaluru" as const,
      dietaryRequirements: "Vegetarian only",
      capacityKgPerDay: 150,
      acceptedCategories: ["Cooked Food", "Grains", "Vegetables"],
    },
    {
      email: "frpe-ngo2@demo.resqmeal.local",
      displayName: "Nourish India Trust",
      orgName: "Nourish India Community Kitchen",
      locality: "Indiranagar, Bengaluru" as const,
      dietaryRequirements: "Any",
      capacityKgPerDay: 200,
      acceptedCategories: ["Cooked Food", "Dairy", "Bakery"],
    },
  ];

  let ngoCount = 0;
  const ngoOrgs: { id: string }[] = [];

  for (const d of ngoData) {
    const existing = await db.user.findUnique({ where: { email: d.email }, include: { organisation: true } });
    if (existing?.organisation) {
      ngoOrgs.push({ id: existing.organisation.id });
      ngoCount++;
      continue;
    }
    const coords = LOCALITIES[d.locality];
    const user = await db.user.create({
      data: {
        email: d.email,
        passwordHash: hashedPassword,
        role: "NGO",
        displayName: d.displayName,
        isVerified: true,
        organisation: {
          create: {
            type: "NGO",
            name: d.orgName,
            publicLocality: d.locality,
            latitude: coords.latitude,
            longitude: coords.longitude,
            acceptedCategories: d.acceptedCategories,
            capacityKgPerDay: d.capacityKgPerDay,
            dietaryRequirements: d.dietaryRequirements,
            hasColdStorage: false,
            verificationStatus: "VERIFIED",
          },
        },
      },
      include: { organisation: true },
    });
    if (user.organisation) ngoOrgs.push({ id: user.organisation.id });
    ngoCount++;
  }

  // ── 2. Restaurant users + orgs ───────────────────────────────────────────
  const restaurantData = [
    {
      email: "frpe-rest1@demo.resqmeal.local",
      displayName: "Spice Route Restaurant",
      orgName: "Spice Route Restaurant",
      locality: "Koramangala, Bengaluru" as const,
    },
    {
      email: "frpe-rest2@demo.resqmeal.local",
      displayName: "The Biryani House",
      orgName: "The Biryani House",
      locality: "HSR Layout, Bengaluru" as const,
    },
  ];

  let restaurantCount = 0;
  const restaurantOrgs: { id: string }[] = [];

  for (const d of restaurantData) {
    const existing = await db.user.findUnique({ where: { email: d.email }, include: { organisation: true } });
    if (existing?.organisation) {
      restaurantOrgs.push({ id: existing.organisation.id });
      restaurantCount++;
      continue;
    }
    const coords = LOCALITIES[d.locality];
    const user = await db.user.create({
      data: {
        email: d.email,
        passwordHash: hashedPassword,
        role: "RESTAURANT",
        displayName: d.displayName,
        isVerified: true,
        organisation: {
          create: {
            type: "RESTAURANT",
            name: d.orgName,
            publicLocality: d.locality,
            latitude: coords.latitude + (Math.random() - 0.5) * 0.01,
            longitude: coords.longitude + (Math.random() - 0.5) * 0.01,
            acceptedCategories: [],
            hasColdStorage: false,
            verificationStatus: "VERIFIED",
          },
        },
      },
      include: { organisation: true },
    });
    if (user.organisation) restaurantOrgs.push({ id: user.organisation.id });
    restaurantCount++;
  }

  // ── 3. Volunteer users ───────────────────────────────────────────────────
  const volunteerData = [
    { email: "frpe-vol1@demo.resqmeal.local", displayName: "Arjun Sharma", locality: "Koramangala, Bengaluru" },
    { email: "frpe-vol2@demo.resqmeal.local", displayName: "Priya Nair", locality: "Indiranagar, Bengaluru" },
    { email: "frpe-vol3@demo.resqmeal.local", displayName: "Rahul Verma", locality: "HSR Layout, Bengaluru" },
    { email: "frpe-vol4@demo.resqmeal.local", displayName: "Sneha Patel", locality: "Jayanagar, Bengaluru" },
    { email: "frpe-vol5@demo.resqmeal.local", displayName: "Kiran Reddy", locality: "Whitefield, Bengaluru" },
    { email: "frpe-vol6@demo.resqmeal.local", displayName: "Meera Iyer", locality: "Koramangala, Bengaluru" },
    { email: "frpe-vol7@demo.resqmeal.local", displayName: "Vikram Singh", locality: "Indiranagar, Bengaluru" },
    { email: "frpe-vol8@demo.resqmeal.local", displayName: "Ananya Das", locality: "HSR Layout, Bengaluru" },
  ];

  let volunteerCount = 0;

  for (const d of volunteerData) {
    const existing = await db.user.findUnique({ where: { email: d.email } });
    if (existing) { volunteerCount++; continue; }
    await db.user.create({
      data: {
        email: d.email,
        passwordHash: hashedPassword,
        role: "VOLUNTEER",
        displayName: d.displayName,
        isVerified: true,
        volunteer: {
          create: {
            serviceLocalities: [d.locality],
            vehicleType: "Bike",
            isActive: true,
          },
        },
      },
    });
    volunteerCount++;
  }

  // ── 4. Donations ─────────────────────────────────────────────────────────
  const rest1 = restaurantOrgs[0]?.id;
  const rest2 = restaurantOrgs[1]?.id;

  if (!rest1 || !rest2) {
    return NextResponse.json({ error: "Restaurant orgs missing" }, { status: 500 });
  }

  const donationSpecs = [
    // CRITICAL (< 30 min)
    {
      restaurantOrgId: rest1, title: "Fresh Butter Chicken",
      quantityValue: 45, quantityUnit: "SERVINGS" as const,
      isVegetarian: false, foodCategory: "Cooked Food",
      pickupDeadline: new Date(now.getTime() + 20 * 60000),
    },
    {
      restaurantOrgId: rest2, title: "Dal Makhani",
      quantityValue: 30, quantityUnit: "SERVINGS" as const,
      isVegetarian: true, foodCategory: "Cooked Food",
      pickupDeadline: new Date(now.getTime() + 25 * 60000),
    },
    // HIGH (30–120 min)
    {
      restaurantOrgId: rest1, title: "Veg Biryani Special",
      quantityValue: 60, quantityUnit: "KG" as const,
      isVegetarian: true, foodCategory: "Rice",
      pickupDeadline: new Date(now.getTime() + 50 * 60000),
    },
    {
      restaurantOrgId: rest2, title: "Idli Sambar Combo",
      quantityValue: 80, quantityUnit: "SERVINGS" as const,
      isVegetarian: true, foodCategory: "South Indian",
      pickupDeadline: new Date(now.getTime() + 55 * 60000),
    },
    {
      restaurantOrgId: rest1, title: "Paneer Butter Masala",
      quantityValue: 25, quantityUnit: "KG" as const,
      isVegetarian: true, foodCategory: "Cooked Food",
      pickupDeadline: new Date(now.getTime() + 95 * 60000),
    },
    {
      restaurantOrgId: rest2, title: "Mixed Veg Curry",
      quantityValue: 40, quantityUnit: "SERVINGS" as const,
      isVegetarian: true, foodCategory: "Cooked Food",
      pickupDeadline: new Date(now.getTime() + 110 * 60000),
    },
    // MEDIUM (2–4 hours)
    {
      restaurantOrgId: rest1, title: "Chicken Biryani",
      quantityValue: 50, quantityUnit: "SERVINGS" as const,
      isVegetarian: false, foodCategory: "Rice",
      pickupDeadline: new Date(now.getTime() + 3 * 3600000),
    },
    {
      restaurantOrgId: rest2, title: "Pulao Rice",
      quantityValue: 15, quantityUnit: "KG" as const,
      isVegetarian: true, foodCategory: "Rice",
      pickupDeadline: new Date(now.getTime() + 3.5 * 3600000),
    },
    // OVERDUE
    {
      restaurantOrgId: rest1, title: "Leftover Rotis",
      quantityValue: 10, quantityUnit: "KG" as const,
      isVegetarian: true, foodCategory: "Bread",
      pickupDeadline: new Date(now.getTime() - 30 * 60000),
    },
    // NORMAL (> 4 hours)
    {
      restaurantOrgId: rest2, title: "Fruit Salad",
      quantityValue: 8, quantityUnit: "KG" as const,
      isVegetarian: true, foodCategory: "Fruits",
      pickupDeadline: new Date(now.getTime() + 6 * 3600000),
    },
  ];

  let donationCount = 0;

  for (const spec of donationSpecs) {
    const preparedAt = new Date(spec.pickupDeadline.getTime() - 3 * 3600000);
    const pickupWindowStart = new Date(spec.pickupDeadline.getTime() - 60 * 60000);
    const consumeBy = new Date(spec.pickupDeadline.getTime() + 2 * 3600000);

    await db.donation.create({
      data: {
        restaurantOrgId: spec.restaurantOrgId,
        title: spec.title,
        description: `Demo donation: ${spec.title}. Created by FRPE seed for testing.`,
        foodCategory: spec.foodCategory,
        isVegetarian: spec.isVegetarian,
        quantityValue: spec.quantityValue,
        quantityUnit: spec.quantityUnit,
        estimatedServings: spec.quantityUnit === "SERVINGS" ? Math.round(spec.quantityValue) : Math.round(spec.quantityValue * 2.5),
        preparedAt,
        storageType: "AMBIENT",
        storageInstructions: "Keep covered at room temperature.",
        allergens: [],
        handlingInstructions: "Handle with clean gloves.",
        consumeBy,
        pickupWindowStart,
        pickupDeadline: spec.pickupDeadline,
        status: "POSTED",
      },
    });
    donationCount++;
  }

  return NextResponse.json({
    seeded: true,
    counts: {
      ngos: ngoCount,
      restaurants: restaurantCount,
      volunteers: volunteerCount,
      donations: donationCount,
    },
  });
}

export const POST = GET;

