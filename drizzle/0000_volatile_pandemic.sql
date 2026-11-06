CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`details_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`listing_name` text NOT NULL,
	`user_id` text NOT NULL,
	`organization_id` text,
	`anonymous` integer DEFAULT true NOT NULL,
	`channel` text DEFAULT 'email_relay' NOT NULL,
	`relay_token` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`last_message_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `conversations_relay_token_unique` ON `conversations` (`relay_token`);--> statement-breakpoint
CREATE INDEX `conversations_user_idx` ON `conversations` (`user_id`);--> statement-breakpoint
CREATE INDEX `conversations_org_idx` ON `conversations` (`organization_id`);--> statement-breakpoint
CREATE TABLE `favorites` (
	`user_id` text NOT NULL,
	`listing_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `listing_id`)
);
--> statement-breakpoint
CREATE TABLE `import_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`uploaded_by` text NOT NULL,
	`file_name` text NOT NULL,
	`file_type` text NOT NULL,
	`object_key` text,
	`status` text DEFAULT 'uploaded' NOT NULL,
	`detected_rows` integer DEFAULT 0 NOT NULL,
	`preview_json` text DEFAULT '[]' NOT NULL,
	`error_message` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `import_jobs_status_idx` ON `import_jobs` (`status`);--> statement-breakpoint
CREATE TABLE `listing_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text,
	`organization_id` text,
	`submitted_by` text NOT NULL,
	`payload_json` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewer_id` text,
	`reviewer_note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`reviewed_at` text
);
--> statement-breakpoint
CREATE INDEX `listing_revisions_status_idx` ON `listing_revisions` (`status`);--> statement-breakpoint
CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`summary` text NOT NULL,
	`description` text,
	`city` text,
	`address` text,
	`phone` text,
	`email` text,
	`website` text,
	`hours` text,
	`eligibility` text,
	`services_json` text DEFAULT '[]' NOT NULL,
	`age_min` integer,
	`age_max` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`source_label` text,
	`last_verified_at` text,
	`created_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `listings_slug_unique` ON `listings` (`slug`);--> statement-breakpoint
CREATE INDEX `listings_status_idx` ON `listings` (`status`);--> statement-breakpoint
CREATE INDEX `listings_org_idx` ON `listings` (`organization_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`sender_user_id` text,
	`sender_kind` text NOT NULL,
	`body` text NOT NULL,
	`delivery_status` text DEFAULT 'stored' NOT NULL,
	`external_message_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `messages_conversation_idx` ON `messages` (`conversation_id`);--> statement-breakpoint
CREATE TABLE `organization_members` (
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`member_role` text DEFAULT 'staff' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`organization_id`, `user_id`)
);
--> statement-breakpoint
CREATE INDEX `organization_members_user_idx` ON `organization_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`website` text,
	`verification_status` text DEFAULT 'unclaimed' NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`anonymous_by_default` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
