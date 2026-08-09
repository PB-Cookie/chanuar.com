-- Run with `supabase test db` against a disposable local project.
begin;

create extension if not exists pgtap with schema extensions;
select extensions.plan(26);

select extensions.has_table('food', 'food_admins', 'food.food_admins exists');
select extensions.has_table('food', 'restaurants', 'food.restaurants exists');
select extensions.has_table('food', 'menu_items', 'food.menu_items exists');
select extensions.has_table('food', 'order_cycles', 'food.order_cycles exists');
select extensions.has_table('food', 'orders', 'food.orders exists');
select extensions.has_table('food', 'order_items', 'food.order_items exists');

select extensions.table_privs_are('anon', 'food', 'orders', array[]::text[], 'anon cannot read order rows');
select extensions.table_privs_are('anon', 'food', 'order_items', array[]::text[], 'anon cannot read order item rows');
select extensions.table_privs_are('anon', 'food', 'food_admins', array[]::text[], 'anon cannot enumerate admins');
select extensions.table_privs_are('authenticated', 'food', 'orders', array[]::text[], 'ordinary authenticated users cannot read order rows');
select extensions.table_privs_are('authenticated', 'food', 'order_cycles', array[]::text[], 'ordinary authenticated users cannot enumerate history');

select extensions.function_privs_are(
  'anon', 'public', 'food_active_menu', array[]::text[], array['EXECUTE'],
  'anon can only use the public active-menu function'
);
select extensions.function_privs_are(
  'anon', 'public', 'food_restaurant_options', array[]::text[], array['EXECUTE'],
  'anon can use the presentation-only restaurant directory function'
);
select extensions.function_privs_are(
  'anon', 'public', 'food_admin_current', array[]::text[], array[]::text[],
  'anon cannot call admin summaries'
);
select extensions.function_privs_are(
  'authenticated', 'public', 'food_admin_current', array[]::text[], array['EXECUTE'],
  'authenticated role can call the function, which applies the allowlist internally'
);
select extensions.function_privs_are(
  'anon', 'public', 'food_admin_close_cycle', array['uuid', 'integer'], array[]::text[],
  'anon cannot close cycles or set service fees'
);
select extensions.function_privs_are(
  'authenticated', 'public', 'food_admin_close_cycle', array['uuid', 'integer'], array['EXECUTE'],
  'authenticated role can call cycle closure, which applies the allowlist internally'
);
select extensions.function_privs_are(
  'anon', 'public', 'food_scraper_sync_catalog', array['jsonb', 'jsonb', 'boolean', 'boolean'], array[]::text[],
  'anon cannot publish scraper catalogs'
);
select extensions.function_privs_are(
  'authenticated', 'public', 'food_scraper_sync_catalog', array['jsonb', 'jsonb', 'boolean', 'boolean'], array[]::text[],
  'ordinary authenticated users cannot publish scraper catalogs'
);
select extensions.function_privs_are(
  'service_role', 'public', 'food_scraper_sync_catalog', array['jsonb', 'jsonb', 'boolean', 'boolean'], array['EXECUTE'],
  'only the service role can publish scraper catalogs'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
)
values (
  '00000000-0000-0000-0000-00000000f001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'food-security@example.invalid', '',
  now(), now(), now()
) on conflict (id) do nothing;

insert into food.restaurants (id, scraper_key, name)
values ('00000000-0000-0000-0000-00000000f101', 'test-restaurant', 'Restaurante de prueba');

insert into food.menu_items (id, restaurant_id, scraper_key, category, name, price_cents)
values
  ('00000000-0000-0000-0000-00000000f201', '00000000-0000-0000-0000-00000000f101', 'dish-a', 'Platos', 'Plato A', 725),
  ('00000000-0000-0000-0000-00000000f202', '00000000-0000-0000-0000-00000000f101', 'dish-b', 'Platos', 'Plato B', 950);

insert into food.order_cycles (id, restaurant_id, created_by)
values ('00000000-0000-0000-0000-00000000f301', '00000000-0000-0000-0000-00000000f101', '00000000-0000-0000-0000-00000000f001');

create temporary table food_test_orders (label text primary key, result jsonb);
insert into food_test_orders values (
  'a', public.food_submit_order(
    '00000000-0000-0000-0000-00000000f301', 'Ana', null,
    '[{"menu_item_id":"00000000-0000-0000-0000-00000000f201","quantity":2,"note":"Salsa aparte","price_cents":1}]'::jsonb
  )
);
insert into food_test_orders values (
  'b', public.food_submit_order(
    '00000000-0000-0000-0000-00000000f301', 'Luis', null,
    '[{"menu_item_id":"00000000-0000-0000-0000-00000000f202","quantity":1}]'::jsonb
  )
);

select extensions.is(
  (public.food_get_order(
    ((select result from food_test_orders where label = 'a')->>'order_id')::uuid,
    (select result from food_test_orders where label = 'a')->>'edit_token'
  )->>'total_cents')::integer,
  1450,
  'client-supplied prices are ignored and trusted snapshots determine totals'
);

select extensions.throws_ok(
  format(
    'select public.food_get_order(%L::uuid, %L)',
    (select result->>'order_id' from food_test_orders where label = 'a'),
    (select result->>'edit_token' from food_test_orders where label = 'b')
  ),
  'P0001', 'FOOD_ORDER_NOT_FOUND',
  'an edit token cannot read another order'
);

select extensions.throws_ok(
  $$select public.food_submit_order(
    '00000000-0000-0000-0000-00000000f301', 'Mal', null,
    '[{"menu_item_id":"00000000-0000-0000-0000-00000000f201","quantity":21}]'::jsonb
  )$$,
  'P0001', 'FOOD_INVALID_INPUT',
  'out-of-range quantities are rejected'
);

update food.menu_items set is_available = false where id = '00000000-0000-0000-0000-00000000f202';
select extensions.throws_ok(
  $$select public.food_submit_order(
    '00000000-0000-0000-0000-00000000f301', 'Mal', null,
    '[{"menu_item_id":"00000000-0000-0000-0000-00000000f202","quantity":1}]'::jsonb
  )$$,
  'P0001', 'FOOD_INVALID_ITEMS',
  'unavailable menu items are rejected'
);

update food.menu_items set name = 'Nombre nuevo', price_cents = 5000
where id = '00000000-0000-0000-0000-00000000f201';
select extensions.is(
  (public.food_get_order(
    ((select result from food_test_orders where label = 'a')->>'order_id')::uuid,
    (select result from food_test_orders where label = 'a')->>'edit_token'
  )->'items'->0->>'item_name'),
  'Plato A',
  'historical item names remain immutable after scraper updates'
);

select extensions.is(
  (public.food_get_order(
    ((select result from food_test_orders where label = 'a')->>'order_id')::uuid,
    (select result from food_test_orders where label = 'a')->>'edit_token'
  )->'items'->0->>'unit_price_cents')::integer,
  725,
  'historical prices remain immutable after scraper updates'
);

select * from extensions.finish();
rollback;
