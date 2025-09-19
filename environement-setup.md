# دليل إعداد متغيرات البيئة

## نظرة عامة

هذا الدليل يوضح كيفية إعداد متغيرات البيئة لنظام إدارة الصيدلية في البيئات المختلفة (التطوير، الاختبار، الإنتاج).

## 1. إعداد البيئة المحلية (Development)

### الخطوة 1: إنشاء ملف .env

```bash
# انسخ ملف المثال
cp .env.example .env

# قم بتحرير الملف
nano .env  # أو استخدم محرر النصوص المفضل لديك
```

### الخطوة 2: تكوين Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. أنشئ مشروع جديد أو استخدم مشروع موجود
3. اذهب إلى **Project Settings** > **Service Accounts**
4. انقر على **Generate New Private Key**
5. احفظ الملف JSON وانسخ المعلومات إلى ملف .env

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

### الخطوة 3: تكوين Flask

```env
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-very-secret-key-for-development
JWT_SECRET_KEY=your-jwt-secret-key-for-development
```

### الخطوة 4: تشغيل النظام محلياً

```bash
# تشغيل الواجهة الخلفية
cd backend
python -m venv venv
source venv/bin/activate  # في Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py

# تشغيل الواجهة الأمامية (في terminal آخر)
cd frontend
# افتح index.html في المتصفح أو استخدم خادم محلي
python -m http.server 3000
```

## 2. إعداد GitHub Secrets للنشر

### الخطوة 1: إضافة Secrets في GitHub

1. اذهب إلى repository الخاص بك على GitHub
2. انقر على **Settings** > **Secrets and variables** > **Actions**
3. انقر على **New repository secret**
4. أضف المتغيرات التالية:

```
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
FLASK_SECRET_KEY
JWT_SECRET_KEY
HEROKU_API_KEY (إذا كنت تستخدم Heroku)
```

### الخطوة 2: إنشاء ملف GitHub Actions

إنشاء ملف `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Configure environment
      run: |
        echo "REACT_APP_API_BASE_URL=${{ secrets.API_BASE_URL }}" >> .env.production
        echo "REACT_APP_ENVIRONMENT=production" >> .env.production
    
    - name: Build and Deploy
      run: |
        # نسخ الملفات إلى مجلد البناء
        mkdir -p build
        cp -r frontend/* build/
        
        # تحديث التكوين للإنتاج
        sed -i 's/development/production/g' build/js/config.js
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
```

## 3. إعداد بيئة الإنتاج

### خيار 1: Heroku للواجهة الخلفية

```bash
# تثبيت Heroku CLI
# إنشاء تطبيق جديد
heroku create your-pharmacy-api

# إضافة متغيرات البيئة
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=your-production-secret-key
heroku config:set FIREBASE_PROJECT_ID=your-project-id
# ... باقي المتغيرات

# نشر التطبيق
git subtree push --prefix backend heroku main
```

### خيار 2: Railway للواجهة الخلفية

1. اذهب إلى [Railway](https://railway.app/)
2. ربط repository GitHub
3. إضافة متغيرات البيئة في لوحة التحكم
4. النشر التلقائي عند push

### خيار 3: Vercel للواجهة الأمامية

```bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر المشروع
vercel --prod

# إضافة متغيرات البيئة
vercel env add REACT_APP_API_BASE_URL
```

## 4. إعداد قاعدة البيانات

### Firebase Firestore

1. في Firebase Console، اذهب إلى **Firestore Database**
2. انقر على **Create database**
3. اختر **Start in test mode** للتطوير أو **Start in production mode** للإنتاج
4. اختر المنطقة الجغرافية
5. قم بإعداد قواعد الأمان:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // السماح للمستخدمين المصادق عليهم فقط
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Supabase (بديل مستقبلي)

1. اذهب إلى [Supabase](https://supabase.com/)
2. أنشئ مشروع جديد
3. احصل على URL و API Key
4. أضفهما إلى متغيرات البيئة:

```env
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 5. اختبار التكوين

### اختبار البيئة المحلية

```bash
# اختبار الواجهة الخلفية
curl http://localhost:5000/api/health

# اختبار تسجيل الدخول
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","role":"hospital_manager"}'
```

### اختبار البيئة المنشورة

```bash
# اختبار الواجهة الأمامية
curl https://yourusername.github.io/repository-name/

# اختبار الواجهة الخلفية
curl https://your-heroku-app.herokuapp.com/api/health
```

## 6. استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### 1. خطأ CORS
```
Access to fetch at 'API_URL' from origin 'FRONTEND_URL' has been blocked by CORS policy
```

**الحل:**
```env
CORS_ORIGINS=https://yourusername.github.io,http://localhost:3000
```

#### 2. خطأ Firebase Authentication
```
Error: Firebase project not found
```

**الحل:**
- تأكد من صحة FIREBASE_PROJECT_ID
- تأكد من تمكين Firestore في المشروع

#### 3. خطأ متغيرات البيئة
```
Configuration not loaded
```

**الحل:**
- تأكد من تحميل config.js قبل api.js
- تأكد من وجود ملف .env في المكان الصحيح

## 7. أفضل الممارسات

### الأمان
- لا تشارك ملف .env أبداً
- استخدم كلمات مرور قوية
- قم بتدوير المفاتيح السرية بانتظام
- استخدم HTTPS في الإنتاج

### التنظيم
- استخدم أسماء واضحة للمتغيرات
- قم بتوثيق جميع المتغيرات
- استخدم ملفات منفصلة لكل بيئة
- احتفظ بنسخ احتياطية من التكوين

### المراقبة
- راقب استخدام API
- تتبع الأخطاء باستخدام Sentry
- راقب أداء قاعدة البيانات
- استخدم Google Analytics لتتبع الاستخدام

## 8. الدعم والمساعدة

إذا واجهت أي مشاكل:

1. تحقق من ملف `debug.log` في مجلد المشروع
2. راجع console المتصفح للأخطاء
3. تأكد من صحة جميع متغيرات البيئة
4. اختبر الاتصال بقاعدة البيانات
5. راجع وثائق Firebase أو الخدمة المستخدمة

للمساعدة الإضافية، يمكنك:
- فتح issue في GitHub repository
- مراجعة الوثائق الرسمية للخدمات المستخدمة
- البحث في Stack Overflow عن مشاكل مشابهة
