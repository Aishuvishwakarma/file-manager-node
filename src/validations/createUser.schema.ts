import * as yup from "yup";

/**
 * Schema to validate user creation payload.
 * - `email`: required string for the user's email.
 * - `password`: required string for the user's password.
 */
export const createUserSchema = yup.object({
  email: yup.string().required("Folder name is required"),
  password: yup
    .string()
    .required("Password is required")
    .length(6, "Password must be at least 6 characters"),
});
