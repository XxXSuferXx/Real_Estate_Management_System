import "dotenv/config"
import { User } from "../Modals/userSchema.js";
import bcrypt from "bcryptjs";
import { UserRole } from "../common/constants/roles.js";
import { connectDB } from "../config/db.js";

export const seedAdmin = async() => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const username = process.env.ADMIN_USERNAME as string;

    if(!email || !password) {
        console.log("admin email or password not found");
        return;
    }

    const adminExist = await User.findOne({ email });

    if(adminExist) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
        username,
        email,
        password: hashedPassword,
        role: UserRole.ADMIN
    })

    console.log(`Admin account created: ${email}`);
}

if (process.argv.includes("--seed")) {
  connectDB()
    .then(seedAdmin)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Failed to seed admin:", error);
      process.exit(1);
    });
}