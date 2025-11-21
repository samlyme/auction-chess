import "@supabase/functions-js"
import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { corsHeaders } from "../_shared/cors.ts";


const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_KEY')!)

const app = new Hono().basePath("/lobbies")

app.use(cors({
  origin: corsHeaders["Access-Control-Allow-Origin"],
  allowHeaders: corsHeaders["Access-Control-Allow-Headers"]
}))


app.get('/', (c) => {
  console.log(c.req);
  return c.text('hello world!')
})

app.post('/', (c) => {
  return c.json({ code: 'LMFAO'})
})

Deno.serve(app.fetch)