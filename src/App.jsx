import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import FournisseurForm from './FournisseurForm';
import './App.css';

function App() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false); 

  async function getFournisseurs() {
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

  const handleAddFournisseur = async (nouveauFournisseur) => {
    try {
      const { data, error } = await supabase
        .from('fournisseur')
        .insert([nouveauFournisseur])
        .select(); 

      if (error) {
        throw error;
      }

      if (data) {
        setFournisseurs((prevFournisseurs) => [...prevFournisseurs, data[0]]);
        setIsAdding(false);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du fournisseur:", error);
      alert(`فشل في إضافة المورد: ${error.message}`);
    }
  };

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
