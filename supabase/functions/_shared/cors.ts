// supabase/functions/_shared/cors.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://abboudyasser.github.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true' // إضافة هذا الرأس
}

export function handleOptions(req: Request ) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 }) // التأكد من حالة 200 OK
  }
  return null;
}
