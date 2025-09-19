# دليل المساهمة في نظام إدارة الصيدلية 🤝

مرحباً بك في مشروع نظام إدارة الصيدلية! نحن نرحب بمساهماتك ونقدر وقتك وجهدك في تحسين هذا النظام.

## 📋 جدول المحتويات

- [كيفية المساهمة](#كيفية-المساهمة)
- [إعداد بيئة التطوير](#إعداد-بيئة-التطوير)
- [معايير الكود](#معايير-الكود)
- [عملية Pull Request](#عملية-pull-request)
- [الإبلاغ عن الأخطاء](#الإبلاغ-عن-الأخطاء)
- [اقتراح ميزات جديدة](#اقتراح-ميزات-جديدة)
- [إرشادات التصميم](#إرشادات-التصميم)

## 🚀 كيفية المساهمة

### أنواع المساهمات المرحب بها

- 🐛 **إصلاح الأخطاء**: إصلاح bugs موجودة
- ✨ **ميزات جديدة**: إضافة وظائف جديدة
- 📚 **تحسين الوثائق**: تحديث أو إضافة وثائق
- 🎨 **تحسين التصميم**: تحسين واجهة المستخدم
- ⚡ **تحسين الأداء**: تحسين سرعة وكفاءة النظام
- 🧪 **إضافة اختبارات**: كتابة اختبارات جديدة
- 🔧 **تحسين البنية**: إعادة هيكلة الكود

### قبل البدء

1. **تحقق من Issues الموجودة**: تأكد من عدم وجود issue مشابه
2. **ناقش الفكرة**: للميزات الكبيرة، افتح issue للنقاش أولاً
3. **اقرأ الوثائق**: تأكد من فهم هيكل المشروع

## 🛠️ إعداد بيئة التطوير

### المتطلبات الأساسية

```bash
# البرامج المطلوبة
- Git
- Python 3.8+
- Node.js 14+
- متصفح ويب حديث
```

### خطوات الإعداد

```bash
# 1. Fork المشروع على GitHub
# انقر على زر "Fork" في صفحة المشروع

# 2. استنساخ المشروع محلياً
git clone https://github.com/YOUR_USERNAME/pharmacy-management-system.git
cd pharmacy-management-system

# 3. إضافة المشروع الأصلي كـ upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/pharmacy-management-system.git

# 4. إعداد الواجهة الخلفية
cd backend
python -m venv venv
source venv/bin/activate  # في Windows: venv\Scripts\activate
pip install -r requirements.txt

# 5. إعداد متغيرات البيئة
cp ../.env.example .env
# قم بتحرير .env وإضافة بياناتك

# 6. تشغيل الخادم الخلفي
python main.py

# 7. تشغيل الواجهة الأمامية (في terminal آخر)
cd ../frontend
python -m http.server 3000
```

### التحقق من الإعداد

```bash
# اختبار الواجهة الخلفية
curl http://localhost:5000/api/health

# اختبار الواجهة الأمامية
# افتح http://localhost:3000 في المتصفح
```

## 📝 معايير الكود

### JavaScript

```javascript
// استخدم const/let بدلاً من var
const API_URL = 'https://api.example.com';
let currentUser = null;

// استخدم arrow functions عند المناسب
const fetchData = async () => {
    try {
        const response = await fetch(API_URL);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

// أضف تعليقات واضحة
/**
 * تحديث بيانات المريض
 * @param {string} patientId - معرف المريض
 * @param {Object} data - البيانات الجديدة
 * @returns {Promise<Object>} بيانات المريض المحدثة
 */
async function updatePatient(patientId, data) {
    // تنفيذ الدالة...
}
```

### Python

```python
# اتبع PEP 8
from flask import Flask, request, jsonify
import logging

# استخدم type hints
def create_user(name: str, email: str) -> dict:
    """
    إنشاء مستخدم جديد
    
    Args:
        name: اسم المستخدم
        email: البريد الإلكتروني
        
    Returns:
        dict: بيانات المستخدم الجديد
    """
    return {
        'name': name,
        'email': email,
        'created_at': datetime.now().isoformat()
    }

# معالجة الأخطاء بشكل صحيح
try:
    result = risky_operation()
except SpecificException as e:
    logging.error(f"Error in operation: {e}")
    raise
```

### CSS

```css
/* استخدم BEM methodology */
.patient-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.patient-card__header {
    padding: 16px;
    border-bottom: 1px solid #eee;
}

.patient-card__title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

/* استخدم CSS custom properties */
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
}

/* تأكد من الاستجابة */
@media (max-width: 768px) {
    .patient-card {
        margin: 8px;
    }
}
```

### HTML

```html
<!-- استخدم HTML5 semantic elements -->
<main class="dashboard">
    <header class="dashboard-header">
        <h1>لوحة التحكم</h1>
    </header>
    
    <section class="stats-section">
        <article class="stat-card">
            <h2>إجمالي المرضى</h2>
            <p>1,234</p>
        </article>
    </section>
</main>

<!-- أضف alt text للصور -->
<img src="patient-photo.jpg" alt="صورة المريض أحمد محمد">

<!-- استخدم labels للنماذج -->
<label for="patient-name">اسم المريض</label>
<input type="text" id="patient-name" name="patient-name" required>
```

## 🔄 عملية Pull Request

### 1. إنشاء فرع جديد

```bash
# تحديث الفرع الرئيسي
git checkout main
git pull upstream main

# إنشاء فرع للميزة الجديدة
git checkout -b feature/patient-search
```

### 2. تطوير الميزة

```bash
# اكتب الكود
# اختبر التغييرات
# أضف تعليقات

# Commit التغييرات
git add .
git commit -m "feat: add patient search functionality

- Add search input to patients page
- Implement search API endpoint
- Add search results highlighting
- Update documentation

Closes #123"
```

### 3. رفع الفرع

```bash
git push origin feature/patient-search
```

### 4. إنشاء Pull Request

1. اذهب إلى GitHub repository
2. انقر على "New Pull Request"
3. اختر الفرع الخاص بك
4. املأ template الـ PR:

```markdown
## 📝 وصف التغييرات

### ما تم إضافته/تغييره؟
- إضافة وظيفة البحث في المرضى
- تحسين واجهة المستخدم
- إضافة validation للبيانات

### لماذا هذا التغيير مطلوب؟
- تحسين تجربة المستخدم
- تسريع العثور على المرضى
- تقليل الأخطاء

## 🧪 الاختبارات

- [x] تم اختبار الوظيفة محلياً
- [x] تم اختبار التوافق مع المتصفحات
- [x] تم اختبار الاستجابة للأجهزة المختلفة
- [ ] تم إضافة اختبارات تلقائية

## 📷 لقطات الشاشة

[أضف صور للتغييرات إذا كانت في الواجهة]

## ✅ Checklist

- [x] الكود يتبع معايير المشروع
- [x] تم تحديث الوثائق
- [x] لا توجد console errors
- [x] تم اختبار الوظيفة بالكامل
```

## 🐛 الإبلاغ عن الأخطاء

### قبل الإبلاغ

1. **تحقق من Issues الموجودة**: ابحث عن مشاكل مشابهة
2. **تأكد من إعادة الإنتاج**: تأكد من أن المشكلة تحدث باستمرار
3. **جرب الحلول الأساسية**: إعادة تحميل الصفحة، مسح cache

### template للإبلاغ عن خطأ

```markdown
## 🐛 وصف الخطأ
وصف واضح ومختصر للمشكلة.

## 🔄 خطوات إعادة الإنتاج
1. اذهب إلى '...'
2. انقر على '...'
3. مرر إلى '...'
4. شاهد الخطأ

## ✅ السلوك المتوقع
وصف ما كان يجب أن يحدث.

## 📱 البيئة
- نظام التشغيل: [مثل iOS, Windows 10]
- المتصفح: [مثل Chrome 96, Safari 15]
- الجهاز: [مثل iPhone 12, Desktop]
- حجم الشاشة: [مثل 1920x1080]

## 📷 لقطات الشاشة
أضف لقطات شاشة للمساعدة في شرح المشكلة.

## 📋 معلومات إضافية
أي معلومات أخرى مفيدة حول المشكلة.
```

## ✨ اقتراح ميزات جديدة

### template لاقتراح ميزة

```markdown
## 🚀 اقتراح ميزة جديدة

### 📝 وصف الميزة
وصف واضح للميزة المقترحة.

### 🎯 المشكلة التي تحلها
ما هي المشكلة التي ستحلها هذه الميزة؟

### 💡 الحل المقترح
وصف تفصيلي للحل.

### 🔄 بدائل أخرى
هل فكرت في حلول أخرى؟

### 📊 الأولوية
- [ ] عالية (ضرورية للنظام)
- [ ] متوسطة (مفيدة ولكن ليست ضرورية)
- [ ] منخفضة (تحسين إضافي)

### 👥 المستخدمون المستفيدون
من سيستفيد من هذه الميزة؟
```

## 🎨 إرشادات التصميم

### الألوان

```css
/* الألوان الأساسية */
--primary-blue: #007bff;
--primary-green: #28a745;
--primary-red: #dc3545;
--primary-yellow: #ffc107;

/* الألوان الرمادية */
--gray-100: #f8f9fa;
--gray-200: #e9ecef;
--gray-300: #dee2e6;
--gray-800: #343a40;
--gray-900: #212529;
```

### الخطوط

```css
/* الخط الأساسي */
font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

/* أحجام الخطوط */
--font-size-xs: 0.75rem;   /* 12px */
--font-size-sm: 0.875rem;  /* 14px */
--font-size-base: 1rem;    /* 16px */
--font-size-lg: 1.125rem;  /* 18px */
--font-size-xl: 1.25rem;   /* 20px */
```

### المسافات

```css
/* نظام المسافات */
--spacing-xs: 0.25rem;  /* 4px */
--spacing-sm: 0.5rem;   /* 8px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */
```

### الأيقونات

- استخدم Font Awesome للأيقونات
- تأكد من وضوح الأيقونات في جميع الأحجام
- أضف `aria-label` للأيقونات التفاعلية

## 🧪 الاختبارات

### اختبارات يدوية

```bash
# قائمة فحص للاختبار اليدوي
- [ ] تسجيل الدخول يعمل بشكل صحيح
- [ ] جميع الصفحات تحمل بدون أخطاء
- [ ] النماذج تتحقق من البيانات
- [ ] الأزرار تعمل كما هو متوقع
- [ ] التصميم متجاوب على جميع الأجهزة
- [ ] لا توجد أخطاء في console
```

### اختبارات المتصفحات

```bash
# المتصفحات المدعومة
- Chrome (آخر إصدارين)
- Firefox (آخر إصدارين)
- Safari (آخر إصدارين)
- Edge (آخر إصدارين)
```

## 📚 الموارد المفيدة

### الوثائق
- [دليل المستخدم](README.md)
- [دليل النشر](docs/deployment-guide.md)
- [دليل إعداد البيئة](environment-setup.md)

### الأدوات
- [VS Code](https://code.visualstudio.com/) - محرر النصوص المفضل
- [GitHub Desktop](https://desktop.github.com/) - واجهة Git سهلة
- [Postman](https://www.postman.com/) - اختبار APIs

### التعلم
- [MDN Web Docs](https://developer.mozilla.org/) - مرجع الويب
- [Flask Documentation](https://flask.palletsprojects.com/) - وثائق Flask
- [Git Tutorial](https://git-scm.com/docs/gittutorial) - تعلم Git

## 🤝 قواعد السلوك

### كن محترماً
- استخدم لغة مهذبة ومحترمة
- احترم آراء الآخرين
- كن صبوراً مع المبتدئين

### كن بناءً
- قدم نقد بناء
- اقترح حلول بدلاً من الشكوى فقط
- ساعد الآخرين في التعلم

### كن متعاوناً
- شارك المعرفة
- ساعد في مراجعة الكود
- ادعم المساهمين الجدد

## 📞 التواصل

### للأسئلة والمساعدة
- افتح issue في GitHub
- استخدم Discussions للنقاشات العامة
- راسلنا على البريد الإلكتروني للأمور الحساسة

### للاقتراحات
- افتح issue مع label "enhancement"
- شارك في Discussions
- اقترح في Pull Request

## 🎉 شكراً لك!

شكراً لك على اهتمامك بالمساهمة في نظام إدارة الصيدلية. مساهمتك تساعد في تحسين الرعاية الصحية وتطوير النظام ليكون أفضل للجميع.

كل مساهمة، مهما كانت صغيرة، لها قيمة كبيرة. سواء كان إصلاح خطأ إملائي أو إضافة ميزة كاملة، نحن نقدر جهدك ووقتك.

---

**ملاحظة**: هذا الدليل يتطور مع المشروع. إذا كان لديك اقتراحات لتحسينه، فلا تتردد في مشاركتها!
