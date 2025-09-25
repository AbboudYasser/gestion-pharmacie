// supabase/functions/api/index.ts (نسخة التشخيص)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import * as bcrypt from "https://esm.sh/bcryptjs@2.4.3";

serve(async (req ) => {
  // التعامل مع OPTIONS أولاً
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  try {
    // التحقق من أن الطلب هو POST
    if (req.method !== 'POST') {
      throw new Error('Method Not Allowed: Only POST requests are accepted.');
    }

    const { action, payload } = await req.json();
    if (!action) throw new Error("Action is missing from the request body.");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- المنطق الرئيسي ---
    switch (action) {
      case "CHECK_USER_EXISTS": {
        const { email } = payload;
        if (!email) throw new Error("Email is required for CHECK_USER_EXISTS.");
        const { data: user, error } = await supabaseAdmin.from("users").select("prenom, nom, password").eq("email", email).single();
        if (error || !user) throw new Error("No account found with this email.");
        if (user.password !== null) throw new Error("This account already has a password.");
        return new Response(JSON.stringify({ prenom: user.prenom, nom: user.nom }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
      }
      // ... أضف الحالات الأخرى هنا إذا لزم الأمر
      default:
        throw new Error(`Invalid action: '${action}'.`);
    }
  } catch (e) {
    // --- معالج الأخطاء الشامل والجديد ---
    // هذا سيضمن دائمًا إرجاع رسالة خطأ واضحة
    const errorResponse = {
      error: e.message,
      stack: e.stack, // لإظهار تفاصيل الخطأ الكاملة في الـ Console
    };
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400, // استخدام 400 للأخطاء المتوقعة
    });
  }
});
