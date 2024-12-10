import { z } from "zod";

const timestampSchema = z.object({
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const idSchema = z.object({
  id: z.string().length(26),
});

export const UserCreateSchema = z
  .object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    email: z.string().email().max(255),
    password: z
      .string()
      .min(8)
      .max(255)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain uppercase, lowercase, number and special character",
      ),
    isVerified: z.boolean().default(false),
  })
  .merge(timestampSchema);

export const UserSchema = UserCreateSchema.merge(idSchema);
export const UserUpdateSchema = UserCreateSchema.partial();
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const SpeakerCreateSchema = z
  .object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    email: z.string().email().max(255),
    password: z
      .string()
      .min(8)
      .max(255)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain uppercase, lowercase, number and special character",
      ),
    isVerified: z.boolean().default(false),
    pricePerSession: z.string().regex(/^\d+(\.\d{1,2})?$/),
    bio: z.string().min(10).max(1000).optional(),
  })
  .merge(timestampSchema);

export const SpeakerSchema = SpeakerCreateSchema.merge(idSchema);
export const SpeakerUpdateSchema = SpeakerCreateSchema.partial();

export const BookingCreateSchema = z
  .object({
    sessionStartTime: z.date(),
    sessionEndTime: z.date(),
    speakerIds: z.array(z.string().length(26)),
    userIds: z.array(z.string().length(26)),
  })
  .merge(timestampSchema);

export const BookingSchema = BookingCreateSchema.merge(idSchema).refine(
  (data) => data.sessionEndTime > data.sessionStartTime,
  {
    message: "End time must be after start time",
    path: ["sessionEndTime"],
  },
);
export const BookingUpdateSchema = BookingCreateSchema.partial();

export const SpeakerBookingSchema = z.object({
  speakerId: z.string().length(26),
  sessionStartTime: z.string().datetime(),
  sessionEndTime: z.string().datetime(),
});

export const UserBookingSchema = z.object({
  bookingId: z.string().length(26),
  userId: z.string().length(26),
});
