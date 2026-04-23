import z from "zod";

export const inquiryFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must have atleast 2 characters")
    .max(70, "Name must have less than or equal to 70 characters")
    .regex(/^[A-Za-z ]+$/, "Name can only contain letters and spaces")
    .trim(),
  phone: z
    .string()
    .regex(/^(98|97)\d{8}$/, "Invalid phone number")
    .trim(),
  message: z.string().trim(),
  email: z.email().trim(),
  source: z.enum(["facebook", "instagram", "tiktok", "referral", "inPerson"]),
});

export type InquiryForm = z.infer<typeof inquiryFormSchema>;

export const createStudentAdmissionRequest = z.object({
  fullName: z
    .string()
    .min(5)
    .max(70)
    .regex(/^[A-Za-z ]+$/, "Name can only contain letters and spaces")
    .trim(),
  Phone: z
    .string()
    .regex(/^(98|97)\d{8}$/, "Invalid phone number")
    .trim(),
  source: z.enum(["facebook", "instagram", "tiktok", "referral", "inPerson"]),
  email: z.email().trim(),
  dob: z.date(),
  gender: z.enum(["male", "female", "others"]),
  guardianName: z
    .string()
    .min(5)
    .max(70)
    .regex(/^[A-Za-z ]+$/, "Name can only contain letters and spaces")
    .trim(),
  guardianPhone: z
    .string()
    .regex(/^(98|97)\d{8}$/, "Invalid phone number")
    .trim(),

  Courses: z.array(z.uuid()).min(1),
  address: z.string().trim(),
  claimedAmount: z.number(),
  photoUrl: z.url(),
});

export type CreateStudentAdmission = z.infer<
  typeof createStudentAdmissionRequest
>;
