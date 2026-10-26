import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  customerId: text("customer_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  customerType: text("customer_type").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email").notNull().default(""),
  mailingAddress: text("mailing_address").notNull().default(""),
  notes: text("notes").notNull().default(""),
  registrationDate: text("registration_date").notNull(),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customersTable, {
  customerType: z.enum(["Individual", "Company"]),
  status: z.enum(["Active", "Inactive"]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customersTable.$inferSelect;
