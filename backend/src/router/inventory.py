from flask import Blueprint, request, jsonify
from src.routes.auth import token_required
import datetime

inventory_bp = Blueprint('inventory', __name__)

# بيانات تجريبية للمخزون
temp_inventory = [
    {
        'id': 'MED001',
        'name': 'باراسيتامول 500mg',
        'generic_name': 'Paracetamol',
        'category': 'مسكنات الألم',
        'manufacturer': 'شركة الأدوية الجزائرية',
        'batch_number': 'B2025001',
        'quantity': 500,
        'unit': 'قرص',
        'unit_price': 2.50,
        'expiry_date': '2026-12-31',
        'minimum_stock': 100,
        'location': 'رف A1',
        'status': 'متوفر',
        'last_updated': '2025-06-13'
    },
    {
        'id': 'MED002',
        'name': 'أموكسيسيلين 250mg',
        'generic_name': 'Amoxicillin',
        'category': 'مضادات حيوية',
        'manufacturer': 'شركة المضادات الحيوية',
        'batch_number': 'B2025002',
        'quantity': 200,
        'unit': 'كبسولة',
        'unit_price': 5.00,
        'expiry_date': '2025-08-15',
        'minimum_stock': 50,
        'location': 'رف B2',
        'status': 'متوفر',
        'last_updated': '2025-06-13'
    },
    {
        'id': 'MED003',
        'name': 'أوميبرازول 20mg',
        'generic_name': 'Omeprazole',
        'category': 'أدوية الجهاز الهضمي',
        'manufacturer': 'شركة الأدوية المتقدمة',
        'batch_number': 'B2025003',
        'quantity': 150,
        'unit': 'كبسولة',
        'unit_price': 8.00,
        'expiry_date': '2027-03-20',
        'minimum_stock': 30,
        'location': 'رف C1',
        'status': 'متوفر',
        'last_updated': '2025-06-13'
    },
    {
        'id': 'MED004',
        'name': 'إنسولين سريع المفعول',
        'generic_name': 'Rapid Acting Insulin',
        'category': 'أدوية السكري',
        'manufacturer': 'شركة الأدوية الحيوية',
        'batch_number': 'B2025004',
        'quantity': 25,
        'unit': 'قلم',
        'unit_price': 150.00,
        'expiry_date': '2025-07-10',
        'minimum_stock': 20,
        'location': 'ثلاجة A',
        'status': 'نقص في المخزون',
        'last_updated': '2025-06-13'
    },
    {
        'id': 'MED005',
        'name': 'أسبرين 100mg',
        'generic_name': 'Aspirin',
        'category': 'مسكنات الألم',
        'manufacturer': 'شركة الأدوية الكلاسيكية',
        'batch_number': 'B2024005',
        'quantity': 50,
        'unit': 'قرص',
        'unit_price': 1.00,
        'expiry_date': '2025-06-20',
        'minimum_stock': 100,
        'location': 'رف A2',
        'status': 'منتهي الصلاحية قريباً',
        'last_updated': '2025-06-13'
    }
]

@inventory_bp.route('/', methods=['GET'])
@token_required
def get_inventory(current_user):
    try:
        # فلترة المخزون حسب المعايير
        category_filter = request.args.get('category')
        status_filter = request.args.get('status')
        search_query = request.args.get('search')
        
        filtered_inventory = temp_inventory.copy()
        
        if category_filter:
            filtered_inventory = [item for item in filtered_inventory if item['category'] == category_filter]
        
        if status_filter:
            filtered_inventory = [item for item in filtered_inventory if item['status'] == status_filter]
        
        if search_query:
            search_query = search_query.lower()
            filtered_inventory = [
                item for item in filtered_inventory 
                if search_query in item['name'].lower() or search_query in item['generic_name'].lower()
            ]
        
        return jsonify({
            'success': True,
            'inventory': filtered_inventory,
            'total': len(filtered_inventory)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@inventory_bp.route('/<item_id>', methods=['GET'])
@token_required
def get_inventory_item(current_user, item_id):
    try:
        item = next((item for item in temp_inventory if item['id'] == item_id), None)
        
        if not item:
            return jsonify({
                'success': False,
                'message': 'الصنف غير موجود'
            }), 404
        
        return jsonify({
            'success': True,
            'item': item
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@inventory_bp.route('/', methods=['POST'])
@token_required
def add_inventory_item(current_user):
    try:
        data = request.get_json()
        
        # التحقق من البيانات المطلوبة
        required_fields = ['name', 'category', 'quantity', 'unit', 'unit_price', 'expiry_date']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'الحقل {field} مطلوب'
                }), 400
        
        # إنشاء معرف جديد
        new_id = f"MED{len(temp_inventory) + 1:03d}"
        
        # تحديد حالة الصنف
        quantity = int(data['quantity'])
        minimum_stock = int(data.get('minimum_stock', 50))
        
        if quantity <= 0:
            status = 'غير متوفر'
        elif quantity <= minimum_stock:
            status = 'نقص في المخزون'
        else:
            status = 'متوفر'
        
        new_item = {
            'id': new_id,
            'name': data['name'],
            'generic_name': data.get('generic_name', ''),
            'category': data['category'],
            'manufacturer': data.get('manufacturer', ''),
            'batch_number': data.get('batch_number', ''),
            'quantity': quantity,
            'unit': data['unit'],
            'unit_price': float(data['unit_price']),
            'expiry_date': data['expiry_date'],
            'minimum_stock': minimum_stock,
            'location': data.get('location', ''),
            'status': status,
            'last_updated': datetime.datetime.now().strftime('%Y-%m-%d')
        }
        
        temp_inventory.append(new_item)
        
        return jsonify({
            'success': True,
            'message': 'تم إضافة الصنف بنجاح',
            'item': new_item
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@inventory_bp.route('/<item_id>', methods=['PUT'])
@token_required
def update_inventory_item(current_user, item_id):
    try:
        item = next((item for item in temp_inventory if item['id'] == item_id), None)
        
        if not item:
            return jsonify({
                'success': False,
                'message': 'الصنف غير موجود'
            }), 404
        
        data = request.get_json()
        
        # تحديث البيانات
        for key, value in data.items():
            if key in item and key != 'id':
                item[key] = value
        
        # إعادة تحديد الحالة
        quantity = int(item['quantity'])
        minimum_stock = int(item['minimum_stock'])
        
        if quantity <= 0:
            item['status'] = 'غير متوفر'
        elif quantity <= minimum_stock:
            item['status'] = 'نقص في المخزون'
        else:
            item['status'] = 'متوفر'
        
        item['last_updated'] = datetime.datetime.now().strftime('%Y-%m-%d')
        
        return jsonify({
            'success': True,
            'message': 'تم تحديث الصنف بنجاح',
            'item': item
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@inventory_bp.route('/stats', methods=['GET'])
@token_required
def get_inventory_stats(current_user):
    try:
        total_items = len(temp_inventory)
        available_items = len([item for item in temp_inventory if item['status'] == 'متوفر'])
        low_stock_items = len([item for item in temp_inventory if item['status'] == 'نقص في المخزون'])
        out_of_stock_items = len([item for item in temp_inventory if item['status'] == 'غير متوفر'])
        expiring_soon_items = len([item for item in temp_inventory if item['status'] == 'منتهي الصلاحية قريباً'])
        
        total_value = sum(item['quantity'] * item['unit_price'] for item in temp_inventory)
        
        categories = {}
        for item in temp_inventory:
            category = item['category']
            if category not in categories:
                categories[category] = 0
            categories[category] += 1
        
        return jsonify({
            'success': True,
            'stats': {
                'total_items': total_items,
                'available': available_items,
                'low_stock': low_stock_items,
                'out_of_stock': out_of_stock_items,
                'expiring_soon': expiring_soon_items,
                'total_value': total_value,
                'categories': categories
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@inventory_bp.route('/low-stock', methods=['GET'])
@token_required
def get_low_stock_items(current_user):
    try:
        low_stock_items = [
            item for item in temp_inventory 
            if item['quantity'] <= item['minimum_stock']
        ]
        
        return jsonify({
            'success': True,
            'items': low_stock_items,
            'total': len(low_stock_items)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

