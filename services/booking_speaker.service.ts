import { eq } from "drizzle-orm";
import type z from "zod";
import { db } from "../config/db";
import { bookingSpeakers, bookings } from "../schema/schema";
import type { SpeakerBookingSchema } from "../schema/zodSchemas";
import { checkStartTime } from "./booking.service";

type SpeakerBookingSchemaType = z.infer<typeof SpeakerBookingSchema>;

export const speakerBooking = async (bookingData: SpeakerBookingSchemaType) => {
  if (await checkStartTime(new Date(bookingData.sessionStartTime))) {
    throw new Error("Slot start time is already taken");
  }
  try {
    const booking = await db
      .insert(bookings)
      .values({
        sessionStartTime: new Date(bookingData.sessionStartTime),
        sessionEndTime: new Date(bookingData.sessionEndTime),
        createdAt: new Date(),
      })
      .returning({
        id: bookings.id,
        sessionStartTime: bookings.sessionStartTime,
        sessionEndTime: bookings.sessionEndTime,
      });
    const speaker_bookings = await db
      .insert(bookingSpeakers)
      .values({
        bookingId: booking[0].id,
        speakerId: bookingData.speakerId,
      })
      .returning({
        bookingId: bookingSpeakers.bookingId,
        speakerId: bookingSpeakers.speakerId,
      });

    return {
      message: "Booking created successfully",
      speakerBooking: speaker_bookings,
      booking,
    };
  } catch (error: unknown) {
    throw new Error(
      `Error creating booking: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const deleteSpeakerBooking = async (
  bookingId: string,
  speakerId: string,
) => {
  try {
    await db
      .delete(bookingSpeakers)
      .where(eq(bookingSpeakers.bookingId, speakerId));

    await db.delete(bookings).where(eq(bookings.id, bookingId));
  } catch (error: unknown) {
    throw new Error(
      `Error deleting booking: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const getSpeakerBookings = async (speakerId: string) => {
  try {
    const speakerBookings = await db
      .select()
      .from(bookingSpeakers)
      .where(eq(bookingSpeakers.speakerId, speakerId));
    return speakerBookings;
  } catch (error: unknown) {
    throw new Error(
      `Error fetching bookings: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
