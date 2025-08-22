import {z} from "zod"

// Define the maximum file size (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Define the accepted file types for Excel
const ACCEPTED_EXCEL_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const loginSchema = z.object({
    username: z.string(),
    password: z.string().min(3)
})

type loginFields = z.infer<typeof loginSchema>

const registerUserSchema = z.object({
    email: z.email({ error: "Please enter a valid email." }),
    username: z.string().min(3, "Username must be at least 3 characters."),
    role: z.enum(["OA", "entity"]),
    company: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters."),
    repeatPassword: z.string(),
}).superRefine((data, ctx) => {
    if (data.password !== data.repeatPassword) {
        ctx.addIssue({
            code: "custom",
            message: "Passwords do not match",
            path: ["repeatPassword"],
        });
    }
    if (data.role === 'entity' && !data.company) {
        ctx.addIssue({
            code: "custom",
            message: "Company is required for entity role.",
            path: ["company"],
        });
    }
});

type registerUserFields = z.infer<typeof registerUserSchema>


const editUserSchema = z.object({
    email: z.email({ message: "Please enter a valid email." }).optional(),
    username: z.string().min(3, "Username must be at least 3 characters.").optional(),
    role: z.enum(["OA", "entity"]).optional(),
    company: z.string().optional(),
    password: z.string().optional().or(z.literal('')), // Allow empty string for password
    repeatPassword: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.password && data.password.length > 0 && data.password.length < 8) {
         ctx.addIssue({ code: "custom", message: "Password must be at least 8 characters.", path: ["password"] });
    }
    if (data.password && data.password !== data.repeatPassword) {
        ctx.addIssue({ code: "custom", message: "Passwords do not match", path: ["repeatPassword"] });
    }
    if (data.role === 'entity' && !data.company) {
        ctx.addIssue({ code: "custom", message: "Company is required for entity role.", path: ["company"] });
    }
});

type editUserFields = z.infer<typeof editUserSchema>

const fileUploadSchema = z.object({
    company_name: z.string().min(1, {error: "Company Name required"}),
    standard: z.enum(['62443', 'NIST CSF 2.0']),
    output_excel: z
        .any()
        .refine((files) => files?.length === 1, 'An excel file is required') 
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, 'Max file size is 5MB')
        .refine((files) => ACCEPTED_EXCEL_TYPES.includes(files?.[0]?.type), 'Only .xls and .xlsx formats are supported'),
    sector: z.string().min(1, {error: "Sector required"}),
    region: z.string().min(1, {error: "Region required"}),
})

type fileUploadFields = z.infer<typeof fileUploadSchema>

const ControlEvaluationSchema = z.object({
    control_id: z.string(),
    control_name: z.string(),
    inPlace: z.enum(['Y', 'N', 'P', '']),
    targetRating: z.string(),
    observedRating: z.string().min(1, {error: "Rating is required"}),
})

const SubDomainSchema = z.object({
    subdomain_id: z.string(),
    controls: z.array(ControlEvaluationSchema),
})

const SPESchema = z.object({
    spe_name: z.string(),
    subdomains: z.array(SubDomainSchema)
})

const CompanyMetaDataSchema = z.object({
    company_name: z
        .string()
        .min(1, { message: "Company Name is required." }),
    sector: z.string().min(1, { message: "Sector is required." }),
    region: z.string().min(1, { message: "Region is required." }),
});


const SelfEvaluationSchema = z.object({
    spes: z.array(SPESchema),
    meta_data: CompanyMetaDataSchema
})

type SelfEvaluationFields = z.infer<typeof SelfEvaluationSchema>

export {
    loginSchema,
    type loginFields,
    fileUploadSchema,
    type fileUploadFields,
    registerUserSchema,
    type registerUserFields,
    editUserSchema,
    type editUserFields,
    SelfEvaluationSchema,
    type SelfEvaluationFields,
} 

