# نظام إدارة الصيدلية 💊

نظام شامل لإدارة صيدليات المستشفيات الحكومية في الجزائر، مبني بتقنيات الويب الحديثة مع دعم كامل للغة العربية.

## 🌟 المميزات

### 🏥 إدارة شاملة
- **إدارة الوصفات الطبية**: نظام متطور لإدخال ومتابعة الوصفات
- **إدارة المخزون**: تتبع الأدوية والكميات وتواريخ الانتهاء
- **إدارة المرضى**: قاعدة بيانات شاملة للمرضى والتاريخ المرضي
- **إدارة الموردين**: نظام متكامل للموردين وطلبات الشراء
- **التقارير والإحصائيات**: تقارير تفصيلية وإحصائيات في الوقت الفعلي

### 🔐 الأمان والمصادقة
- نظام مصادقة متقدم باستخدام JWT
- أدوار مستخدمين متعددة (مدير مستشفى، رئيس صيدلية، صيدلي، طبيب، مورد)
- حماية البيانات الحساسة
- تشفير كلمات المرور

### 🎨 واجهة المستخدم
- تصميم عربي احترافي مع دعم RTL
- واجهة متجاوبة تعمل على جميع الأجهزة
- تجربة مستخدم بديهية وسهلة الاستخدام
- ألوان وخطوط مناسبة للبيئة الطبية

### 🌐 التقنيات المستخدمة
- **الواجهة الأمامية**: HTML5, CSS3, JavaScript ES6+
- **الواجهة الخلفية**: Python Flask
- **قاعدة البيانات**: Firebase Firestore
- **المصادقة**: JWT (JSON Web Tokens)
- **التنسيق**: CSS Grid, Flexbox, Font Awesome
- **الخطوط**: Google Fonts (Cairo)

## 📁 هيكل المشروع

```
pharmacy-management-system/
├── frontend/                  # الواجهة الأمامية
│   ├── index.html            # الصفحة الرئيسية
│   ├── login.html            # صفحة تسجيل الدخول
│   ├── dashboard.html        # لوحة التحكم
│   ├── patients.html         # إدارة المرضى
│   ├── css/                  # ملفات التنسيق
│   │   ├── style.css         # الأنماط العامة
│   │   ├── login.css         # أنماط تسجيل الدخول
│   │   ├── dashboard.css     # أنماط لوحة التحكم
│   │   ├── patients.css      # أنماط إدارة المرضى
│   │   ├── home.css          # أنماط الصفحة الرئيسية
│   │   └── components.css    # أنماط المكونات المشتركة
│   └── js/                   # ملفات JavaScript
│       ├── config.js         # إدارة التكوين والبيئات
│       ├── mockData.js       # البيانات الوهمية
│       ├── api.js            # التفاعل مع API
│       ├── utils.js          # الدوال المساعدة
│       ├── login.js          # منطق تسجيل الدخول
│       ├── dashboard.js      # منطق لوحة التحكم
│       ├── patients.js       # منطق إدارة المرضى
│       └── home.js           # منطق الصفحة الرئيسية
├── backend/                  # الواجهة الخلفية
│   ├── main.py              # نقطة دخول التطبيق
│   ├── auth.py              # نظام المصادقة
│   ├── inventory.py         # إدارة المخزون
│   ├── prescriptions.py     # إدارة الوصفات
│   ├── reports.py           # التقارير والإحصائيات
│   ├── suppliers.py         # إدارة الموردين
│   ├── users.py             # إدارة المستخدمين
│   ├── requirements.txt     # متطلبات Python
│   └── .env                 # متغيرات البيئة
├── docs/                    # الوثائق
│   ├── project_analysis.md  # تحليل المشروع
│   └── environment-setup.md # دليل إعداد البيئة
├── .env.example             # مثال لمتغيرات البيئة
├── .gitignore              # ملفات مستبعدة من Git
└── README.md               # هذا الملف
```

## 🚀 التثبيت والتشغيل

### المتطلبات الأساسية
- Python 3.8+ للواجهة الخلفية
- متصفح ويب حديث للواجهة الأمامية
- حساب Firebase (اختياري للبيانات الحقيقية)

### 1. تحميل المشروع
```bash
git clone https://github.com/yourusername/pharmacy-management-system.git
cd pharmacy-management-system
```

### 2. إعداد الواجهة الخلفية
```bash
cd backend

# إنشاء بيئة افتراضية
python -m venv venv

# تفعيل البيئة الافتراضية
# في Windows:
venv\Scripts\activate
# في macOS/Linux:
source venv/bin/activate

# تثبيت المتطلبات
pip install -r requirements.txt

# إعداد متغيرات البيئة
cp ../.env.example .env
# قم بتحرير ملف .env وإضافة بياناتك

# تشغيل الخادم
python main.py
```

### 3. تشغيل الواجهة الأمامية
```bash
cd frontend

# تشغيل خادم محلي بسيط
python -m http.server 3000

# أو استخدم أي خادم ويب آخر
# مثل Live Server في VS Code
```

### 4. الوصول للنظام
- افتح المتصفح واذهب إلى `http://localhost:3000`
- استخدم بيانات الدخول التجريبية:
  - **مدير المستشفى**: `admin` / `admin123`
  - **رئيس الصيدلية**: `pharmacist` / `pharm123`
  - **طبيب**: `doctor` / `doc123`

## 🔧 التكوين

### متغيرات البيئة
انسخ ملف `.env.example` إلى `.env` وقم بتحديث القيم:

```env
# إعدادات Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key

# إعدادات Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key

# إعدادات JWT
JWT_SECRET_KEY=your-jwt-secret
```

### إعداد Firebase (اختياري)
1. أنشئ مشروع في [Firebase Console](https://console.firebase.google.com/)
2. فعّل Firestore Database
3. أنشئ Service Account وحمّل ملف JSON
4. أضف بيانات Firebase إلى ملف `.env`

## 🌐 النشر

### GitHub Pages (الواجهة الأمامية)
```bash
# إنشاء فرع gh-pages
git checkout -b gh-pages

# نسخ ملفات الواجهة الأمامية
cp -r frontend/* .

# رفع التغييرات
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

### Heroku (الواجهة الخلفية)
```bash
# تثبيت Heroku CLI وتسجيل الدخول
heroku login

# إنشاء تطبيق
heroku create your-pharmacy-api

# إضافة متغيرات البيئة
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=your-production-secret

# نشر التطبيق
git subtree push --prefix backend heroku main
```

## 📱 الاستخدام

### تسجيل الدخول
1. اذهب إلى صفحة تسجيل الدخول
2. أدخل اسم المستخدم وكلمة المرور
3. اختر دورك في النظام
4. انقر على "تسجيل الدخول"

### إدارة المرضى
1. من لوحة التحكم، انقر على "إدارة المرضى"
2. لإضافة مريض جديد، انقر على "إضافة مريض جديد"
3. املأ البيانات المطلوبة
4. احفظ البيانات

### إدارة الوصفات
1. انقر على "الوصفات الطبية"
2. لإضافة وصفة جديدة، انقر على "وصفة جديدة"
3. اختر المريض والأدوية
4. احفظ الوصفة

## 🛠️ التطوير

### إضافة ميزة جديدة
1. أنشئ فرع جديد: `git checkout -b feature/new-feature`
2. اكتب الكود في الملفات المناسبة
3. اختبر الميزة محلياً
4. ارفع التغييرات: `git push origin feature/new-feature`
5. أنشئ Pull Request

### هيكل الكود
- **الواجهة الأمامية**: استخدم الدوال في `utils.js` للمهام الشائعة
- **الواجهة الخلفية**: اتبع نمط MVC وفصل المنطق في ملفات منفصلة
- **قاعدة البيانات**: استخدم Firestore للبيانات الحقيقية أو البيانات الوهمية للتطوير

### اختبار الكود
```bash
# اختبار الواجهة الخلفية
cd backend
python -m pytest tests/

# اختبار الواجهة الأمامية
# افتح المتصفح وتحقق من console للأخطاء
```

## 🐛 استكشاف الأخطاء

### مشاكل شائعة

#### 1. خطأ CORS
```
Access to fetch has been blocked by CORS policy
```
**الحل**: تأكد من إضافة عنوان الواجهة الأمامية إلى `CORS_ORIGINS` في الواجهة الخلفية.

#### 2. خطأ Firebase
```
Firebase project not found
```
**الحل**: تحقق من `FIREBASE_PROJECT_ID` في ملف `.env`.

#### 3. خطأ تسجيل الدخول
```
Invalid credentials
```
**الحل**: استخدم بيانات الدخول الصحيحة أو تأكد من عمل الخادم الخلفي.

### سجلات الأخطاء
- **الواجهة الأمامية**: افتح Developer Tools في المتصفح
- **الواجهة الخلفية**: راجع سجلات Flask في Terminal

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. أنشئ فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

### إرشادات المساهمة
- اكتب كود نظيف ومعلق
- اتبع نمط الكود الموجود
- اختبر التغييرات قبل الإرسال
- اكتب وصف واضح للتغييرات

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 👥 الفريق

- **المطور الرئيسي**: [اسمك هنا]
- **مصمم الواجهة**: [اسم المصمم]
- **مطور الواجهة الخلفية**: [اسم المطور]

## 📞 التواصل

- **البريد الإلكتروني**: info@pharmacy-system.dz
- **الموقع**: [رابط الموقع]
- **GitHub Issues**: [رابط Issues]

## 🙏 شكر وتقدير

- [Firebase](https://firebase.google.com/) لخدمات قاعدة البيانات
- [Font Awesome](https://fontawesome.com/) للأيقونات
- [Google Fonts](https://fonts.google.com/) لخط Cairo
- [Flask](https://flask.palletsprojects.com/) لإطار العمل الخلفي

## 📈 خارطة الطريق

### الإصدار القادم (v2.0)
- [ ] تطبيق الهاتف المحمول
- [ ] إشعارات فورية
- [ ] تقارير متقدمة
- [ ] تكامل مع أنظمة المستشفى الأخرى
- [ ] دعم متعدد اللغات

### المستقبل البعيد
- [ ] ذكاء اصطناعي لتوقع النقص في المخزون
- [ ] تحليلات متقدمة للبيانات
- [ ] تكامل مع أجهزة IoT
- [ ] نظام إدارة الجودة

---

**ملاحظة**: هذا المشروع تم تطويره لأغراض تعليمية وتجريبية. للاستخدام في بيئة إنتاج حقيقية، يرجى مراجعة متطلبات الأمان والامتثال الطبي المحلية.
