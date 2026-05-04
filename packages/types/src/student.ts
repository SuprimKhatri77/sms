import z from "zod";

export const inquiryFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(70, "Full name must be 70 characters or less")
    .regex(/^[A-Za-z ]+$/, "Full name can only contain letters and spaces")
    .trim(),

  phone: z
    .string()
    .trim()
    .regex(/^(98|97)\d{8}$/, "Enter a valid Nepali phone number"),

  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(200, "Message must be 200 characters or less"),

  email: z.email("Enter a valid email address").trim(),

  source: z.enum(["facebook", "instagram", "tiktok", "referral", "inPerson"], {
    error: "Please select how you heard about us",
  }),
});

export type InquiryForm = z.infer<typeof inquiryFormSchema>;

export const createStudentAdmissionRequest = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .min(5, "Full name must be at least 5 characters")
    .max(50, "Full name must be less than 70 characters")
    .regex(/^[A-Za-z ]+$/, "Full name can only contain letters and spaces"),

  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^(98|97)\d{8}$/, "Enter a valid Nepali phone number"),

  source: z.enum(["facebook", "instagram", "tiktok", "referral", "inPerson"], {
    error: "Please select how you heard about us",
  }),

  email: z
    .email("Enter a valid email address")
    .trim()
    .min(1, "Email is required"),

  dob: z
    .string()
    .min(1, "Date of birth is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use format YYYY-MM-DD"),

  gender: z.enum(["male", "female", "other"], {
    error: "Please select a gender",
  }),

  guardianName: z
    .string()
    .trim()
    .min(1, "Guardian name is required")
    .min(5, "Guardian name must be at least 5 characters")
    .max(70, "Guardian name must be less than 70 characters")
    .regex(/^[A-Za-z ]+$/, "Guardian name can only contain letters and spaces"),

  guardianPhone: z
    .string()
    .trim()
    .min(1, "Guardian phone number is required")
    .regex(/^(98|97)\d{8}$/, "Enter a valid Nepali phone number"),

  courses: z.array(z.uuid()).min(1, "Please select at least one course"),

  address: z
    .string()
    .trim()
    .min(1, "Address is required")
    .min(5, "Address is too short"),

  claimedAmount: z
    .number({ error: "Amount must be a number" })
    .min(0, "Amount cannot be negative")
    .nullable(),

  photoUrl: z.url("Invalid photo URL").min(1, "Photo is required"),
});

export type CreateStudentAdmission = z.infer<
  typeof createStudentAdmissionRequest
>;
