ALTER TABLE IF EXISTS "public"."beerRating"
  ALTER COLUMN "wankyness" TYPE double precision,
  ALTER COLUMN "taste" TYPE double precision;
--> statement-breakpoint
ALTER TABLE IF EXISTS "public"."coffeeRating"
  ALTER COLUMN "experience" TYPE double precision,
  ALTER COLUMN "taste" TYPE double precision;
