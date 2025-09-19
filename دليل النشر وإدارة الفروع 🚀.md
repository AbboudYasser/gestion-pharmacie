# دليل النشر وإدارة الفروع 🚀

## نظرة عامة

هذا الدليل يوضح كيفية نشر نظام إدارة الصيدلية على GitHub Pages وإدارة الفروع بشكل احترافي.

## 🌿 استراتيجية الفروع

### الفروع الرئيسية

#### 1. فرع `main` (الإنتاج)
- **الغرض**: الكود المستقر والجاهز للإنتاج
- **الحماية**: محمي من التعديل المباشر
- **النشر**: تلقائي على GitHub Pages
- **القواعد**: 
  - يتطلب Pull Request للتعديل
  - يجب اجتياز جميع الفحوصات
  - مراجعة الكود مطلوبة

#### 2. فرع `develop` (التطوير)
- **الغرض**: دمج الميزات الجديدة قبل الإنتاج
- **الاستخدام**: نقطة تجميع للميزات الجديدة
- **الاختبار**: اختبارات شاملة قبل الدمج في main

#### 3. فروع الميزات `feature/*`
- **النمط**: `feature/feature-name`
- **الغرض**: تطوير ميزات جديدة
- **المثال**: `feature/patient-search`, `feature/inventory-alerts`
- **الدورة**: إنشاء → تطوير → مراجعة → دمج → حذف

#### 4. فروع الإصلاحات `hotfix/*`
- **النمط**: `hotfix/issue-description`
- **الغرض**: إصلاحات عاجلة للإنتاج
- **المثال**: `hotfix/login-bug`, `hotfix/security-patch`

### مخطط تدفق الفروع

```
main (إنتاج)
├── develop (تطوير)
│   ├── feature/patient-management
│   ├── feature/inventory-system
│   └── feature/reporting-module
└── hotfix/critical-bug-fix
```

## 🚀 عملية النشر

### النشر التلقائي

يتم النشر تلقائياً عند:
1. Push إلى فرع `main`
2. دمج Pull Request في `main`
3. تشغيل يدوي من GitHub Actions

### خطوات النشر التلقائي

```yaml
# .github/workflows/deploy.yml
1. تحميل الكود
2. إعداد البيئة (Node.js, Python)
3. بناء المشروع
4. تكوين الإنتاج
5. التحقق من صحة البناء
6. النشر على GitHub Pages
7. اختبار ما بعد النشر
```

### عناوين النشر

- **الإنتاج**: `https://yourusername.github.io/pharmacy-management-system/`
- **التطوير**: يمكن نشره على Netlify أو Vercel للاختبار

## 📋 دليل العمليات

### 1. إنشاء ميزة جديدة

```bash
# إنشاء فرع جديد من develop
git checkout develop
git pull origin develop
git checkout -b feature/new-feature-name

# تطوير الميزة
# ... كتابة الكود ...

# رفع الفرع
git add .
git commit -m "feat: add new feature description"
git push origin feature/new-feature-name

# إنشاء Pull Request إلى develop
```

### 2. إصلاح عاجل

```bash
# إنشاء فرع hotfix من main
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue

# إصلاح المشكلة
# ... كتابة الإصلاح ...

# رفع الإصلاح
git add .
git commit -m "fix: resolve critical issue"
git push origin hotfix/critical-issue

# إنشاء Pull Request إلى main
```

### 3. إصدار جديد

```bash
# دمج develop في main
git checkout main
git pull origin main
git merge develop

# إنشاء tag للإصدار
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# النشر التلقائي سيبدأ
```

## ⚙️ إعداد GitHub Repository

### 1. إعداد GitHub Pages

```bash
# في إعدادات Repository
Settings → Pages → Source: GitHub Actions
```

### 2. إعداد Branch Protection

```bash
# حماية فرع main
Settings → Branches → Add rule
- Branch name pattern: main
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Include administrators
```

### 3. إعداد Secrets (إذا لزم الأمر)

```bash
Settings → Secrets and variables → Actions
- FIREBASE_PROJECT_ID
- FIREBASE_PRIVATE_KEY
- API_BASE_URL
```

## 🔧 التكوين المحلي

### إعداد Git Hooks

```bash
# إنشاء pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
echo "🔍 Running pre-commit checks..."

# فحص JavaScript
find frontend/js -name "*.js" -exec node -c {} \;
if [ $? -ne 0 ]; then
    echo "❌ JavaScript syntax errors found"
    exit 1
fi

# فحص Python
find backend -name "*.py" -exec python -m py_compile {} \;
if [ $? -ne 0 ]; then
    echo "❌ Python syntax errors found"
    exit 1
fi

echo "✅ Pre-commit checks passed"
EOF

chmod +x .git/hooks/pre-commit
```

### إعداد Git Aliases

```bash
# إضافة aliases مفيدة
git config alias.co checkout
git config alias.br branch
git config alias.ci commit
git config alias.st status
git config alias.unstage 'reset HEAD --'
git config alias.last 'log -1 HEAD'
git config alias.visual '!gitk'
```

## 📊 مراقبة النشر

### GitHub Actions Dashboard

```
Repository → Actions
- عرض جميع workflows
- مراقبة حالة النشر
- عرض logs التفصيلية
```

### فحص حالة الموقع

```bash
# اختبار الموقع المنشور
curl -I https://yourusername.github.io/pharmacy-management-system/

# اختبار صفحات محددة
curl -I https://yourusername.github.io/pharmacy-management-system/frontend/login.html
```

## 🐛 استكشاف أخطاء النشر

### مشاكل شائعة وحلولها

#### 1. فشل البناء
```bash
# مراجعة logs في GitHub Actions
# التحقق من:
- صحة الملفات المطلوبة
- صيغة YAML في workflows
- صلاحيات GitHub Pages
```

#### 2. روابط مكسورة
```bash
# التحقق من الروابط النسبية
# تحديث المسارات في HTML
sed -i 's|href="frontend/|href="./frontend/|g' index.html
```

#### 3. مشاكل CORS
```bash
# إضافة headers في GitHub Pages
# استخدام relative URLs
# تحديث API configuration
```

#### 4. ملفات مفقودة
```bash
# التحقق من .gitignore
# التأكد من رفع جميع الملفات المطلوبة
git ls-files --others --ignored --exclude-standard
```

## 📈 تحسين الأداء

### تحسين وقت البناء

```yaml
# استخدام cache في GitHub Actions
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### تحسين حجم النشر

```bash
# ضغط الملفات
- name: Compress files
  run: |
    find build -name "*.js" -exec gzip -k {} \;
    find build -name "*.css" -exec gzip -k {} \;
```

## 🔄 النسخ الاحتياطي والاستعادة

### نسخ احتياطي للكود

```bash
# إنشاء نسخة احتياطية
git bundle create backup-$(date +%Y%m%d).bundle --all

# استعادة من النسخة الاحتياطية
git clone backup-20250119.bundle restored-repo
```

### نسخ احتياطي للإعدادات

```bash
# تصدير إعدادات Repository
gh repo view --json name,description,visibility,defaultBranch > repo-settings.json
```

## 📚 أفضل الممارسات

### Commit Messages

```bash
# استخدام Conventional Commits
feat: add patient search functionality
fix: resolve login authentication issue
docs: update deployment guide
style: format CSS files
refactor: reorganize API structure
test: add unit tests for inventory
chore: update dependencies
```

### Pull Request Template

```markdown
## وصف التغييرات
- [ ] إضافة ميزة جديدة
- [ ] إصلاح خطأ
- [ ] تحسين الأداء
- [ ] تحديث الوثائق

## الاختبارات
- [ ] تم اختبار الميزة محلياً
- [ ] تم اختبار التوافق مع المتصفحات
- [ ] تم اختبار الاستجابة للأجهزة المختلفة

## Screenshots (إذا لزم الأمر)
[إضافة صور للتغييرات في الواجهة]
```

### Code Review Checklist

```markdown
- [ ] الكود يتبع معايير المشروع
- [ ] التعليقات واضحة ومفيدة
- [ ] لا توجد أسرار مكشوفة
- [ ] الأداء محسن
- [ ] التوافق مع المتصفحات
- [ ] إمكانية الوصول (Accessibility)
```

## 🎯 خارطة الطريق

### المرحلة القادمة
- [ ] إعداد بيئة staging
- [ ] تطبيق Continuous Integration
- [ ] إضافة اختبارات تلقائية
- [ ] مراقبة الأداء

### المستقبل البعيد
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] CDN integration
- [ ] Multi-region deployment

## 📞 الدعم

للمساعدة في النشر:
1. راجع GitHub Actions logs
2. تحقق من GitHub Pages settings
3. راجع الوثائق الرسمية لـ GitHub Pages
4. افتح issue في Repository للدعم

---

**ملاحظة**: هذا الدليل يتطور مع المشروع. يرجى تحديثه عند إضافة ميزات جديدة أو تغيير عملية النشر.
