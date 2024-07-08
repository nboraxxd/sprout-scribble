CREATE TABLE IF NOT EXISTS "emailToken" (
	"id" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	"email" text NOT NULL,
	CONSTRAINT "emailToken_email_token_pk" PRIMARY KEY("email","token")
);
--> statement-breakpoint
DROP TABLE "verificationToken";