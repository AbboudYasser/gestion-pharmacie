from flask import Blueprint, request, jsonify
from src.routes.auth import token_required
import datetime

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard_stats(current_user):
    try:
        # إحصائيات عامة للوحة التحكم
        today = datetime.datetime.now().strftime('%Y-%m-%d')
        
        # إحصائيات الوصفات
        from src.routes.prescriptions import temp_prescriptions
        total_prescriptions = len(temp_prescriptions)
        today_prescriptions = len([p for p in temp_prescriptions if p['created_date'] == today])
        pending_prescriptions = len([p for p in temp_prescriptions if p['status'] == 'معلقة'])
        
        # إحصائيات المخزون
        from src.routes.inventory import temp_inventory
        total_medications = len(temp_inventory)
        low_stock_count = len([item for item in temp_inventory if item['quantity'] <= item['minimum_stock']])
        expired_medications = len([item for item in temp_inventory if item['status'] == 'منتهي الصلاحية قريباً'])
        
        # إحصائيات الموردين
        from src.routes.suppliers import temp_suppliers, temp_purchase_orders
        active_suppliers = len([s for s in temp_suppliers if s['status'] == 'نشط'])
        pending_orders = len([o for o in temp_purchase_orders if o['status'] == 'معلق'])
        
        # الأدوية الأكثر طلباً (محاكاة)
        popular_medications = [
            {'name': 'باراسيتامول 500mg', 'requests': 45},
            {'name': 'أموكسيسيلين 250mg', 'requests': 32},
            {'name': 'أوميبرازول 20mg', 'requests': 28},
            {'name': 'أسبرين 100mg', 'requests': 25},
            {'name': 'إنسولين سريع المفعول', 'requests': 18}
        ]
        
        return jsonify({
            'success': True,
            'stats': {
                'prescriptions': {
                    'total': total_prescriptions,
                    'today': today_prescriptions,
                    'pending': pending_prescriptions
                },
                'inventory': {
                    'total_medications': total_medications,
                    'low_stock': low_stock_count,
                    'expired_soon': expired_medications
                },
                'suppliers': {
                    'active_suppliers': active_suppliers,
                    'pending_orders': pending_orders
                },
                'popular_medications': popular_medications
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@reports_bp.route('/prescriptions', methods=['GET'])
@token_required
def get_prescriptions_report(current_user):
    try:
        # تقرير الوصفات الطبية
        from src.routes.prescriptions import temp_prescriptions
        
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        filtered_prescriptions = temp_prescriptions.copy()
        
        if start_date:
            filtered_prescriptions = [p for p in filtered_prescriptions if p['created_date'] >= start_date]
        
        if end_date:
            filtered_prescriptions = [p for p in filtered_prescriptions if p['created_date'] <= end_date]
        
        # إحصائيات التقرير
        total_prescriptions = len(filtered_prescriptions)
        dispensed_count = len([p for p in filtered_prescriptions if p['status'] == 'مصروفة'])
        pending_count = len([p for p in filtered_prescriptions if p['status'] == 'معلقة'])
        
        # إحصائيات الأطباء
        doctors_stats = {}
        for prescription in filtered_prescriptions:
            doctor = prescription['doctor_name']
            if doctor not in doctors_stats:
                doctors_stats[doctor] = 0
            doctors_stats[doctor] += 1
        
        # إحصائيات الأقسام
        departments_stats = {}
        for prescription in filtered_prescriptions:
            dept = prescription.get('department', 'غير محدد')
            if dept not in departments_stats:
                departments_stats[dept] = 0
            departments_stats[dept] += 1
        
        return jsonify({
            'success': True,
            'report': {
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'summary': {
                    'total_prescriptions': total_prescriptions,
                    'dispensed': dispensed_count,
                    'pending': pending_count,
                    'dispensing_rate': round((dispensed_count / total_prescriptions * 100) if total_prescriptions > 0 else 0, 2)
                },
                'doctors_stats': doctors_stats,
                'departments_stats': departments_stats,
                'prescriptions': filtered_prescriptions
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@reports_bp.route('/inventory', methods=['GET'])
@token_required
def get_inventory_report(current_user):
    try:
        # تقرير المخزون
        from src.routes.inventory import temp_inventory
        
        category_filter = request.args.get('category')
        
        filtered_inventory = temp_inventory.copy()
        
        if category_filter:
            filtered_inventory = [item for item in filtered_inventory if item['category'] == category_filter]
        
        # إحصائيات التقرير
        total_items = len(filtered_inventory)
        total_value = sum(item['quantity'] * item['unit_price'] for item in filtered_inventory)
        
        # إحصائيات الحالة
        status_stats = {}
        for item in filtered_inventory:
            status = item['status']
            if status not in status_stats:
                status_stats[status] = {'count': 0, 'value': 0}
            status_stats[status]['count'] += 1
            status_stats[status]['value'] += item['quantity'] * item['unit_price']
        
        # إحصائيات الفئات
        category_stats = {}
        for item in filtered_inventory:
            category = item['category']
            if category not in category_stats:
                category_stats[category] = {'count': 0, 'value': 0}
            category_stats[category]['count'] += 1
            category_stats[category]['value'] += item['quantity'] * item['unit_price']
        
        # الأصناف منخفضة المخزون
        low_stock_items = [item for item in filtered_inventory if item['quantity'] <= item['minimum_stock']]
        
        return jsonify({
            'success': True,
            'report': {
                'summary': {
                    'total_items': total_items,
                    'total_value': total_value,
                    'low_stock_count': len(low_stock_items)
                },
                'status_stats': status_stats,
                'category_stats': category_stats,
                'low_stock_items': low_stock_items,
                'inventory': filtered_inventory
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@reports_bp.route('/financial', methods=['GET'])
@token_required
def get_financial_report(current_user):
    try:
        # تقرير مالي
        from src.routes.inventory import temp_inventory
        from src.routes.suppliers import temp_purchase_orders
        
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # قيمة المخزون الحالي
        inventory_value = sum(item['quantity'] * item['unit_price'] for item in temp_inventory)
        
        # مصروفات الشراء
        filtered_orders = temp_purchase_orders.copy()
        
        if start_date:
            filtered_orders = [o for o in filtered_orders if o['order_date'] >= start_date]
        
        if end_date:
            filtered_orders = [o for o in filtered_orders if o['order_date'] <= end_date]
        
        total_purchases = sum(order['total_amount'] for order in filtered_orders)
        completed_purchases = sum(order['total_amount'] for order in filtered_orders if order['status'] == 'تم التسليم')
        pending_purchases = sum(order['total_amount'] for order in filtered_orders if order['status'] == 'معلق')
        
        # إحصائيات الموردين
        supplier_spending = {}
        for order in filtered_orders:
            supplier = order['supplier_name']
            if supplier not in supplier_spending:
                supplier_spending[supplier] = 0
            supplier_spending[supplier] += order['total_amount']
        
        return jsonify({
            'success': True,
            'report': {
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'summary': {
                    'inventory_value': inventory_value,
                    'total_purchases': total_purchases,
                    'completed_purchases': completed_purchases,
                    'pending_purchases': pending_purchases
                },
                'supplier_spending': supplier_spending,
                'purchase_orders': filtered_orders
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@reports_bp.route('/usage', methods=['GET'])
@token_required
def get_usage_report(current_user):
    try:
        # تقرير الاستخدام (محاكاة)
        from src.routes.users import temp_users_detailed
        
        # إحصائيات المستخدمين
        users_list = list(temp_users_detailed.values())
        active_users = len([u for u in users_list if u['status'] == 'نشط'])
        
        # محاكاة بيانات الاستخدام
        usage_stats = {
            'daily_logins': [
                {'date': '2025-06-09', 'logins': 12},
                {'date': '2025-06-10', 'logins': 15},
                {'date': '2025-06-11', 'logins': 18},
                {'date': '2025-06-12', 'logins': 14},
                {'date': '2025-06-13', 'logins': 16}
            ],
            'feature_usage': {
                'prescriptions': 85,
                'inventory': 72,
                'suppliers': 45,
                'reports': 38,
                'users': 25
            },
            'peak_hours': [
                {'hour': '08:00', 'activity': 25},
                {'hour': '09:00', 'activity': 45},
                {'hour': '10:00', 'activity': 60},
                {'hour': '11:00', 'activity': 55},
                {'hour': '14:00', 'activity': 40},
                {'hour': '15:00', 'activity': 35}
            ]
        }
        
        return jsonify({
            'success': True,
            'report': {
                'summary': {
                    'active_users': active_users,
                    'total_users': len(users_list)
                },
                'usage_stats': usage_stats
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

