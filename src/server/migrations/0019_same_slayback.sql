CREATE TABLE IF NOT EXISTS "passwordResetToken" (
	"id" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	"email" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "passwordResetToken_id_token_email_pk" PRIMARY KEY("id","token","email")
);
