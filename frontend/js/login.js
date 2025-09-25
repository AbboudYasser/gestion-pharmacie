document.addEventListener("DOMContentLoaded", function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init("nR-eq2QOrW8I_ZUmu");
    } else {
        console.error("EmailJS SDK not loaded!");
    }

    document.getElementById("loginForm").addEventListener("submit", handleLogin);
    document.getElementById("setupPasswordForm").addEventListener("submit", handleSetupPassword);
    document.getElementById("forgotPasswordLink").addEventListener("click", handleForgotPasswordRequest);
    document.getElementById("backToLoginBtn").addEventListener("click", () => updateView('login'));
});

let userEmailForSetup = null;
let generatedOTP = null;

async function handleForgotPasswordRequest(e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    if (!email) {
        showAlert("الرجاء إدخال البريد الإلكتروني أولاً.", "danger");
        return;
    }
    showLoading(true, 'loginBtn');
    try {
        const { data: user, error } = await supabaseClient.from('users').select('id, password, prenom, nom').eq('email', email).single();
        if (error || !user) throw new Error("لا يوجد حساب مرتبط بهذا البريد الإلكتروني.");
        if (user.password !== null) {
            throw new Error("هذا الحساب لديه كلمة مرور بالفعل.");
        }
        userEmailForSetup = email;
        const fullName = `${user.prenom} ${user.nom}`;
        await sendOTP(email, fullName);
        showAlert(`تم إرسال رمز التحقق إلى ${email}.`, "success");
        updateView('setupPassword');
    } catch (error) {
        showAlert(error.message, "danger");
    } finally {
        showLoading(false, 'loginBtn');
    }
}

async function sendOTP(email, name) {
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const templateParams = { to_email: email, to_name: name, otp_code: generatedOTP };
    try {
        await emailjs.send('service_q792eyc', 'template_g3osree', templateParams);
    } catch (error) {
        console.error('EmailJS send failed:', error);
        generatedOTP = null;
        throw new Error("فشل إرسال رمز التحقق. تحقق من اتصالك بالإنترنت أو إعدادات EmailJS.");
    }
}

async function handleSetupPassword(e) {
    e.preventDefault();
    showLoading(true, 'setupBtn');
    const otp = document.getElementById("otp").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    try {
        if (!generatedOTP || otp !== generatedOTP) throw new Error("رمز التحقق (OTP) غير صحيح.");
        if (newPassword.length < 8) throw new Error("يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.");
        if (newPassword !== confirmPassword) throw new Error("كلمتا المرور غير متطابقتين.");
        
        // الآن bcrypt سيكون متاحًا بالتأكيد بفضل 'defer'
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const { error } = await supabaseClient.from('users').update({ password: hashedPassword }).eq('email', userEmailForSetup);
        if (error) throw error;
        
        showAlert("تم تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.", "success");
        generatedOTP = null;
        userEmailForSetup = null;
        setTimeout(() => {
            document.getElementById("setupPasswordForm").reset();
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
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        const { data: user, error } = await supabaseClient.from('users').select('id, password, role').eq('email', email).single();
        if (error || !user) throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        if (user.password === null) throw new Error("ليس لديك كلمة مرور. استخدم 'كلمة مرور جديدة؟'.");
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userId', user.id);
        
        showAlert("تم تسجيل الدخول بنجاح. جاري توجيهك...", "success");
        setTimeout(() => redirectUser(user.role), 1500);
    } catch (error) {
        showAlert(error.message, "danger");
    } finally {
        showLoading(false, 'loginBtn');
    }
}

function redirectUser(role) {
    const destinations = { 'pharmacien': 'stock.html', 'directeur': 'dashboard.html', 'chef_service': 'department_requests.html', 'fournisseur': 'supplier_orders.html' };
    window.location.href = destinations[role] || 'login.html';
}

function updateView(viewName) {
    document.getElementById('loginForm').style.display = (viewName === 'login') ? 'block' : 'none';
    document.getElementById('setupPasswordForm').style.display = (viewName === 'setupPassword') ? 'block' : 'none';
    document.getElementById("alert-container").innerHTML = '';
}

function showAlert(message, type) {
    const alertContainer = document.getElementById("alert-container");
    alertContainer.innerHTML = `<div class="alert alert-${type}"><i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"}"></i> ${message}</div>`;
    if (type !== 'success') {
        setTimeout(() => alertContainer.innerHTML = '', 6000);
    }
}

function showLoading(isLoading, btnId) {
    const button = document.getElementById(btnId);
    const defaultTexts = { 'loginBtn': '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول', 'setupBtn': '<i class="fas fa-check"></i> تعيين كلمة المرور' };
    button.disabled = isLoading;
    button.innerHTML = isLoading ? `<i class="fas fa-spinner fa-spin"></i> جاري التحميل...` : defaultTexts[btnId];
}

function togglePassword(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(iconId);
    passwordInput.type = (passwordInput.type === "password") ? "text" : "password";
    toggleIcon.className = `fas ${passwordInput.type === "password" ? "fa-eye" : "fa-eye-slash"}`;
}
