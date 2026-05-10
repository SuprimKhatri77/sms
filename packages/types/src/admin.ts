import z from "zod";
import { baseAPIResponseSchema } from "./base";

export const listStudentResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.array(
      z.object({
        id: z.uuid(),
        fullName: z.string(),
        phone: z.string(),
        referenceNo: z.string(),
        courses: z.array(z.string()),
        status: z.enum(["pending", "completed", "rejected", "active"]),
        claimedAmount: z.number(),
      }),
    ),
    meta: z.object({
      total: z.number(),
      totalPages: z.number(),
      limit: z.number(),
    }),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);

export type ListStudent = z.infer<typeof listStudentResponseSchema>;

export const studentDetailResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.object({
      id: z.uuid(),
      studentID: z.uuid(),
      email: z.email(),
      referenceNo: z.string(),
      fiscalYear: z.string(),
      serialNo: z.number,
      fullName: z.string(),
      dob: z.date(),
      gender: z.enum(["male", "female", "other"]),
      phone: z.string(),
      address: z.string(),
      guardianName: z.string(),
      guardianPhone: z.string(),
      photoUrl: z.url(),
      source: z.enum([
        "facebook",
        "instagram",
        "tiktok",
        "referral",
        "inperson",
      ]),
      claimedAmount: z.number(),
      status: z.enum(["pending", "active", "completed", "rejected"]),
      notes: z.string(),
      createdAt: z.date(),
    }),
  }),

  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);

export type StudentDetail = z.infer<typeof studentDetailResponseSchema>;

export const studentEnrolledCoursesResponseSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(true),
      data: z.array(
        z.object({
          id: z.uuid(),
          name: z.string(),
          fee: z.number(),
          isActive: z.boolean(),
          createdAt: z.date(),
        }),
      ),
    }),

    z.object({
      success: z.literal(false),
      message: z.string(),
      code: z.string(),
    }),
  ],
);

export type StudentEnrolledCourses = z.infer<
  typeof studentEnrolledCoursesResponseSchema
>;

export const studentPaymentDetailsResponseSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(true),
      data: z.array(
        z.object({
          id: z.uuid(),
          studentID: z.uuid(),
          addedBy: z.uuid(),
          addedAt: z.date(),
          remarks: z.string(),
          amount: z.number(),
          addedByName: z.string(),
        }),
      ),
    }),
    z.object({
      success: z.literal(false),
      message: z.string(),
      code: z.string(),
    }),
  ],
);

export type StudentPaymentDetails = z.infer<
  typeof studentPaymentDetailsResponseSchema
>;

export const updateStudentStatusSchema = z.object({
  status: z.enum(["pending", "active", "completed", "rejected"]),
});

export type UpdateStudentStatus = z.infer<typeof updateStudentStatusSchema>;

export const updateStudentStatusResponseSchema = baseAPIResponseSchema;

export type UpdateStudentStatusResponse = z.infer<
  typeof updateStudentStatusResponseSchema
>;

export const addPaymentSchema = z.object({
  amount: z.number().gt(0),
  addedBy: z.uuid(),
  remarks: z.string().min(3).max(100).optional(),
});

export type AddPayment = z.infer<typeof addPaymentSchema>;

export const addPaymentResponseSchema = baseAPIResponseSchema;
export type AddPaymentResponse = z.infer<typeof addPaymentResponseSchema>;

export const createCourseSchema = z.object({
  name: z.string().min(2).max(50),
  isActive: z.boolean(),
  fee: z.number().gt(0),
});

export const createCourseResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.object({
      id: z.uuid(),
      name: z.string(),
      fee: z.number(),
      isActive: z.boolean(),
      createdAt: z.date(),
    }),
  }),

  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);
export type CreateCourse = z.infer<typeof createCourseSchema>;
export type CreateCourseResponse = z.infer<typeof createCourseResponseSchema>;

export const updateCourseSchema = z.object({
  name: z.string().min(2).max(50),
  isActive: z.boolean(),
  fee: z.number().gt(0),
  id: z.uuid(),
});

export const updateCourseResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
  }),

  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);
export type UpdateCourse = z.infer<typeof updateCourseSchema>;
export type UpdateCourseResponse = z.infer<typeof updateCourseResponseSchema>;

export const deleteCourseResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
  }),

  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);

export type DeleteCourse = z.infer<typeof deleteCourseResponseSchema>;

export const coursesListResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.array(
      z.object({
        id: z.uuid(),
        name: z.string(),
        fee: z.number(),
        isActive: z.boolean(),
        createdAt: z.date(),
      }),
    ),
  }),

  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);

export type CoursesListResponse = z.infer<typeof coursesListResponseSchema>;

export const toggleCourseSchema = z.object({
  status: z.boolean(),
  id: z.uuid(),
});

export type ToggleCourse = z.infer<typeof toggleCourseSchema>;

export const updateSetting = z.object({
  value: z.string().min(1).max(30),
  key: z.string(),
});

export type UpdateSetting = z.infer<typeof updateSetting>;

export const updateSettingResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
  }),

  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);

export type UpdateSettingResponse = z.infer<typeof updateSettingResponseSchema>;

export const settingsListResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    ),
  }),

  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);

export type SettingsListResponse = z.infer<typeof settingsListResponseSchema>;

export const inquiriesListResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.object({
      inquiries: z.array(
        z.object({
          id: z.uuid(),
          fullName: z.string(),
          phone: z.string(),
          email: z.email().optional(),
          message: z.string(),
          source: z.enum([
            "facebook",
            "tiktok",
            "instagram",
            "referral",
            "inperson",
          ]),
          isRead: z.boolean(),
          createdAt: z.date(),
        }),
      ),
      unreadCount: z.number(),
      readCount: z.number(),
    }),
    meta: z.object({
      total: z.number(),
      totalPages: z.number(),
      limit: z.number(),
    }),
  }),

  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);

export type InquiriesList = z.infer<typeof inquiriesListResponseSchema>;

export const markInquiryReadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type MarkInquiryReadResponse = z.infer<
  typeof markInquiryReadResponseSchema
>;

export const deleteInquiryResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type DeleteInquiryResponse = z.infer<typeof deleteInquiryResponseSchema>;

export const analyticsResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.object({
      overview: z.object({
        totalStudents: z.number(),
        pendingApprovals: z.number(),
        totalRevenue: z.number(),
        studentsWithBalance: z.number(),
      }),
      monthlyRevenue: z.array(
        z.object({ month: z.string(), amount: z.number() }),
      ),
      monthlyAdmissions: z.array(
        z.object({ month: z.string(), count: z.number() }),
      ),
      sourceBreakdown: z.array(
        z.object({
          source: z.enum([
            "inperson",
            "referral",
            "instagram",
            "facebook",
            "tiktok",
          ]),
          count: z.number(),
        }),
      ),

      inquiryStats: z.object({
        total: z.number(),
        unread: z.number(),
      }),

      monthlyInquiries: z.array(
        z.object({
          month: z.string(),
          count: z.number(),
        }),
      ),

      revenueStats: z.object({
        thisMonth: z.number(),
        lastMonth: z.number(),
        outstanding: z.number(),
      }),

      coursePopularity: z.array(
        z.object({ course: z.string(), count: z.number() }),
      ),
      statusBreakdown: z.object({
        pending: z.number(),
        active: z.number(),
        rejected: z.number(),
        completed: z.number(),
      }),
    }),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
  }),
]);

export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>;
