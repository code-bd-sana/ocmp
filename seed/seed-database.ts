import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// Import all models
import AuditsAndRectificationReports from "./../backend/src/models/compliance-enforcement-dvsa/auditsAndRecificationReports.schema";
import ComplianceTimeTable from "./../backend/src/models/compliance-enforcement-dvsa/complianceTimeTable.schema";
import OrsPlan from "./../backend/src/models/compliance-enforcement-dvsa/orsPlan.schema";
import pg9AndPg13Plan from "./../backend/src/models/compliance-enforcement-dvsa/pg9AndPg13Plan.schema";
import RenewalTracker from "./../backend/src/models/compliance-enforcement-dvsa/renewalTracker.schema";
import SpotCheck from "./../backend/src/models/compliance-enforcement-dvsa/spotCheck.schema";
import TrafficCommissionerCommunication from "./../backend/src/models/compliance-enforcement-dvsa/trafficCommissionerCommunication.schema";
import WheelRetorquePolicyMonitoring from "./../backend/src/models/compliance-enforcement-dvsa/wheelRetorquePolicyMonitoring.schema";
import Document from "./../backend/src/models/document.schema";
import SubscriptionDuration from "./../backend/src/models/subscription-billing/subscriptionDuration.schema";
import SubscriptionFeature from "./../backend/src/models/subscription-billing/subscriptionFeature.schema";
import SubscriptionHistory from "./../backend/src/models/subscription-billing/subscriptionHistory.schema";
import SubscriptionInvoice from "./../backend/src/models/subscription-billing/subscriptionInvoice.schema";
import SubscriptionPayment from "./../backend/src/models/subscription-billing/subscriptionPayment.schema";
import SubscriptionPlan from "./../backend/src/models/subscription-billing/subscriptionPlan.schema";
import SubscriptionPricing from "./../backend/src/models/subscription-billing/subscriptionPricing.schema";
import SubscriptionTrial from "./../backend/src/models/subscription-billing/subscriptionTrial.schema";
import UserSubscription from "./../backend/src/models/subscription-billing/userSubscription.schema";
import ActivityLog from "./../backend/src/models/users-accounts/activityLog.schema";
import LoginActivity from "./../backend/src/models/users-accounts/loginActivity.schema";
import Notification from "./../backend/src/models/users-accounts/notification.schema";
import RepositorySettings from "./../backend/src/models/users-accounts/repositorySettings.schema";
import User, {
  UserRole,
} from "./../backend/src/models/users-accounts/user.schema";
import Driver from "./../backend/src/models/vehicle-transport/driver.schema";
import DriverTachograph from "./../backend/src/models/vehicle-transport/driverTachograph.schema";
import FuelUsage from "./../backend/src/models/vehicle-transport/fuelUsage.schema";
import SubContractor from "./../backend/src/models/vehicle-transport/subContractor.schema";
import Vehicle from "./../backend/src/models/vehicle-transport/vehicle.schema";

// Store created IDs for references
const ids: any = {};

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Clear existing data
    await clearDatabase();

    // Seed in order of dependencies
    await seedUsers();
    await seedDocuments();
    await seedRepositorySettings();
    await seedNotifications();
    await seedLoginActivities();
    await seedActivityLogs();

    // Subscription related
    await seedSubscriptionPlans();
    await seedSubscriptionDurations();
    await seedSubscriptionPricings();
    await seedSubscriptionFeatures();
    await seedUserSubscriptions();
    await seedSubscriptionTrials();
    await seedSubscriptionHistories();
    await seedSubscriptionInvoices();
    await seedSubscriptionPayments();

    // Vehicle and Transport related
    await seedDrivers();
    await seedVehicles();
    await seedDriverTachographs();
    await seedFuelUsages();
    await seedSubContractors();

    // Compliance, Enforcement & DVSA
    await seedSpotChecks();
    await seedPg9AndPg13Plans();
    await seedOrsPlans();
    await seedTrafficCommissionerCommunications();
    await seedRenewalTrackers();
    await seedAuditsAndRectificationReports();
    await seedWheelRetorquePolicyMonitorings();
    await seedComplianceTimeTables();

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- Users: ${ids.users?.length || 0}`);
    console.log(`- Documents: ${ids.documents?.length || 0}`);
    console.log(`- Subscription Plans: ${ids.subscriptionPlans?.length || 0}`);
    console.log(`- Vehicles: ${ids.vehicles?.length || 0}`);
    console.log(`- Drivers: ${ids.drivers?.length || 0}`);
    console.log("... and all other related data!\n");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

async function clearDatabase() {
  console.log("🗑️  Clearing existing data...");
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    // Drop all indexes for the collection
    try {
      await collection.dropIndexes();
    } catch (error) {
      // Ignore errors when dropping indexes
    }
    // Delete all documents
    await collection.deleteMany({});
  }
  console.log("✓ Database cleared\n");
}

// ==================== USER ACCOUNTS ====================

async function seedUsers() {
  console.log("👤 Seeding users...");
  const hashedPassword = await bcrypt.hash("123456", 10);

  const users = await User.create([
    {
      fullName: "Super Admin User",
      email: "user0@example.com",
      phone: "+447123456789",
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
    {
      fullName: "John Transport Manager",
      email: "user1@example.com",
      phone: "+447987654321",
      password: hashedPassword,
      role: UserRole.TRANSPORT_MANAGER,
      isEmailVerified: true,
      isActive: true,
    },
    {
      fullName: "Jane Standalone User",
      email: "user2@example.com",
      phone: "+447555123456",
      password: hashedPassword,
      role: UserRole.STANDALONE_USER,
      isEmailVerified: true,
      isActive: true,
    },
    {
      fullName: "Mike Staff Member",
      email: "user3@example.com",
      password: hashedPassword,
      role: UserRole.STAFF,
      isEmailVerified: false,
      isActive: false,
    },
  ]);

  ids.users = users;
  console.log(`✓ Created ${users.length} users\n`);
}

async function seedDocuments() {
  console.log("📄 Seeding documents...");

  const documents = await Document.create([
    {
      filename: "driver-license-001.pdf",
      originalName: "John_Driver_License.pdf",
      mimeType: "application/pdf",
      size: 524288,
      url: "https://s3.amazonaws.com/timtim/documents/driver-license-001.pdf",
      s3Key: "documents/driver-license-001.pdf",
      uploader: ids.users[0]._id,
    },
    {
      filename: "vehicle-insurance-001.pdf",
      originalName: "Vehicle_Insurance_2026.pdf",
      mimeType: "application/pdf",
      size: 1048576,
      url: "https://s3.amazonaws.com/timtim/documents/vehicle-insurance-001.pdf",
      s3Key: "documents/vehicle-insurance-001.pdf",
      uploader: ids.users[1]._id,
    },
    {
      filename: "compliance-report-001.pdf",
      originalName: "Compliance_Report_Q1_2026.pdf",
      mimeType: "application/pdf",
      size: 2097152,
      url: "https://s3.amazonaws.com/timtim/documents/compliance-report-001.pdf",
      s3Key: "documents/compliance-report-001.pdf",
      uploader: ids.users[0]._id,
    },
  ]);

  ids.documents = documents;
  console.log(`✓ Created ${documents.length} documents\n`);
}

async function seedRepositorySettings() {
  console.log("⚙️  Seeding repository settings...");

  const settings = [];
  for (let i = 0; i < 100; i++) {
    settings.push({
      vehicleList: i % 2 === 0,
      spotChecks: i % 3 !== 0,
      driverDetailsLicenceAndDoc: i % 4 !== 0,
      driverTachoGraphAndWTDInfringements: i % 5 !== 0,
      trainingAndToolboxTalks: i % 2 === 1,
      renewalsTracker: i % 3 === 0,
      OCRSChecksAndRectification: i % 2 === 0,
      trafficCommissionerCommunicate: i % 4 === 0,
      transportManager: i % 2 === 0,
      selfServiceAndLogin: i % 3 !== 0,
      Planner: i % 2 === 1,
      PG9sPG13FGClearanceInvesting: i % 5 !== 0,
      contactLog: i % 2 === 0,
      GV79DAndMaintenanceProvider: i % 3 === 0,
      complianceTimetable: i % 2 === 0,
      auditsAndRectificationReports: i % 4 !== 0,
      fuelUsage: i % 2 === 0,
      wheelRetorquePolicyAndMonitoring: i % 3 !== 0,
      workingTimeDirective: i % 2 === 1,
      policyProcedureReviewTracker: i % 3 === 0,
      subcontractorDetails: i % 2 === 0,
      userId: ids.users[i % ids.users.length]._id,
    });
  }
  const createdSettings = await RepositorySettings.create(settings);
  ids.repositorySettings = createdSettings;
  console.log(`✓ Created ${createdSettings.length} repository settings\n`);
}

async function seedNotifications() {
  console.log("🔔 Seeding notifications...");

  const types = ["SUBSCRIPTION", "SYSTEM", "BILLING", "SECURITY"];
  const notifications = [];
  for (let i = 0; i < 120; i++) {
    const isRead = i % 2 === 0;
    notifications.push({
      userId: ids.users[i % ids.users.length]._id,
      title: `Notification Title #${i + 1}`,
      message: `Notification message #${i + 1} for user ${i % ids.users.length}`,
      type: types[i % types.length],
      isRead,
      readAt: isRead ? new Date(Date.now() - i * 1000 * 60 * 60) : undefined,
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60),
    });
  }
  const createdNotifications = await Notification.create(notifications);
  ids.notifications = createdNotifications;
  console.log(`✓ Created ${createdNotifications.length} notifications\n`);
}

async function seedLoginActivities() {
  console.log("🔐 Seeding login activities...");

  const browsers = [
    "Chrome 120",
    "Safari 17",
    "Firefox 110",
    "Edge 119",
    "Opera 105",
  ];
  const osList = ["Windows 11", "macOS 14", "Linux", "Android 13", "iOS 17"];
  const locations = [
    "London, UK",
    "Manchester, UK",
    "Birmingham, UK",
    "Leeds, UK",
    "Glasgow, UK",
  ];
  const activities = [];
  for (let i = 0; i < 100; i++) {
    activities.push({
      email: ids.users[i % ids.users.length].email,
      loginHash: "hash_" + Math.random().toString(36).substr(2, 9),
      ipAddress: `192.168.${i % 255}.${(i * 7) % 255}`,
      deviceInfo: `Mozilla/5.0 (${osList[i % osList.length]})`,
      browser: browsers[i % browsers.length],
      os: osList[i % osList.length],
      location: locations[i % locations.length],
      loginAt: new Date(Date.now() - i * 1000 * 60 * 60 * 2),
      logoutAt:
        i % 3 === 0 ? new Date(Date.now() - i * 1000 * 60 * 60) : undefined,
      isSuccessful: i % 4 !== 0,
    });
  }
  const createdActivities = await LoginActivity.create(activities);
  ids.loginActivities = createdActivities;
  console.log(`✓ Created ${createdActivities.length} login activities\n`);
}

async function seedActivityLogs() {
  console.log("📋 Seeding activity logs...");

  const actions = [
    "CREATE",
    "UPDATE",
    "DELETE",
    "LOGIN",
    "LOGOUT",
    "UPLOAD",
    "DOWNLOAD",
  ];
  const modules = [
    "VEHICLE",
    "DRIVER",
    "SUBSCRIPTION",
    "DOCUMENT",
    "USER",
    "NOTIFICATION",
  ];
  const logs = [];
  for (let i = 0; i < 100; i++) {
    logs.push({
      userId: ids.users[i % ids.users.length]._id,
      action: actions[i % actions.length],
      module: modules[i % modules.length],
      entityType:
        modules[i % modules.length].charAt(0) +
        modules[i % modules.length].slice(1).toLowerCase(),
      entityId: `entity_${i + 1}`,
      description: `Activity log #${i + 1} for action ${actions[i % actions.length]}`,
      timestamp: new Date(Date.now() - i * 1000 * 60 * 30),
    });
  }
  const createdLogs = await ActivityLog.create(logs);
  ids.activityLogs = createdLogs;
  console.log(`✓ Created ${createdLogs.length} activity logs\n`);
}

// ==================== SUBSCRIPTION BILLING ====================

async function seedSubscriptionPlans() {
  console.log("📦 Seeding subscription plans...");

  const planTypes = ["FREE", "BASIC", "PROFESSIONAL", "ENTERPRISE", "CUSTOM"];
  const billingCycles = [
    "TRIAL",
    "MONTHLY",
    "QUARTERLY",
    "SEMI-ANNUAL",
    "ANNUAL",
  ];
  const accountTypes = ["BOTH", "STANDALONE", "TRANSPORT_MANAGER"];
  const plans = [];
  for (let i = 0; i < 120; i++) {
    const type = planTypes[i % planTypes.length];
    const cycle = billingCycles[i % billingCycles.length];
    const accType = accountTypes[i % accountTypes.length];
    let name = "";
    if (type === "FREE") {
      name = "FREE TRIAL";
    } else if (type === "CUSTOM") {
      name = `CUSTOM PLAN ${cycle}`;
    } else {
      name = `${type} ${cycle}`;
    }
    plans.push({
      name,
      planType:
        type === "FREE" ? "FREE" : type === "CUSTOM" ? "CUSTOM" : "PAID",
      applicableAccountType: accType,
      description: `${name} for ${accType.toLowerCase().replace("_", " ")} users`,
      isActive: true,
      createdBy: ids.users[0]._id,
    });
  }
  const createdPlans = await SubscriptionPlan.create(plans);
  ids.subscriptionPlans = createdPlans;
  console.log(`\u2713 Created ${createdPlans.length} subscription plans\n`);
}

async function seedSubscriptionDurations() {
  console.log("⏱️  Seeding subscription durations...");

  const baseDurations = [
    { name: "Trial", days: 7 },
    { name: "Weekly", days: 7 },
    { name: "Bi-Weekly", days: 14 },
    { name: "Monthly", days: 30 },
    { name: "Quarterly", days: 90 },
    { name: "Semi-Annual", days: 180 },
    { name: "Annual", days: 365 },
  ];
  const durations = [];
  // Add base durations first
  for (const d of baseDurations) {
    durations.push({
      name: d.name,
      durationInDays: d.days,
      isActive: true,
      createdBy: ids.users[0]._id,
    });
  }
  // Add custom durations
  for (let i = baseDurations.length; i < 100; i++) {
    const days = 7 + i * 7;
    durations.push({
      name: `Custom ${days} Days`,
      durationInDays: days,
      isActive: true,
      createdBy: ids.users[0]._id,
    });
  }
  const createdDurations = await SubscriptionDuration.create(durations);
  ids.subscriptionDurations = createdDurations;
  console.log(
    `\u2713 Created ${createdDurations.length} subscription durations\n`,
  );
}

async function seedSubscriptionPricings() {
  console.log("💰 Seeding subscription pricings...");

  const pricings = [];
  const planCount = ids.subscriptionPlans.length;
  const durationCount = ids.subscriptionDurations.length;
  for (let i = 0; i < 300; i++) {
    pricings.push({
      subscriptionPlanId: ids.subscriptionPlans[i % planCount]._id,
      subscriptionDurationId: ids.subscriptionDurations[i % durationCount]._id,
      price: Math.round(Math.random() * 1000 * 100) / 100,
      currency: "GBP",
      isActive: true,
      createdBy: ids.users[0]._id,
    });
  }
  const createdPricings = await SubscriptionPricing.create(pricings);
  ids.subscriptionPricings = createdPricings;
  console.log(
    `\u2713 Created ${createdPricings.length} subscription pricings\n`,
  );
}

async function seedSubscriptionFeatures() {
  console.log("✨ Seeding subscription features...");

  const features = await SubscriptionFeature.create([
    {
      code: "VEHICLE_MANAGEMENT",
      name: "Vehicle Management",
      description: "Manage vehicle fleet and related documents",
      isCoreFeature: true,
      createdBy: ids.users[0]._id,
    },
    {
      code: "DRIVER_MANAGEMENT",
      name: "Driver Management",
      description: "Manage drivers, licenses, and compliance",
      isCoreFeature: true,
      createdBy: ids.users[0]._id,
    },
    {
      code: "SPOT_CHECKS",
      name: "Spot Checks",
      description: "Perform and track vehicle spot checks",
      isCoreFeature: false,
      createdBy: ids.users[0]._id,
    },
    {
      code: "COMPLIANCE_TRACKING",
      name: "Compliance Tracking",
      description: "Track compliance requirements and deadlines",
      isCoreFeature: true,
      createdBy: ids.users[0]._id,
    },
    {
      code: "FUEL_TRACKING",
      name: "Fuel Usage Tracking",
      description: "Monitor and analyze fuel usage",
      isCoreFeature: false,
      createdBy: ids.users[0]._id,
    },
    {
      code: "ADVANCED_REPORTING",
      name: "Advanced Reporting",
      description: "Generate detailed analytics and reports",
      isCoreFeature: false,
      createdBy: ids.users[0]._id,
    },
  ]);

  ids.subscriptionFeatures = features;
  console.log(`✓ Created ${features.length} subscription features\n`);
}

async function seedUserSubscriptions() {
  console.log("👥 Seeding user subscriptions...");

  const subscriptions = await UserSubscription.create([
    {
      userId: ids.users[1]._id,
      subscriptionPlanId: ids.subscriptionPlans[2]._id,
      subscriptionDurationId: ids.subscriptionDurations[1]._id,
      subscriptionPricingId: ids.subscriptionPricings[2]._id,
      status: "ACTIVE",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-31"),
      autoRenew: true,
      isFree: false,
      refundable: true,
      refundWindowEnd: new Date("2026-01-08"),
      refundedAmount: 0,
    },
    {
      userId: ids.users[2]._id,
      subscriptionPlanId: ids.subscriptionPlans[1]._id,
      subscriptionDurationId: ids.subscriptionDurations[1]._id,
      subscriptionPricingId: ids.subscriptionPricings[1]._id,
      status: "ACTIVE",
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-03-03"),
      autoRenew: false,
      isFree: false,
      refundable: true,
      refundWindowEnd: new Date("2026-02-08"),
    },
    {
      userId: ids.users[3]._id,
      subscriptionPlanId: ids.subscriptionPlans[0]._id,
      subscriptionDurationId: ids.subscriptionDurations[0]._id,
      subscriptionPricingId: ids.subscriptionPricings[0]._id,
      status: "TRIAL",
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-02-08"),
      autoRenew: false,
      isFree: true,
      refundable: false,
    },
  ]);

  ids.userSubscriptions = subscriptions;
  console.log(`✓ Created ${subscriptions.length} user subscriptions\n`);
}

async function seedSubscriptionTrials() {
  console.log("🎁 Seeding subscription trials...");

  const trials = await SubscriptionTrial.create([
    {
      userId: ids.users[3]._id,
      trialDays: 7,
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-02-08"),
      isUsed: true,
      convertedToPaid: false,
    },
    {
      userId: ids.users[1]._id,
      trialDays: 14,
      startDate: new Date("2025-12-15"),
      endDate: new Date("2025-12-29"),
      isUsed: true,
      convertedToPaid: true,
    },
  ]);

  ids.subscriptionTrials = trials;
  console.log(`✓ Created ${trials.length} subscription trials\n`);
}

async function seedSubscriptionHistories() {
  console.log("📜 Seeding subscription histories...");

  const histories = await SubscriptionHistory.create([
    {
      userId: ids.users[1]._id,
      subscriptionPlanId: ids.subscriptionPlans[0]._id,
      subscriptionDurationId: ids.subscriptionDurations[0]._id,
      startDate: new Date("2025-12-01"),
      endDate: new Date("2025-12-08"),
      status: "EXPIRED",
      changedAt: new Date("2025-12-08"),
    },
    {
      userId: ids.users[1]._id,
      subscriptionPlanId: ids.subscriptionPlans[2]._id,
      subscriptionDurationId: ids.subscriptionDurations[1]._id,
      startDate: new Date("2025-12-09"),
      endDate: new Date("2026-01-09"),
      status: "ACTIVE",
      changedAt: new Date("2025-12-09"),
    },
  ]);

  ids.subscriptionHistories = histories;
  console.log(`✓ Created ${histories.length} subscription histories\n`);
}

async function seedSubscriptionInvoices() {
  console.log("🧾 Seeding subscription invoices...");

  const invoices = await SubscriptionInvoice.create([
    {
      userId: ids.users[1]._id,
      userSubscriptionId: ids.userSubscriptions[0]._id,
      invoiceNumber: "INV-2026-001",
      amount: 99.99,
      status: "PAID",
      dueDate: new Date("2026-01-15"),
    },
    {
      userId: ids.users[2]._id,
      userSubscriptionId: ids.userSubscriptions[1]._id,
      invoiceNumber: "INV-2026-002",
      amount: 49.99,
      status: "PAID",
      dueDate: new Date("2026-02-15"),
    },
    {
      userId: ids.users[1]._id,
      userSubscriptionId: ids.userSubscriptions[0]._id,
      invoiceNumber: "INV-2026-003",
      amount: 99.99,
      status: "PENDING",
      dueDate: new Date("2026-02-15"),
    },
  ]);

  ids.subscriptionInvoices = invoices;
  console.log(`✓ Created ${invoices.length} subscription invoices\n`);
}

async function seedSubscriptionPayments() {
  console.log("💳 Seeding subscription payments...");

  const payments = await SubscriptionPayment.create([
    {
      subscriptionInvoiceId: ids.subscriptionInvoices[0]._id,
      transactionId: "txn_" + Math.random().toString(36).substr(2, 16),
      paidAmount: 99.99,
      paymentStatus: "SUCCESS",
      paidAt: new Date("2026-01-10"),
      paymentMethod: "STRIPE",
    },
    {
      subscriptionInvoiceId: ids.subscriptionInvoices[1]._id,
      transactionId: "txn_" + Math.random().toString(36).substr(2, 16),
      paidAmount: 49.99,
      paymentStatus: "SUCCESS",
      paidAt: new Date("2026-02-01"),
      paymentMethod: "CARD",
    },
  ]);

  ids.subscriptionPayments = payments;
  console.log(`✓ Created ${payments.length} subscription payments\n`);
}

// ==================== VEHICLE & TRANSPORT ====================

async function seedDrivers() {
  console.log("🚗 Seeding drivers...");

  const drivers = [];
  for (let i = 0; i < 120; i++) {
    drivers.push({
      fullName: `Driver ${i + 1}`,
      licenseNumber: `LIC${100000 + i}`,
      postCode: `P${i % 10} ${i % 10}${i % 10}AA`,
      niNumber: `NI${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}`.slice(0, 9),
      licenseExpiry: new Date(2028, i % 12, 1 + (i % 28)),
      licenseExpiryDTC: new Date(2027, i % 12, 1 + (i % 28)),
      cpcExpiry: new Date(2029, i % 12, 1 + (i % 28)),
      points: i % 7,
      endorsementCodes: i % 5 === 0 ? ["SP30"] : [],
      lastChecked: new Date(2026, i % 12, 1 + (i % 28)),
      checkFrequencyDays: 30 + (i % 90),
      nextCheckDueDate: new Date(2026, (i + 1) % 12, 1 + (i % 28)),
      employed: i % 2 === 0,
      checkStatus: i % 3 === 0 ? "Due" : "Okay",
      attachments: [ids.documents[i % ids.documents.length]?._id],
      standAloneId: ids.users[i % ids.users.length]._id,
      createdBy: ids.users[i % ids.users.length]._id,
    });
  }
  const createdDrivers = await Driver.create(drivers);
  ids.drivers = createdDrivers;
  console.log(`✓ Created ${createdDrivers.length} drivers\n`);
}

async function seedVehicles() {
  console.log("🚛 Seeding vehicles...");

  const types = ["HGV Class 1", "HGV Class 2", "Van", "Car", "Minibus"];
  const statuses = ["PENDING", "ACTIVE", "INACTIVE"];
  const vehicles = [];
  for (let i = 0; i < 120; i++) {
    vehicles.push({
      vehicleRegId: `REG${1000 + i}`,
      vehicleType: types[i % types.length],
      licensePlate: `LP${i + 1000} AB${i % 26}`,
      status: statuses[i % statuses.length],
      additionalDetails: {
        lastServiceDate: new Date(2025, i % 12, 1 + (i % 28)),
        nextServiceDate: new Date(2026, i % 12, 1 + (i % 28)),
        grossPlatedWeight: 3500 + (i % 10) * 1000,
        ownerShipStatus:
          i % 2 === 0 ? "Company/Business_Ownership" : "Leased/Financed",
        diskNumber: new Date(2025, i % 12, 1 + (i % 28)),
        chassisNumber: `CHS${100000 + i}`,
        keysAvailable: 1 + (i % 3),
        v5InName: i % 2 === 0,
        plantingCertificate: i % 2 === 0,
        vedExpiry: new Date(2026, i % 12, 1 + (i % 28)),
        insuranceExpiry: new Date(2026, (i + 1) % 12, 1 + (i % 28)),
        serviceDueDate: new Date(2026, (i + 2) % 12, 1 + (i % 28)),
      },
      driverPack: i % 2 === 0,
      notes: `Vehicle #${i + 1} seeded for testing`,
      driverId: ids.drivers[i % ids.drivers.length]?._id,
      clientId: ids.users[i % ids.users.length]._id,
      attachments: [ids.documents[i % ids.documents.length]?._id],
      createdBy: ids.users[i % ids.users.length]._id,
    });
  }
  const createdVehicles = await Vehicle.create(vehicles);
  ids.vehicles = createdVehicles;
  console.log(`✓ Created ${createdVehicles.length} vehicles\n`);
}

async function seedDriverTachographs() {
  console.log("📟 Seeding driver tachographs...");

  const tachographs = await DriverTachograph.create([
    {
      driverId: ids.drivers[0]._id,
      vehicleId: ids.vehicles[0]._id,
      typeOfInfringement: "Daily rest period",
      details: "Reduced daily rest period by 15 minutes",
      actionTaken: "Driver counseled on importance of proper rest",
      reviewedBy: ids.users[1]._id,
      signed: true,
    },
    {
      driverId: ids.drivers[1]._id,
      vehicleId: ids.vehicles[1]._id,
      typeOfInfringement: "Driving time",
      details: "Exceeded continuous driving time by 10 minutes",
      actionTaken: "Written warning issued, additional training scheduled",
      reviewedBy: ids.users[1]._id,
      signed: true,
    },
    {
      driverId: ids.drivers[0]._id,
      vehicleId: ids.vehicles[0]._id,
      typeOfInfringement: "None",
      details: "All compliance requirements met",
      actionTaken: "No action required",
      reviewedBy: ids.users[1]._id,
      signed: false,
    },
  ]);

  ids.driverTachographs = tachographs;
  console.log(`✓ Created ${tachographs.length} driver tachographs\n`);
}

async function seedFuelUsages() {
  console.log("⛽ Seeding fuel usages...");

  const fuelUsages = await FuelUsage.create([
    {
      vehicleId: ids.vehicles[0]._id,
      driverId: ids.drivers[0]._id,
      adBlueUsed: 25.5,
      fuelUsed: 185.2,
      createdBy: ids.users[1]._id,
    },
    {
      vehicleId: ids.vehicles[0]._id,
      driverId: ids.drivers[0]._id,
      adBlueUsed: 18.3,
      fuelUsed: 165.7,
      createdBy: ids.users[1]._id,
    },
    {
      vehicleId: ids.vehicles[1]._id,
      driverId: ids.drivers[1]._id,
      fuelUsed: 45.8,
      createdBy: ids.users[1]._id,
    },
  ]);

  ids.fuelUsages = fuelUsages;
  console.log(`✓ Created ${fuelUsages.length} fuel usages\n`);
}

async function seedSubContractors() {
  console.log("🤝 Seeding subcontractors...");

  const subContractors = await SubContractor.create([
    {
      createdBy: ids.users[1]._id,
      insurancePolicyNumber: "INS-2026-ABC123",
      insuranceExpiryDate: new Date("2026-12-31"),
      gitPolicyNumber: new Date("2026-06-30"),
      gitExpiryDate: new Date("2026-06-30"),
      gitCover: 50000,
      hiabAvailable: true,
      otherCapabilities:
        "Refrigerated transport, Hazardous materials certified",
      startDateOfAgreement: new Date("2025-01-01"),
      rating: 0.9,
      checkedBy: ids.users[0]._id,
    },
    {
      createdBy: ids.users[1]._id,
      insurancePolicyNumber: "INS-2026-XYZ789",
      insuranceExpiryDate: new Date("2026-09-30"),
      gitPolicyNumber: new Date("2026-09-30"),
      gitExpiryDate: new Date("2026-09-30"),
      gitCover: 30000,
      hiabAvailable: false,
      otherCapabilities: "Long distance specialist",
      startDateOfAgreement: new Date("2025-06-15"),
      rating: 0.85,
      checkedBy: ids.users[0]._id,
    },
  ]);

  ids.subContractors = subContractors;
  console.log(`✓ Created ${subContractors.length} subcontractors\n`);
}

// ==================== COMPLIANCE, ENFORCEMENT & DVSA ====================

async function seedSpotChecks() {
  console.log("🔍 Seeding spot checks...");

  const spotChecks = await SpotCheck.create([
    {
      vehicleId: ids.vehicles[0]._id,
      issueDetails: "Headlight alignment slightly off",
      reportedBy: ids.users[1]._id,
      rectificationRequired: new Date("2026-02-15"),
      actionTaken: "Scheduled for workshop adjustment",
      dateCompleted: new Date("2026-02-10"),
      completedBy: "Service Center A",
      followUpNeeded: "Re-check after 1 month",
      notes: "Minor issue, addressed promptly",
      attachments: [ids.documents[2]._id],
    },
    {
      vehicleId: ids.vehicles[1]._id,
      issueDetails: "Tire tread depth below optimal level",
      reportedBy: ids.users[1]._id,
      rectificationRequired: new Date("2026-02-20"),
      actionTaken: "New tires ordered",
      notes: "Priority order placed",
    },
    {
      vehicleId: ids.vehicles[0]._id,
      issueDetails: "All checks passed",
      reportedBy: ids.users[1]._id,
      actionTaken: "No action required",
      dateCompleted: new Date("2026-02-05"),
      completedBy: "James Wilson",
      notes: "Vehicle in excellent condition",
    },
  ]);

  ids.spotChecks = spotChecks;
  console.log(`✓ Created ${spotChecks.length} spot checks\n`);
}

async function seedPg9AndPg13Plans() {
  console.log("📋 Seeding PG9 and PG13 plans...");

  const plans = await pg9AndPg13Plan.create([
    {
      vehicleId: ids.vehicles[0]._id,
      issueType: "PG9",
      defectDescription: "Brake pad wear indicator warning",
      clearanceStatus: "CLEARED",
      tcContactMade: true,
      maintenanceProvider: "ABC Motors Ltd",
      meetingDate: new Date("2026-01-20"),
      notes: "Issue resolved, vehicle cleared for service",
      followUp: false,
      createdBy: ids.users[1]._id,
    },
    {
      vehicleId: ids.vehicles[1]._id,
      issueType: "DV79D",
      defectDescription: "Emission system fault detected",
      clearanceStatus: "PENDING",
      tcContactMade: true,
      maintenanceProvider: "XYZ Service Center",
      meetingDate: new Date("2026-02-15"),
      notes: "Awaiting parts delivery",
      followUp: true,
      createdBy: ids.users[1]._id,
    },
  ]);

  ids.pg9AndPg13Plans = plans;
  console.log(`✓ Created ${plans.length} PG9/PG13 plans\n`);
}

async function seedOrsPlans() {
  console.log("📊 Seeding ORS plans...");

  const orsPlans = await OrsPlan.create([
    {
      roadWorthinessScore: "GREEN",
      overallTrafficScore: "AMBER",
      actionRequired:
        "Continue current maintenance schedule, review driver training",
      documents: [
        {
          textDoc: [
            {
              label: "Compliance Report Q4 2025",
              description: "Quarterly compliance assessment",
            },
          ],
          attachments: [ids.documents[2]._id],
        },
      ],
    },
    {
      roadWorthinessScore: "AMBER",
      overallTrafficScore: "GREEN",
      actionRequired: "Increase vehicle inspection frequency",
      documents: [
        {
          textDoc: [
            {
              label: "Maintenance Schedule 2026",
              description: "Updated maintenance plan",
            },
          ],
          attachments: [],
        },
      ],
    },
  ]);

  ids.orsPlans = orsPlans;
  console.log(`✓ Created ${orsPlans.length} ORS plans\n`);
}

async function seedTrafficCommissionerCommunications() {
  console.log("📞 Seeding traffic commissioner communications...");

  const communications = await TrafficCommissionerCommunication.create([
    {
      type: "Email",
      contactedPerson: "Commissioner Sarah Williams",
      reason: "Annual compliance review submission",
      communicationDate: new Date("2026-01-15"),
      attachments: [ids.documents[2]._id],
      notes: new Date("2026-01-20"),
      createdBy: ids.users[1]._id,
    },
    {
      type: "Phone Call",
      contactedPerson: "Deputy Commissioner John Thompson",
      reason: "Query regarding new regulatory requirements",
      communicationDate: new Date("2026-02-03"),
      notes: new Date("2026-02-03"),
      createdBy: ids.users[1]._id,
    },
    {
      type: "Letter",
      contactedPerson: "Office of the Traffic Commissioner",
      reason: "Notification of fleet expansion",
      communicationDate: new Date("2026-01-10"),
      createdBy: ids.users[1]._id,
    },
  ]);

  ids.trafficCommissionerCommunications = communications;
  console.log(
    `✓ Created ${communications.length} traffic commissioner communications\n`,
  );
}

async function seedRenewalTrackers() {
  console.log("🔄 Seeding renewal trackers...");

  const renewals = await RenewalTracker.create([
    {
      type: "Insurance",
      item: "Fleet Insurance Policy",
      description: "Comprehensive fleet insurance coverage",
      refOrPolicyNo: "POL-2026-FLEET-001",
      providerOrIssuer: "ABC Insurance Ltd",
      startDate: new Date("2026-01-01"),
      expiryOrDueDate: new Date("2026-12-31"),
      reminderSet: true,
      reminderDate: new Date("2026-11-01"),
      status: true,
      notes: "Premium: £12,500/year",
      createdBy: ids.users[1]._id,
    },
    {
      type: "License",
      item: "Operator License",
      description: "Standard National Operator License",
      refOrPolicyNo: "OL-123456",
      providerOrIssuer: "Traffic Commissioner",
      startDate: new Date("2021-03-15"),
      expiryOrDueDate: new Date("2026-03-14"),
      reminderSet: true,
      reminderDate: new Date("2025-12-15"),
      status: true,
      notes: "Renewal application submitted",
      createdBy: ids.users[1]._id,
    },
    {
      type: "Certification",
      item: "ISO 9001 Certification",
      description: "Quality management system certification",
      refOrPolicyNo: "ISO-9001-2025",
      providerOrIssuer: "BSI Group",
      startDate: new Date("2025-06-01"),
      expiryOrDueDate: new Date("2026-05-31"),
      reminderSet: true,
      reminderDate: new Date("2026-03-01"),
      status: false,
      notes: "Audit scheduled for April 2026",
      createdBy: ids.users[0]._id,
    },
  ]);

  ids.renewalTrackers = renewals;
  console.log(`✓ Created ${renewals.length} renewal trackers\n`);
}

async function seedAuditsAndRectificationReports() {
  console.log("📑 Seeding audits and rectification reports...");

  const reports = await AuditsAndRectificationReports.create([
    {
      title: "Q4 2025 Internal Compliance Audit",
      type: "Internal Audit",
      responsiblePerson: "John Transport Manager",
      attachments: [ids.documents[2]._id],
      createdBy: ids.users[1]._id,
    },
    {
      title: "DVSA Roadside Inspection Report",
      type: "External Inspection",
      responsiblePerson: "DVSA Inspector",
      attachments: [],
      createdBy: ids.users[1]._id,
    },
    {
      title: "Vehicle Maintenance Audit January 2026",
      type: "Maintenance Audit",
      responsiblePerson: "Mike Staff Member",
      createdBy: ids.users[0]._id,
    },
  ]);

  ids.auditsAndRectificationReports = reports;
  console.log(`✓ Created ${reports.length} audits and rectification reports\n`);
}

async function seedWheelRetorquePolicyMonitorings() {
  console.log("🔧 Seeding wheel retorque policy monitorings...");

  const retorques = await WheelRetorquePolicyMonitoring.create([
    {
      vehicleId: ids.vehicles[0]._id,
      dateChanged: new Date("2026-01-15"),
      tyreSize: "315/80R22.5",
      tyreLocation: "Front Axle - Left",
      reTorqueDue: new Date("2026-01-29"),
      reTorqueCompleted: new Date("2026-01-28"),
      Technician: "David Smith",
      createdBy: ids.users[1]._id,
    },
    {
      vehicleId: ids.vehicles[0]._id,
      dateChanged: new Date("2026-01-15"),
      tyreSize: "315/80R22.5",
      tyreLocation: "Front Axle - Right",
      reTorqueDue: new Date("2026-01-29"),
      reTorqueCompleted: new Date("2026-01-28"),
      Technician: "David Smith",
      createdBy: ids.users[1]._id,
    },
    {
      vehicleId: ids.vehicles[1]._id,
      dateChanged: new Date("2026-02-01"),
      tyreSize: "195/75R16",
      tyreLocation: "Rear Axle - Left",
      reTorqueDue: new Date("2026-02-15"),
      Technician: "TBD",
      createdBy: ids.users[1]._id,
    },
  ]);

  ids.wheelRetorquePolicyMonitorings = retorques;
  console.log(`✓ Created ${retorques.length} wheel retorque monitorings\n`);
}

async function seedComplianceTimeTables() {
  console.log("📅 Seeding compliance timetables...");

  const timeTables = await ComplianceTimeTable.create([
    {
      task: "Monthly vehicle inspection reports submission",
      responsibleParty: "John Transport Manager",
      dueDate: new Date("2026-03-01"),
      status: "PENDING",
      createdBy: ids.users[1]._id,
    },
    {
      task: "Driver CPC training renewal - James Wilson",
      responsibleParty: "John Transport Manager",
      dueDate: new Date("2029-03-20"),
      status: "PENDING",
      createdBy: ids.users[1]._id,
    },
    {
      task: "Annual operator license review",
      responsibleParty: "Super Admin User",
      dueDate: new Date("2026-03-14"),
      status: "IN_PROGRESS",
      createdBy: ids.users[0]._id,
    },
    {
      task: "Q1 2026 compliance audit",
      responsibleParty: "Mike Staff Member",
      dueDate: new Date("2026-03-31"),
      status: "PENDING",
      createdBy: ids.users[0]._id,
    },
  ]);

  ids.complianceTimeTables = timeTables;
  console.log(`✓ Created ${timeTables.length} compliance timetables\n`);
}

// Export for use in other scripts
export default seedDatabase;
