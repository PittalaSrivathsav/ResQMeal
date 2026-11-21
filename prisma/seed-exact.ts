import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function run() {
  console.log("Starting exact seed...");
  const passwordHash = await bcrypt.hash("ResQMeal-Demo-2026", 10);

  // 1. Ensure Spice Garden Restaurant
  const spiceUser = await prisma.user.upsert({
    where: { email: "spicegarden@sample.resqmeal.test" },
    update: { displayName: "Spice Garden Restaurant", role: "RESTAURANT", isVerified: true },
    create: {
      email: "spicegarden@sample.resqmeal.test",
      passwordHash,
      role: "RESTAURANT",
      displayName: "Spice Garden Restaurant",
      phone: "+91-98765-43210",
      isVerified: true,
    },
  });
  console.log("Spice user:", spiceUser.id);

  let spiceOrg = await prisma.organisation.findFirst({ where: { userId: spiceUser.id } });
  if (!spiceOrg) {
    spiceOrg = await prisma.organisation.create({
      data: {
        userId: spiceUser.id,
        name: "Spice Garden Restaurant",
        type: "RESTAURANT",
        publicLocality: "Kukatpally, Hyderabad",
        latitude: 17.4875,
        longitude: 78.401,
        capacityKgPerDay: 80,
        hasColdStorage: true,
        verificationStatus: "VERIFIED",
        acceptedCategories: ["Cooked meals", "Bakery", "Fresh produce"],
      },
    });
  } else {
    await prisma.organisation.update({
      where: { id: spiceOrg.id },
      data: { name: "Spice Garden Restaurant", publicLocality: "Kukatpally, Hyderabad" },
    });
  }
  console.log("Spice org:", spiceOrg.id);

  // 2. Ensure Hope Foundation (NGO)
  const hopeUser = await prisma.user.upsert({
    where: { email: "hope@sample.resqmeal.test" },
    update: { displayName: "Hope Foundation", role: "NGO", isVerified: true },
    create: {
      email: "hope@sample.resqmeal.test",
      passwordHash,
      role: "NGO",
      displayName: "Hope Foundation",
      phone: "+91-98765-43211",
      isVerified: true,
    },
  });
  console.log("Hope user:", hopeUser.id);

  let hopeOrg = await prisma.organisation.findFirst({ where: { userId: hopeUser.id } });
  if (!hopeOrg) {
    hopeOrg = await prisma.organisation.create({
      data: {
        userId: hopeUser.id,
        name: "Hope Foundation",
        type: "NGO",
        publicLocality: "Kukatpally, Hyderabad",
        latitude: 17.4875,
        longitude: 78.401,
        capacityKgPerDay: 120,
        hasColdStorage: true,
        dietaryRequirements: "Vegetarian preferred",
        verificationStatus: "VERIFIED",
        acceptedCategories: ["Cooked meals", "Bakery", "Fresh produce", "Packaged"],
      },
    });
  } else {
    await prisma.organisation.update({
      where: { id: hopeOrg.id },
      data: { name: "Hope Foundation", publicLocality: "Kukatpally, Hyderabad" },
    });
  }
  console.log("Hope org:", hopeOrg.id);

  // 3. Ensure Volunteer Rahul
  const rahulUser = await prisma.user.upsert({
    where: { email: "rahul@sample.resqmeal.test" },
    update: { displayName: "Rahul", role: "VOLUNTEER", isVerified: true },
    create: {
      email: "rahul@sample.resqmeal.test",
      passwordHash,
      role: "VOLUNTEER",
      displayName: "Rahul",
      phone: "+91-98765-43212",
      isVerified: true,
    },
  });
  console.log("Rahul user:", rahulUser.id);

  let rahulVol = await prisma.volunteer.findFirst({ where: { userId: rahulUser.id } });
  if (!rahulVol) {
    rahulVol = await prisma.volunteer.create({
      data: {
        userId: rahulUser.id,
        vehicleType: "Scooter",
        serviceLocalities: ["Kukatpally, Hyderabad", "KPHB Colony"],
        isActive: true,
      },
    });
  }
  console.log("Rahul vol:", rahulVol.id);

  // 4. Create the Featured "Veg Biryani" (Delivered) with exact timeline matching Screen 7
  const existingBiryani = await prisma.donation.findFirst({
    where: { restaurantOrgId: spiceOrg.id, title: "Veg Biryani", status: "DELIVERED" },
  });
  if (!existingBiryani) {
    const biryani = await prisma.donation.create({
      data: {
        restaurantOrgId: spiceOrg.id,
        title: "Veg Biryani",
        description: "50 meal packets of freshly packed vegetarian biryani with raita.",
        foodCategory: "Vegetarian",
        isVegetarian: true,
        quantityValue: 50,
        quantityUnit: "SERVINGS",
        estimatedServings: 50,
        preparedAt: new Date(Date.now() - 3.5 * 3600000),
        pickupWindowStart: new Date(Date.now() - 3.0 * 3600000),
        pickupDeadline: new Date(Date.now() + 3.0 * 3600000),
        consumeBy: new Date(Date.now() + 4.0 * 3600000),
        storageType: "AMBIENT",
        storageInstructions: "Keep in sealed containers. Consume within 4 hours.",
        handlingInstructions: "Keep warm in insulated bags.",
        allergens: ["Contains dairy"],
        status: "DELIVERED",
        statusHistory: {
          create: [
            { fromStatus: null, toStatus: "POSTED", actorUserId: spiceUser.id, createdAt: new Date(Date.now() - 3.5 * 3600000) },
            { fromStatus: "POSTED", toStatus: "CLAIMED", actorUserId: hopeUser.id, createdAt: new Date(Date.now() - 3.2 * 3600000) },
            { fromStatus: "CLAIMED", toStatus: "COLLECTED", actorUserId: rahulUser.id, createdAt: new Date(Date.now() - 2.5 * 3600000) },
            { fromStatus: "COLLECTED", toStatus: "DELIVERED", actorUserId: rahulUser.id, createdAt: new Date(Date.now() - 2.0 * 3600000) },
          ],
        },
        claim: {
          create: {
            ngoOrgId: hopeOrg.id,
            quantityClaimed: 50,
            status: "COMPLETED",
          },
        },
      },
    });

    await prisma.task.create({
      data: {
        donationId: biryani.id,
        type: "DELIVERY",
        status: "DONE",
        volunteerId: rahulVol.id,
        assignedAt: new Date(Date.now() - 3.2 * 3600000),
        collectedAt: new Date(Date.now() - 2.5 * 3600000),
        deliveredAt: new Date(Date.now() - 2.0 * 3600000),
      },
    });

    await prisma.impactEvent.create({
      data: {
        donationId: biryani.id,
        deliveredKg: 20,
        mealsEstimated: 50,
        co2eAvoidedKg: 50,
        assumptionVersion: 1,
      },
    });
    console.log("Created delivered Veg Biryani tracking sample:", biryani.id);
  }

  // 5. Active Claimed Veg Biryani for Spice Garden Restaurant
  const activeBiryani = await prisma.donation.findFirst({
    where: { restaurantOrgId: spiceOrg.id, title: "Veg Biryani", status: "CLAIMED" },
  });
  if (!activeBiryani) {
    const active = await prisma.donation.create({
      data: {
        restaurantOrgId: spiceOrg.id,
        title: "Veg Biryani",
        description: "50 meal packets of freshly prepared vegetarian biryani with salad and gravy.",
        foodCategory: "Vegetarian",
        isVegetarian: true,
        quantityValue: 50,
        quantityUnit: "SERVINGS",
        estimatedServings: 50,
        preparedAt: new Date(Date.now() - 1 * 3600000),
        pickupWindowStart: new Date(Date.now() - 0.5 * 3600000),
        pickupDeadline: new Date(Date.now() + 2.5 * 3600000),
        consumeBy: new Date(Date.now() + 4 * 3600000),
        storageType: "AMBIENT",
        storageInstructions: "Keep in sealed containers. Consume within 4 hours.",
        handlingInstructions: "Keep in thermal containers.",
        allergens: ["Contains dairy"],
        status: "CLAIMED",
        statusHistory: {
          create: [
            { fromStatus: null, toStatus: "POSTED", actorUserId: spiceUser.id },
            { fromStatus: "POSTED", toStatus: "CLAIMED", actorUserId: hopeUser.id },
          ],
        },
        claim: {
          create: {
            ngoOrgId: hopeOrg.id,
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
    console.log("Created active Veg Biryani:", active.id);
  }

  // 6. Available "Idli & Sambar" for NGO and Volunteer
  const existingIdli = await prisma.donation.findFirst({ where: { title: "Idli & Sambar" } });
  if (!existingIdli) {
    const idli = await prisma.donation.create({
      data: {
        restaurantOrgId: spiceOrg.id,
        title: "Idli & Sambar",
        description: "80 meal packets: fresh steaming idlis with flavorful vegetable sambar and chutney.",
        foodCategory: "Vegetarian",
        isVegetarian: true,
        quantityValue: 80,
        quantityUnit: "SERVINGS",
        estimatedServings: 80,
        preparedAt: new Date(Date.now() - 1.5 * 3600000),
        pickupWindowStart: new Date(Date.now() - 0.5 * 3600000),
        pickupDeadline: new Date(Date.now() + 3.5 * 3600000),
        consumeBy: new Date(Date.now() + 5 * 3600000),
        storageType: "AMBIENT",
        storageInstructions: "Keep hot. Consume within 4 hours.",
        handlingInstructions: "Sealed food-grade containers.",
        allergens: [],
        status: "POSTED",
        tasks: {
          create: {
            type: "PICKUP",
            status: "OPEN",
          },
        },
      },
    });
    console.log("Created Idli & Sambar:", idli.id);
  }

  // 7. Available "Rice & Dal" for NGO
  const existingRice = await prisma.donation.findFirst({ where: { title: "Rice & Dal" } });
  if (!existingRice) {
    const rice = await prisma.donation.create({
      data: {
        restaurantOrgId: spiceOrg.id,
        title: "Rice & Dal",
        description: "100 meal packets: wholesome dal fry with steamed aromatic rice.",
        foodCategory: "Vegetarian",
        isVegetarian: true,
        quantityValue: 100,
        quantityUnit: "SERVINGS",
        estimatedServings: 100,
        preparedAt: new Date(Date.now() - 1 * 3600000),
        pickupWindowStart: new Date(Date.now() - 0.2 * 3600000),
        pickupDeadline: new Date(Date.now() + 3 * 3600000),
        consumeBy: new Date(Date.now() + 5 * 3600000),
        storageType: "AMBIENT",
        storageInstructions: "Keep warm in insulated bags.",
        handlingInstructions: "Deliver promptly.",
        allergens: [],
        status: "POSTED",
      },
    });
    console.log("Created Rice & Dal:", rice.id);
  }

  console.log("Exact seed completed successfully!");
}

run()
  .catch((e) => console.error("Error in exact seed:", e))
  .finally(() => prisma.$disconnect());
