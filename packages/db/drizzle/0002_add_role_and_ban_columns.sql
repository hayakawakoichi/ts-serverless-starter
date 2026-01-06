-- Add role column with default value 'user'
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;
--> statement-breakpoint
-- Add ban-related columns for Admin Plugin
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;
