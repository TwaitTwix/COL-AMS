import { z } from "zod";

export const managedRoleSchema = z.object({
  role: z.enum(["pending", "student", "student_officer", "col_officer", "officer", "admin"]),
  student_id: z.string().uuid().nullable().optional(),
});

export const createStudentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  student_number: z.string().trim().min(1).max(40),
  institution: z.enum(['MCNP','ISAP']).nullable().optional(),
  college: z.string().trim().min(1).max(100).nullable().optional(),
});

export const studentArchiveSchema = z.object({ archived: z.boolean() });

export const createEventSchema = z.object({
  name: z.string().trim().min(1).max(160),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  radius_meters: z.number().finite().positive().max(100_000),
  starts_at: z.string().datetime({ offset: true }),
  ends_at: z.string().datetime({ offset: true }),
  institution: z.enum(['MCNP','ISAP']).nullable().default(null),
  college: z.string().trim().min(1).max(100).nullable().default(null),
}).refine((event) => Date.parse(event.starts_at) <= Date.parse(event.ends_at), {
  path: ["ends_at"],
  message: "Event end must be after its start",
}).refine(event=>!event.college||!!event.institution,{path:['college'],message:'Choose an institution for this college'});

export const eventArchiveSchema = z.object({ archived: z.boolean() });
