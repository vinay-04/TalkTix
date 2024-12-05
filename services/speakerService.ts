import { db } from "../config/db";
import { speakers } from "../schema/schema";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import type { SpeakerProfileSchema } from "../schema/zodSchemas";

type SpeakerProfile = z.infer<typeof SpeakerProfileSchema>;

export const createSpeakerProfile = async (
  userId: string,
  profileData: SpeakerProfile,
) => {
  try {
    const [speaker] = await db
      .insert(speakers)
      .values({
        userId,
        ...{
          ...profileData,
          pricePerSession: profileData.pricePerSession.toString(),
        },
        createdAt: new Date(),
      })
      .returning();

    if (!speaker) throw new Error("Failed to create speaker profile");
    return speaker;
  } catch (error: unknown) {
    throw new Error(
      `Error creating speaker profile: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const getSpeakerProfile = async (userId: string) => {
  try {
    const [speaker] = await db
      .select()
      .from(speakers)
      .where(eq(speakers.userId, userId));

    if (!speaker) throw new Error("Speaker profile not found");
    return speaker;
  } catch (error: unknown) {
    throw new Error(
      `Error fetching speaker profile: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const getSpeakerById = async (speakerId: string) => {
  try {
    const [speaker] = await db
      .select()
      .from(speakers)
      .where(eq(speakers.id, speakerId));

    if (!speaker) throw new Error("Speaker not found");
    return speaker;
  } catch (error: unknown) {
    throw new Error(
      `Error fetching speaker: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const updateSpeakerProfile = async (
  userId: string,
  profileData: Partial<SpeakerProfile>,
) => {
  try {
    const [updated] = await db
      .update(speakers)
      .set({
        ...profileData,
        pricePerSession: profileData.pricePerSession?.toString(),
      })
      .where(eq(speakers.userId, userId))
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
      .where(eq(speakers.userId, userId))
      .returning();

    if (!deleted) throw new Error("Speaker profile not found");
    return deleted;
  } catch (error: unknown) {
    throw new Error(
      `Error deleting speaker profile: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
