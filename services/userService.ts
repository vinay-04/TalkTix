import { db } from "../config/db";
import { users } from "../schema/schema";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import type { UserSignupSchema, UserLoginSchema } from "../schema/zodSchemas";
import { hashPassword } from "../utils/hashPassUtils";

type UserSignup = z.infer<typeof UserSignupSchema>;
type UserLogin = z.infer<typeof UserLoginSchema>;

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

    return user;
  } catch (error: unknown) {
    throw new Error(
      `Error creating user: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const loginUser = async ({ email, password }: UserLogin) => {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = (await hashPassword(password)) === user.password;
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      isVerified: user.isVerified,
    };
  } catch (error: unknown) {
    throw new Error(
      `Login failed: ${error instanceof Error ? error.message : "Unknown error"}`,
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
