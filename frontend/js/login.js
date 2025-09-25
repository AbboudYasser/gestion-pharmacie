// ==================================================================
//   ملف login.js الكامل والنهائي - نظام إدارة الصيدلية
//   يحتوي على كل الدوال الرئيسية والمساعدة
// ==================================================================

// --- الخطوة 1: ربط العناصر التفاعلية عند تحميل الصفحة ---
document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const setupPasswordForm = document.getElementById('setupPasswordForm');
    if (setupPasswordForm) setupPasswordForm.addEventListener('submit', handleSetupPassword);

    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', handleForgotPasswordRequest);

    const backToLoginBtn = document.getElementById('backToLoginBtn');
    if (backToLoginBtn) backToLoginBtn.addEventListener('click', () => updateView('login'));
});

// --- الخطوة 2: متغيرات لتخزين الحالة ---
let userEmailForSetup = null;
let generatedOTP = null;

// --- الخطوة 3: الدوال التي تتعامل مع الأحداث ---

async function handleForgotPasswordRequest(e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    if (!email) {
        showAlert("الرجاء إدخال البريد الإلكتروني أولاً.", "danger");
        return;
    }
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
        const confirmPassword = document.getElementById("confirmPassword").value;
        if (newPassword !== confirmPassword) throw new Error("كلمتا المرور غير متطابقتين.");
        if (!generatedOTP || otp !== generatedOTP) throw new Error("رمز التحقق (OTP) غير صحيح.");
        const data = await apiCall("SETUP_PASSWORD", { email: userEmailForSetup, newPassword: newPassword });
        showAlert(data.message, "success");
        setTimeout(() => {
            document.getElementById('otp').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            updateView('login');
        }, 2000);
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

// --- الخطوة 4: الدوال المساعدة (التي كانت مفقودة) ---

async function apiCall(action, payload) {
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabaseClient.functions.invoke('api', {
        body: { action, payload },
    });
    if (error) {
        const errorMessage = (data && data.error) ? data.error : (error.context && error.context.msg) || error.message;
        throw new Error(errorMessage || "فشل الاتصال بالخادم.");
    }
    return data;
}

function updateView(viewName) {
    const loginForm = document.getElementById('loginForm');
    const setupForm = document.getElementById('setupPasswordForm');
    const alertContainer = document.getElementById('alert-container');
    alertContainer.innerHTML = '';
    alertContainer.style.display = 'none';
    if (viewName === 'login') {
        loginForm.style.display = 'block';
        setupForm.style.display = 'none';
    } else if (viewName === 'setupPassword') {
        loginForm.style.display = 'none';
        setupForm.style.display = 'block';
    }
}

function showAlert(message, type = "info") {
    const alertContainer = document.getElementById('alert-container');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    alertContainer.style.display = 'block';
}

function showLoading(isLoading, btnId) {
    const button = document.getElementById(btnId);
    if (!button) return;
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري المعالجة...';
    } else {
        button.disabled = false;
        if (btnId === 'loginBtn') {
            button.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول';
        } else if (btnId === 'setupBtn') {
            button.innerHTML = '<i class="fas fa-check"></i> تعيين كلمة المرور';
        }
    }
}

function togglePassword(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

function redirectUser(role) {
    if (role === 'admin') {
        window.location.href = 'dashboard.html';
    } else {
        window.location.href = 'index.html';
    }
}
