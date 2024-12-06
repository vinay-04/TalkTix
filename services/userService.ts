import { db } from "../config/db";
import { speakers, users } from "../schema/schema";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import type { UserSignupSchema, UserLoginSchema } from "../schema/zodSchemas";
import { hashPassword } from "../utils/hashPassUtils";
import {
  generateOTP,
  sendVerificationEmail,
  storeOTP,
  verifyOTP,
} from "../utils/otpGenerator";
import bcrypt from "bcrypt";
import { JwtTokenUtils } from "../utils/jwttokenUtils";

type UserSignup = z.infer<typeof UserSignupSchema>;
type UserLogin = z.infer<typeof UserLoginSchema>;

const jwtUtils = new JwtTokenUtils();

export const createUser = async (userData: UserSignup) => {
  try {
    const hashedPassword = await hashPassword(userData.password);
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        userType: users.userType,
        isVerified: users.isVerified,
      });

    if (user.userType === "speaker") {
      await db.insert(speakers).values({
        userId: user.id,
        pricePerSession: "10",
        createdAt: new Date(),
      });
    }

    return user;
  } catch (error: unknown) {
    throw new Error(
      `Error creating user: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const loginUser = async ({ email, password }: UserLogin) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  const token = jwtUtils.generateToken({
    userId: user.id,
    email: user.email,
    role: user.userType,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      isVerified: user.isVerified,
    },
    token,
  };
};

export const getUserById = async (id: string) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));

    if (!user) throw new Error("User not found");
    return user;
  } catch (error: unknown) {
    throw new Error(
      `Error fetching user: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) throw new Error("User not found");
    return user;
  } catch (error: unknown) {
    throw new Error(
      `Error fetching user: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const updateUser = async (
  id: string,
  userData: Partial<Omit<UserSignup, "password">>,
) => {
  try {
    const [updated] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!updated) throw new Error("User not found");
    return updated;
  } catch (error: unknown) {
    throw new Error(
      `Error updating user: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const verifyUser = async (id: string) => {
  try {
    const [updated] = await db
      .update(users)
      .set({
        isVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!updated) throw new Error("User not found");
    return updated;
  } catch (error: unknown) {
    throw new Error(
      `Error verifying user: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const sendOTP = async (userId: string) => {
  try {
    const user = await getUserById(userId);
    const otp = generateOTP();
    await storeOTP(userId, otp);
    await sendVerificationEmail(user.email, otp);
  } catch (error: unknown) {
    throw new Error(
      `Error sending OTP: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const verify = async (userId: string, otp: string) => {
  try {
    await verifyOTP(userId, otp);
    return await verifyUser(userId);
  } catch (error: unknown) {
    throw new Error(
      `Error verifying OTP: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
