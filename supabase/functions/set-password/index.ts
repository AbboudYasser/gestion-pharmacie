// supabase/functions/set-password/index.ts
// وظيفة تعيين كلمة مرور جديدة للمستخدمين

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOptions } from "../_shared/cors.ts";
import { createSupabaseAdmin, createErrorResponse, createSuccessResponse, validateEmail, validatePassword, handleError } from "../_shared/utils.ts";
import { hash } from "https://esm.sh/bcryptjs@2.4.3";

serve(async (req) => {
  // التعامل مع طلبات OPTIONS
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  try {
    // استلام البيانات من الطلب
    const { email, newPassword } = await req.json();
    
    // التحقق من وجود البيانات المطلوبة
    if (!email || !newPassword) {
      throw new Error("البريد الإلكتروني وكلمة المرور الجديدة مطلوبان.");
    }
    
    // التحقق من صحة البريد الإلكتروني
    if (!validateEmail(email)) {
      throw new Error("البريد الإلكتروني غير صحيح.");
    }
    
    // التحقق من قوة كلمة المرور
    if (!validatePassword(newPassword)) {
      throw new Error("يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.");
    }

    // إنشاء عميل Supabase Admin
    const supabaseAdmin = createSupabaseAdmin();

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await hash(newPassword, 10);
    
    // تحديث كلمة المرور في قاعدة البيانات
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password: hashedPassword })
      .eq("email", email);

    if (updateError) {
      throw new Error("فشل تحديث كلمة المرور. تأكد من صحة البريد الإلكتروني.");
    }

    // إرجاع رسالة النجاح
    return createSuccessResponse({ message: "تم تعيين كلمة المرور بنجاح!" });
    
  } catch (error) {
    return handleError(error);
  }
});
