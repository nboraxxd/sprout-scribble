ALTER TABLE "user" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "password" text NOT NULL;