// supabase/functions/_shared/utils.ts
// ملف مساعد مشترك لتقليل التكرار في وظائف Supabase Edge Functions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";

/**
 * إنشاء عميل Supabase Admin باستخدام SERVICE_ROLE_KEY
 * @returns عميل Supabase مع صلاحيات المدير
 */
export function createSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}

/**
 * إرجاع استجابة خطأ موحدة
 * @param message رسالة الخطأ
 * @param status رمز الحالة (افتراضي: 400)
 * @returns Response object
 */
export function createErrorResponse(message: string, status: number = 400) {
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

/**
 * إرجاع استجابة نجاح موحدة
 * @param data البيانات المراد إرجاعها
 * @param status رمز الحالة (افتراضي: 200)
 * @returns Response object
 */
export function createSuccessResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

/**
 * التحقق من صحة البريد الإلكتروني
 * @param email البريد الإلكتروني
 * @returns true إذا كان صحيحاً
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * التحقق من قوة كلمة المرور
 * @param password كلمة المرور
 * @returns true إذا كانت قوية (8 أحرف على الأقل)
 */
export function validatePassword(password: string): boolean {
  return password && typeof password === 'string' && password.length >= 8;
}

/**
 * معالج الأخطاء الشامل
 * @param error الخطأ
 * @returns Response object
 */
export function handleError(error: any) {
  console.error('Error:', error);
  
  // إذا كان الخطأ يحتوي على رسالة مخصصة، استخدمها
  if (error.message) {
    return createErrorResponse(error.message);
  }
  
  // خطأ عام
  return createErrorResponse("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
}
