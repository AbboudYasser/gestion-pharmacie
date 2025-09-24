document.addEventListener('DOMContentLoaded', function() {
    loadAndDisplayProducts();

    
    document.getElementById('add-product-btn').addEventListener('click', showAddProductModal);
    document.getElementById('cancel-product-btn').addEventListener('click', hideProductModal);
    document.getElementById('product-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancel-delete-btn').addEventListener('click', hideDeleteModal);
    document.getElementById('confirm-delete-btn').addEventListener('click', deleteProduct);
});

let productToDeleteId = null;
let isEditMode = false;




async function loadAndDisplayProducts() {
    const tableBody = document.getElementById('products-table-body');
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> جاري تحميل البيانات...</td></tr>`;

    try {
        const { data: products, error } = await supabaseClient.from('produit').select('*');
        if (error) throw error;

        tableBody.innerHTML = '';
        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد منتجات لعرضها.</td></tr>';
            return;
        }

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.desig_prod || ''}</td>
                <td>${product.p_u || 0}</td>
                <td>${product.qte_stc || 0}</td>
                <td>${product.typ_prod || ''}</td>
                <td class="action-buttons">
                    <button class="btn-sm btn-info" onclick="viewProduct('${product.ref_prod}')" title="عرض"><i class="fas fa-eye"></i></button>
                    <button class="btn-sm btn-warning" onclick="showEditModal('${product.ref_prod}')" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="btn-sm btn-danger" onclick="showDeleteModal('${product.ref_prod}')" title="حذف"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('❌ خطأ في جلب المنتجات:', error.message);
        tableBody.innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">فشل تحميل البيانات.</td></tr>`;
    }
}

function showDeleteModal(productId) {
    productToDeleteId = productId;
    document.getElementById('delete-confirm-modal').style.display = 'flex';
}

function hideDeleteModal() {
    document.getElementById('delete-confirm-modal').style.display = 'none';
    productToDeleteId = null;
}

async function deleteProduct() {
    if (!productToDeleteId) return;
    try {
        const { error } = await supabaseClient.from('produit').delete().eq('ref_prod', productToDeleteId);
        if (error) throw error;
        hideDeleteModal();
        loadAndDisplayProducts();
    } catch (error) {
        alert(`فشل حذف المنتج: ${error.message}`);
    }
}






function showAddProductModal() {
    isEditMode = false;
    document.getElementById('product-form').reset();
    document.getElementById('modal-title').innerText = 'إضافة منتج جديد';
    document.getElementById('ref_prod').disabled = false; 
    document.getElementById('product-modal').style.display = 'flex';
}


async function showEditModal(productId) {
    isEditMode = true;
    try {
        const { data, error } = await supabaseClient.from('produit').select('*').eq('ref_prod', productId).single();
        if (error) throw error;

        
        document.getElementById('ref_prod').value = data.ref_prod;
        document.getElementById('desig_prod').value = data.desig_prod;
        document.getElementById('p_u').value = data.p_u;
        document.getElementById('qte_stc').value = data.qte_stc;
        document.getElementById('typ_prod').value = data.typ_prod;
        document.getElementById('num_mag').value = data.num_mag;

        document.getElementById('modal-title').innerText = 'تعديل المنتج';
        document.getElementById('ref_prod').disabled = true; 
        document.getElementById('product-modal').style.display = 'flex';
    } catch (error) {
        alert(`فشل في جلب بيانات المنتج للتعديل: ${error.message}`);
    }
}


function hideProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}


async function handleFormSubmit(event) {
    event.preventDefault();
    const refProd = document.getElementById('ref_prod').value;

    const productData = {
        desig_prod: document.getElementById('desig_prod').value,
        p_u: parseFloat(document.getElementById('p_u').value),
        qte_stc: parseInt(document.getElementById('qte_stc').value),
        typ_prod: document.getElementById('typ_prod').value,
        num_mag: document.getElementById('num_mag').value,
    };

    try {
        let error;
        if (isEditMode) {
            
            const { error: updateError } = await supabaseClient.from('produit').update(productData).eq('ref_prod', refProd);
            error = updateError;
        } else {
            
            productData.ref_prod = refProd; 
            const { error: insertError } = await supabaseClient.from('produit').insert([productData]);
            error = insertError;
        }

        if (error) throw error;

        hideProductModal();
        loadAndDisplayProducts();
    } catch (error) {
        alert(`فشل حفظ المنتج: ${error.message}`);
    }
}


function viewProduct(productId) {
    alert(`سيتم عرض تفاصيل المنتج: ${productId}`);
}
