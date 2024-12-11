import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "../config/db";
import { speakers } from "../schema/schema";
import type { LoginSchema, SpeakerCreateSchema } from "../schema/zodSchemas";
import { hashPassword } from "../utils/hashPassUtils";
import { JwtTokenUtils } from "../utils/jwttokenUtils";
import {
  generateOTP,
  sendVerificationEmail,
  storeOTP,
  verifyOTP,
} from "../utils/otpGenerator";

type SpeakerProfile = z.infer<typeof SpeakerCreateSchema>;
type SpeakerLogin = z.infer<typeof LoginSchema>;

const jwtUtils = new JwtTokenUtils();

export const createSpeakerProfile = async (profileData: SpeakerProfile) => {
  try {
    const hashedPassword = await hashPassword(profileData.password);
    const [speaker] = await db
      .insert(speakers)
      .values({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        password: hashedPassword,
        pricePerSession: profileData.pricePerSession,
        bio: profileData.bio,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!speaker) throw new Error("Failed to create speaker profile");
    const token = jwtUtils.generateToken({
      userId: speaker.id,
      role: "speaker",
    });
    return {
      speaker: {
        id: speaker.id,
        email: speaker.email,
        firstName: speaker.firstName,
        lastName: speaker.lastName,
        isVerified: speaker.isVerified,
      },
      token,
    };
  } catch (error: unknown) {
    throw new Error(
      `Error creating speaker profile: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const loginSpeaker = async ({ email, password }: SpeakerLogin) => {
  const speaker = await getSpeakerByEmail(email);

  if (!speaker) {
    throw new Error("Speaker not found");
  }

  const isValidPassword = await bcrypt.compare(password, speaker.password);
  if (!isValidPassword) {
    throw new Error("Invalid password");
  }

  const token = jwtUtils.generateToken({
    userId: speaker.id,
    role: "speaker",
  });

  return {
    speaker: {
      id: speaker.id,
      email: speaker.email,
      firstName: speaker.firstName,
      lastName: speaker.lastName,
      isVerified: speaker.isVerified,
    },
    token,
  };
};

export const getSpeakerById = async (userId: string) => {
  try {
    const [speaker] = await db
      .select()
      .from(speakers)
      .where(eq(speakers.id, userId));

    if (!speaker) throw new Error("Speaker profile not found");
    return speaker;
  } catch (error: unknown) {
    throw new Error(
      `Error fetching speaker profile: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const getSpeakerByEmail = async (email: string) => {
  try {
    const [speaker] = await db
      .select()
      .from(speakers)
      .where(eq(speakers.email, email));

    if (!speaker) throw new Error("Speaker profile not found");
    return speaker;
  } catch (error: unknown) {
    throw new Error(
      `Error fetching speaker profile: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const updateSpeakerProfile = async (
  userId: string,
  profileData: SpeakerProfile,
) => {
  try {
    const [updated] = await db
      .update(speakers)
      .set({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        pricePerSession: profileData.pricePerSession,
        bio: profileData.bio,
        updatedAt: new Date(),
      })
      .where(eq(speakers.id, userId))
      .returning();

    if (!updated) throw new Error("Speaker profile not found");
    return updated;
  } catch (error: unknown) {
    throw new Error(
      `Error updating speaker profile: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const getAllSpeakers = async () => {
  try {
    const allSpeakers = await db.select().from(speakers);
    return allSpeakers;
  } catch (error: unknown) {
    throw new Error(
      `Error fetching speakers: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const deleteSpeakerProfile = async (userId: string) => {
  try {
    const [deleted] = await db
      .delete(speakers)
      .where(eq(speakers.id, userId))
      .returning();

    if (!deleted) throw new Error("Speaker profile not found");
    return deleted;
  } catch (error: unknown) {
    throw new Error(
      `Error deleting speaker profile: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const sendOTP = async (userId: string) => {
  try {
    const user = await getSpeakerById(userId);
    const otp = generateOTP();
    await storeOTP(userId, otp);
    await sendVerificationEmail(user.email, otp);
  } catch (error: unknown) {
    throw new Error(
      `Error sending OTP: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const verifySpeaker = async (userId: string) => {
  try {
    const [updated] = await db
      .update(speakers)
      .set({
        isVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(speakers.id, userId))
      .returning();
    if (!updated) throw new Error("Speaker not found");
    return updated;
  } catch (error: unknown) {
    throw new Error(
      `Error verifying speaker: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const verify = async (userId: string, otp: string) => {
  try {
    await verifyOTP(userId, otp);
    return await verifySpeaker(userId);
  } catch (error: unknown) {
    throw new Error(
      `Error verifying OTP: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
