import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import FournisseurForm from './FournisseurForm'; // استيراد مكون النموذج
import './App.css';

function App() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false); // حالة لإظهار/إخفاء النموذج

  // دالة جلب البيانات (تبقى كما هي)
  async function getFournisseurs() {
    // ... (الكود من الخطوة السابقة لم يتغير)
    try {
        setLoading(true);
        const { data, error } = await supabase.from('fournisseur').select('*');
        if (error) throw error;
        if (data) setFournisseurs(data);
    } catch (error) {
        console.error("Erreur lors de la récupération des fournisseurs:", error);
        setError(error.message);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    getFournisseurs();
  }, []);

  // دالة لإضافة مورد جديد (هذا هو المنطق الجديد)
  const handleAddFournisseur = async (nouveauFournisseur) => {
    try {
      // إرسال البيانات إلى جدول 'fournisseur' في Supabase
      const { data, error } = await supabase
        .from('fournisseur')
        .insert([nouveauFournisseur])
        .select(); // .select() لإعادة البيانات التي تم إدراجها

      if (error) {
        throw error; // التعامل مع أخطاء Supabase
      }

      if (data) {
        // تحديث الواجهة فوراً بإضافة المورد الجديد إلى القائمة (تفصيل مهم)
        // هذا يمنع الحاجة إلى إعادة تحميل كل البيانات من قاعدة البيانات
        setFournisseurs((prevFournisseurs) => [...prevFournisseurs, data[0]]);
        setIsAdding(false); // إخفاء النموذج بعد الإضافة الناجحة
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du fournisseur:", error);
      alert(`فشل في إضافة المورد: ${error.message}`);
    }
  };

  // عرض واجهة المستخدم
  if (loading) return <div>Chargement des données...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="app-container">
      <header>
        <h1>قائمة الموردين</h1>
        {!isAdding && (
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
            إضافة مورد جديد +
          </button>
        )}
      </header>
      <main>
        {isAdding ? (
          <FournisseurForm onAddFournisseur={handleAddFournisseur} setIsAdding={setIsAdding} />
        ) : (
          <table>
            <thead>
              <tr>
                <th>الرمز</th>
                <th>اسم المورد</th>
                <th>العنوان</th>
                <th>الهاتف</th>
              </tr>
            </thead>
            <tbody>
              {fournisseurs.map((fournisseur) => (
                <tr key={fournisseur.id}>
                  <td>{fournisseur.cod_four}</td>
                  <td>{fournisseur.nom_four}</td>
                  <td>{fournisseur.adres_four}</td>
                  <td>{fournisseur.num_tel_four}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default App;
