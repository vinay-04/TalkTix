import { z } from "zod";

export const UserSignupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Password must include letters, numbers, and special characters",
    ),
  userType: z.enum(["user", "speaker"]),
});

export const UserLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const SpeakerProfileSchema = z.object({
  pricePerSession: z.number().positive("Price must be a positive number"),
  bio: z.string().optional().nullable(),
});

export const BookingCreateSchema = z
  .object({
    speakerId: z.string(),
    sessionStartTime: z.coerce.date(),
    sessionEndTime: z.coerce.date(),
  })
  .refine((data) => data.sessionEndTime > data.sessionStartTime, {
    message: "End time must be after start time",
  });

export const BookingUpdateSchema = z.object({
  sessionStartTime: z.coerce.date().optional(),
  sessionEndTime: z.coerce.date().optional(),
});
