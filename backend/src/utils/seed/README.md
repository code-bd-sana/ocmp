# Database Seeding Utility

This utility seeds your MongoDB database with comprehensive test data for all 34 schemas in the Tim Tim application.

## Schemas Covered (34 total)

### Users & Accounts (5)

- User
- RepositorySettings
- Notification
- LoginActivity
- ActivityLog

### Subscription & Billing (15)

- SubscriptionPlan
- SubscriptionDuration
- SubscriptionPricing
- SubscriptionFeature
- UserSubscription
- SubscriptionCustomization
- SubscriptionTrial
- SubscriptionExemption
- SubscriptionHistory
- SubscriptionInvoice
- SubscriptionPayment
- SubscriptionStatusLog
- SubscriptionUsageLog
- SubscriptionChangeRequest
- SubscriptionRefund

### Vehicle & Transport (5)

- Vehicle
- Driver
- DriverTachograph
- FuelUsage
- SubContractor

### Compliance, Enforcement & DVSA (8)

- SpotCheck
- pg9AndPg13Plan
- OrsPlan
- TrafficCommissionerCommunication
- RenewalTracker
- AuditsAndRectificationReports
- WheelRetorquePolicyMonitoring
- ComplianceTimeTable

### Documents (1)

- Document

## Usage

### Development Environment

```bash
npm run seed
```

### Production Environment

```bash
npm run seed:prod
```

## What Gets Seeded

The seeding script creates realistic test data including:

### Users (4)

- Super Admin (superadmin@timtim.com)
- Transport Manager (john.manager@timtim.com)
- Standalone User (jane.user@timtim.com)
- Staff Member (mike.staff@timtim.com)

**Password for all users**: `Password123!`

### Subscription Plans (5)

- Free Trial
- Basic Monthly
- Professional Monthly
- Enterprise Annual
- Custom Plan

### Subscription Durations (5)

- Trial (7 days)
- Monthly (30 days)
- Quarterly (90 days)
- Semi-Annual (180 days)
- Annual (365 days)

### Vehicles (3)

- HGV Class 1 (Active)
- Van (Active)
- HGV Class 2 (Inactive)

### Drivers (3)

- James Wilson (Employed, No points)
- Sarah Johnson (Employed, 3 points)
- Robert Brown (Not employed, License expiring soon)

### And much more...

- Documents (3 sample files)
- Notifications (4 types)
- Login Activities (successful and failed)
- Activity Logs (create, update, delete actions)
- Subscription customizations and trials
- Invoice and payment records
- Driver tachograph records
- Fuel usage logs
- Spot checks and compliance reports
- ORS plans and PG9/PG13 plans
- Traffic commissioner communications
- Renewal trackers
- Wheel retorque monitoring
- Compliance timetables

## Important Notes

⚠️ **WARNING**: This script will:

1. **Delete all existing data** in your database
2. Create fresh test data
3. Use the MongoDB URI from your environment variables

### Before Running

1. Ensure your `.env` file has the correct `MONGODB_URI`
2. **Never run this on a production database** unless you want to lose all data
3. Backup your database if you have important data

### After Seeding

You can log in with any of the test users:

- Email: `superadmin@timtim.com`
- Password: `Password123!`

## Data Relationships

The seeding function maintains proper relationships between entities:

- Users own documents, vehicles, and drivers
- Subscriptions link to plans, durations, and pricing
- Vehicles are assigned to drivers and clients
- Compliance records reference vehicles and users
- Invoices connect to subscriptions and payments
- All audit trails properly reference users

## Customization

To modify the seeded data:

1. Open `src/utils/seed/seed-database.ts`
2. Locate the function for the entity you want to modify (e.g., `seedUsers()`)
3. Adjust the data as needed
4. Run the seed script again

## Troubleshooting

### Connection Error

```
Error: Could not connect to MongoDB
```

**Solution**: Check your `MONGODB_URI` in `.env` file

### Schema Validation Error

```
Error: Validation failed
```

**Solution**: Ensure all required fields are provided in the seed data

### Duplicate Key Error

```
Error: E11000 duplicate key error
```

**Solution**: The script already clears the database first. If this occurs, check for unique constraints in your schemas.

## Files

- `seed-database.ts` - Main seeding logic for all schemas
- `run-seed.ts` - Executable script that connects to DB and runs seeding
- `README.md` - This file

## Support

For issues or questions about the seeding utility, contact the development team.
