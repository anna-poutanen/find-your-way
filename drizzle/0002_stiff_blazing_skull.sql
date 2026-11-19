CREATE TABLE `email_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`to_email` text NOT NULL,
	`subject` text NOT NULL,
	`text_body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`provider_message_id` text,
	`last_error` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `email_deliveries_status_idx` ON `email_deliveries` (`status`);--> statement-breakpoint
CREATE INDEX `email_deliveries_message_idx` ON `email_deliveries` (`message_id`);--> statement-breakpoint
CREATE TABLE `listing_ownership` (
	`listing_id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `organization_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`listing_name` text NOT NULL,
	`submitted_by` text NOT NULL,
	`work_email` text NOT NULL,
	`role_title` text NOT NULL,
	`note` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`organization_id` text,
	`reviewer_id` text,
	`reviewed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `organization_claims_status_idx` ON `organization_claims` (`status`);--> statement-breakpoint
CREATE INDEX `organization_claims_listing_idx` ON `organization_claims` (`listing_id`);--> statement-breakpoint
CREATE TABLE `organization_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`invited_by` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`accepted_at` text
);
--> statement-breakpoint
CREATE INDEX `organization_invitations_email_idx` ON `organization_invitations` (`email`,`status`);--> statement-breakpoint
CREATE INDEX `organization_invitations_org_idx` ON `organization_invitations` (`organization_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_auth_accounts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`hash_iterations` integer DEFAULT 100000 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_auth_accounts`("user_id", "email", "password_hash", "password_salt", "hash_iterations", "created_at", "updated_at") SELECT "user_id", "email", "password_hash", "password_salt", "hash_iterations", "created_at", "updated_at" FROM `auth_accounts`;--> statement-breakpoint
DROP TABLE `auth_accounts`;--> statement-breakpoint
ALTER TABLE `__new_auth_accounts` RENAME TO `auth_accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `auth_accounts_email_unique` ON `auth_accounts` (`email`);--> statement-breakpoint
ALTER TABLE `conversations` ADD `contact_email` text;