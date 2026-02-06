import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Import all models
import AuditsAndRectificationReports from '../../models/compliance-enforcement-dvsa/auditsAndRecificationReports.schema';
import ComplianceTimeTable from '../../models/compliance-enforcement-dvsa/complianceTimeTable.schema';
import OrsPlan from '../../models/compliance-enforcement-dvsa/orsPlan.schema';
import pg9AndPg13Plan from '../../models/compliance-enforcement-dvsa/pg9AndPg13Plan.schema';
import RenewalTracker from '../../models/compliance-enforcement-dvsa/renewalTracker.schema';
import SpotCheck from '../../models/compliance-enforcement-dvsa/spotCheck.schema';
import TrafficCommissionerCommunication from '../../models/compliance-enforcement-dvsa/trafficCommissionerCommunication.schema';
import WheelRetorquePolicyMonitoring from '../../models/compliance-enforcement-dvsa/wheelRetorquePolicyMonitoring.schema';
import Document from '../../models/document.schema';
import SubscriptionChangeRequest from '../../models/subscription-billing/subscriptionChangeRequest.schema';
import SubscriptionCustomization from '../../models/subscription-billing/subscriptionCustomization.schema';
import SubscriptionDuration from '../../models/subscription-billing/subscriptionDuration.schema';
import SubscriptionExemption from '../../models/subscription-billing/subscriptionExemption.schema';
import SubscriptionFeature from '../../models/subscription-billing/subscriptionFeature.schema';
import SubscriptionHistory from '../../models/subscription-billing/subscriptionHistory.schema';
import SubscriptionInvoice from '../../models/subscription-billing/subscriptionInvoice.schema';
import SubscriptionPayment from '../../models/subscription-billing/subscriptionPayment.schema';
import SubscriptionPlan from '../../models/subscription-billing/subscriptionPlan.schema';
import SubscriptionPricing from '../../models/subscription-billing/subscriptionPricing.schema';
import SubscriptionRefund from '../../models/subscription-billing/subscriptionRefund.schema';
import SubscriptionStatusLog from '../../models/subscription-billing/subscriptionStatusLog.schema';
import SubscriptionTrial from '../../models/subscription-billing/subscriptionTrial.schema';
import SubscriptionUsageLog from '../../models/subscription-billing/subscriptionUsageLog.schema';
import UserSubscription from '../../models/subscription-billing/userSubscription.schema';
import ActivityLog from '../../models/users-accounts/activityLog.schema';
import LoginActivity from '../../models/users-accounts/loginActivity.schema';
import Notification from '../../models/users-accounts/notification.schema';
import RepositorySettings from '../../models/users-accounts/repositorySettings.schema';
import User, { UserRole } from '../../models/users-accounts/user.schema';
import Driver from '../../models/vehicle-transport/driver.schema';
import DriverTachograph from '../../models/vehicle-transport/driverTachograph.schema';
import FuelUsage from '../../models/vehicle-transport/fuelUsage.schema';
import SubContractor from '../../models/vehicle-transport/subContractor.schema';
import Vehicle from '../../models/vehicle-transport/vehicle.schema';

// Store created IDs for references
const ids: any = {};

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

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
    await seedSubscriptionCustomizations();
    await seedSubscriptionTrials();
    await seedSubscriptionExemptions();
    await seedSubscriptionHistories();
    await seedSubscriptionInvoices();
    await seedSubscriptionPayments();
    await seedSubscriptionStatusLogs();
    await seedSubscriptionUsageLogs();
    await seedSubscriptionChangeRequests();
    await seedSubscriptionRefunds();

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

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${ids.users?.length || 0}`);
    console.log(`- Documents: ${ids.documents?.length || 0}`);
    console.log(`- Subscription Plans: ${ids.subscriptionPlans?.length || 0}`);
    console.log(`- Vehicles: ${ids.vehicles?.length || 0}`);
    console.log(`- Drivers: ${ids.drivers?.length || 0}`);
    console.log('... and all other related data!\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
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
  console.log('✓ Database cleared\n');
}

// ==================== USER ACCOUNTS ====================

async function seedUsers() {
  console.log('👤 Seeding users...');
  const hashedPassword = await bcrypt.hash('123456', 10);

  const users = await User.create([
    {
      fullName: 'Super Admin User',
      email: 'user0@example.com',
      phone: '+447123456789',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
    {
      fullName: 'John Transport Manager',
      email: 'user1@example.com',
      phone: '+447987654321',
      password: hashedPassword,
      role: UserRole.TRANSPORT_MANAGER,
      isEmailVerified: true,
      isActive: true,
    },
    {
      fullName: 'Jane Standalone User',
      email: 'user2@example.com',
      phone: '+447555123456',
      password: hashedPassword,
      role: UserRole.STANDALONE_USER,
      isEmailVerified: true,
      isActive: true,
    },
    {
      fullName: 'Mike Staff Member',
      email: 'user3@example.com',
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
  console.log('📄 Seeding documents...');

  const documents = await Document.create([
    {
      filename: 'driver-license-001.pdf',
      originalName: 'John_Driver_License.pdf',
      mimeType: 'application/pdf',
      size: 524288,
      url: 'https://s3.amazonaws.com/timtim/documents/driver-license-001.pdf',
      s3Key: 'documents/driver-license-001.pdf',
      uploader: ids.users[0]._id,
    },
    {
      filename: 'vehicle-insurance-001.pdf',
      originalName: 'Vehicle_Insurance_2026.pdf',
      mimeType: 'application/pdf',
      size: 1048576,
      url: 'https://s3.amazonaws.com/timtim/documents/vehicle-insurance-001.pdf',
      s3Key: 'documents/vehicle-insurance-001.pdf',
      uploader: ids.users[1]._id,
    },
    {
      filename: 'compliance-report-001.pdf',
      originalName: 'Compliance_Report_Q1_2026.pdf',
      mimeType: 'application/pdf',
      size: 2097152,
      url: 'https://s3.amazonaws.com/timtim/documents/compliance-report-001.pdf',
      s3Key: 'documents/compliance-report-001.pdf',
      uploader: ids.users[0]._id,
    },
  ]);

  ids.documents = documents;
  console.log(`✓ Created ${documents.length} documents\n`);
}

async function seedRepositorySettings() {
  console.log('⚙️  Seeding repository settings...');

  const settings = await RepositorySettings.create([
    {
      vehicleList: true,
      spotChecks: true,
      driverDetailsLicenceAndDoc: true,
      driverTachoGraphAndWTDInfringements: true,
      trainingAndToolboxTalks: false,
      renewalsTracker: true,
      OCRSChecksAndRectification: true,
      trafficCommissionerCommunicate: true,
      transportManager: true,
      selfServiceAndLogin: true,
      Planner: false,
      PG9sPG13FGClearanceInvesting: true,
      contactLog: false,
      GV79DAndMaintenanceProvider: true,
      complianceTimetable: true,
      auditsAndRectificationReports: true,
      fuelUsage: true,
      wheelRetorquePolicyAndMonitoring: true,
      workingTimeDirective: false,
      policyProcedureReviewTracker: false,
      subcontractorDetails: true,
      userId: ids.users[1]._id,
    },
    {
      vehicleList: true,
      spotChecks: false,
      driverDetailsLicenceAndDoc: true,
      renewalsTracker: true,
      userId: ids.users[2]._id,
    },
  ]);

  ids.repositorySettings = settings;
  console.log(`✓ Created ${settings.length} repository settings\n`);
}

async function seedNotifications() {
  console.log('🔔 Seeding notifications...');

  const notifications = await Notification.create([
    {
      userId: ids.users[1]._id,
      title: 'Subscription Expiring Soon',
      message:
        'Your subscription will expire in 7 days. Please renew to continue using all features.',
      type: 'SUBSCRIPTION',
      isRead: false,
    },
    {
      userId: ids.users[1]._id,
      title: 'License Verification Required',
      message: 'Driver license verification is due for John Smith.',
      type: 'SYSTEM',
      isRead: true,
      readAt: new Date('2026-02-05'),
    },
    {
      userId: ids.users[2]._id,
      title: 'Payment Successful',
      message: 'Your payment of £199.99 has been processed successfully.',
      type: 'BILLING',
      isRead: true,
      readAt: new Date('2026-02-01'),
    },
    {
      userId: ids.users[0]._id,
      title: 'Security Alert',
      message: 'New login detected from unrecognized device.',
      type: 'SECURITY',
      isRead: false,
    },
  ]);

  ids.notifications = notifications;
  console.log(`✓ Created ${notifications.length} notifications\n`);
}

async function seedLoginActivities() {
  console.log('🔐 Seeding login activities...');

  const activities = await LoginActivity.create([
    {
      email: ids.users[0].email,
      loginHash: 'hash_' + Math.random().toString(36).substr(2, 9),
      ipAddress: '192.168.1.100',
      deviceInfo: 'Mozilla/5.0 Windows NT 10.0',
      browser: 'Chrome 120',
      os: 'Windows 11',
      location: 'London, UK',
      loginAt: new Date('2026-02-06T08:30:00'),
      isSuccessful: true,
    },
    {
      email: ids.users[1].email,
      loginHash: 'hash_' + Math.random().toString(36).substr(2, 9),
      ipAddress: '192.168.1.101',
      deviceInfo: 'Mozilla/5.0 Macintosh',
      browser: 'Safari 17',
      os: 'macOS 14',
      location: 'Manchester, UK',
      loginAt: new Date('2026-02-06T09:15:00'),
      logoutAt: new Date('2026-02-06T17:30:00'),
      isSuccessful: true,
    },
    {
      email: 'unknown@example.com',
      ipAddress: '203.0.113.42',
      deviceInfo: 'Unknown',
      loginAt: new Date('2026-02-05T23:45:00'),
      isSuccessful: false,
    },
  ]);

  ids.loginActivities = activities;
  console.log(`✓ Created ${activities.length} login activities\n`);
}

async function seedActivityLogs() {
  console.log('📋 Seeding activity logs...');

  const logs = await ActivityLog.create([
    {
      userId: ids.users[1]._id,
      action: 'CREATE',
      module: 'VEHICLE',
      entityType: 'Vehicle',
      entityId: 'pending',
      description: 'Created new vehicle entry',
    },
    {
      userId: ids.users[1]._id,
      action: 'UPDATE',
      module: 'DRIVER',
      entityType: 'Driver',
      entityId: 'pending',
      description: 'Updated driver license information',
    },
    {
      userId: ids.users[0]._id,
      action: 'DELETE',
      module: 'SUBSCRIPTION',
      entityType: 'UserSubscription',
      entityId: 'pending',
      description: 'Cancelled user subscription',
    },
  ]);

  ids.activityLogs = logs;
  console.log(`✓ Created ${logs.length} activity logs\n`);
}

// ==================== SUBSCRIPTION BILLING ====================

async function seedSubscriptionPlans() {
  console.log('📦 Seeding subscription plans...');

  const plans = await SubscriptionPlan.create([
    {
      name: 'FREE TRIAL',
      planType: 'FREE',
      applicableAccountType: 'BOTH',
      description: '7-day free trial with basic features',
      isActive: true,
      createdBy: ids.users[0]._id,
    },
    {
      name: 'BASIC MONTHLY',
      planType: 'PAID',
      applicableAccountType: 'STANDALONE',
      description: 'Basic plan for standalone users',
      isActive: true,
      createdBy: ids.users[0]._id,
    },
    {
      name: 'PROFESSIONAL MONTHLY',
      planType: 'PAID',
      applicableAccountType: 'TRANSPORT_MANAGER',
      description: 'Professional plan for transport managers',
      isActive: true,
      createdBy: ids.users[0]._id,
    },
    {
      name: 'ENTERPRISE ANNUAL',
      planType: 'PAID',
      applicableAccountType: 'BOTH',
      description: 'Enterprise plan with all features',
      isActive: true,
      createdBy: ids.users[0]._id,
    },
    {
      name: 'CUSTOM PLAN',
      planType: 'CUSTOM',
      applicableAccountType: 'BOTH',
      description: 'Custom plan negotiated with client',
      isActive: true,
      createdBy: ids.users[0]._id,
    },
  ]);

  ids.subscriptionPlans = plans;
  console.log(`✓ Created ${plans.length} subscription plans\n`);
}

async function seedSubscriptionDurations() {
  console.log('⏱️  Seeding subscription durations...');

  const durations = await SubscriptionDuration.create([
    {
      name: 'TRIAL',
      durationInDays: 7,
      isActive: true,
      createdBy: ids.users[0]._id,
    },
    {
      name: 'MONTHLY',
      durationInDays: 30,
      isActive: true,
      createdBy: ids.users[0]._id,
    },
    {
      name: 'QUARTERLY',
      durationInDays: 90,
      isActive: true,
      createdBy: ids.users[0]._id,
    },
    {
      name: 'SEMI-ANNUAL',
      durationInDays: 180,
      isActive: true,
      createdBy: ids.users[0]._id,
    },
    {
      name: 'ANNUAL',
      durationInDays: 365,
      isActive: true,
      createdBy: ids.users[0]._id,
    },
  ]);

  ids.subscriptionDurations = durations;
  console.log(`✓ Created ${durations.length} subscription durations\n`);
}

async function seedSubscriptionPricings() {
  console.log('💰 Seeding subscription pricings...');

  const pricings = await SubscriptionPricing.create([
    {
      subscriptionPlanId: ids.subscriptionPlans[0]._id,
      subscriptionDurationId: ids.subscriptionDurations[0]._id,
      price: 0,
      currency: 'GBP',
      isActive: true,
      createdBy: ids.users[0]._id,
    },
    {
      subscriptionPlanId: ids.subscriptionPlans[1]._id,
      subscriptionDurationId: ids.subscriptionDurations[1]._id,
      price: 49.99,
      currency: 'GBP',
      isActive: true,
      createdBy: ids.users[0]._id,
    },
    {
      subscriptionPlanId: ids.subscriptionPlans[2]._id,
      subscriptionDurationId: ids.subscriptionDurations[1]._id,
      price: 99.99,
      currency: 'GBP',
      isActive: true,
      createdBy: ids.users[0]._id,
    },
    {
      subscriptionPlanId: ids.subscriptionPlans[3]._id,
      subscriptionDurationId: ids.subscriptionDurations[4]._id,
      price: 999.99,
      currency: 'GBP',
      isActive: true,
      createdBy: ids.users[0]._id,
    },
  ]);

  ids.subscriptionPricings = pricings;
  console.log(`✓ Created ${pricings.length} subscription pricings\n`);
}

async function seedSubscriptionFeatures() {
  console.log('✨ Seeding subscription features...');

  const features = await SubscriptionFeature.create([
    {
      code: 'VEHICLE_MANAGEMENT',
      name: 'Vehicle Management',
      description: 'Manage vehicle fleet and related documents',
      isCoreFeature: true,
      createdBy: ids.users[0]._id,
    },
    {
      code: 'DRIVER_MANAGEMENT',
      name: 'Driver Management',
      description: 'Manage drivers, licenses, and compliance',
      isCoreFeature: true,
      createdBy: ids.users[0]._id,
    },
    {
      code: 'SPOT_CHECKS',
      name: 'Spot Checks',
      description: 'Perform and track vehicle spot checks',
      isCoreFeature: false,
      createdBy: ids.users[0]._id,
    },
    {
      code: 'COMPLIANCE_TRACKING',
      name: 'Compliance Tracking',
      description: 'Track compliance requirements and deadlines',
      isCoreFeature: true,
      createdBy: ids.users[0]._id,
    },
    {
      code: 'FUEL_TRACKING',
      name: 'Fuel Usage Tracking',
      description: 'Monitor and analyze fuel usage',
      isCoreFeature: false,
      createdBy: ids.users[0]._id,
    },
    {
      code: 'ADVANCED_REPORTING',
      name: 'Advanced Reporting',
      description: 'Generate detailed analytics and reports',
      isCoreFeature: false,
      createdBy: ids.users[0]._id,
    },
  ]);

  ids.subscriptionFeatures = features;
  console.log(`✓ Created ${features.length} subscription features\n`);
}

async function seedUserSubscriptions() {
  console.log('👥 Seeding user subscriptions...');

  const subscriptions = await UserSubscription.create([
    {
      userId: ids.users[1]._id,
      subscriptionPlanId: ids.subscriptionPlans[2]._id,
      subscriptionDurationId: ids.subscriptionDurations[1]._id,
      subscriptionPricingId: ids.subscriptionPricings[2]._id,
      status: 'ACTIVE',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-01-31'),
      autoRenew: true,
      isFree: false,
      refundable: true,
      refundWindowEnd: new Date('2026-01-08'),
      refundedAmount: 0,
    },
    {
      userId: ids.users[2]._id,
      subscriptionPlanId: ids.subscriptionPlans[1]._id,
      subscriptionDurationId: ids.subscriptionDurations[1]._id,
      subscriptionPricingId: ids.subscriptionPricings[1]._id,
      status: 'ACTIVE',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-03-03'),
      autoRenew: false,
      isFree: false,
      refundable: true,
      refundWindowEnd: new Date('2026-02-08'),
    },
    {
      userId: ids.users[3]._id,
      subscriptionPlanId: ids.subscriptionPlans[0]._id,
      subscriptionDurationId: ids.subscriptionDurations[0]._id,
      subscriptionPricingId: ids.subscriptionPricings[0]._id,
      status: 'TRIAL',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-02-08'),
      autoRenew: false,
      isFree: true,
      refundable: false,
    },
  ]);

  ids.userSubscriptions = subscriptions;
  console.log(`✓ Created ${subscriptions.length} user subscriptions\n`);
}

async function seedSubscriptionCustomizations() {
  console.log('🎨 Seeding subscription customizations...');

  const customizations = await SubscriptionCustomization.create([
    {
      userSubscriptionId: ids.userSubscriptions[0]._id,
      subscriptionFeatureId: ids.subscriptionFeatures[0]._id,
      isEnabled: true,
    },
    {
      userSubscriptionId: ids.userSubscriptions[0]._id,
      subscriptionFeatureId: ids.subscriptionFeatures[1]._id,
      isEnabled: true,
    },
    {
      userSubscriptionId: ids.userSubscriptions[0]._id,
      subscriptionFeatureId: ids.subscriptionFeatures[2]._id,
      isEnabled: true,
    },
    {
      userSubscriptionId: ids.userSubscriptions[1]._id,
      subscriptionFeatureId: ids.subscriptionFeatures[0]._id,
      isEnabled: true,
    },
    {
      userSubscriptionId: ids.userSubscriptions[1]._id,
      subscriptionFeatureId: ids.subscriptionFeatures[1]._id,
      isEnabled: false,
    },
  ]);

  ids.subscriptionCustomizations = customizations;
  console.log(`✓ Created ${customizations.length} subscription customizations\n`);
}

async function seedSubscriptionTrials() {
  console.log('🎁 Seeding subscription trials...');

  const trials = await SubscriptionTrial.create([
    {
      userId: ids.users[3]._id,
      trialDays: 7,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-02-08'),
      isUsed: true,
      convertedToPaid: false,
    },
    {
      userId: ids.users[1]._id,
      trialDays: 14,
      startDate: new Date('2025-12-15'),
      endDate: new Date('2025-12-29'),
      isUsed: true,
      convertedToPaid: true,
    },
  ]);

  ids.subscriptionTrials = trials;
  console.log(`✓ Created ${trials.length} subscription trials\n`);
}

async function seedSubscriptionExemptions() {
  console.log('🎫 Seeding subscription exemptions...');

  const exemptions = await SubscriptionExemption.create([
    {
      userId: ids.users[0]._id,
      reason: 'Internal administrator account - permanent exemption',
      approvedBy: ids.users[0]._id,
      isPermanent: true,
      startDate: new Date('2025-01-01'),
    },
  ]);

  ids.subscriptionExemptions = exemptions;
  console.log(`✓ Created ${exemptions.length} subscription exemptions\n`);
}

async function seedSubscriptionHistories() {
  console.log('📜 Seeding subscription histories...');

  const histories = await SubscriptionHistory.create([
    {
      userId: ids.users[1]._id,
      subscriptionPlanId: ids.subscriptionPlans[0]._id,
      subscriptionDurationId: ids.subscriptionDurations[0]._id,
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-08'),
      status: 'EXPIRED',
      changedAt: new Date('2025-12-08'),
    },
    {
      userId: ids.users[1]._id,
      subscriptionPlanId: ids.subscriptionPlans[2]._id,
      subscriptionDurationId: ids.subscriptionDurations[1]._id,
      startDate: new Date('2025-12-09'),
      endDate: new Date('2026-01-09'),
      status: 'ACTIVE',
      changedAt: new Date('2025-12-09'),
    },
  ]);

  ids.subscriptionHistories = histories;
  console.log(`✓ Created ${histories.length} subscription histories\n`);
}

async function seedSubscriptionInvoices() {
  console.log('🧾 Seeding subscription invoices...');

  const invoices = await SubscriptionInvoice.create([
    {
      userId: ids.users[1]._id,
      userSubscriptionId: ids.userSubscriptions[0]._id,
      invoiceNumber: 'INV-2026-001',
      amount: 99.99,
      status: 'PAID',
      dueDate: new Date('2026-01-15'),
    },
    {
      userId: ids.users[2]._id,
      userSubscriptionId: ids.userSubscriptions[1]._id,
      invoiceNumber: 'INV-2026-002',
      amount: 49.99,
      status: 'PAID',
      dueDate: new Date('2026-02-15'),
    },
    {
      userId: ids.users[1]._id,
      userSubscriptionId: ids.userSubscriptions[0]._id,
      invoiceNumber: 'INV-2026-003',
      amount: 99.99,
      status: 'PENDING',
      dueDate: new Date('2026-02-15'),
    },
  ]);

  ids.subscriptionInvoices = invoices;
  console.log(`✓ Created ${invoices.length} subscription invoices\n`);
}

async function seedSubscriptionPayments() {
  console.log('💳 Seeding subscription payments...');

  const payments = await SubscriptionPayment.create([
    {
      subscriptionInvoiceId: ids.subscriptionInvoices[0]._id,
      transactionId: 'txn_' + Math.random().toString(36).substr(2, 16),
      paidAmount: 99.99,
      paymentStatus: 'SUCCESS',
      paidAt: new Date('2026-01-10'),
      paymentMethod: 'STRIPE',
    },
    {
      subscriptionInvoiceId: ids.subscriptionInvoices[1]._id,
      transactionId: 'txn_' + Math.random().toString(36).substr(2, 16),
      paidAmount: 49.99,
      paymentStatus: 'SUCCESS',
      paidAt: new Date('2026-02-01'),
      paymentMethod: 'CARD',
    },
  ]);

  ids.subscriptionPayments = payments;
  console.log(`✓ Created ${payments.length} subscription payments\n`);
}

async function seedSubscriptionStatusLogs() {
  console.log('📊 Seeding subscription status logs...');

  const statusLogs = await SubscriptionStatusLog.create([
    {
      userSubscriptionId: ids.userSubscriptions[0]._id,
      oldStatus: 'TRIAL',
      newStatus: 'ACTIVE',
      changedBy: ids.users[1]._id,
      changedAt: new Date('2025-12-09'),
    },
    {
      userSubscriptionId: ids.userSubscriptions[1]._id,
      oldStatus: 'TRIAL',
      newStatus: 'ACTIVE',
      changedBy: ids.users[2]._id,
      changedAt: new Date('2026-02-01'),
    },
  ]);

  ids.subscriptionStatusLogs = statusLogs;
  console.log(`✓ Created ${statusLogs.length} subscription status logs\n`);
}

async function seedSubscriptionUsageLogs() {
  console.log('📈 Seeding subscription usage logs...');

  const usageLogs = await SubscriptionUsageLog.create([
    {
      userSubscriptionId: ids.userSubscriptions[0]._id,
      subscriptionFeatureId: ids.subscriptionFeatures[0]._id,
      usageCount: 45,
      lastUsedAt: new Date('2026-02-06'),
    },
    {
      userSubscriptionId: ids.userSubscriptions[0]._id,
      subscriptionFeatureId: ids.subscriptionFeatures[1]._id,
      usageCount: 32,
      lastUsedAt: new Date('2026-02-05'),
    },
    {
      userSubscriptionId: ids.userSubscriptions[1]._id,
      subscriptionFeatureId: ids.subscriptionFeatures[0]._id,
      usageCount: 12,
      lastUsedAt: new Date('2026-02-06'),
    },
  ]);

  ids.subscriptionUsageLogs = usageLogs;
  console.log(`✓ Created ${usageLogs.length} subscription usage logs\n`);
}

async function seedSubscriptionChangeRequests() {
  console.log('🔄 Seeding subscription change requests...');

  const changeRequests = await SubscriptionChangeRequest.create([
    {
      userId: ids.users[2]._id,
      userSubscriptionId: ids.userSubscriptions[1]._id,
      subscriptionPlanId: ids.subscriptionPlans[2]._id,
      subscriptionDurationId: ids.subscriptionDurations[1]._id,
      requestType: 'UPGRADE',
      status: 'PENDING',
      requestedAt: new Date('2026-02-05'),
    },
    {
      userId: ids.users[1]._id,
      userSubscriptionId: ids.userSubscriptions[0]._id,
      subscriptionPlanId: ids.subscriptionPlans[3]._id,
      subscriptionDurationId: ids.subscriptionDurations[4]._id,
      requestType: 'UPGRADE',
      status: 'APPROVED',
      requestedAt: new Date('2026-01-20'),
      processedAt: new Date('2026-01-21'),
    },
  ]);

  ids.subscriptionChangeRequests = changeRequests;
  console.log(`✓ Created ${changeRequests.length} subscription change requests\n`);
}

async function seedSubscriptionRefunds() {
  console.log('💸 Seeding subscription refunds...');

  const refunds = await SubscriptionRefund.create([
    {
      userId: ids.users[2]._id,
      userSubscriptionId: ids.userSubscriptions[1]._id,
      subscriptionInvoiceId: ids.subscriptionInvoices[1]._id,
      subscriptionPaymentId: ids.subscriptionPayments[1]._id,
      refundType: 'FULL',
      refundReason: 'Customer requested cancellation within refund window',
      paidAmount: 49.99,
      usedDays: 3,
      totalDays: 30,
      calculatedRefundAmount: 49.99,
      approvedRefundAmount: 49.99,
      refundMethod: 'ORIGINAL_METHOD',
      requestedBy: ids.users[2]._id,
      approvedBy: ids.users[0]._id,
      requestedAt: new Date('2026-02-04'),
      approvedAt: new Date('2026-02-04'),
      refundedAt: new Date('2026-02-05'),
      adminNote: 'Valid refund request processed successfully',
    },
  ]);

  ids.subscriptionRefunds = refunds;
  console.log(`✓ Created ${refunds.length} subscription refunds\n`);
}

// ==================== VEHICLE & TRANSPORT ====================

async function seedDrivers() {
  console.log('🚗 Seeding drivers...');

  const drivers = await Driver.create([
    {
      fullName: 'James Wilson',
      licenseNumber: 'WILSO123456JW7HG',
      postCode: 'M1 1AA',
      niNumber: 'AB123456C',
      licenseExpiry: new Date('2028-06-15'),
      licenseExpiryDTC: new Date('2027-12-31'),
      cpcExpiry: new Date('2029-03-20'),
      points: 0,
      endorsementCodes: [],
      lastChecked: new Date('2026-01-15'),
      checkFrequencyDays: 90,
      nextCheckDueDate: new Date('2026-04-15'),
      employed: true,
      checkStatus: 'Okay',
      attachments: [ids.documents[0]._id],
      employedBy: ids.users[1]._id,
      createdBy: ids.users[1]._id,
    },
    {
      fullName: 'Sarah Johnson',
      licenseNumber: 'JOHNSO789012SJ3CD',
      postCode: 'L2 3BB',
      niNumber: 'CD789012D',
      licenseExpiry: new Date('2027-09-20'),
      licenseExpiryDTC: new Date('2027-06-15'),
      cpcExpiry: new Date('2028-11-10'),
      points: 3,
      endorsementCodes: ['SP30'],
      lastChecked: new Date('2026-02-01'),
      checkFrequencyDays: 60,
      nextCheckDueDate: new Date('2026-04-02'),
      employed: true,
      checkStatus: 'Okay',
      employedBy: ids.users[1]._id,
      createdBy: ids.users[1]._id,
    },
    {
      fullName: 'Robert Brown',
      licenseNumber: 'BROWN456789RB5EF',
      postCode: 'B3 2CC',
      niNumber: 'EF345678E',
      licenseExpiry: new Date('2026-03-10'),
      licenseExpiryDTC: new Date('2026-12-31'),
      cpcExpiry: new Date('2027-08-15'),
      points: 0,
      endorsementCodes: [],
      lastChecked: new Date('2025-12-20'),
      checkFrequencyDays: 90,
      nextCheckDueDate: new Date('2026-03-20'),
      employed: false,
      checkStatus: 'Due',
      employedBy: ids.users[2]._id,
      createdBy: ids.users[2]._id,
    },
  ]);

  ids.drivers = drivers;
  console.log(`✓ Created ${drivers.length} drivers\n`);
}

async function seedVehicles() {
  console.log('🚛 Seeding vehicles...');

  const vehicles = await Vehicle.create([
    {
      vehicleRegId: 'ABC123',
      vehicleType: 'HGV Class 1',
      licensePlate: 'AB12 CDE',
      status: 'ACTIVE',
      additionalDetails: {
        lastServiceDate: new Date('2025-12-15'),
        nextServiceDate: new Date('2026-06-15'),
        grossPlatedWeight: 44000,
        ownerShipStatus: 'Company/Business_Ownership',
        diskNumber: new Date('2025-01-01'),
        chassisNumber: 'VF1AB12CD34567890',
        keysAvailable: 2,
        v5InName: true,
        plantingCertificate: true,
        vedExpiry: new Date('2026-12-31'),
        insuranceExpiry: new Date('2026-08-15'),
        serviceDueDate: new Date('2026-06-15'),
      },
      driverPack: true,
      notes: 'Regular maintenance schedule. Good condition.',
      driverId: ids.drivers[0]._id,
      clientId: ids.users[1]._id,
      attachments: [ids.documents[1]._id],
      createdBy: ids.users[1]._id,
    },
    {
      vehicleRegId: 'XYZ789',
      vehicleType: 'Van',
      licensePlate: 'XY78 ZAB',
      status: 'ACTIVE',
      additionalDetails: {
        lastServiceDate: new Date('2026-01-10'),
        nextServiceDate: new Date('2026-07-10'),
        grossPlatedWeight: 3500,
        ownerShipStatus: 'Leased/Financed',
        diskNumber: new Date('2025-06-01'),
        chassisNumber: 'WF2XY78ZA98765432',
        keysAvailable: 1,
        v5InName: false,
        plantingCertificate: false,
        vedExpiry: new Date('2026-05-31'),
        insuranceExpiry: new Date('2026-11-30'),
        serviceDueDate: new Date('2026-07-10'),
      },
      driverPack: false,
      notes: 'Leased vehicle - check lease terms before modifications',
      driverId: ids.drivers[1]._id,
      clientId: ids.users[1]._id,
      createdBy: ids.users[1]._id,
    },
    {
      vehicleRegId: 'DEF456',
      vehicleType: 'HGV Class 2',
      licensePlate: 'DE45 FGH',
      status: 'INACTIVE',
      additionalDetails: {
        lastServiceDate: new Date('2025-09-20'),
        grossPlatedWeight: 18000,
        ownerShipStatus: 'Individual_Ownership',
        diskNumber: new Date('2025-03-01'),
        dateLeft: new Date('2026-01-31'),
        chassisNumber: 'YF3DE45FG12345678',
        keysAvailable: 2,
        v5InName: true,
        plantingCertificate: true,
        vedExpiry: new Date('2026-02-28'),
        insuranceExpiry: new Date('2026-02-28'),
      },
      driverPack: true,
      notes: 'Vehicle retired from active service',
      driverId: ids.drivers[2]._id,
      clientId: ids.users[2]._id,
      createdBy: ids.users[2]._id,
    },
  ]);

  ids.vehicles = vehicles;
  console.log(`✓ Created ${vehicles.length} vehicles\n`);
}

async function seedDriverTachographs() {
  console.log('📟 Seeding driver tachographs...');

  const tachographs = await DriverTachograph.create([
    {
      driverId: ids.drivers[0]._id,
      vehicleId: ids.vehicles[0]._id,
      typeOfInfringement: 'Daily rest period',
      details: 'Reduced daily rest period by 15 minutes',
      actionTaken: 'Driver counseled on importance of proper rest',
      reviewedBy: ids.users[1]._id,
      Signed: true,
    },
    {
      driverId: ids.drivers[1]._id,
      vehicleId: ids.vehicles[1]._id,
      typeOfInfringement: 'Driving time',
      details: 'Exceeded continuous driving time by 10 minutes',
      actionTaken: 'Written warning issued, additional training scheduled',
      reviewedBy: ids.users[1]._id,
      Signed: true,
    },
    {
      driverId: ids.drivers[0]._id,
      vehicleId: ids.vehicles[0]._id,
      typeOfInfringement: 'None',
      details: 'All compliance requirements met',
      actionTaken: 'No action required',
      reviewedBy: ids.users[1]._id,
      Signed: false,
    },
  ]);

  ids.driverTachographs = tachographs;
  console.log(`✓ Created ${tachographs.length} driver tachographs\n`);
}

async function seedFuelUsages() {
  console.log('⛽ Seeding fuel usages...');

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
  console.log('🤝 Seeding subcontractors...');

  const subContractors = await SubContractor.create([
    {
      createdBy: ids.users[1]._id,
      insurancePolicyNumber: 'INS-2026-ABC123',
      insuranceExpiryDate: new Date('2026-12-31'),
      gitPolicyNumber: new Date('2026-06-30'),
      gitExpiryDate: new Date('2026-06-30'),
      gitCover: 50000,
      hiabAvailable: true,
      otherCapabilities: 'Refrigerated transport, Hazardous materials certified',
      startDateOfAgreement: new Date('2025-01-01'),
      rating: 0.9,
      checkedBy: ids.users[0]._id,
    },
    {
      createdBy: ids.users[1]._id,
      insurancePolicyNumber: 'INS-2026-XYZ789',
      insuranceExpiryDate: new Date('2026-09-30'),
      gitPolicyNumber: new Date('2026-09-30'),
      gitExpiryDate: new Date('2026-09-30'),
      gitCover: 30000,
      hiabAvailable: false,
      otherCapabilities: 'Long distance specialist',
      startDateOfAgreement: new Date('2025-06-15'),
      rating: 0.85,
      checkedBy: ids.users[0]._id,
    },
  ]);

  ids.subContractors = subContractors;
  console.log(`✓ Created ${subContractors.length} subcontractors\n`);
}

// ==================== COMPLIANCE, ENFORCEMENT & DVSA ====================

async function seedSpotChecks() {
  console.log('🔍 Seeding spot checks...');

  const spotChecks = await SpotCheck.create([
    {
      vehicleId: ids.vehicles[0]._id,
      issueDetails: 'Headlight alignment slightly off',
      reportedBy: ids.users[1]._id,
      rectificationRequired: new Date('2026-02-15'),
      actionTaken: 'Scheduled for workshop adjustment',
      dateCompleted: new Date('2026-02-10'),
      completedBy: 'Service Center A',
      followUpNeeded: 'Re-check after 1 month',
      notes: 'Minor issue, addressed promptly',
      attachments: [ids.documents[2]._id],
    },
    {
      vehicleId: ids.vehicles[1]._id,
      issueDetails: 'Tire tread depth below optimal level',
      reportedBy: ids.users[1]._id,
      rectificationRequired: new Date('2026-02-20'),
      actionTaken: 'New tires ordered',
      notes: 'Priority order placed',
    },
    {
      vehicleId: ids.vehicles[0]._id,
      issueDetails: 'All checks passed',
      reportedBy: ids.users[1]._id,
      actionTaken: 'No action required',
      dateCompleted: new Date('2026-02-05'),
      completedBy: 'James Wilson',
      notes: 'Vehicle in excellent condition',
    },
  ]);

  ids.spotChecks = spotChecks;
  console.log(`✓ Created ${spotChecks.length} spot checks\n`);
}

async function seedPg9AndPg13Plans() {
  console.log('📋 Seeding PG9 and PG13 plans...');

  const plans = await pg9AndPg13Plan.create([
    {
      vehicleId: ids.vehicles[0]._id,
      issueType: 'PG9',
      defectDescription: 'Brake pad wear indicator warning',
      clearanceStatus: 'CLEARED',
      tcContactMade: true,
      maintenanceProvider: 'ABC Motors Ltd',
      meetingDate: new Date('2026-01-20'),
      notes: 'Issue resolved, vehicle cleared for service',
      followUp: false,
      createdBy: ids.users[1]._id,
    },
    {
      vehicleId: ids.vehicles[1]._id,
      issueType: 'DV79D',
      defectDescription: 'Emission system fault detected',
      clearanceStatus: 'PENDING',
      tcContactMade: true,
      maintenanceProvider: 'XYZ Service Center',
      meetingDate: new Date('2026-02-15'),
      notes: 'Awaiting parts delivery',
      followUp: true,
      createdBy: ids.users[1]._id,
    },
  ]);

  ids.pg9AndPg13Plans = plans;
  console.log(`✓ Created ${plans.length} PG9/PG13 plans\n`);
}

async function seedOrsPlans() {
  console.log('📊 Seeding ORS plans...');

  const orsPlans = await OrsPlan.create([
    {
      roadWorthinessScore: 'GREEN',
      overallTrafficScore: 'AMBER',
      actionRequired: 'Continue current maintenance schedule, review driver training',
      documents: [
        {
          textDoc: [
            {
              label: 'Compliance Report Q4 2025',
              description: 'Quarterly compliance assessment',
            },
          ],
          attachments: [ids.documents[2]._id],
        },
      ],
    },
    {
      roadWorthinessScore: 'AMBER',
      overallTrafficScore: 'GREEN',
      actionRequired: 'Increase vehicle inspection frequency',
      documents: [
        {
          textDoc: [
            {
              label: 'Maintenance Schedule 2026',
              description: 'Updated maintenance plan',
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
  console.log('📞 Seeding traffic commissioner communications...');

  const communications = await TrafficCommissionerCommunication.create([
    {
      type: 'Email',
      contactedPerson: 'Commissioner Sarah Williams',
      reason: 'Annual compliance review submission',
      communicationDate: new Date('2026-01-15'),
      attachments: [ids.documents[2]._id],
      notes: new Date('2026-01-20'),
      createdBy: ids.users[1]._id,
    },
    {
      type: 'Phone Call',
      contactedPerson: 'Deputy Commissioner John Thompson',
      reason: 'Query regarding new regulatory requirements',
      communicationDate: new Date('2026-02-03'),
      notes: new Date('2026-02-03'),
      createdBy: ids.users[1]._id,
    },
    {
      type: 'Letter',
      contactedPerson: 'Office of the Traffic Commissioner',
      reason: 'Notification of fleet expansion',
      communicationDate: new Date('2026-01-10'),
      createdBy: ids.users[1]._id,
    },
  ]);

  ids.trafficCommissionerCommunications = communications;
  console.log(`✓ Created ${communications.length} traffic commissioner communications\n`);
}

async function seedRenewalTrackers() {
  console.log('🔄 Seeding renewal trackers...');

  const renewals = await RenewalTracker.create([
    {
      type: 'Insurance',
      item: 'Fleet Insurance Policy',
      description: 'Comprehensive fleet insurance coverage',
      refOrPolicyNo: 'POL-2026-FLEET-001',
      providerOrIssuer: 'ABC Insurance Ltd',
      startDate: new Date('2026-01-01'),
      expiryOrDueDate: new Date('2026-12-31'),
      reminderSet: true,
      reminderDate: new Date('2026-11-01'),
      status: true,
      notes: 'Premium: £12,500/year',
      createdBy: ids.users[1]._id,
    },
    {
      type: 'License',
      item: 'Operator License',
      description: 'Standard National Operator License',
      refOrPolicyNo: 'OL-123456',
      providerOrIssuer: 'Traffic Commissioner',
      startDate: new Date('2021-03-15'),
      expiryOrDueDate: new Date('2026-03-14'),
      reminderSet: true,
      reminderDate: new Date('2025-12-15'),
      status: true,
      notes: 'Renewal application submitted',
      createdBy: ids.users[1]._id,
    },
    {
      type: 'Certification',
      item: 'ISO 9001 Certification',
      description: 'Quality management system certification',
      refOrPolicyNo: 'ISO-9001-2025',
      providerOrIssuer: 'BSI Group',
      startDate: new Date('2025-06-01'),
      expiryOrDueDate: new Date('2026-05-31'),
      reminderSet: true,
      reminderDate: new Date('2026-03-01'),
      status: false,
      notes: 'Audit scheduled for April 2026',
      createdBy: ids.users[0]._id,
    },
  ]);

  ids.renewalTrackers = renewals;
  console.log(`✓ Created ${renewals.length} renewal trackers\n`);
}

async function seedAuditsAndRectificationReports() {
  console.log('📑 Seeding audits and rectification reports...');

  const reports = await AuditsAndRectificationReports.create([
    {
      title: 'Q4 2025 Internal Compliance Audit',
      type: 'Internal Audit',
      responsiblePerson: 'John Transport Manager',
      attachments: [ids.documents[2]._id],
      createdBy: ids.users[1]._id,
    },
    {
      title: 'DVSA Roadside Inspection Report',
      type: 'External Inspection',
      responsiblePerson: 'DVSA Inspector',
      attachments: [],
      createdBy: ids.users[1]._id,
    },
    {
      title: 'Vehicle Maintenance Audit January 2026',
      type: 'Maintenance Audit',
      responsiblePerson: 'Mike Staff Member',
      createdBy: ids.users[0]._id,
    },
  ]);

  ids.auditsAndRectificationReports = reports;
  console.log(`✓ Created ${reports.length} audits and rectification reports\n`);
}

async function seedWheelRetorquePolicyMonitorings() {
  console.log('🔧 Seeding wheel retorque policy monitorings...');

  const retorques = await WheelRetorquePolicyMonitoring.create([
    {
      vehicleId: ids.vehicles[0]._id,
      dateChanged: new Date('2026-01-15'),
      tyreSize: '315/80R22.5',
      tyreLocation: 'Front Axle - Left',
      reTorqueDue: new Date('2026-01-29'),
      reTorqueCompleted: new Date('2026-01-28'),
      Technician: 'David Smith',
      createdBy: ids.users[1]._id,
    },
    {
      vehicleId: ids.vehicles[0]._id,
      dateChanged: new Date('2026-01-15'),
      tyreSize: '315/80R22.5',
      tyreLocation: 'Front Axle - Right',
      reTorqueDue: new Date('2026-01-29'),
      reTorqueCompleted: new Date('2026-01-28'),
      Technician: 'David Smith',
      createdBy: ids.users[1]._id,
    },
    {
      vehicleId: ids.vehicles[1]._id,
      dateChanged: new Date('2026-02-01'),
      tyreSize: '195/75R16',
      tyreLocation: 'Rear Axle - Left',
      reTorqueDue: new Date('2026-02-15'),
      Technician: 'TBD',
      createdBy: ids.users[1]._id,
    },
  ]);

  ids.wheelRetorquePolicyMonitorings = retorques;
  console.log(`✓ Created ${retorques.length} wheel retorque monitorings\n`);
}

async function seedComplianceTimeTables() {
  console.log('📅 Seeding compliance timetables...');

  const timeTables = await ComplianceTimeTable.create([
    {
      task: 'Monthly vehicle inspection reports submission',
      responsibleParty: 'John Transport Manager',
      dueDate: new Date('2026-03-01'),
      status: 'PENDING',
      createdBy: ids.users[1]._id,
    },
    {
      task: 'Driver CPC training renewal - James Wilson',
      responsibleParty: 'John Transport Manager',
      dueDate: new Date('2029-03-20'),
      status: 'PENDING',
      createdBy: ids.users[1]._id,
    },
    {
      task: 'Annual operator license review',
      responsibleParty: 'Super Admin User',
      dueDate: new Date('2026-03-14'),
      status: 'IN_PROGRESS',
      createdBy: ids.users[0]._id,
    },
    {
      task: 'Q1 2026 compliance audit',
      responsibleParty: 'Mike Staff Member',
      dueDate: new Date('2026-03-31'),
      status: 'PENDING',
      createdBy: ids.users[0]._id,
    },
  ]);

  ids.complianceTimeTables = timeTables;
  console.log(`✓ Created ${timeTables.length} compliance timetables\n`);
}

// Export for use in other scripts
export default seedDatabase;
