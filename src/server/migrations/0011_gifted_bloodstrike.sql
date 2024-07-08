CREATE TABLE IF NOT EXISTS "emailVerificationToken" (
	"id" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	"email" text NOT NULL,
	CONSTRAINT "emailVerificationToken_email_token_id_pk" PRIMARY KEY("email","token","id")
);
