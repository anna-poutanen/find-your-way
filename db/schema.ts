import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role", { enum: ["user", "shelter", "admin"] }).notNull().default("user"),
  anonymousByDefault: integer("anonymous_by_default", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const authAccounts = sqliteTable("auth_accounts", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  hashIterations: integer("hash_iterations").notNull().default(310000),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const authSessions = sqliteTable(
  "auth_sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id").notNull(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("auth_sessions_user_idx").on(table.userId), index("auth_sessions_expiry_idx").on(table.expiresAt)],
);

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website"),
  verificationStatus: text("verification_status", { enum: ["unclaimed", "pending", "verified", "rejected"] }).notNull().default("unclaimed"),
  createdBy: text("created_by"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const organizationMembers = sqliteTable(
  "organization_members",
  {
    organizationId: text("organization_id").notNull(),
    userId: text("user_id").notNull(),
    memberRole: text("member_role", { enum: ["owner", "staff"] }).notNull().default("staff"),
    status: text("status", { enum: ["pending", "active", "removed"] }).notNull().default("pending"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [primaryKey({ columns: [table.organizationId, table.userId] }), index("organization_members_user_idx").on(table.userId)],
);

export const listings = sqliteTable(
  "listings",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id"),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    summary: text("summary").notNull(),
    description: text("description"),
    city: text("city"),
    address: text("address"),
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    hours: text("hours"),
    eligibility: text("eligibility"),
    servicesJson: text("services_json").notNull().default("[]"),
    ageMin: integer("age_min"),
    ageMax: integer("age_max"),
    status: text("status", { enum: ["draft", "pending", "published", "rejected", "archived"] }).notNull().default("draft"),
    sourceLabel: text("source_label"),
    lastVerifiedAt: text("last_verified_at"),
    createdBy: text("created_by"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("listings_status_idx").on(table.status), index("listings_org_idx").on(table.organizationId)],
);

export const listingRevisions = sqliteTable(
  "listing_revisions",
  {
    id: text("id").primaryKey(),
    listingId: text("listing_id"),
    organizationId: text("organization_id"),
    submittedBy: text("submitted_by").notNull(),
    payloadJson: text("payload_json").notNull(),
    status: text("status", { enum: ["pending", "approved", "changes_requested", "rejected"] }).notNull().default("pending"),
    reviewerId: text("reviewer_id"),
    reviewerNote: text("reviewer_note"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    reviewedAt: text("reviewed_at"),
  },
  (table) => [index("listing_revisions_status_idx").on(table.status)],
);

export const favorites = sqliteTable(
  "favorites",
  {
    userId: text("user_id").notNull(),
    listingId: text("listing_id").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [primaryKey({ columns: [table.userId, table.listingId] })],
);

export const conversations = sqliteTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    listingId: text("listing_id").notNull(),
    listingName: text("listing_name").notNull(),
    userId: text("user_id").notNull(),
    organizationId: text("organization_id"),
    anonymous: integer("anonymous", { mode: "boolean" }).notNull().default(true),
    channel: text("channel", { enum: ["in_app", "email_relay", "both"] }).notNull().default("email_relay"),
    relayToken: text("relay_token").notNull().unique(),
    status: text("status", { enum: ["open", "closed", "blocked"] }).notNull().default("open"),
    lastMessageAt: text("last_message_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("conversations_user_idx").on(table.userId), index("conversations_org_idx").on(table.organizationId)],
);

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id").notNull(),
    senderUserId: text("sender_user_id"),
    senderKind: text("sender_kind", { enum: ["user", "shelter", "admin", "email"] }).notNull(),
    body: text("body").notNull(),
    deliveryStatus: text("delivery_status", { enum: ["stored", "queued", "sent", "delivered", "bounced", "failed"] }).notNull().default("stored"),
    externalMessageId: text("external_message_id"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("messages_conversation_idx").on(table.conversationId)],
);

export const importJobs = sqliteTable(
  "import_jobs",
  {
    id: text("id").primaryKey(),
    uploadedBy: text("uploaded_by").notNull(),
    fileName: text("file_name").notNull(),
    fileType: text("file_type").notNull(),
    objectKey: text("object_key"),
    status: text("status", { enum: ["uploaded", "parsing", "needs_review", "approved", "failed"] }).notNull().default("uploaded"),
    detectedRows: integer("detected_rows").notNull().default(0),
    previewJson: text("preview_json").notNull().default("[]"),
    errorMessage: text("error_message"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("import_jobs_status_idx").on(table.status)],
);

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    detailsJson: text("details_json").notNull().default("{}"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("audit_logs_entity_idx").on(table.entityType, table.entityId)],
);
