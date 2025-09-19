from flask import Blueprint, request, jsonify
from firebase_admin import firestore
import hashlib
import jwt
import datetime
from functools import wraps

auth_bp = Blueprint('auth', __name__)

# قاعدة بيانات مؤقتة للمستخدمين (في حالة عدم توفر Firebase)
temp_users = {
    'admin': {
        'password': hashlib.sha256('123456'.encode()).hexdigest(),
        'role': 'hospital_manager',
        'name': 'أحمد محمد',
        'email': 'admin@hospital.dz'
    },
    'pharmacy_head': {
        'password': hashlib.sha256('123456'.encode()).hexdigest(),
        'role': 'pharmacy_head',
        'name': 'فاطمة علي',
        'email': 'pharmacy.head@hospital.dz'
    },
    'pharmacist1': {
        'password': hashlib.sha256('123456'.encode()).hexdigest(),
        'role': 'department_pharmacist',
        'name': 'محمد حسن',
        'email': 'pharmacist1@hospital.dz'
    },
    'doctor1': {
        'password': hashlib.sha256('123456'.encode()).hexdigest(),
        'role': 'doctor',
        'name': 'د. سارة أحمد',
        'email': 'doctor1@hospital.dz'
    },
    'supplier1': {
        'password': hashlib.sha256('123456'.encode()).hexdigest(),
        'role': 'supplier',
        'name': 'شركة الأدوية المتحدة',
        'email': 'supplier1@pharma.dz'
    }
}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, 'pharmacy-management-secret-key-2025', algorithms=['HS256'])
            current_user = data['username']
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        role = data.get('role')
        
        if not username or not password or not role:
            return jsonify({
                'success': False,
                'message': 'يرجى ملء جميع الحقول المطلوبة'
            }), 400
        
        # تشفير كلمة المرور للمقارنة
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        # البحث عن المستخدم
        user = temp_users.get(username)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'اسم المستخدم غير صحيح'
            }), 401
        
        if user['password'] != hashed_password:
            return jsonify({
                'success': False,
                'message': 'كلمة المرور غير صحيحة'
            }), 401
        
        if user['role'] != role:
            return jsonify({
                'success': False,
                'message': 'الدور المحدد غير صحيح'
            }), 401
        
        # إنشاء JWT token
        token = jwt.encode({
            'username': username,
            'role': user['role'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, 'pharmacy-management-secret-key-2025', algorithm='HS256')
        
        return jsonify({
            'success': True,
            'message': 'تم تسجيل الدخول بنجاح',
            'token': token,
            'user': {
                'username': username,
                'name': user['name'],
                'role': user['role'],
                'email': user['email']
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@auth_bp.route('/verify', methods=['POST'])
@token_required
def verify_token(current_user):
    try:
        user = temp_users.get(current_user)
        if user:
            return jsonify({
                'success': True,
                'user': {
                    'username': current_user,
                    'name': user['name'],
                    'role': user['role'],
                    'email': user['email']
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'المستخدم غير موجود'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    return jsonify({
        'success': True,
        'message': 'تم تسجيل الخروج بنجاح'
    }), 200

