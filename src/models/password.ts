import { z } from "zod";

export const Password = z
  .string()
  .min(8, "Password must be 8 characters or more")
  .max(64, "Password must be 64 characters or less")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/,
    "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character",
  )
  .transform((password) => password.trim());

export type Password = z.infer<typeof Password>;
