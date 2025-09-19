import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

# تحميل متغيرات البيئة
load_dotenv()

# إعداد Firebase
firebase_config = {
    "type": "service_account",
    "project_id": os.getenv("FIREBASE_PROJECT_ID", "pharmacie-dz-2025"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL")
}

# تهيئة Firebase (إذا لم يتم تهيئته بالفعل)
if not firebase_admin._apps:
    try:
        # محاولة استخدام بيانات الاعتماد من متغيرات البيئة
        cred = credentials.Certificate(firebase_config)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("تم تهيئة Firebase بنجاح.")
    except Exception as e:
        print(f"تحذير: لم يتم تهيئة Firebase بسبب: {e}")
        print("سيتم استخدام قاعدة بيانات محلية مؤقتة")
        db = None
else:
    db = firestore.client()

# إنشاء تطبيق Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "pharmacy-management-secret-key-2025")
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "jwt-super-secret-key")
app.config['FIREBASE_DB'] = db

# تمكين CORS للسماح بالطلبات من الواجهة الأمامية
CORS(app, origins=["*"])

# تسجيل المسارات
from src.routes.auth import auth_bp
from src.routes.prescriptions import prescriptions_bp
from src.routes.inventory import inventory_bp
from src.routes.suppliers import suppliers_bp
from src.routes.users import users_bp
from src.routes.reports import reports_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(prescriptions_bp, url_prefix='/api/prescriptions')
app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
app.register_blueprint(suppliers_bp, url_prefix='/api/suppliers')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(reports_bp, url_prefix='/api/reports')

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "message": "نظام إدارة الصيدلية يعمل بشكل صحيح"})

@app.route('/')
def index():
    return "Welcome to the Pharmacy Management System Backend!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
