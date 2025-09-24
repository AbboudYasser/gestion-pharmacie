document.addEventListener('DOMContentLoaded', () => {
    
    fetchUsers();
    populateSelects(); 

    
    document.getElementById('addUserBtn').addEventListener('click', showAddUserForm);
    document.getElementById('closeFormBtn').addEventListener('click', hideAddUserForm);
    document.getElementById('cancelFormBtn').addEventListener('click', hideAddUserForm);
    document.getElementById('userForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('roleSelect').addEventListener('change', handleRoleChange);
    document.getElementById('searchInput').addEventListener('input', (e) => filterUsers(e.target.value));
});

let allUsers = [];
let currentEditingUserId = null;


function showAddUserForm() {
    currentEditingUserId = null;
    document.getElementById('userForm').reset();
    document.getElementById('formTitle').textContent = 'إضافة مستخدم جديد';
    document.getElementById('email').disabled = false;
    handleRoleChange({ target: { value: '' } });
    document.getElementById('addUserContainer').style.display = 'block';
    document.getElementById('addUserContainer').scrollIntoView({ behavior: 'smooth' });
}

function hideAddUserForm() {
    document.getElementById('addUserContainer').style.display = 'none';
}



async function fetchUsers() {
    try {
        const { data, error } = await supabaseClient.from('users').select(`id, prenom, nom, email, role, is_active, service:num_serv(desig_serv)`).order('created_at', { ascending: false });
        if (error) throw error;
        allUsers = data;
        renderUsersTable(allUsers);
    } catch (error) {
        console.error('Error fetching users:', error.message);
    }
}

function filterUsers(searchTerm) {
    const lowerCaseTerm = searchTerm.toLowerCase();
    const filtered = allUsers.filter(user => {
        const fullName = `${user.nom} ${user.prenom}`.toLowerCase();
        const email = user.email.toLowerCase();
        const role = user.role.toLowerCase();
        return fullName.includes(lowerCaseTerm) || email.includes(lowerCaseTerm) || role.includes(lowerCaseTerm);
    });
    renderUsersTable(filtered);
}

function renderUsersTable(users) {
    const tableBody = document.getElementById('usersTableBody');
    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">لا يوجد مستخدمون.</td></tr>';
        return;
    }
    tableBody.innerHTML = users.map(user => {
        const fullName = `${user.nom} ${user.prenom}`;
        let displayRole = user.role;
        if (user.role === 'chef_service' && user.service) {
            displayRole = `رئيس قسم: ${user.service.desig_serv}`;
        }
        return `
            <tr>
                <td>${fullName}</td><td class="role-cell">${displayRole}</td><td>${user.email}</td>
                <td><span class="status ${user.is_active ? 'status-active' : 'status-inactive'}">${user.is_active ? 'نشط' : 'غير نشط'}</span></td>
                <td class="actions">
                    <button class="btn-action btn-edit" onclick="openEditUserForm('${user.id}')" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" onclick="deleteUser('${user.id}', '${fullName}')" title="حذف"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    }).join('');
}

// **الدالة المصححة لتعبئة جميع القوائم المنسدلة**
async function populateSelects() {
    try {
        // 1. تعبئة قائمة الأدوار (يدوياً)
        const userRoles = ['directeur', 'pharmacien', 'chef_service', 'fournisseur'];
        const roleSelect = document.getElementById('roleSelect');
        roleSelect.innerHTML = '<option value="">-- اختر دورًا --</option>' + userRoles.map(role => `<option value="${role}">${role}</option>`).join('');

        // 2. جلب وتعبئة قائمة الأقسام
        const { data: services, error: servicesError } = await supabaseClient.from('service').select('num_serv, desig_serv');
        if (servicesError) throw servicesError;
        document.getElementById('serviceSelect').innerHTML = services.map(s => `<option value="${s.num_serv}">${s.desig_serv}</option>`).join('');

        // 3. جلب وتعبئة قائمة الموردين
        const { data: fournisseurs, error: fournisseursError } = await supabaseClient.from('fournisseur').select('cod_four, nom_four');
        if (fournisseursError) throw fournisseursError;
        document.getElementById('fournisseurSelect').innerHTML = fournisseurs.map(f => `<option value="${f.cod_four}">${f.nom_four}</option>`).join('');

    } catch (error) {
        console.error('Error populating selects:', error.message);
        alert('حدث خطأ أثناء تحميل بيانات النموذج (الأدوار، الأقسام، الموردين).');
    }
}

function handleRoleChange(e) {
    const role = e.target.value;
    document.getElementById('service-group').style.display = (role === 'chef_service') ? 'block' : 'none';
    document.getElementById('fournisseur-group').style.display = (role === 'fournisseur') ? 'block' : 'none';
}


async function handleFormSubmit(e) {
    e.preventDefault();
    currentEditingUserId ? await updateUser(currentEditingUserId) : await addUser();
}

async function addUser() {
    const role = document.getElementById('roleSelect').value;
    const newUser = {
        prenom: document.getElementById('firstName').value, nom: document.getElementById('lastName').value,
        email: document.getElementById('email').value, telephone: document.getElementById('phone').value,
        type_piece: document.getElementById('idType').value, num_piece: document.getElementById('idNumber').value,
        role: role, is_active: document.getElementById('isActive').checked, password: null,
        num_serv: role === 'chef_service' ? document.getElementById('serviceSelect').value : null,
        cod_four: role === 'fournisseur' ? document.getElementById('fournisseurSelect').value : null,
    };
    try {
        const { error } = await supabaseClient.from('users').insert([newUser]);
        if (error) throw error;
        alert('تمت إضافة المستخدم بنجاح!');
        hideAddUserForm();
        fetchUsers();
    } catch (error) {
        alert(`فشل في إضافة المستخدم: ${error.message}`);
    }
}

async function updateUser(userId) {
    const role = document.getElementById('roleSelect').value;
    const updatedData = {
        prenom: document.getElementById('firstName').value, nom: document.getElementById('lastName').value,
        email: document.getElementById('email').value, telephone: document.getElementById('phone').value,
        type_piece: document.getElementById('idType').value, num_piece: document.getElementById('idNumber').value,
        role: role, is_active: document.getElementById('isActive').checked,
        num_serv: role === 'chef_service' ? document.getElementById('serviceSelect').value : null,
        cod_four: role === 'fournisseur' ? document.getElementById('fournisseurSelect').value : null,
    };
    try {
        const { error } = await supabaseClient.from('users').update(updatedData).eq('id', userId);
        if (error) throw error;
        alert('تم تحديث بيانات المستخدم بنجاح.');
        hideAddUserForm();
        fetchUsers();
    } catch (error) {
        alert(`فشل في تحديث المستخدم: ${error.message}`);
    }
}

async function deleteUser(userId, userName) {
    if (!confirm(`هل أنت متأكد من حذف "${userName}"؟`)) return;
    try {
        const { error } = await supabaseClient.from('users').delete().eq('id', userId);
        if (error) throw error;
        alert('تم حذف المستخدم بنجاح.');
        fetchUsers();
    } catch (error) {
        alert(`فشل في حذف المستخدم: ${error.message}`);
    }
}

async function openEditUserForm(userId) {
    try {
        const { data: user, error } = await supabaseClient.from('users').select('*').eq('id', userId).single();
        if (error) throw error;
        
        showAddUserForm();
        document.getElementById('formTitle').textContent = 'تعديل بيانات المستخدم';
        currentEditingUserId = user.id;

        document.getElementById('firstName').value = user.prenom;
        document.getElementById('lastName').value = user.nom;
        document.getElementById('email').value = user.email;
        document.getElementById('email').disabled = true;
        document.getElementById('phone').value = user.telephone;
        document.getElementById('idType').value = user.type_piece;
        document.getElementById('idNumber').value = user.num_piece;
        document.getElementById('roleSelect').value = user.role;
        document.getElementById('isActive').checked = user.is_active;
        
        handleRoleChange({ target: { value: user.role } });
        if (user.role === 'chef_service') document.getElementById('serviceSelect').value = user.num_serv;
        if (user.role === 'fournisseur') document.getElementById('fournisseurSelect').value = user.cod_four;

    } catch (error) {
        alert('فشل في جلب بيانات المستخدم للتعديل.');
    }
}
