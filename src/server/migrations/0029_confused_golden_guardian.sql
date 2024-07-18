CREATE UNIQUE INDEX IF NOT EXISTS "slugIdx" ON "products" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_slug_unique" UNIQUE("slug");