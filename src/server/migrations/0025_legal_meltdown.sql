ALTER TABLE "twoFactorCode" DROP CONSTRAINT "twoFactorCode_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "twoFactorCode" ADD COLUMN "ipAddress" text;--> statement-breakpoint
ALTER TABLE "twoFactorCode" DROP COLUMN IF EXISTS "userId";