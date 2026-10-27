ALTER TABLE IF EXISTS "public"."beerRating"
  ALTER COLUMN "wankyness" TYPE double precision,
  ALTER COLUMN "taste" TYPE double precision;
--> statement-breakpoint
ALTER TABLE IF EXISTS "public"."coffeeRating"
  ALTER COLUMN "experience" TYPE double precision,
  ALTER COLUMN "taste" TYPE double precision;
--> statement-breakpoint
ALTER TABLE IF EXISTS "public"."beer"
  ALTER COLUMN "abv" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE IF EXISTS "public"."holiday"
  ALTER COLUMN "dateBeen" DROP NOT NULL;
