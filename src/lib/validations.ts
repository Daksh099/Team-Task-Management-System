import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["low", "medium", "high"]),
  assignedTo: z.string().min(1, "Assignee is required"),
  deadline: z.string().min(1, "Deadline is required"),
});

export const rescheduleSchema = z.object({
  proposedDeadline: z.string().min(1, "Proposed deadline is required"),
  reason: z.string().min(10, "Please provide a detailed reason (at least 10 characters)"),
});

export const commentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type RescheduleFormData = z.infer<typeof rescheduleSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
