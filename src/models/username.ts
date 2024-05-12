import { z } from "zod";

export const Username = z
  .string()
  .min(3, "Username must be 3 characters or more")
  .max(32, "Username must be 32 characters or less")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, underscores and dashes are allowed in username",
  );

export type Username = z.infer<typeof Username>;
