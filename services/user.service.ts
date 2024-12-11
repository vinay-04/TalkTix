import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type z from "zod";
import { db } from "../config/db";
import { users } from "../schema/schema";
import type { LoginSchema, UserCreateSchema } from "../schema/zodSchemas";
import { hashPassword } from "../utils/hashPassUtils";
import { JwtTokenUtils } from "../utils/jwttokenUtils";
import {
  generateOTP,
  sendVerificationEmail,
  storeOTP,
  verifyOTP,
} from "../utils/otpGenerator";

type UserSignup = z.infer<typeof UserCreateSchema>;
type UserLogin = z.infer<typeof LoginSchema>;

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
        isVerified: users.isVerified,
      });

    const token = jwtUtils.generateToken({
      userId: user.id,
      role: "user",
    });
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
      },
      token,
    };
  } catch (error: unknown) {
    throw new Error(
      `Error creating user: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const loginUser = async ({ email, password }: UserLogin) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    // throw new Error("Invalid credentials");
  }

  const token = jwtUtils.generateToken({
    userId: user.id,
    role: "user",
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
    },
    token,
  };
};

export const getUsers = async () => {
  try {
    const allUsers = await db.select().from(users);
    return allUsers;
  } catch (error: unknown) {
    throw new Error(
      `Error fetching users: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
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
