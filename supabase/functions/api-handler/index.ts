// supabase/functions/api-handler/index.ts
// واجهة API آمنة للتعامل مع عمليات قاعدة البيانات - محدثة لبنية قاعدة البيانات الجديدة

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOptions } from "../_shared/cors.ts";
import { createSupabaseAdmin, createErrorResponse, createSuccessResponse, handleError } from "../_shared/utils.ts";

// قائمة الجداول المسموح بالوصول إليها (محدثة حسب بنية قاعدة البيانات الجديدة)
const ALLOWED_TABLES = [
  // الجداول الأساسية
  'users', 'patients', 'fournisseur', 'produit', 'service', 'magasin',
  
  // جداول الطلبات والتوريد
  'bon_cmde_four', 'bon_cmde_serv', 'bon_liv_four', 'bon_liv_serv',
  'detail_cmde_four', 'detail_cmde_serv', 'detail_liv_four', 'detail_liv_serv',
  
  // جداول الفواتير والاستلام
  'facture', 'bon_recp', 'decharge', 'detail_decharge'
];

// قائمة العمليات المسموحة (طبقة أمان)
const ALLOWED_METHODS = [
  'select', 'insert', 'update', 'upsert', 'delete'
];

/**
 * التحقق من أن الطلب آمن
 * يمكن تطوير هذه الدالة لاحقاً لإضافة التحقق من التوكن
 */
function isAuthorized(req: Request): boolean {
  // حالياً نسمح بجميع الطلبات، لكن يمكن إضافة التحقق من التوكن هنا
  // مثال: return req.headers.get('Authorization') === 'Bearer YOUR_SECRET_TOKEN';
  return true;
}

/**
 * التحقق من صحة معاملات الطلب
 */
function validateRequest(table: string, method: string): void {
  if (!table || !ALLOWED_TABLES.includes(table)) {
    throw new Error(`الجدول '${table}' غير مسموح أو غير موجود.`);
  }
  
  if (!method || !ALLOWED_METHODS.includes(method)) {
    throw new Error(`العملية '${method}' غير مسموحة.`);
  }
}

/**
 * إضافة الاستعلامات المخصصة للجداول المترابطة
 */
function buildSelectQuery(supabaseAdmin: any, table: string, select?: string) {
  const defaultSelects: { [key: string]: string } = {
    // استعلام المنتجات مع معلومات المخزن
    'produit': `
      ref_prod,
      desig_prod,
      p_u,
      typ_prod,
      qte_stc,
      num_mag,
      magasin (
        num_mag,
        stok_ini,
        stok_fin
      )
    `,
    
    // استعلام المستخدمين مع معلومات الخدمة والمورد
    'users': `
      id,
      prenom,
      nom,
      email,
      telephone,
      type_piece,
      num_piece,
      role,
      num_serv,
      is_active,
      created_at,
      service (
        num_serv,
        desig_serv
      ),
      fournisseur (
        cod_four,
        nom_four
      )
    `,
    
    // استعلام طلبات الموردين مع التفاصيل
    'bon_cmde_four': `
      num_bon_cmde_four,
      dat_cmde_four,
      cod_four,
      fournisseur (
        nom_four,
        adres_four,
        num_tel_four
      ),
      detail_cmde_four (
        ref_prod,
        qte_dm_four,
        produit (
          desig_prod,
          p_u,
          typ_prod
        )
      )
    `,
    
    // استعلام طلبات الخدمات مع التفاصيل
    'bon_cmde_serv': `
      num_bon_cmde_serv,
      dat_cmde_serv,
      num_serv,
      service (
        desig_serv
      ),
      detail_cmde_serv (
        ref_prod,
        qte_dat_serv,
        produit (
          desig_prod,
          p_u,
          typ_prod
        )
      )
    `,
    
    // استعلام الفواتير مع معلومات المورد
    'facture': `
      num_fact,
      dat_fact,
      montant,
      cod_four,
      fournisseur (
        nom_four,
        adres_four
      )
    `
  };

  const selectClause = select || defaultSelects[table] || '*';
  return supabaseAdmin.from(table).select(selectClause);
}

serve(async (req) => {
  // التعامل مع طلبات OPTIONS
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  try {
    // التحقق من الصلاحيات
    if (!isAuthorized(req)) {
      return createErrorResponse("غير مصرح لك بالوصول.", 401);
    }

    // استلام البيانات من الطلب
    const { table, method, payload, match, select, filters } = await req.json();

    // التحقق من صحة المعاملات
    validateRequest(table, method);

    // إنشاء عميل Supabase Admin
    const supabaseAdmin = createSupabaseAdmin();

    // بناء الاستعلام
    let query;
    
    switch (method) {
      case 'select':
        query = buildSelectQuery(supabaseAdmin, table, select);
        break;
      case 'insert':
        if (!payload) throw new Error("البيانات مطلوبة للإدراج.");
        query = supabaseAdmin.from(table).insert(payload);
        break;
      case 'update':
        if (!payload) throw new Error("البيانات مطلوبة للتحديث.");
        query = supabaseAdmin.from(table).update(payload);
        break;
      case 'upsert':
        if (!payload) throw new Error("البيانات مطلوبة للإدراج/التحديث.");
        query = supabaseAdmin.from(table).upsert(payload);
        break;
      case 'delete':
        query = supabaseAdmin.from(table).delete();
        break;
      default:
        throw new Error(`العملية '${method}' غير مدعومة.`);
    }

    // إضافة شروط البحث إذا وجدت
    if (match && typeof match === 'object') {
      for (const [key, value] of Object.entries(match)) {
        query = query.eq(key, value);
      }
    }

    // إضافة فلاتر إضافية للبحث المتقدم
    if (filters && typeof filters === 'object') {
      // فلتر البحث النصي
      if (filters.search && table === 'produit') {
        query = query.or(`desig_prod.ilike.%${filters.search}%,ref_prod.ilike.%${filters.search}%`);
      }
      if (filters.search && table === 'fournisseur') {
        query = query.or(`nom_four.ilike.%${filters.search}%,cod_four.ilike.%${filters.search}%`);
      }
      if (filters.search && table === 'patients') {
        query = query.or(`full_name.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
      }
      
      // فلتر المخزون المنخفض
      if (filters.low_stock && table === 'produit') {
        query = query.lt('qte_stc', filters.low_stock_threshold || 10);
      }
      
      // فلتر نوع المنتج
      if (filters.typ_prod && table === 'produit') {
        query = query.eq('typ_prod', filters.typ_prod);
      }
      
      // فلتر التاريخ
      if (filters.date_from) {
        const dateColumn = getDateColumn(table);
        if (dateColumn) {
          query = query.gte(dateColumn, filters.date_from);
        }
      }
      if (filters.date_to) {
        const dateColumn = getDateColumn(table);
        if (dateColumn) {
          query = query.lte(dateColumn, filters.date_to);
        }
      }
      
      // ترتيب النتائج
      if (filters.order_by) {
        const ascending = filters.order_direction !== 'desc';
        query = query.order(filters.order_by, { ascending });
      }
      
      // تحديد عدد النتائج
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
    }

    // تنفيذ الاستعلام
    const { data, error } = await query;

    if (error) {
      throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
    }

    return createSuccessResponse(data);

  } catch (error) {
    return handleError(error);
  }
});

/**
 * الحصول على عمود التاريخ المناسب لكل جدول
 */
function getDateColumn(table: string): string | null {
  const dateColumns: { [key: string]: string } = {
    'bon_cmde_four': 'dat_cmde_four',
    'bon_cmde_serv': 'dat_cmde_serv',
    'bon_liv_four': 'dat_liv_four',
    'bon_liv_serv': 'dat_liv_serv',
    'facture': 'dat_fact',
    'bon_recp': 'dat_recp',
    'decharge': 'dat_dech',
    'users': 'created_at'
  };
  
  return dateColumns[table] || null;
}
