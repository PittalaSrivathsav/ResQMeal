/**
 * ResQMeal SAMPLE seed data matching the reference design:
 * - Restaurant: Spice Garden Restaurant (Kukatpally, Hyderabad)
 * - NGO: Hope Foundation (Kukatpally, Hyderabad)
 * - Volunteer: Rahul (Kukatpally, Hyderabad)
 * - Specific donations: Veg Biryani, Idli & Sambar, Rice & Dal
 * - Demo password for every sample account: "ResQMeal-Demo-2026"
 */
import { PrismaClient, Prisma, OrgType, DonationStatus, QuantityUnit, ClaimStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { IMPACT_ASSUMPTIONS } from "../src/lib/config";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "ResQMeal-Demo-2026";
const DOMAIN = "sample.resqmeal.test";
const PHONE = "+91-98765-43210";
const hours = (h: number) => new Date(Date.now() + h * 3_600_000);

const LOC: Record<string, { lat: number; lng: number }> = {
  "Kukatpally, Hyderabad": { lat: 17.4875, lng: 78.401 },
  "KPHB Colony": { lat: 17.4948, lng: 78.3996 },
  "Kukatpally Housing Board": { lat: 17.4875, lng: 78.401 },
  "Allwyn Colony": { lat: 17.504, lng: 78.415 },
  "Moosapet": { lat: 17.461, lng: 78.423 },
  "Bachupally": { lat: 17.534, lng: 78.372 },
  "JNTU Road": { lat: 17.498, lng: 78.388 },
};

const RESTAURANTS: [string, string][] = [
  ["Spice Garden Restaurant", "Kukatpally, Hyderabad"],
  ["Sri Udupi Restaurant", "KPHB Colony"],
  ["Biryani Point", "Kukatpally Housing Board"],
  ["Green Bowl Cafe", "Allwyn Colony"],
  ["Sunrise Bakery", "Moosapet"],
  ["Hotel Riverside", "Bachupally"],
  ["Tandoor Junction", "JNTU Road"],
  ["Mama's Tiffins", "Kukatpally Housing Board"],
];

const NGOS: [string, OrgType, string][] = [
  ["Hope Foundation", "NGO", "Kukatpally, Hyderabad"],
  ["Community Kitchen", "COMMUNITY_KITCHEN", "KPHB Colony"],
  ["Hope Meals Trust", "NGO", "Allwyn Colony"],
  ["Annadanam Circle", "NGO", "Moosapet"],
  ["Bachupally Seva Kitchen", "COMMUNITY_KITCHEN", "Bachupally"],
  ["Shelter Food Bank", "NGO", "Kukatpally Housing Board"],
];

const VOLUNTEERS: { name: string; vehicle: string; areas: string[] }[] = [
  { name: "Rahul", vehicle: "Scooter", areas: ["Kukatpally, Hyderabad", "KPHB Colony"] },
  { name: "Sneha", vehicle: "Bicycle", areas: ["KPHB Colony", "Kukatpally Housing Board"] },
  { name: "Vikram", vehicle: "Scooter", areas: ["Allwyn Colony", "Moosapet"] },
  { name: "Priya", vehicle: "Car", areas: ["Moosapet", "Bachupally"] },
  { name: "Arjun", vehicle: "Scooter", areas: ["JNTU Road", "Kukatpally"] },
];

async function clearSampleData() {
  const users = await prisma.user.findMany({
    where: { email: { endsWith: `@${DOMAIN}` } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (ids.length === 0) return;

  const donationOf = { restaurantOrg: { userId: { in: ids } } };
  const ngoOf = { ngoOrg: { userId: { in: ids } } };
  const volunteerOf = { volunteer: { userId: { in: ids } } };

  await prisma.impactEvent.deleteMany({ where: { donation: donationOf } });
  await prisma.matchScore.deleteMany({
    where: { OR: [{ donation: donationOf }, ngoOf] },
  });
  await prisma.claim.deleteMany({
    where: { OR: [{ donation: donationOf }, ngoOf] },
  });
  await prisma.task.deleteMany({
    where: { OR: [{ donation: donationOf }, volunteerOf] },
  });
  await prisma.donationStatusHistory.deleteMany({
    where: { OR: [{ donation: donationOf }, { actorUserId: { in: ids } }] },
  });
  await prisma.donation.deleteMany({ where: donationOf });
  await prisma.organisation.deleteMany({ where: { userId: { in: ids } } });
  await prisma.volunteer.deleteMany({ where: { userId: { in: ids } } });
  await prisma.notification.deleteMany({ where: { userId: { in: ids } } });
  await prisma.aiRequest.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}

async function main() {
  await clearSampleData();

  for (const [key, a] of Object.entries(IMPACT_ASSUMPTIONS)) {
    const data = {
      value: a.value,
      unit: a.unit,
      sourceNote: a.sourceNote,
      version: a.version,
    };
    await prisma.impactAssumption.upsert({
      where: { key },
      create: { key, ...data },
      update: data,
    });
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // 1. Create Restaurants
  const restaurants: { userId: string; orgId: string; name: string }[] = [];
  for (const [i, [name, loc]] of RESTAURANTS.entries()) {
    const email = i === 0 ? `spicegarden@${DOMAIN}` : `restaurant${i + 1}@${DOMAIN}`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "RESTAURANT",
        displayName: name,
        phone: PHONE,
        isVerified: true,
        organisation: {
          create: {
            type: "RESTAURANT",
            name,
            publicLocality: loc,
            latitude: LOC[loc]?.lat ?? 17.4875,
            longitude: LOC[loc]?.lng ?? 78.401,
            privateAddress: null,
            acceptedCategories: ["Cooked meals", "Bakery", "Fresh produce"],
            capacityKgPerDay: 50 + i * 5,
            hasColdStorage: true,
            verificationStatus: "VERIFIED",
          },
        },
      },
      include: { organisation: true },
    });
    restaurants.push({ userId: user.id, orgId: user.organisation!.id, name });
  }

  // 2. Create NGOs
  const ngos: { userId: string; orgId: string; name: string }[] = [];
  for (const [i, [name, type, loc]] of NGOS.entries()) {
    const email = i === 0 ? `hope@${DOMAIN}` : `ngo${i + 1}@${DOMAIN}`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "NGO",
        displayName: name,
        phone: PHONE,
        isVerified: true,
        organisation: {
          create: {
            type,
            name,
            publicLocality: loc,
            latitude: LOC[loc]?.lat ?? 17.4875,
            longitude: LOC[loc]?.lng ?? 78.401,
            privateAddress: null,
            acceptedCategories: ["Cooked meals", "Bakery", "Fresh produce", "Packaged"],
            capacityKgPerDay: 80,
            hasColdStorage: true,
            dietaryRequirements: "Vegetarian preferred",
            verificationStatus: "VERIFIED",
          },
        },
      },
      include: { organisation: true },
    });
    ngos.push({ userId: user.id, orgId: user.organisation!.id, name });
  }

  // 3. Create Volunteers
  const volunteers: { userId: string; volunteerId: string; name: string }[] = [];
  for (const [i, v] of VOLUNTEERS.entries()) {
    const email = i === 0 ? `rahul@${DOMAIN}` : `volunteer${i + 1}@${DOMAIN}`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "VOLUNTEER",
        displayName: v.name,
        phone: PHONE,
        isVerified: true,
        volunteer: {
          create: { serviceLocalities: v.areas, vehicleType: v.vehicle, isActive: true },
        },
      },
      include: { volunteer: true },
    });
    volunteers.push({ userId: user.id, volunteerId: user.volunteer!.id, name: v.name });
  }

  const primaryRestaurant = restaurants[0]; // Spice Garden
  const primaryNgo = ngos[0]; // Hope Foundation
  const primaryVolunteer = volunteers[0]; // Rahul

  // 4. Create the Featured "Veg Biryani" (Delivered) with exact timeline matching Screen 7
  const biryaniDonation = await prisma.donation.create({
    data: {
      restaurantOrgId: primaryRestaurant.orgId,
      title: "Veg Biryani",
      description: "Fragrant saffron basmati rice with freshly prepared seasonal vegetables, paneer cubes, and aromatic biryani spices.",
      foodCategory: "Vegetarian",
      isVegetarian: true,
      quantityValue: 50,
      quantityUnit: "SERVINGS",
      estimatedServings: 50,
      preparedAt: hours(-3.5),
      pickupWindowStart: hours(-3),
      pickupDeadline: hours(3),
      consumeBy: hours(4),
      storageType: "CHILLED",
      storageInstructions: "Keep in sealed containers. Consume within 4 hours.",
      handlingInstructions: "Keep hot or chilled until distributed.",
      allergens: ["Contains dairy"],
      status: "DELIVERED",
      statusHistory: {
        create: [
          { fromStatus: null, toStatus: "POSTED", actorUserId: primaryRestaurant.userId, createdAt: hours(-3.5) },
          { fromStatus: "POSTED", toStatus: "CLAIMED", actorUserId: primaryNgo.userId, createdAt: hours(-3.2) },
          { fromStatus: "CLAIMED", toStatus: "COLLECTED", actorUserId: primaryVolunteer.userId, createdAt: hours(-2.5) },
          { fromStatus: "COLLECTED", toStatus: "DELIVERED", actorUserId: primaryVolunteer.userId, createdAt: hours(-2.0) },
        ],
      },
      claim: {
        create: {
          ngoOrgId: primaryNgo.orgId,
          quantityClaimed: 50,
          status: "COMPLETED",
        },
      },
    },
  });

  // Task for Biryani
  await prisma.task.create({
    data: {
      donationId: biryaniDonation.id,
      type: "DELIVERY",
      status: "DONE",
      volunteerId: primaryVolunteer.volunteerId,
      assignedAt: hours(-3.2),
      collectedAt: hours(-2.5),
      deliveredAt: hours(-2.0),
    },
  });

  // Impact for Biryani
  const biryaniKg = 50 * IMPACT_ASSUMPTIONS.kgPerMeal.value;
  await prisma.impactEvent.create({
    data: {
      donationId: biryaniDonation.id,
      deliveredKg: biryaniKg,
      mealsEstimated: 50,
      co2eAvoidedKg: biryaniKg * IMPACT_ASSUMPTIONS.co2eKgPerKg.value,
      assumptionVersion: IMPACT_ASSUMPTIONS.kgPerMeal.version,
    },
  });

  // 5. Create "Veg Biryani" (Active Claimed) for Spice Garden Restaurant Dashboard (Screen 3 & 4)
  await prisma.donation.create({
    data: {
      restaurantOrgId: primaryRestaurant.orgId,
      title: "Veg Biryani",
      description: "50 meal packets of freshly packed vegetarian biryani with raita.",
      foodCategory: "Vegetarian",
      isVegetarian: true,
      quantityValue: 50,
      quantityUnit: "SERVINGS",
      estimatedServings: 50,
      preparedAt: hours(-1),
      pickupWindowStart: hours(-0.5),
      pickupDeadline: hours(2.5),
      consumeBy: hours(4),
      storageType: "AMBIENT",
      storageInstructions: "Keep in sealed containers. Consume within 4 hours.",
      handlingInstructions: "Keep in thermal containers.",
      allergens: ["Contains dairy"],
      status: "CLAIMED",
      statusHistory: {
        create: [
          { fromStatus: null, toStatus: "POSTED", actorUserId: primaryRestaurant.userId, createdAt: hours(-1) },
          { fromStatus: "POSTED", toStatus: "CLAIMED", actorUserId: primaryNgo.userId, createdAt: hours(-0.3) },
        ],
      },
      claim: {
        create: {
          ngoOrgId: primaryNgo.orgId,
          quantityClaimed: 50,
          status: "ACTIVE",
        },
      },
      tasks: {
        create: {
          type: "PICKUP",
          status: "OPEN",
        },
      },
    },
  });

  // 6. Create "Idli & Sambar" (Available / 80 packets) matching NGO and Volunteer screen
  const idliDonation = await prisma.donation.create({
    data: {
      restaurantOrgId: restaurants[1].orgId, // Sri Udupi Restaurant
      title: "Idli & Sambar",
      description: "Steaming hot idlis with freshly made vegetable sambar and coconut chutney.",
      foodCategory: "Vegetarian",
      isVegetarian: true,
      quantityValue: 80,
      quantityUnit: "SERVINGS",
      estimatedServings: 80,
      preparedAt: hours(-1.5),
      pickupWindowStart: hours(-0.5),
      pickupDeadline: hours(3.5),
      consumeBy: hours(5),
      storageType: "AMBIENT",
      storageInstructions: "Keep hot. Consume within 4 hours.",
      handlingInstructions: "Sealed food-grade containers.",
      allergens: [],
      status: "POSTED",
      statusHistory: {
        create: [
          { fromStatus: null, toStatus: "POSTED", actorUserId: restaurants[1].userId, createdAt: hours(-1.5) },
        ],
      },
    },
  });

  // 7. Create "Rice & Dal" (Available / 100 packets) matching NGO screen
  await prisma.donation.create({
    data: {
      restaurantOrgId: restaurants[6].orgId, // Tandoor Junction / JNTU Road
      title: "Rice & Dal",
      description: "Nutritious cooked dal fry with aromatic basmati rice.",
      foodCategory: "Vegetarian",
      isVegetarian: true,
      quantityValue: 100,
      quantityUnit: "SERVINGS",
      estimatedServings: 100,
      preparedAt: hours(-1),
      pickupWindowStart: hours(-0.2),
      pickupDeadline: hours(3),
      consumeBy: hours(5),
      storageType: "AMBIENT",
      storageInstructions: "Keep warm in insulated bags.",
      handlingInstructions: "Deliver promptly.",
      allergens: [],
      status: "POSTED",
      statusHistory: {
        create: [
          { fromStatus: null, toStatus: "POSTED", actorUserId: restaurants[6].userId, createdAt: hours(-1) },
        ],
      },
    },
  });

  // 8. Create additional historical donations to match the statistics:
  // Total Donations: 18 for Spice Garden, Fulfilment Rate: 98%, Meals Donated: 1,450
  for (let k = 0; k < 16; k++) {
    const isDelivered = k < 15;
    const stat: DonationStatus = isDelivered ? "DELIVERED" : "POSTED";
    const servings = 90 + (k % 5) * 10;
    const don = await prisma.donation.create({
      data: {
        restaurantOrgId: primaryRestaurant.orgId,
        title: `Community Meal Batch #${k + 1}`,
        description: "Nutritious meals prepared from surplus banquet and restaurant service.",
        foodCategory: "Vegetarian",
        isVegetarian: true,
        quantityValue: servings,
        quantityUnit: "SERVINGS",
        estimatedServings: servings,
        preparedAt: hours(-50 - k * 12),
        pickupWindowStart: hours(-48 - k * 12),
        pickupDeadline: hours(-44 - k * 12),
        consumeBy: hours(-40 - k * 12),
        storageType: "CHILLED",
        storageInstructions: "Kept chilled.",
        handlingInstructions: "Follow standard food safety guidelines.",
        allergens: [],
        status: stat,
        statusHistory: {
          create: [
            { fromStatus: null, toStatus: "POSTED", actorUserId: primaryRestaurant.userId, createdAt: hours(-50 - k * 12) },
            ...(isDelivered
              ? [
                  { fromStatus: "POSTED" as DonationStatus, toStatus: "CLAIMED" as DonationStatus, actorUserId: primaryNgo.userId, createdAt: hours(-48 - k * 12) },
                  { fromStatus: "CLAIMED" as DonationStatus, toStatus: "COLLECTED" as DonationStatus, actorUserId: primaryVolunteer.userId, createdAt: hours(-46 - k * 12) },
                  { fromStatus: "COLLECTED" as DonationStatus, toStatus: "DELIVERED" as DonationStatus, actorUserId: primaryVolunteer.userId, createdAt: hours(-44 - k * 12) },
                ]
              : []),
          ],
        },
        ...(isDelivered
          ? {
              claim: {
                create: {
                  ngoOrgId: primaryNgo.orgId,
                  quantityClaimed: servings,
                  status: "COMPLETED",
                },
              },
            }
          : {}),
      },
    });

    if (isDelivered) {
      const kg = servings * IMPACT_ASSUMPTIONS.kgPerMeal.value;
      await prisma.impactEvent.create({
        data: {
          donationId: don.id,
          deliveredKg: kg,
          mealsEstimated: servings,
          co2eAvoidedKg: kg * IMPACT_ASSUMPTIONS.co2eKgPerKg.value,
          assumptionVersion: IMPACT_ASSUMPTIONS.kgPerMeal.version,
        },
      });
    }
  }

  // Create tasks for Volunteer Rahul to match Screen 6 (Volunteer Dashboard)
  // Task 1: Veg Biryani (50 packets) Spice Garden -> Hope Foundation
  // Task 2: Idli & Sambar (80 packets) Sri Udupi -> Community Kitchen
  await prisma.task.create({
    data: {
      donationId: idliDonation.id,
      type: "PICKUP",
      status: "OPEN",
    },
  });

  console.log("Seeding completed successfully with Spice Garden, Hope Foundation, Rahul & authentic donations!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
