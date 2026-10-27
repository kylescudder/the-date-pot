-- Fixture for local verification only: one group with two members and a little of everything.
INSERT INTO "group" (id) VALUES ('11111111-1111-4111-8111-111111111111');
INSERT INTO "user" (id, name, username, "clerkId", bio) VALUES
  ('22222222-2222-4222-8222-222222222221', 'Test Kyle', 'testkyle', 'user_3LFVN7yEgn8eAU4XqJzSXvo2oqd', NULL),
  ('22222222-2222-4222-8222-222222222222', 'Test Partner', 'testpartner', 'user_partner_fixture', NULL);
-- userGroups.id matches group.id so either foreign-key target is satisfied
INSERT INTO "userGroups" (id, "userId", "groupId") VALUES
  ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', '11111111-1111-4111-8111-111111111111'),
  ('33333333-3333-4333-8333-333333333332', '22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111');
INSERT INTO pot (id, "potName", icon) VALUES
  (gen_random_uuid(), 'Activity', 'IconBallFootball'),
  (gen_random_uuid(), 'Beer', 'IconBeer'),
  (gen_random_uuid(), 'Coffee', 'IconCoffee'),
  (gen_random_uuid(), 'Film', 'IconMovie'),
  (gen_random_uuid(), 'Restaurant', 'IconToolsKitchen2'),
  (gen_random_uuid(), 'Vinyl', 'IconVinyl');
INSERT INTO brewery (id, "breweryName") VALUES ('44444444-4444-4444-8444-444444444441', 'Northern Monk'), ('44444444-4444-4444-8444-444444444442', 'Cloudwater');
INSERT INTO "beerType" (id, "beerType") VALUES ('44444444-4444-4444-8444-444444444451', 'IPA'), ('44444444-4444-4444-8444-444444444452', 'Stout');
INSERT INTO cuisine (id, cuisine) VALUES ('44444444-4444-4444-8444-444444444461', 'Italian'), ('44444444-4444-4444-8444-444444444462', 'Thai');
INSERT INTO "when" (id, "when") VALUES ('44444444-4444-4444-8444-444444444471', 'Lunch'), ('44444444-4444-4444-8444-444444444472', 'Dinner');
INSERT INTO director (id, "directorName") VALUES ('44444444-4444-4444-8444-444444444481', 'Greta Gerwig');
INSERT INTO genre (id, "genreText") VALUES ('44444444-4444-4444-8444-444444444491', 'Comedy'), ('44444444-4444-4444-8444-444444444492', 'Drama');
INSERT INTO platform (id, "platformName") VALUES ('44444444-4444-4444-8444-4444444444a1', 'Netflix');
INSERT INTO expense (id, expense) VALUES ('44444444-4444-4444-8444-4444444444b1', 'Free'), ('44444444-4444-4444-8444-4444444444b2', '££');
INSERT INTO beer (id, name, abv, "addedById", archive, "userGroupId") VALUES
  ('55555555-5555-4555-8555-555555555551', 'Faith', 5.4, '22222222-2222-4222-8222-222222222221', false, '11111111-1111-4111-8111-111111111111'),
  ('55555555-5555-4555-8555-555555555552', 'Old Stout', 7.0, '22222222-2222-4222-8222-222222222221', false, '11111111-1111-4111-8111-111111111111');
INSERT INTO "beerBreweries" (id, "beerId", "breweryId") VALUES (gen_random_uuid(), '55555555-5555-4555-8555-555555555551', '44444444-4444-4444-8444-444444444441');
INSERT INTO "beerTypes" (id, "beerId", "beerTypeId") VALUES (gen_random_uuid(), '55555555-5555-4555-8555-555555555551', '44444444-4444-4444-8444-444444444451');
INSERT INTO "beerRating" (id, "beerId", "userId", wankyness, taste) VALUES
  (gen_random_uuid(), '55555555-5555-4555-8555-555555555551', '22222222-2222-4222-8222-222222222221', 2, 4),
  (gen_random_uuid(), '55555555-5555-4555-8555-555555555551', '22222222-2222-4222-8222-222222222222', 4, 4);
INSERT INTO coffee (id, name, archive, "userGroupId", "addedById", address) VALUES
  ('55555555-5555-4555-8555-555555555561', 'Grindsmith', false, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', '');
INSERT INTO "coffeeRating" (id, "userId", "coffeeId", experience, taste) VALUES
  (gen_random_uuid(), '22222222-2222-4222-8222-222222222221', '55555555-5555-4555-8555-555555555561', 4, 5);
INSERT INTO film (id, name, archive, "userGroupId", "addedById", "addedDate", "releaseDate", "runTime", watched) VALUES
  ('55555555-5555-4555-8555-555555555571', 'Lady Bird', false, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', '2026-01-05', '2017-11-03', 94, false);
INSERT INTO "filmDirectors" (id, "filmId", "directorId") VALUES (gen_random_uuid(), '55555555-5555-4555-8555-555555555571', '44444444-4444-4444-8444-444444444481');
INSERT INTO "filmGenres" (id, "filmId", "genreId") VALUES (gen_random_uuid(), '55555555-5555-4555-8555-555555555571', '44444444-4444-4444-8444-444444444491');
INSERT INTO "filmPlatforms" (id, "filmId", "platformId") VALUES (gen_random_uuid(), '55555555-5555-4555-8555-555555555571', '44444444-4444-4444-8444-4444444444a1');
INSERT INTO restaurant (id, name, archive, "userGroupId", address) VALUES
  ('55555555-5555-4555-8555-555555555581', 'Rudy''s Pizza', false, '11111111-1111-4111-8111-111111111111', '');
INSERT INTO "restaurantCuisines" (id, "cuisineId", "restaurantId") VALUES (gen_random_uuid(), '44444444-4444-4444-8444-444444444461', '55555555-5555-4555-8555-555555555581');
INSERT INTO "restaurantWhens" (id, "whenId", "restaurantId") VALUES (gen_random_uuid(), '44444444-4444-4444-8444-444444444472', '55555555-5555-4555-8555-555555555581');
INSERT INTO activity (id, name, archive, "userGroupId", address, "expenseId") VALUES
  ('55555555-5555-4555-8555-555555555591', 'Crazy golf', false, '11111111-1111-4111-8111-111111111111', '', '44444444-4444-4444-8444-4444444444b2');
INSERT INTO vinyl (id, name, artist, archive, "userGroupId", "addedById", purchased) VALUES
  ('55555555-5555-4555-8555-5555555555a1', 'Blue', 'Joni Mitchell', false, '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', false);
-- A second group whose data the test user must never see
INSERT INTO "group" (id) VALUES ('99999999-9999-4999-8999-999999999999');
INSERT INTO "user" (id, name, username, "clerkId") VALUES ('99999999-9999-4999-8999-999999999998', 'Stranger', 'stranger', 'user_stranger_fixture');
INSERT INTO "userGroups" (id, "userId", "groupId") VALUES ('99999999-9999-4999-8999-999999999999', '99999999-9999-4999-8999-999999999998', '99999999-9999-4999-8999-999999999999');
INSERT INTO beer (id, name, abv, "addedById", archive, "userGroupId") VALUES
  ('99999999-9999-4999-8999-999999999991', 'Someone Else''s Beer', 4.0, '99999999-9999-4999-8999-999999999998', false, '99999999-9999-4999-8999-999999999999');
