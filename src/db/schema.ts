import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const languageEnum = pgEnum("language", ["english", "swahili", "sheng", "luhya"]);
export const consentStatusEnum = pgEnum("consent_status", ["active", "withdrawn"]);
export const occupationCategoryEnum = pgEnum("occupation_category", [
  "formal_employee",
  "market_vendor",
  "smallholder_farmer",
  "cross_border_trader",
  "boda_operator",
  "chama_backed_enterprise",
  "other"
]);
export const loanApplicationStatusEnum = pgEnum("loan_application_status", [
  "pending",
  "triage",
  "escalated",
  "approved",
  "denied",
  "withdrawn"
]);
export const loanOutcomeEnum = pgEnum("loan_outcome", ["approve", "deny", "revise", "escalate"]);
export const reviewerTypeEnum = pgEnum("reviewer_type", ["ai", "human", "system"]);
export const agentTypeEnum = pgEnum("agent_type", ["scout", "guardian", "hunter"]);
export const handoffStatusEnum = pgEnum("handoff_status", ["open", "accepted", "closed"]);

export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  nationalIdHash: text("national_id_hash"),
  county: text("county").notNull(),
  subCounty: text("sub_county"),
  preferredLanguage: languageEnum("preferred_language").notNull().default("english"),
  childrenUnderFive: integer("children_under_five").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const consents = pgTable("consents", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  transactionDataAllowed: boolean("transaction_data_allowed").notNull().default(false),
  automatedDecisionAllowed: boolean("automated_decision_allowed").notNull().default(false),
  thirdPartySharingAllowed: boolean("third_party_sharing_allowed").notNull().default(false),
  consentTextVersion: text("consent_text_version").notNull(),
  status: consentStatusEnum("status").notNull().default("active"),
  withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const loanApplications = pgTable("loan_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  requestedAmount: numeric("requested_amount", { precision: 12, scale: 2 }).notNull(),
  requestedTermMonths: integer("requested_term_months").notNull(),
  purpose: text("purpose").notNull(),
  occupationRaw: text("occupation_raw").notNull(),
  occupationCategory: occupationCategoryEnum("occupation_category").notNull(),
  county: text("county").notNull(),
  subCounty: text("sub_county"),
  status: loanApplicationStatusEnum("status").notNull().default("pending"),
  riskScore: integer("risk_score"),
  repaymentCapacityMonthly: numeric("repayment_capacity_monthly", { precision: 12, scale: 2 }),
  affordabilityEvidence: jsonb("affordability_evidence").$type<Record<string, unknown>>().notNull().default({}),
  biasChecks: jsonb("bias_checks").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const loanDecisions = pgTable("loan_decisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => loanApplications.id, { onDelete: "cascade" }),
  outcome: loanOutcomeEnum("outcome").notNull(),
  amountApproved: numeric("amount_approved", { precision: 12, scale: 2 }),
  reviewerType: reviewerTypeEnum("reviewer_type").notNull(),
  reviewerId: text("reviewer_id"),
  reasons: jsonb("reasons").$type<string[]>().notNull().default([]),
  memberMessage: text("member_message").notNull(),
  modelVersion: text("model_version"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const agentHandoffs = pgTable("agent_handoffs", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => loanApplications.id, { onDelete: "cascade" }),
  fromAgent: agentTypeEnum("from_agent").notNull(),
  toAgent: agentTypeEnum("to_agent").notNull(),
  trigger: text("trigger").notNull(),
  context: jsonb("context").$type<Record<string, unknown>>().notNull().default({}),
  status: handoffStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorType: reviewerTypeEnum("actor_type").notNull(),
  actorId: text("actor_id"),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const membersRelations = relations(members, ({ many }) => ({
  consents: many(consents),
  loanApplications: many(loanApplications)
}));

export const consentsRelations = relations(consents, ({ one }) => ({
  member: one(members, {
    fields: [consents.memberId],
    references: [members.id]
  })
}));

export const loanApplicationsRelations = relations(loanApplications, ({ one, many }) => ({
  member: one(members, {
    fields: [loanApplications.memberId],
    references: [members.id]
  }),
  decisions: many(loanDecisions),
  handoffs: many(agentHandoffs)
}));
