

document.addEventListener('DOMContentLoaded', ( ) => {
    const updatePasswordForm = document.getElementById('update-password-form');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const messageContainer = document.getElementById('message-container');

    
    updatePasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        messageContainer.textContent = '';
        messageContainer.classList.remove('success', 'error');

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        
        if (newPassword !== confirmPassword) {
            messageContainer.textContent = 'كلمتا المرور غير متطابقتين.';
            messageContainer.classList.add('error');
            return;
        }

        
        if (newPassword.length < 6) {
            messageContainer.textContent = 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.';
            messageContainer.classList.add('error');
            return;
        }

        try {
            
            
            const { data, error } = await supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (error) {
                throw error; 
            }

            
            messageContainer.textContent = 'تم تحديث كلمة المرور بنجاح! سيتم توجيهك لصفحة تسجيل الدخول...';
            messageContainer.classList.add('success');

            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);

        } catch (error) {
            console.error('خطأ في تحديث كلمة المرور:', error);
            messageContainer.textContent = 'فشل تحديث كلمة المرور. قد يكون الرابط منتهي الصلاحية. حاول مرة أخرى.';
            messageContainer.classList.add('error');
        }
    });
});
