// supabase/functions/api/index.ts
// نقطة نهاية API عامة للعمليات المختلفة

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOptions } from "../_shared/cors.ts";
import { createSupabaseAdmin, createErrorResponse, createSuccessResponse, validateEmail, handleError } from "../_shared/utils.ts";
import * as bcrypt from "https://esm.sh/bcryptjs@2.4.3";

serve(async (req) => {
  // التعامل مع طلبات OPTIONS
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  try {
    // التحقق من أن الطلب هو POST
    if (req.method !== 'POST') {
      throw new Error('Method Not Allowed: Only POST requests are accepted.');
    }

    // استلام البيانات من الطلب
    const { action, payload } = await req.json();
    
    if (!action) {
      throw new Error("Action is missing from the request body.");
    }

    // إنشاء عميل Supabase Admin
    const supabaseAdmin = createSupabaseAdmin();

    // معالجة العمليات المختلفة
    switch (action) {
      case "CHECK_USER_EXISTS": {
        const { email } = payload;
        
        if (!email) {
          throw new Error("Email is required for CHECK_USER_EXISTS.");
        }
        
        if (!validateEmail(email)) {
          throw new Error("البريد الإلكتروني غير صحيح.");
        }
        
        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("prenom, nom, password")
          .eq("email", email)
          .single();
          
        if (error || !user) {
          throw new Error("No account found with this email.");
        }
        
        if (user.password !== null) {
          throw new Error("This account already has a password.");
        }
        
        return createSuccessResponse({ 
          prenom: user.prenom, 
          nom: user.nom 
        });
      }
      
      case "GET_DASHBOARD_STATS": {
        // إحصائيات لوحة التحكم
        const stats = {
          prescriptions: {
            total: 150,
            today: 12,
            pending: 8
          },
          inventory: {
            total_medications: 245,
            low_stock: 15,
            expired_soon: 3
          },
          suppliers: {
            total: 25,
            pending_orders: 7
          }
        };
        
        return createSuccessResponse(stats);
      }
      
      case "GET_LOW_STOCK_ITEMS": {
        // عناصر المخزون المنخفض (بيانات تجريبية)
        const lowStockItems = [
          {
            id: 1,
            name: "باراسيتامول 500mg",
            quantity: 15,
            unit: "علبة",
            minimum_stock: 50,
            status: "مخزون منخفض"
          },
          {
            id: 2,
            name: "أموكسيسيلين 250mg",
            quantity: 8,
            unit: "علبة",
            minimum_stock: 30,
            status: "مخزون منخفض"
          }
        ];
        
        return createSuccessResponse(lowStockItems);
      }
      
      default:
        throw new Error(`Invalid action: '${action}'.`);
    }
    
  } catch (error) {
    return handleError(error);
  }
});
