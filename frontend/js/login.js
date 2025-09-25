// انتظر حتى يتم تحميل جميع عناصر الصفحة
document.addEventListener("DOMContentLoaded", function() {
    // --- ربط النماذج والأزرار بالدوال الخاصة بها ---

    // 1. ربط نموذج تسجيل الدخول بدالة handleLogin
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // 2. ربط نموذج إعداد كلمة المرور بدالة handleSetupPassword
    const setupPasswordForm = document.getElementById('setupPasswordForm');
    if (setupPasswordForm) {
        setupPasswordForm.addEventListener('submit', handleSetupPassword);
    }

    // 3. ✨✨✨ هذا هو الإصلاح الرئيسي: ربط رابط "كلمة مرور جديدة؟" بدالة handleForgotPasswordRequest ✨✨✨
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPasswordRequest);
    }

    // 4. ربط زر "الرجوع لتسجيل الدخول" بوظيفة تحديث الواجهة
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => updateView('login'));
    }
});

let userEmailForSetup = null;
let generatedOTP = null;

// --- دالة مساعدة لاستدعاء البوابة الوحيدة (تبقى كما هي) ---
async function apiCall(action, payload) {
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabaseClient.functions.invoke('api', {
        body: { action, payload },
    });
    // تحسين رسالة الخطأ
    if (error) {
        const errorMessage = (data && data.error) ? data.error : (error.context && error.context.msg) || error.message;
        throw new Error(errorMessage || "فشل الاتصال بالخادم.");
    }
    return data;
}

async function handleForgotPasswordRequest(e) {
    e.preventDefault(); // منع الرابط من تحديث الصفحة
    const email = document.getElementById("email").value;
    if (!email) { showAlert("الرجاء إدخال البريد الإلكتروني أولاً.", "danger"); return; }
    
    // استخدم زر تسجيل الدخول لإظهار التحميل لأنه مرئي في هذه الواجهة
    showLoading(true, 'loginBtn'); 
    try {
        const userData = await apiCall("CHECK_USER_EXISTS", { email: email });

        userEmailForSetup = email;
        const fullName = `${userData.prenom} ${userData.nom}`;
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        
        const templateParams = { to_email: email, to_name: fullName, otp_code: generatedOTP };
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        
        showAlert(`تم إرسال رمز التحقق إلى ${email}.`, "success");
        updateView('setupPassword');
    } catch (error) {
        showAlert(error.message, "danger");
    } finally {
        showLoading(false, 'loginBtn');
    }
}

async function handleSetupPassword(e) {
    e.preventDefault();
    showLoading(true, 'setupBtn');
    try {
        const otp = document.getElementById("otp").value;
        const newPassword = document.getElementById("newPassword").value;
        if (!generatedOTP || otp !== generatedOTP) throw new Error("رمز التحقق (OTP) غير صحيح.");

        const data = await apiCall("SETUP_PASSWORD", { email: userEmailForSetup, newPassword: newPassword });
        
        showAlert(data.message, "success");
        setTimeout(() => updateView('login'), 2000);
    } catch (error) {
        showAlert(error.message, "danger");
    } finally {
        showLoading(false, 'setupBtn');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    showLoading(true, 'loginBtn');
    try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const data = await apiCall("LOGIN_USER", { email, password });

        localStorage.setItem('userRole', data.userRole);
        localStorage.setItem('userId', data.userId);
        
        showAlert("تم تسجيل الدخول بنجاح!", "success");
        setTimeout(() => redirectUser(data.userRole), 1500);
    } catch (error) {
        showAlert(error.message, "danger");
    } finally {
        showLoading(false, 'loginBtn');
    }
}

// --- الدوال المساعدة (لا تغيير هنا) ---
// ... (redirectUser, updateView, showAlert, showLoading, togglePassword)
// تأكد من وجود هذه الدوال في ملفك
function updateView(viewName) {
    document.getElementById('loginForm').style.display = (viewName === 'login') ? 'block' : 'none';
    document.getElementById('setupPasswordForm').style.display = (viewName === 'setupPassword') ? 'block' : 'none';
}
// ... وباقي الدوال
