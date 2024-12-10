import bcrypt from "bcrypt";
import e from "express";

export const hashPassword = async (password: string) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error: unknown) {
    throw new Error(
      `Error hashing password: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
