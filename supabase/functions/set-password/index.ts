import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
// --- الإصلاح 1: استبدال مكتبة التشفير ---
import * as bcrypt from "https://esm.sh/bcryptjs@2.4.3";

serve(async (req ) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  try {
    const body = await req.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) throw new Error("البريد الإلكتروني وكلمة المرور الجديدة مطلوبان.");
    if (newPassword.length < 8) throw new Error("يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.");

    // --- الإصلاح 2: استخدام الطريقة الصحيحة لجلب متغيرات البيئة ---
    const env = Deno.env.toObject();
    const supabaseAdmin = createClient(
      env.SUPABASE_URL ?? "",
      env.SUPABASE_SERVICE_ROLE_KEY ?? ""
    );

    // --- الإصلاح 3: استخدام الدالة المتزامنة من bcryptjs ---
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password: hashedPassword })
      .eq("email", email);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      throw new Error("فشل تحديث كلمة المرور. تأكد من صحة البريد الإلكتروني.");
    }

    return new Response(JSON.stringify({ message: "تم تعيين كلمة المرور بنجاح!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in set-password function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
