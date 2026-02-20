import mongoose from 'mongoose';
import config from '../../config/config';
import seedDatabase from './seed-database';

async function main() {
  try {
    console.log('🚀 Connecting to database...\n');

    // Connect to MongoDB
    await mongoose.connect(config.DB_CONNECTION_URI);
    console.log('✅ Connected to MongoDB\n');

    // Run seeding
    await seedDatabase();

    console.log('✨ Seeding process completed!\n');
  } catch (error) {
    console.error('💥 Error during seeding:', error);
    process.exit(1);
  } finally {
    // Disconnect from database
    await mongoose.disconnect();
    console.log('👋 Disconnected from database');
    process.exit(0);
  }
}

// Run the script
main();
