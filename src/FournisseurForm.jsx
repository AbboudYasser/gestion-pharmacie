import { useState } from 'react';


function FournisseurForm({ onAddFournisseur, setIsAdding }) {
  const [codFour, setCodFour] = useState('');
  const [nomFour, setNomFour] = useState('');
  const [adresFour, setAdresFour] = useState('');
  const [numTelFour, setNumTelFour] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!codFour || !nomFour) {
      alert('الرجاء إدخال رمز واسم المورد على الأقل.');
      return; 
    }

    const nouveauFournisseur = {
      cod_four: parseInt(codFour),
      nom_four: nomFour,
      adres_four: adresFour,
      num_tel_four: numTelFour,
    };

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
