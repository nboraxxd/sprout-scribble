CREATE TABLE IF NOT EXISTS "twoFactorCode" (
	"id" text NOT NULL,
	"code" text NOT NULL,
	"expires" timestamp NOT NULL,
	"email" text NOT NULL,
	"userId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "twoFactorCode_id_code_email_pk" PRIMARY KEY("id","code","email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "twoFactorCode" ADD CONSTRAINT "twoFactorCode_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
