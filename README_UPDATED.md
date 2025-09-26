# نظام إدارة الصيدلية - محدث لبنية قاعدة البيانات الجديدة

## نظرة عامة

نظام شامل لإدارة صيدلية المستشفى يتضمن إدارة المخزون، المرضى، الموردين، والتقارير. تم تحديث النظام ليتوافق مع بنية قاعدة البيانات الجزائرية الجديدة.

## التحديثات الجديدة

### 🔄 التحديثات الرئيسية
- **تحديث بنية قاعدة البيانات**: توافق كامل مع الجداول الجديدة
- **تحسين Supabase Edge Functions**: إصلاح الأخطاء وتحسين الأمان
- **واجهة مستخدم محدثة**: تصميم حديث ومتجاوب
- **نظام API موحد**: ملف api.js شامل لجميع العمليات
- **بيانات تجريبية**: نظام fallback للاختبار بدون قاعدة بيانات

### 📊 الجداول المدعومة
```sql
-- الجداول الرئيسية
- produit (المنتجات/الأدوية)
- fournisseur (الموردين)
- patients (المرضى)
- service (الخدمات)
- magasin (المخازن)
- users (المستخدمين)

-- جداول الطلبات والتسليم
- bon_cmde_four (أوامر الشراء من الموردين)
- bon_liv_four (إيصالات التسليم من الموردين)
- bon_cmde_serv (أوامر الطلب للخدمات)
- bon_liv_serv (إيصالات التسليم للخدمات)

-- جداول التفاصيل
- det_bon_cmde_four (تفاصيل أوامر الشراء)
- det_bon_liv_four (تفاصيل إيصالات التسليم)
- det_bon_cmde_serv (تفاصيل طلبات الخدمات)
- det_bon_liv_serv (تفاصيل تسليم الخدمات)
```

## بنية المشروع

```
gestion-pharmacie/
├── frontend/                    # الواجهة الأمامية
│   ├── css/                    # ملفات التنسيق
│   ├── js/                     # ملفات JavaScript
│   │   ├── config.js          # إعدادات Supabase
│   │   ├── api.js             # API موحد (جديد)
│   │   ├── stock.js           # إدارة المخزون (محدث)
│   │   ├── patients.js        # إدارة المرضى (محدث)
│   │   ├── fournisseurs.js    # إدارة الموردين (محدث)
│   │   ├── dashboard.js       # لوحة التحكم
│   │   ├── login.js           # تسجيل الدخول
│   │   └── utils.js           # دوال مساعدة
│   ├── login.html             # صفحة تسجيل الدخول
│   ├── dashboard.html         # لوحة التحكم
│   ├── stock.html             # إدارة المخزون (محدث)
│   ├── patients.html          # إدارة المرضى (محدث)
│   └── fournisseurs.html      # إدارة الموردين (محدث)
├── supabase/                   # Supabase Edge Functions
│   └── functions/
│       ├── _shared/           # ملفات مشتركة (جديد)
│       │   ├── cors.ts        # إعدادات CORS
│       │   └── utils.ts       # دوال مساعدة مشتركة
│       ├── login-user/        # تسجيل الدخول (محدث)
│       ├── set-password/      # تعيين كلمة المرور (محدث)
│       ├── api-handler/       # معالج API الرئيسي (محدث)
│       └── api/               # API عام (محدث)
├── database_schema.sql        # بنية قاعدة البيانات (جديد)
├── test_platform.html         # صفحة اختبار شاملة (جديد)
└── README_UPDATED.md          # هذا الملف
```

## التثبيت والإعداد

### 1. إعداد Supabase

```bash
# تثبيت Supabase CLI
npm install -g @supabase/cli

# تسجيل الدخول
supabase login

# ربط المشروع
supabase link --project-ref YOUR_PROJECT_ID
```

### 2. إعداد قاعدة البيانات

```sql
-- تشغيل ملف بنية قاعدة البيانات
-- في Supabase Dashboard > SQL Editor
-- نسخ ولصق محتوى database_schema.sql
```

### 3. نشر Edge Functions

```bash
# نشر جميع الوظائف
supabase functions deploy login-user
supabase functions deploy set-password
supabase functions deploy api-handler
supabase functions deploy api

# أو نشر جميع الوظائف مرة واحدة
supabase functions deploy
```

### 4. إعداد الواجهة الأمامية

```javascript
// تحديث frontend/js/config.js
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

## الميزات الجديدة

### 🔧 نظام API موحد
- ملف `api.js` شامل لجميع العمليات
- معالجة أخطاء محسنة
- نظام إشعارات موحد
- دعم البيانات التجريبية

### 📱 واجهة مستخدم محسنة
- تصميم متجاوب مع Bootstrap 5
- أيقونات Font Awesome
- خطوط Cairo العربية
- انتقالات سلسة وتأثيرات بصرية

### 🔒 أمان محسن
- تشفير كلمات المرور مع bcrypt
- التحقق من صحة البيانات
- حماية من SQL Injection
- إدارة جلسات آمنة

### 📊 إدارة البيانات
- دعم كامل للجداول الجديدة
- فلترة وبحث متقدم
- تصدير البيانات CSV
- ترقيم الصفحات

## الاختبار

### اختبار سريع
```bash
# فتح صفحة الاختبار في المتصفح
open test_platform.html
```

### اختبار يدوي
1. **تسجيل الدخول**: `login.html`
2. **لوحة التحكم**: `dashboard.html`
3. **إدارة المخزون**: `stock.html`
4. **إدارة المرضى**: `patients.html`
5. **إدارة الموردين**: `fournisseurs.html`

## استكشاف الأخطاء

### مشاكل شائعة

#### 1. خطأ في الاتصال بـ Supabase
```javascript
// التحقق من إعدادات config.js
console.log('Supabase URL:', SUPABASE_CONFIG.url);
console.log('Anon Key:', SUPABASE_CONFIG.anonKey);
```

#### 2. Edge Functions لا تعمل
```bash
# التحقق من حالة الوظائف
supabase functions list

# عرض سجلات الأخطاء
supabase functions logs login-user
```

#### 3. مشاكل في قاعدة البيانات
```sql
-- التحقق من وجود الجداول
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### وضع البيانات التجريبية
إذا لم تكن قاعدة البيانات متوفرة، سيعمل النظام بالبيانات التجريبية:
- منتجات وهمية في المخزون
- مرضى تجريبيون
- موردين افتراضيين
- إحصائيات محاكاة

## التطوير

### إضافة ميزات جديدة

#### 1. إضافة صفحة جديدة
```html
<!-- إنشاء ملف HTML جديد -->
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<!-- استخدام نفس بنية الصفحات الموجودة -->
```

#### 2. إضافة وظيفة Edge Function جديدة
```typescript
// supabase/functions/new-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // منطق الوظيفة هنا
})
```

#### 3. تحديث API
```javascript
// إضافة دالة جديدة في frontend/js/api.js
const PharmacyAPI = {
  // الدوال الموجودة...
  
  newFunction: async function(data) {
    // منطق الدالة الجديدة
  }
};
```

## الأمان

### أفضل الممارسات
- ✅ تشفير كلمات المرور
- ✅ التحقق من صحة البيانات
- ✅ حماية من XSS
- ✅ إدارة جلسات آمنة
- ✅ تسجيل العمليات

### إعدادات الأمان
```javascript
// في Edge Functions
const validateInput = (data) => {
  // التحقق من صحة البيانات
};

const sanitizeOutput = (data) => {
  // تنظيف البيانات المخرجة
};
```

## الدعم والمساعدة

### الموارد المفيدة
- [Supabase Documentation](https://supabase.com/docs)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.1/)
- [Font Awesome Icons](https://fontawesome.com/icons)

### المساهمة
1. Fork المشروع
2. إنشاء branch جديد
3. إضافة التحسينات
4. إرسال Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT. راجع ملف LICENSE للتفاصيل.

---

## ملاحظات التحديث

### التغييرات المهمة
- **تم تحديث جميع ملفات JavaScript** لتتوافق مع بنية قاعدة البيانات الجديدة
- **تم إصلاح Supabase Edge Functions** وإضافة دوال مساعدة مشتركة
- **تم تحديث واجهة المستخدم** بتصميم حديث ومتجاوب
- **تم إضافة نظام اختبار شامل** للتحقق من سلامة النظام

### الملفات الجديدة
- `frontend/js/api.js` - API موحد
- `supabase/functions/_shared/utils.ts` - دوال مساعدة مشتركة
- `database_schema.sql` - بنية قاعدة البيانات
- `test_platform.html` - صفحة اختبار شاملة
- `README_UPDATED.md` - هذا الملف

### الملفات المحدثة
- جميع ملفات JavaScript في `frontend/js/`
- جميع ملفات HTML في `frontend/`
- جميع Edge Functions في `supabase/functions/`

تم التحديث بتاريخ: سبتمبر 2024
