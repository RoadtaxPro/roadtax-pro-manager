import { z } from 'zod';

export const customerFormSchema = z.object({
  fullName: z.string().trim()
    .min(2, 'Enter a name with at least 2 characters.')
    .max(120, 'The name cannot exceed 120 characters.'),
  customerType: z.enum(['Individual', 'Company'], {
    errorMap: () => ({ message: 'Select Individual or Company.' }),
  }),
  phoneNumber: z.string()
    .trim()
    .min(7, 'Enter a valid phone number.')
    .max(24, 'The phone number is too long.')
    .regex(/^[0-9+()\s-]+$/, 'Use only numbers, spaces, plus signs, parentheses, or hyphens.')
    .refine((value) => value.replace(/\D/g, '').length >= 7, 'The phone number must contain at least 7 digits.'),
  email: z.string().trim().max(160, 'The email address cannot exceed 160 characters.').refine(
    (value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    'Enter a valid email address.',
  ),
  mailingAddress: z.string().trim().max(400, 'The mailing address cannot exceed 400 characters.'),
  notes: z.string().trim().max(1000, 'Notes cannot exceed 1,000 characters.'),
  status: z.enum(['Active', 'Inactive']),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
