import { z } from "zod";
import { ValidationErrors } from "../generated/graphql/types";

export const mapValidationErrors = (error: z.ZodError): ValidationErrors => ({
  errors: error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  })),
  __typename: "ValidationErrors",
});
