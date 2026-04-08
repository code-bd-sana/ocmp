import bcrypt from 'bcryptjs';
import UserModel, { IUser, UserRole } from '../models/users-accounts/user.schema';

export async function seedSuperAdmin() {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;
    const fullName = process.env.SUPER_ADMIN_FULLNAME || 'Super Admin';

    if (!email || !password) {
      console.warn('Super admin seed skipped: missing env values');
      return;
    }

    const existingAdmin = await UserModel.findOne({
      email: email.toLowerCase(),
      role: UserRole.SUPER_ADMIN,
    });

    if (existingAdmin) {
      console.log('Super admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true,
      isActive: true,
    });

    console.log('Super admin seeded successfully');
  } catch (error) {
    console.error('Super admin seed failed:', error);
  }
}

