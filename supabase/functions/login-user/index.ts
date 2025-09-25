// supabase/functions/login-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import * as bcrypt from "https://esm.sh/bcryptjs@2.4.3";

serve(async (req ) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  try {
    const { email, password } = await req.json();
    if (!email || !password) throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان.");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, password, role")
      .eq("email", email)
      .single();

    if (userError || !user) throw new Error("بيانات الاعتماد غير صحيحة.");
    if (user.password === null) throw new Error("هذا الحساب لم يقم بتعيين كلمة مرور بعد. استخدم 'كلمة مرور جديدة؟'.");

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) throw new Error("بيانات الاعتماد غير صحيحة.");

    const responseData = { message: "تم تسجيل الدخول بنجاح!", userId: user.id, userRole: user.role };
    return new Response(JSON.stringify(responseData), {
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
