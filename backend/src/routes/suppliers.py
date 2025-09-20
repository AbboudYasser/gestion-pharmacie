from flask import Blueprint, request, jsonify
from src.routes.auth import token_required

suppliers_bp = Blueprint('suppliers', __name__)

# بيانات تجريبية للموردين
temp_suppliers = [
    {
        'id': 'SUP001',
        'name': 'شركة الأدوية الجزائرية',
        'contact_person': 'أحمد بن علي',
        'email': 'contact@algerian-pharma.dz',
        'phone': '+213 21 123 456',
        'address': 'الجزائر العاصمة، الجزائر',
        'specialties': ['مسكنات الألم', 'مضادات الالتهاب'],
        'rating': 4.5,
        'status': 'نشط',
        'registration_date': '2023-01-15',
        'last_order_date': '2025-06-10'
    },
    {
        'id': 'SUP002',
        'name': 'شركة المضادات الحيوية المتقدمة',
        'contact_person': 'فاطمة محمد',
        'email': 'info@advanced-antibiotics.dz',
        'phone': '+213 31 789 012',
        'address': 'وهران، الجزائر',
        'specialties': ['مضادات حيوية', 'أدوية الجهاز التنفسي'],
        'rating': 4.8,
        'status': 'نشط',
        'registration_date': '2022-08-20',
        'last_order_date': '2025-06-12'
    },
    {
        'id': 'SUP003',
        'name': 'شركة الأدوية الحيوية',
        'contact_person': 'محمد الأمين',
        'email': 'sales@bio-pharma.dz',
        'phone': '+213 25 345 678',
        'address': 'قسنطينة، الجزائر',
        'specialties': ['أدوية السكري', 'الهرمونات'],
        'rating': 4.2,
        'status': 'نشط',
        'registration_date': '2023-03-10',
        'last_order_date': '2025-06-08'
    },
    {
        'id': 'SUP004',
        'name': 'شركة الأدوية الطبيعية',
        'contact_person': 'سارة بوعلام',
        'email': 'contact@natural-meds.dz',
        'phone': '+213 38 901 234',
        'address': 'سطيف، الجزائر',
        'specialties': ['الأدوية الطبيعية', 'المكملات الغذائية'],
        'rating': 3.9,
        'status': 'معلق',
        'registration_date': '2024-01-05',
        'last_order_date': '2025-05-20'
    }
]

# بيانات تجريبية لطلبات الشراء
temp_purchase_orders = [
    {
        'id': 'PO001',
        'supplier_id': 'SUP001',
        'supplier_name': 'شركة الأدوية الجزائرية',
        'order_date': '2025-06-10',
        'expected_delivery': '2025-06-15',
        'status': 'معلق',
        'total_amount': 15000.00,
        'items': [
            {
                'medication_name': 'باراسيتامول 500mg',
                'quantity': 1000,
                'unit_price': 2.50,
                'total_price': 2500.00
            },
            {
                'medication_name': 'أسبرين 100mg',
                'quantity': 2000,
                'unit_price': 1.00,
                'total_price': 2000.00
            }
        ],
        'notes': 'طلب عاجل للمخزون'
    },
    {
        'id': 'PO002',
        'supplier_id': 'SUP002',
        'supplier_name': 'شركة المضادات الحيوية المتقدمة',
        'order_date': '2025-06-12',
        'expected_delivery': '2025-06-18',
        'status': 'تم التسليم',
        'delivery_date': '2025-06-13',
        'total_amount': 8000.00,
        'items': [
            {
                'medication_name': 'أموكسيسيلين 250mg',
                'quantity': 500,
                'unit_price': 5.00,
                'total_price': 2500.00
            }
        ],
        'notes': 'تم التسليم في الموعد المحدد'
    }
]

@suppliers_bp.route('/', methods=['GET'])
@token_required
def get_suppliers(current_user):
    try:
        status_filter = request.args.get('status')
        search_query = request.args.get('search')
        
        filtered_suppliers = temp_suppliers.copy()
        
        if status_filter:
            filtered_suppliers = [s for s in filtered_suppliers if s['status'] == status_filter]
        
        if search_query:
            search_query = search_query.lower()
            filtered_suppliers = [
                s for s in filtered_suppliers 
                if search_query in s['name'].lower() or search_query in s['contact_person'].lower()
            ]
        
        return jsonify({
            'success': True,
            'suppliers': filtered_suppliers,
            'total': len(filtered_suppliers)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@suppliers_bp.route('/<supplier_id>', methods=['GET'])
@token_required
def get_supplier(current_user, supplier_id):
    try:
        supplier = next((s for s in temp_suppliers if s['id'] == supplier_id), None)
        
        if not supplier:
            return jsonify({
                'success': False,
                'message': 'المورد غير موجود'
            }), 404
        
        return jsonify({
            'success': True,
            'supplier': supplier
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@suppliers_bp.route('/', methods=['POST'])
@token_required
def add_supplier(current_user):
    try:
        data = request.get_json()
        
        # التحقق من البيانات المطلوبة
        required_fields = ['name', 'contact_person', 'email', 'phone', 'address']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'الحقل {field} مطلوب'
                }), 400
        
        # إنشاء معرف جديد
        new_id = f"SUP{len(temp_suppliers) + 1:03d}"
        
        new_supplier = {
            'id': new_id,
            'name': data['name'],
            'contact_person': data['contact_person'],
            'email': data['email'],
            'phone': data['phone'],
            'address': data['address'],
            'specialties': data.get('specialties', []),
            'rating': 0.0,
            'status': 'نشط',
            'registration_date': datetime.datetime.now().strftime('%Y-%m-%d'),
            'last_order_date': None
        }
        
        temp_suppliers.append(new_supplier)
        
        return jsonify({
            'success': True,
            'message': 'تم إضافة المورد بنجاح',
            'supplier': new_supplier
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@suppliers_bp.route('/orders', methods=['GET'])
@token_required
def get_purchase_orders(current_user):
    try:
        status_filter = request.args.get('status')
        supplier_filter = request.args.get('supplier_id')
        
        filtered_orders = temp_purchase_orders.copy()
        
        if status_filter:
            filtered_orders = [o for o in filtered_orders if o['status'] == status_filter]
        
        if supplier_filter:
            filtered_orders = [o for o in filtered_orders if o['supplier_id'] == supplier_filter]
        
        return jsonify({
            'success': True,
            'orders': filtered_orders,
            'total': len(filtered_orders)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@suppliers_bp.route('/orders', methods=['POST'])
@token_required
def create_purchase_order(current_user):
    try:
        data = request.get_json()
        
        # التحقق من البيانات المطلوبة
        required_fields = ['supplier_id', 'items', 'expected_delivery']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'الحقل {field} مطلوب'
                }), 400
        
        # البحث عن المورد
        supplier = next((s for s in temp_suppliers if s['id'] == data['supplier_id']), None)
        if not supplier:
            return jsonify({
                'success': False,
                'message': 'المورد غير موجود'
            }), 404
        
        # حساب المبلغ الإجمالي
        total_amount = sum(item['quantity'] * item['unit_price'] for item in data['items'])
        
        # إنشاء معرف جديد
        new_id = f"PO{len(temp_purchase_orders) + 1:03d}"
        
        new_order = {
            'id': new_id,
            'supplier_id': data['supplier_id'],
            'supplier_name': supplier['name'],
            'order_date': datetime.datetime.now().strftime('%Y-%m-%d'),
            'expected_delivery': data['expected_delivery'],
            'status': 'معلق',
            'total_amount': total_amount,
            'items': data['items'],
            'notes': data.get('notes', '')
        }
        
        temp_purchase_orders.append(new_order)
        
        return jsonify({
            'success': True,
            'message': 'تم إنشاء طلب الشراء بنجاح',
            'order': new_order
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@suppliers_bp.route('/stats', methods=['GET'])
@token_required
def get_supplier_stats(current_user):
    try:
        total_suppliers = len(temp_suppliers)
        active_suppliers = len([s for s in temp_suppliers if s['status'] == 'نشط'])
        pending_orders = len([o for o in temp_purchase_orders if o['status'] == 'معلق'])
        total_order_value = sum(o['total_amount'] for o in temp_purchase_orders)
        
        return jsonify({
            'success': True,
            'stats': {
                'total_suppliers': total_suppliers,
                'active_suppliers': active_suppliers,
                'pending_orders': pending_orders,
                'total_order_value': total_order_value
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

