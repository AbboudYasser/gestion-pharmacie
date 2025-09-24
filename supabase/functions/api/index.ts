// supabase/functions/api/index.ts
// النسخة النهائية والمصححة

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import * as bcrypt from "https://esm.sh/bcryptjs@2.4.3";

serve(async (req ) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  try {
    const { action, payload } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // --- الموزع الذكي: switch واحد فقط لجميع الإجراءات ---
    switch (action) {
      case "LOGIN_USER": {
        const { email, password } = payload;
        if (!email || !password) throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان.");

        const { data: user, error } = await supabaseAdmin.from("users").select("id, password, role").eq("email", email).single();
        if (error || !user) throw new Error("بيانات الاعتماد غير صحيحة.");
        if (user.password === null) throw new Error("هذا الحساب لم يقم بتعيين كلمة مرور بعد. استخدم 'كلمة مرور جديدة؟'.");

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) throw new Error("بيانات الاعتماد غير صحيحة.");

        return new Response(JSON.stringify({ message: "تم تسجيل الدخول بنجاح!", userId: user.id, userRole: user.role }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "SETUP_PASSWORD": {
        const { email, newPassword } = payload;
        if (!email || !newPassword) throw new Error("البريد الإلكتروني وكلمة المرور الجديدة مطلوبان.");
        if (newPassword.length < 8) throw new Error("يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.");

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const { error } = await supabaseAdmin.from("users").update({ password: hashedPassword }).eq("email", email);
        if (error) throw new Error("فشل تحديث كلمة المرور: " + error.message);

        return new Response(JSON.stringify({ message: "تم تعيين كلمة المرور بنجاح!" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "CHECK_USER_EXISTS": {
        const { email } = payload;
        if (!email) throw new Error("البريد الإلكتروني مطلوب.");

        const { data: user, error } = await supabaseAdmin.from("users").select("prenom, nom, password").eq("email", email).single();
        if (error || !user) throw new Error("لا يوجد حساب مرتبط بهذا البريد الإلكتروني.");
        if (user.password !== null) throw new Error("هذا الحساب لديه كلمة مرور بالفعل. يمكنك تسجيل الدخول مباشرة.");

        return new Response(JSON.stringify({ prenom: user.prenom, nom: user.nom }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      default:
        throw new Error(`الإجراء '${action}' غير معروف أو غير صالح.`);
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
