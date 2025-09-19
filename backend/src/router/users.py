from flask import Blueprint, request, jsonify
from src.routes.auth import token_required

users_bp = Blueprint('users', __name__)

# بيانات تجريبية للمستخدمين (نفس البيانات من auth.py مع تفاصيل إضافية)
temp_users_detailed = {
    'admin': {
        'username': 'admin',
        'name': 'أحمد محمد',
        'email': 'admin@hospital.dz',
        'role': 'hospital_manager',
        'department': 'الإدارة العامة',
        'phone': '+213 21 123 456',
        'status': 'نشط',
        'last_login': '2025-06-13 08:30:00',
        'created_date': '2023-01-01',
        'permissions': ['all']
    },
    'pharmacy_head': {
        'username': 'pharmacy_head',
        'name': 'فاطمة علي',
        'email': 'pharmacy.head@hospital.dz',
        'role': 'pharmacy_head',
        'department': 'الصيدلية الرئيسية',
        'phone': '+213 21 234 567',
        'status': 'نشط',
        'last_login': '2025-06-13 09:15:00',
        'created_date': '2023-02-15',
        'permissions': ['prescriptions', 'inventory', 'suppliers', 'reports']
    },
    'pharmacist1': {
        'username': 'pharmacist1',
        'name': 'محمد حسن',
        'email': 'pharmacist1@hospital.dz',
        'role': 'department_pharmacist',
        'department': 'صيدلية الطوارئ',
        'phone': '+213 21 345 678',
        'status': 'نشط',
        'last_login': '2025-06-13 07:45:00',
        'created_date': '2023-03-20',
        'permissions': ['prescriptions', 'inventory']
    },
    'doctor1': {
        'username': 'doctor1',
        'name': 'د. سارة أحمد',
        'email': 'doctor1@hospital.dz',
        'role': 'doctor',
        'department': 'الطب الباطني',
        'phone': '+213 21 456 789',
        'status': 'نشط',
        'last_login': '2025-06-13 10:00:00',
        'created_date': '2023-04-10',
        'permissions': ['prescriptions']
    },
    'supplier1': {
        'username': 'supplier1',
        'name': 'شركة الأدوية المتحدة',
        'email': 'supplier1@pharma.dz',
        'role': 'supplier',
        'department': 'خارجي',
        'phone': '+213 31 567 890',
        'status': 'نشط',
        'last_login': '2025-06-12 16:30:00',
        'created_date': '2023-05-01',
        'permissions': ['suppliers']
    }
}

@users_bp.route('/', methods=['GET'])
@token_required
def get_users(current_user):
    try:
        # التحقق من صلاحيات المستخدم
        current_user_data = temp_users_detailed.get(current_user)
        if not current_user_data or current_user_data['role'] not in ['hospital_manager', 'pharmacy_head']:
            return jsonify({
                'success': False,
                'message': 'ليس لديك صلاحية لعرض المستخدمين'
            }), 403
        
        role_filter = request.args.get('role')
        status_filter = request.args.get('status')
        search_query = request.args.get('search')
        
        # تحويل البيانات إلى قائمة
        users_list = list(temp_users_detailed.values())
        
        if role_filter:
            users_list = [u for u in users_list if u['role'] == role_filter]
        
        if status_filter:
            users_list = [u for u in users_list if u['status'] == status_filter]
        
        if search_query:
            search_query = search_query.lower()
            users_list = [
                u for u in users_list 
                if search_query in u['name'].lower() or search_query in u['email'].lower()
            ]
        
        # إزالة كلمات المرور من النتائج
        safe_users = []
        for user in users_list:
            safe_user = user.copy()
            safe_users.append(safe_user)
        
        return jsonify({
            'success': True,
            'users': safe_users,
            'total': len(safe_users)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@users_bp.route('/<username>', methods=['GET'])
@token_required
def get_user(current_user, username):
    try:
        # التحقق من الصلاحيات
        current_user_data = temp_users_detailed.get(current_user)
        if not current_user_data:
            return jsonify({
                'success': False,
                'message': 'المستخدم غير موجود'
            }), 404
        
        # السماح للمستخدم بعرض بياناته الخاصة أو للمدراء بعرض جميع البيانات
        if current_user != username and current_user_data['role'] not in ['hospital_manager', 'pharmacy_head']:
            return jsonify({
                'success': False,
                'message': 'ليس لديك صلاحية لعرض بيانات هذا المستخدم'
            }), 403
        
        user = temp_users_detailed.get(username)
        if not user:
            return jsonify({
                'success': False,
                'message': 'المستخدم غير موجود'
            }), 404
        
        # إزالة كلمة المرور من النتيجة
        safe_user = user.copy()
        
        return jsonify({
            'success': True,
            'user': safe_user
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@users_bp.route('/', methods=['POST'])
@token_required
def create_user(current_user):
    try:
        # التحقق من صلاحيات المستخدم
        current_user_data = temp_users_detailed.get(current_user)
        if not current_user_data or current_user_data['role'] != 'hospital_manager':
            return jsonify({
                'success': False,
                'message': 'ليس لديك صلاحية لإنشاء مستخدمين جدد'
            }), 403
        
        data = request.get_json()
        
        # التحقق من البيانات المطلوبة
        required_fields = ['username', 'name', 'email', 'role', 'department', 'phone']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'الحقل {field} مطلوب'
                }), 400
        
        # التحقق من عدم وجود المستخدم
        if data['username'] in temp_users_detailed:
            return jsonify({
                'success': False,
                'message': 'اسم المستخدم موجود بالفعل'
            }), 400
        
        # تحديد الصلاحيات حسب الدور
        role_permissions = {
            'hospital_manager': ['all'],
            'pharmacy_head': ['prescriptions', 'inventory', 'suppliers', 'reports'],
            'department_pharmacist': ['prescriptions', 'inventory'],
            'doctor': ['prescriptions'],
            'supplier': ['suppliers']
        }
        
        new_user = {
            'username': data['username'],
            'name': data['name'],
            'email': data['email'],
            'role': data['role'],
            'department': data['department'],
            'phone': data['phone'],
            'status': 'نشط',
            'last_login': None,
            'created_date': datetime.datetime.now().strftime('%Y-%m-%d'),
            'permissions': role_permissions.get(data['role'], [])
        }
        
        temp_users_detailed[data['username']] = new_user
        
        return jsonify({
            'success': True,
            'message': 'تم إنشاء المستخدم بنجاح',
            'user': new_user
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@users_bp.route('/<username>', methods=['PUT'])
@token_required
def update_user(current_user, username):
    try:
        # التحقق من الصلاحيات
        current_user_data = temp_users_detailed.get(current_user)
        if not current_user_data:
            return jsonify({
                'success': False,
                'message': 'المستخدم غير موجود'
            }), 404
        
        # السماح للمستخدم بتحديث بياناته الخاصة أو للمدراء بتحديث جميع البيانات
        if current_user != username and current_user_data['role'] not in ['hospital_manager', 'pharmacy_head']:
            return jsonify({
                'success': False,
                'message': 'ليس لديك صلاحية لتحديث بيانات هذا المستخدم'
            }), 403
        
        user = temp_users_detailed.get(username)
        if not user:
            return jsonify({
                'success': False,
                'message': 'المستخدم غير موجود'
            }), 404
        
        data = request.get_json()
        
        # تحديث البيانات المسموحة
        allowed_fields = ['name', 'email', 'department', 'phone']
        if current_user_data['role'] == 'hospital_manager':
            allowed_fields.extend(['role', 'status'])
        
        for field in allowed_fields:
            if field in data:
                user[field] = data[field]
        
        return jsonify({
            'success': True,
            'message': 'تم تحديث بيانات المستخدم بنجاح',
            'user': user
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@users_bp.route('/stats', methods=['GET'])
@token_required
def get_user_stats(current_user):
    try:
        # التحقق من صلاحيات المستخدم
        current_user_data = temp_users_detailed.get(current_user)
        if not current_user_data or current_user_data['role'] not in ['hospital_manager', 'pharmacy_head']:
            return jsonify({
                'success': False,
                'message': 'ليس لديك صلاحية لعرض إحصائيات المستخدمين'
            }), 403
        
        users_list = list(temp_users_detailed.values())
        
        total_users = len(users_list)
        active_users = len([u for u in users_list if u['status'] == 'نشط'])
        
        # إحصائيات الأدوار
        roles_count = {}
        for user in users_list:
            role = user['role']
            if role not in roles_count:
                roles_count[role] = 0
            roles_count[role] += 1
        
        # إحصائيات الأقسام
        departments_count = {}
        for user in users_list:
            dept = user['department']
            if dept not in departments_count:
                departments_count[dept] = 0
            departments_count[dept] += 1
        
        return jsonify({
            'success': True,
            'stats': {
                'total_users': total_users,
                'active_users': active_users,
                'roles': roles_count,
                'departments': departments_count
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

