// supabase/functions/api-handler/index.ts
// هذه هي الواجهة الخلفية (الوسيط الآمن) الجديدة الخاصة بك

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";

// دالة للتحقق من أن الطلب آمن (يمكن تطويرها لاحقًا )
function isAuthorized(req: Request): boolean {
  // حاليًا، سنسمح بالطلبات، ولكن في المستقبل يمكننا إضافة التحقق من التوكن هنا
  // على سبيل المثال: return req.headers.get('Authorization') === 'Bearer YOUR_SECRET_TOKEN';
  return true;
}

serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  // --- طبقة الأمان الأولى: التحقق من الصلاحيات ---
  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    // استلام "الأمر" من الواجهة الأمامية
    const { table, method, payload, match } = await req.json();

    if (!table || !method) {
      throw new Error("Table and method are required.");
    }

    // --- طبقة الأمان الثانية: استخدام مفتاح المدير السري ---
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let query = supabaseAdmin.from(table)[method](payload);

    // إذا كان هناك شرط (مثل "where email = ...")
    if (match) {
      query = query.match(match);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
