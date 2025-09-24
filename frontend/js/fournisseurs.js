




let currentEditingSupplierId = null;


document.addEventListener('DOMContentLoaded', function() {
    
    loadAndDisplaySuppliers();

    
    const addSupplierBtn = document.getElementById('add-supplier-btn');
    const supplierModal = document.getElementById('supplier-modal');
    const cancelBtn = document.getElementById('cancel-supplier-btn');
    const supplierForm = document.getElementById('supplier-form');

    
    addSupplierBtn.addEventListener('click', showAddModal);

    
    cancelBtn.addEventListener('click', () => {
        supplierModal.style.display = 'none';
    });

    
    supplierForm.addEventListener('submit', handleFormSubmit);
});


async function loadAndDisplaySuppliers() {
    const tableBody = document.getElementById('suppliers-table-body');
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> جاري تحميل بيانات الموردين...</td></tr>`;

    try {
        
        const { data: suppliers, error } = await supabaseClient
            .from('fournisseur')
            .select('*')
            .order('nom_four', { ascending: true });

        if (error) throw error;

        tableBody.innerHTML = ''; // تفريغ الجدول
        if (suppliers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا يوجد موردون لعرضهم.</td></tr>';
            return;
        }

        // عرض البيانات في الجدول
        suppliers.forEach(supplier => {
            const row = document.createElement('tr');
            row.dataset.id = supplier.cod_four; 
            row.innerHTML = `
                <td>${supplier.nom_four || 'غير متوفر'}</td>
                <td>${supplier.adres_four || 'غير متوفر'}</td>
                <td>${supplier.num_tel_four || 'غير متوفر'}</td>
                <td>${supplier.nom_comp_four || 'غير متوفر'}</td>
                <td class="action-buttons">
                    <button onclick="handleEdit('${supplier.cod_four}')" class="btn-sm btn-warning" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button onclick="handleDelete('${supplier.cod_four}')" class="btn-sm btn-danger" title="حذف"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('❌ خطأ في جلب الموردين:', error.message);
        tableBody.innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">فشل تحميل البيانات: ${error.message}</td></tr>`;
    }
}


function showAddModal() {
    currentEditingSupplierId = null; 
    document.getElementById('modal-title').textContent = 'إضافة مورد جديد';
    document.getElementById('supplier-form').reset();
    document.getElementById('cod_four').disabled = false; 
    document.getElementById('supplier-modal').style.display = 'flex';
}


async function handleEdit(supplierId) {
    try {
        
        const { data: supplier, error } = await supabaseClient
            .from('fournisseur')
            .select('*')
            .eq('cod_four', supplierId)
            .single(); 

        if (error) throw error;

        
        document.getElementById('cod_four').value = supplier.cod_four;
        document.getElementById('nom_four').value = supplier.nom_four;
        document.getElementById('adres_four').value = supplier.adres_four;
        document.getElementById('num_tel_four').value = supplier.num_tel_four;
        document.getElementById('nom_comp_four').value = supplier.nom_comp_four;

        
        currentEditingSupplierId = supplierId;
        document.getElementById('modal-title').textContent = 'تعديل بيانات المورد';
        document.getElementById('cod_four').disabled = true; 
        document.getElementById('supplier-modal').style.display = 'flex';

    } catch (error) {
        console.error('خطأ في جلب بيانات المورد للتعديل:', error.message);
        alert('فشل في تحميل بيانات المورد. يرجى المحاولة مرة أخرى.');
    }
}


async function handleFormSubmit(event) {
    event.preventDefault(); 

    
    const supplierData = {
        cod_four: document.getElementById('cod_four').value,
        nom_four: document.getElementById('nom_four').value,
        adres_four: document.getElementById('adres_four').value,
        num_tel_four: document.getElementById('num_tel_four').value,
        nom_comp_four: document.getElementById('nom_comp_four').value,
    };

    try {
        let error;
        if (currentEditingSupplierId) {
            
            const { error: updateError } = await supabaseClient
                .from('fournisseur')
                .update(supplierData)
                .eq('cod_four', currentEditingSupplierId);
            error = updateError;
        } else {
            
            const { error: insertError } = await supabaseClient
                .from('fournisseur')
                .insert([supplierData]);
            error = insertError;
        }

        if (error) throw error;

        
        document.getElementById('supplier-modal').style.display = 'none'; 
        loadAndDisplaySuppliers(); 
        alert(currentEditingSupplierId ? 'تم تحديث المورد بنجاح!' : 'تمت إضافة المورد بنجاح!');

    } catch (error) {
        console.error('خطأ في حفظ المورد:', error.message);
        alert(`فشل حفظ المورد: ${error.message}`);
    }
}


function handleDelete(supplierId) {
    const deleteModal = document.getElementById('delete-confirm-modal');
    deleteModal.style.display = 'flex';

    const confirmBtn = document.getElementById('confirm-delete-btn');
    const cancelBtn = document.getElementById('cancel-delete-btn');

    
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.onclick = async () => {
        try {
            
            const { error } = await supabaseClient
                .from('fournisseur')
                .delete()
                .eq('cod_four', supplierId);

            if (error) throw error;

            
            deleteModal.style.display = 'none'; 
            loadAndDisplaySuppliers(); 
            alert('تم حذف المورد بنجاح.');

        } catch (error) {
            console.error('خطأ في حذف المورد:', error.message);
            alert(`فشل حذف المورد: ${error.message}`);
            deleteModal.style.display = 'none';
        }
    };

    cancelBtn.onclick = () => {
        deleteModal.style.display = 'none';
    };
}
