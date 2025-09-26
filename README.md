# نظام إدارة الصيدلية

نظام شامل لإدارة صيدليات المستشفيات الحكومية في الجزائر، مطور باستخدام HTML، CSS، JavaScript، و Supabase.

## المميزات الرئيسية

- **إدارة المخزون**: تتبع الأدوية والمستلزمات الطبية مع تنبيهات المخزون المنخفض
- **إدارة المرضى**: نظام شامل لإدارة بيانات المرضى والوصفات الطبية
- **إدارة الموردين**: تتبع الموردين وطلبات الشراء
- **إدارة المستخدمين**: نظام أدوار وصلاحيات متعدد المستويات
- **لوحة تحكم تفاعلية**: إحصائيات وتقارير في الوقت الفعلي
- **أمان عالي**: تشفير كلمات المرور ونظام مصادقة آمن

## التقنيات المستخدمة

### الواجهة الأمامية
- **HTML5**: بنية الصفحات
- **CSS3**: التصميم والتنسيق
- **JavaScript (Vanilla)**: المنطق والتفاعل
- **Font Awesome**: الأيقونات
- **Google Fonts (Cairo)**: الخطوط العربية

### الواجهة الخلفية وقاعدة البيانات
- **Supabase**: قاعدة البيانات والمصادقة
- **Supabase Edge Functions**: API مخصص باستخدام Deno
- **bcryptjs**: تشفير كلمات المرور
- **EmailJS**: إرسال رسائل البريد الإلكتروني

## بنية المشروع

```
gestion-pharmacie/
├── frontend/                 # الواجهة الأمامية
│   ├── css/                 # ملفات التصميم
│   │   ├── style.css        # الأنماط العامة
│   │   ├── dashboard.css    # أنماط لوحة التحكم
│   │   ├── login.css        # أنماط صفحة تسجيل الدخول
│   │   ├── stock.css        # أنماط صفحة المخزون
│   │   └── ...
│   ├── js/                  # ملفات JavaScript
│   │   ├── config.js        # إعدادات Supabase
│   │   ├── api.js           # طبقة API موحدة
│   │   ├── utils.js         # دوال مساعدة
│   │   ├── login.js         # منطق تسجيل الدخول
│   │   ├── dashboard.js     # منطق لوحة التحكم
│   │   ├── stock.js         # منطق إدارة المخزون
│   │   └── ...
│   ├── images/              # الصور والأيقونات
│   ├── index.html           # الصفحة الرئيسية
│   ├── login.html           # صفحة تسجيل الدخول
│   ├── dashboard.html       # لوحة التحكم
│   ├── stock.html           # إدارة المخزون
│   └── ...
├── supabase/                # إعدادات Supabase
│   ├── functions/           # Supabase Edge Functions
│   │   ├── _shared/         # ملفات مشتركة
│   │   │   ├── cors.ts      # إعدادات CORS
│   │   │   └── utils.ts     # دوال مساعدة مشتركة
│   │   ├── login-user/      # وظيفة تسجيل الدخول
│   │   ├── set-password/    # وظيفة تعيين كلمة المرور
│   │   ├── api/             # API عام
│   │   └── api-handler/     # معالج API آمن
│   └── config.toml          # إعدادات Supabase
└── README.md                # هذا الملف
```

## التثبيت والإعداد

### 1. إعداد Supabase

1. إنشاء مشروع جديد على [Supabase](https://supabase.com)
2. الحصول على `SUPABASE_URL` و `SUPABASE_ANON_KEY` من إعدادات المشروع
3. تحديث ملف `frontend/js/config.js` بالقيم الصحيحة:

```javascript
const SUPABASE_URL = "YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";
```

### 2. إعداد قاعدة البيانات

إنشاء الجداول التالية في Supabase:

```sql
-- جدول المستخدمين
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT,
    prenom VARCHAR(100),
    nom VARCHAR(100),
    role VARCHAR(50) DEFAULT 'pharmacien',
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول الأدوية
CREATE TABLE medications (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity INTEGER DEFAULT 0,
    unit VARCHAR(50),
    min_stock INTEGER DEFAULT 0,
    expiry_date DATE,
    supplier VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول المرضى
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    national_id VARCHAR(18) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    birth_date DATE,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول الموردين
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. نشر Supabase Edge Functions

```bash
# تثبيت Supabase CLI
npm install -g supabase

# تسجيل الدخول
supabase login

# ربط المشروع
supabase link --project-ref YOUR_PROJECT_ID

# نشر الوظائف
supabase functions deploy
```

### 4. إعداد EmailJS (اختياري)

1. إنشاء حساب على [EmailJS](https://www.emailjs.com/)
2. إعداد خدمة البريد الإلكتروني
3. تحديث مفتاح API في `login.js`

### 5. تشغيل المشروع

يمكن تشغيل المشروع على أي خادم ويب محلي:

```bash
# باستخدام Python
python -m http.server 8000

# باستخدام Node.js
npx serve frontend

# باستخدام PHP
php -S localhost:8000 -t frontend
```

## الاستخدام

### تسجيل الدخول

1. افتح `login.html` في المتصفح
2. أدخل البريد الإلكتروني وكلمة المرور
3. للمستخدمين الجدد، استخدم "كلمة مرور جديدة؟" لتعيين كلمة مرور

### الأدوار والصلاحيات

- **مدير المستشفى**: الوصول الكامل لجميع الميزات
- **رئيس الصيدلية**: إدارة المخزون والوصفات والتقارير
- **صيدلي القسم**: إدارة المخزون والوصفات
- **طبيب**: عرض الوصفات فقط
- **مورد**: عرض الطلبات المتعلقة به

### إدارة المخزون

1. انتقل إلى صفحة "إدارة المخزون"
2. استخدم أزرار الإضافة والتعديل والحذف
3. استخدم البحث والفلاتر للعثور على الأدوية
4. راقب تنبيهات المخزون المنخفض

## الأمان

- **تشفير كلمات المرور**: باستخدام bcrypt مع salt rounds = 10
- **CORS محدود**: السماح للنطاقات المصرح بها فقط
- **التحقق من المدخلات**: على مستوى الواجهة الأمامية والخلفية
- **صلاحيات محددة**: كل دور له صلاحيات محددة

## التطوير والمساهمة

### إضافة ميزة جديدة

1. إنشاء ملف HTML جديد في `frontend/`
2. إضافة ملف CSS مخصص في `frontend/css/`
3. إنشاء ملف JavaScript في `frontend/js/`
4. تحديث التنقل في الصفحات الأخرى

### إضافة API جديد

1. إنشاء وظيفة جديدة في `supabase/functions/`
2. استخدام الدوال المساعدة من `_shared/utils.ts`
3. إضافة الوظيفة الجديدة في `frontend/js/api.js`

## المشاكل الشائعة وحلولها

### خطأ في الاتصال بـ Supabase
- تأكد من صحة `SUPABASE_URL` و `SUPABASE_ANON_KEY`
- تحقق من إعدادات CORS في Supabase

### خطأ في تسجيل الدخول
- تأكد من نشر Supabase Edge Functions
- تحقق من وجود المستخدم في قاعدة البيانات

### مشاكل في العرض
- تأكد من تحميل جميع ملفات CSS و JavaScript
- تحقق من وحدة تحكم المطور للأخطاء

## الترخيص

هذا المشروع مطور لأغراض تعليمية وإدارية للمستشفيات الحكومية في الجزائر.

## الدعم

للحصول على الدعم أو الإبلاغ عن مشاكل، يرجى إنشاء issue في المستودع أو التواصل مع فريق التطوير.

---

**ملاحظة**: تأكد من تحديث جميع المفاتيح والإعدادات قبل النشر في بيئة الإنتاج.
