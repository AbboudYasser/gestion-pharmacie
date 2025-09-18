import { useState } from 'react';

// `onAddFournisseur` هي دالة ستأتي من المكون الأب (App.jsx)
// `setIsAdding` هي دالة للتحكم في إظهار/إخفاء النموذج
function FournisseurForm({ onAddFournisseur, setIsAdding }) {
  // حالة لكل حقل في النموذج لإدارة قيمته
  const [codFour, setCodFour] = useState('');
  const [nomFour, setNomFour] = useState('');
  const [adresFour, setAdresFour] = useState('');
  const [numTelFour, setNumTelFour] = useState('');

  // دالة للتعامل مع إرسال النموذج
  const handleSubmit = (event) => {
    event.preventDefault(); // منع التحديث التلقائي للصفحة

    // التحقق من المدخلات (تفصيل مهم)
    if (!codFour || !nomFour) {
      alert('الرجاء إدخال رمز واسم المورد على الأقل.');
      return; // إيقاف التنفيذ إذا كانت الحقول المطلوبة فارغة
    }

    // إنشاء كائن المورد الجديد
    const nouveauFournisseur = {
      cod_four: parseInt(codFour), // تحويل الرمز إلى رقم
      nom_four: nomFour,
      adres_four: adresFour,
      num_tel_four: numTelFour,
    };

    // استدعاء الدالة من المكون الأب وتمرير البيانات الجديدة
    onAddFournisseur(nouveauFournisseur);
  };

  return (
    <div className="form-container">
      <h2>إضافة مورد جديد</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="cod_four">رمز المورد</label>
          <input
            id="cod_four"
            type="number"
            value={codFour}
            onChange={(e) => setCodFour(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="nom_four">اسم المورد</label>
          <input
            id="nom_four"
            type="text"
            value={nomFour}
            onChange={(e) => setNomFour(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="adres_four">العنوان</label>
          <input
            id="adres_four"
            type="text"
            value={adresFour}
            onChange={(e) => setAdresFour(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="num_tel_four">رقم الهاتف</label>
          <input
            id="num_tel_four"
            type="text"
            value={numTelFour}
            onChange={(e) => setNumTelFour(e.target.value)}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">إضافة</button>
          <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>إلغاء</button>
        </div>
      </form>
    </div>
  );
}

export default FournisseurForm;
