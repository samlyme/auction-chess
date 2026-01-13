drop policy "Enable read access for authenticated users" on "public"."lobbies";

revoke delete on table "public"."lobbies" from "anon";

revoke insert on table "public"."lobbies" from "anon";

revoke references on table "public"."lobbies" from "anon";

revoke select on table "public"."lobbies" from "anon";

revoke trigger on table "public"."lobbies" from "anon";

revoke truncate on table "public"."lobbies" from "anon";

revoke update on table "public"."lobbies" from "anon";

revoke delete on table "public"."lobbies" from "authenticated";

revoke insert on table "public"."lobbies" from "authenticated";

revoke references on table "public"."lobbies" from "authenticated";

revoke select on table "public"."lobbies" from "authenticated";

revoke trigger on table "public"."lobbies" from "authenticated";

revoke truncate on table "public"."lobbies" from "authenticated";

revoke update on table "public"."lobbies" from "authenticated";

revoke delete on table "public"."lobbies" from "service_role";

revoke insert on table "public"."lobbies" from "service_role";

revoke references on table "public"."lobbies" from "service_role";

revoke select on table "public"."lobbies" from "service_role";

revoke trigger on table "public"."lobbies" from "service_role";

revoke truncate on table "public"."lobbies" from "service_role";

revoke update on table "public"."lobbies" from "service_role";

alter table "public"."lobbies" drop constraint "lobbies_code_key";

alter table "public"."lobbies" drop constraint "lobbies_guest_uid_fkey";

alter table "public"."lobbies" drop constraint "lobbies_host_uid_fkey";

alter table "public"."lobbies" drop constraint "lobbies_pkey";

drop index if exists "public"."lobbies_code_key";

drop index if exists "public"."lobbies_pkey";

drop table "public"."lobbies";


