ALTER TABLE "user" ADD PRIMARY KEY ("email");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");