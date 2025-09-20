from flask import Blueprint, request, jsonify
from src.routes.auth import token_required
import datetime

prescriptions_bp = Blueprint('prescriptions', __name__)

# بيانات تجريبية للوصفات الطبية
temp_prescriptions = [
    {
        'id': 'P001',
        'patient_name': 'محمد أحمد',
        'patient_id': '1234567890',
        'doctor_name': 'د. سارة علي',
        'doctor_id': 'DOC001',
        'department': 'الطب الباطني',
        'medications': [
            {
                'name': 'باراسيتامول 500mg',
                'dosage': 'قرص واحد كل 8 ساعات',
                'quantity': 30,
                'duration': '10 أيام'
            },
            {
                'name': 'أموكسيسيلين 250mg',
                'dosage': 'كبسولة واحدة كل 12 ساعة',
                'quantity': 20,
                'duration': '10 أيام'
            }
        ],
        'status': 'معلقة',
        'created_date': '2025-06-13',
        'notes': 'يُنصح بتناول الدواء مع الطعام'
    },
    {
        'id': 'P002',
        'patient_name': 'فاطمة محمد',
        'patient_id': '0987654321',
        'doctor_name': 'د. أحمد حسن',
        'doctor_id': 'DOC002',
        'department': 'أمراض النساء',
        'medications': [
            {
                'name': 'حمض الفوليك 5mg',
                'dosage': 'قرص واحد يومياً',
                'quantity': 30,
                'duration': '30 يوم'
            }
        ],
        'status': 'مصروفة',
        'created_date': '2025-06-13',
        'dispensed_date': '2025-06-13',
        'dispensed_by': 'محمد حسن',
        'notes': 'للحامل - شهر الثالث'
    },
    {
        'id': 'P003',
        'patient_name': 'علي محمود',
        'patient_id': '1122334455',
        'doctor_name': 'د. نور الدين',
        'doctor_id': 'DOC003',
        'department': 'طب الأطفال',
        'medications': [
            {
                'name': 'شراب الكحة للأطفال',
                'dosage': '5 مل كل 6 ساعات',
                'quantity': 1,
                'duration': '7 أيام'
            }
        ],
        'status': 'مصروفة',
        'created_date': '2025-06-12',
        'dispensed_date': '2025-06-12',
        'dispensed_by': 'فاطمة علي',
        'notes': 'طفل عمره 5 سنوات'
    }
]

@prescriptions_bp.route('/', methods=['GET'])
@token_required
def get_prescriptions(current_user):
    try:
        # فلترة الوصفات حسب دور المستخدم
        status_filter = request.args.get('status')
        date_filter = request.args.get('date')
        
        filtered_prescriptions = temp_prescriptions.copy()
        
        if status_filter:
            filtered_prescriptions = [p for p in filtered_prescriptions if p['status'] == status_filter]
        
        if date_filter:
            filtered_prescriptions = [p for p in filtered_prescriptions if p['created_date'] == date_filter]
        
        return jsonify({
            'success': True,
            'prescriptions': filtered_prescriptions,
            'total': len(filtered_prescriptions)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@prescriptions_bp.route('/<prescription_id>', methods=['GET'])
@token_required
def get_prescription(current_user, prescription_id):
    try:
        prescription = next((p for p in temp_prescriptions if p['id'] == prescription_id), None)
        
        if not prescription:
            return jsonify({
                'success': False,
                'message': 'الوصفة غير موجودة'
            }), 404
        
        return jsonify({
            'success': True,
            'prescription': prescription
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@prescriptions_bp.route('/', methods=['POST'])
@token_required
def create_prescription(current_user):
    try:
        data = request.get_json()
        
        # التحقق من البيانات المطلوبة
        required_fields = ['patient_name', 'patient_id', 'doctor_name', 'medications']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'الحقل {field} مطلوب'
                }), 400
        
        # إنشاء معرف جديد للوصفة
        new_id = f"P{len(temp_prescriptions) + 1:03d}"
        
        new_prescription = {
            'id': new_id,
            'patient_name': data['patient_name'],
            'patient_id': data['patient_id'],
            'doctor_name': data['doctor_name'],
            'doctor_id': data.get('doctor_id', ''),
            'department': data.get('department', ''),
            'medications': data['medications'],
            'status': 'معلقة',
            'created_date': datetime.datetime.now().strftime('%Y-%m-%d'),
            'notes': data.get('notes', '')
        }
        
        temp_prescriptions.append(new_prescription)
        
        return jsonify({
            'success': True,
            'message': 'تم إنشاء الوصفة بنجاح',
            'prescription': new_prescription
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@prescriptions_bp.route('/<prescription_id>/dispense', methods=['PUT'])
@token_required
def dispense_prescription(current_user, prescription_id):
    try:
        prescription = next((p for p in temp_prescriptions if p['id'] == prescription_id), None)
        
        if not prescription:
            return jsonify({
                'success': False,
                'message': 'الوصفة غير موجودة'
            }), 404
        
        if prescription['status'] == 'مصروفة':
            return jsonify({
                'success': False,
                'message': 'الوصفة مصروفة بالفعل'
            }), 400
        
        # تحديث حالة الوصفة
        prescription['status'] = 'مصروفة'
        prescription['dispensed_date'] = datetime.datetime.now().strftime('%Y-%m-%d')
        prescription['dispensed_by'] = current_user
        
        return jsonify({
            'success': True,
            'message': 'تم صرف الوصفة بنجاح',
            'prescription': prescription
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

@prescriptions_bp.route('/stats', methods=['GET'])
@token_required
def get_prescription_stats(current_user):
    try:
        today = datetime.datetime.now().strftime('%Y-%m-%d')
        
        total_prescriptions = len(temp_prescriptions)
        today_prescriptions = len([p for p in temp_prescriptions if p['created_date'] == today])
        pending_prescriptions = len([p for p in temp_prescriptions if p['status'] == 'معلقة'])
        dispensed_prescriptions = len([p for p in temp_prescriptions if p['status'] == 'مصروفة'])
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total_prescriptions,
                'today': today_prescriptions,
                'pending': pending_prescriptions,
                'dispensed': dispensed_prescriptions
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'خطأ في الخادم: {str(e)}'
        }), 500

