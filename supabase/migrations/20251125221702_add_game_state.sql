alter table "public"."lobbies" add column "game_state" jsonb;


  create policy "Enable read access for authenticated users"
  on "public"."lobbies"
  as permissive
  for select
  to authenticated
using (true);



