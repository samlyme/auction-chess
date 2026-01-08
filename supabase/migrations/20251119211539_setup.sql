revoke delete on table "public"."employees" from "anon";

revoke insert on table "public"."employees" from "anon";

revoke references on table "public"."employees" from "anon";

revoke select on table "public"."employees" from "anon";

revoke trigger on table "public"."employees" from "anon";

revoke truncate on table "public"."employees" from "anon";

revoke update on table "public"."employees" from "anon";

revoke delete on table "public"."employees" from "authenticated";

revoke insert on table "public"."employees" from "authenticated";

revoke references on table "public"."employees" from "authenticated";

revoke select on table "public"."employees" from "authenticated";

revoke trigger on table "public"."employees" from "authenticated";

revoke truncate on table "public"."employees" from "authenticated";

revoke update on table "public"."employees" from "authenticated";

revoke delete on table "public"."employees" from "service_role";

revoke insert on table "public"."employees" from "service_role";

revoke references on table "public"."employees" from "service_role";

revoke select on table "public"."employees" from "service_role";

revoke trigger on table "public"."employees" from "service_role";

revoke truncate on table "public"."employees" from "service_role";

revoke update on table "public"."employees" from "service_role";

alter table "public"."employees" drop constraint "employees_pkey";

drop index if exists "public"."employees_pkey";

drop table "public"."employees";


  create table "public"."profiles" (
    "id" uuid not null default auth.uid(),
    "created_at" timestamp with time zone not null default now(),
    "username" text not null,
    "bio" text not null
      );


alter table "public"."profiles" enable row level security;

alter table "public"."lobbies" add column "config" jsonb not null default '{}'::jsonb;

alter table "public"."lobbies" add column "guest_uid" uuid;

alter table "public"."lobbies" add column "host_uid" uuid not null default auth.uid();

CREATE UNIQUE INDEX lobbies_code_key ON public.lobbies USING btree (code);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."lobbies" add constraint "lobbies_code_key" UNIQUE using index "lobbies_code_key";

alter table "public"."lobbies" add constraint "lobbies_guest_uid_fkey" FOREIGN KEY (guest_uid) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."lobbies" validate constraint "lobbies_guest_uid_fkey";

alter table "public"."lobbies" add constraint "lobbies_host_uid_fkey" FOREIGN KEY (host_uid) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."lobbies" validate constraint "lobbies_host_uid_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

grant delete on table "public"."lobbies" to "postgres";

grant insert on table "public"."lobbies" to "postgres";

grant references on table "public"."lobbies" to "postgres";

grant select on table "public"."lobbies" to "postgres";

grant trigger on table "public"."lobbies" to "postgres";

grant truncate on table "public"."lobbies" to "postgres";

grant update on table "public"."lobbies" to "postgres";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "postgres";

grant insert on table "public"."profiles" to "postgres";

grant references on table "public"."profiles" to "postgres";

grant select on table "public"."profiles" to "postgres";

grant trigger on table "public"."profiles" to "postgres";

grant truncate on table "public"."profiles" to "postgres";

grant update on table "public"."profiles" to "postgres";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";


  create policy "Enable delete for users based on user id"
  on "public"."profiles"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = id));



  create policy "Enable insert for users based on user id"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = id));



  create policy "Enable read access for all users"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Enable update for users based on user id"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((( SELECT auth.uid() AS uid) = id))
with check ((( SELECT auth.uid() AS uid) = id));



