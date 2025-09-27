// supabase/functions/login-user/index.ts
// وظيفة تسجيل دخول المستخدمين مع التحقق من كلمات المرور المشفرة

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOptions } from "../_shared/cors.ts";
import { createSupabaseAdmin, createErrorResponse, createSuccessResponse, validateEmail, handleError } from "../_shared/utils.ts";
import { compare } from "https://esm.sh/bcryptjs@2.4.3";

serve(async (req) => {
  // التعامل مع طلبات OPTIONS
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  try {
    // استلام البيانات من الطلب
    const { email, password } = await req.json();
    
    // التحقق من وجود البيانات المطلوبة
    if (!email || !password) {
      throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان.");
    }
    
    // التحقق من صحة البريد الإلكتروني
    if (!validateEmail(email)) {
      throw new Error("البريد الإلكتروني غير صحيح.");
    }

    // إنشاء عميل Supabase Admin
    const supabaseAdmin = createSupabaseAdmin();

    // البحث عن المستخدم في قاعدة البيانات
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, password, role, prenom, nom")
      .eq("email", email)
      .single();

    // التحقق من وجود المستخدم
    if (userError || !user) {
      throw new Error("بيانات الاعتماد غير صحيحة.");
    }
    
    // التحقق من أن المستخدم قام بتعيين كلمة مرور
    if (user.password === null) {
      throw new Error("هذا الحساب لم يقم بتعيين كلمة مرور بعد. استخدم 'كلمة مرور جديدة؟'.");
    }

    // التحقق من صحة كلمة المرور
    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("بيانات الاعتماد غير صحيحة.");
    }

    // إرجاع بيانات النجاح
    const responseData = {
      message: "تم تسجيل الدخول بنجاح!",
      userId: user.id,
      userRole: user.role,
      userName: `${user.prenom} ${user.nom}`
    };
    
    return createSuccessResponse(responseData);
    
  } catch (error) {
    return handleError(error);
  }
});
