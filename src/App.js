import React, { useState, useEffect } from 'react';
import axios from 'axios';


function App() {
    const [universidades, setUniversidades] = useState([]);
    const [documentos, setDocumentos] = useState([]);
    const [universidadId, setUniversidadId] = useState('');

    useEffect(() => {
        axios.get('https://hs1s.onrender.com/universidades/')
            .then(response => setUniversidades(response.data.universidades))
            .catch(error => console.error(error));
    }, []);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
          await axios.post(`https://hs1s.onrender.com/documentos/?universidad_id=${universidadId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
            alert('Documento subido con éxito');
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDocumentos = async () => {
        try {
            const response = await axios.get(`https://hs1s.onrender.com/documentos/${universidadId}`);
            setDocumentos(response.data.documentos);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Gestión de Documentoss</h1>
            <div>
                <label>Seleccione una universidad:</label>
                <select onChange={(e) => setUniversidadId(e.target.value)}>
                    <option value="">Seleccione...</option>
                    {universidades.map(universidad => (
                        <option key={universidad.id} value={universidad.id}>{universidad.nombre}</option>
                    ))}
                </select>
            </div>
            <div>
                <input type="file" onChange={handleFileUpload} />
            </div>
            <button onClick={fetchDocumentos}>Consultar Documentos</button>
            <ul>
                {documentos.map(documento => (
                    <li key={documento.id}>{documento.nombre_archivo} - {documento.estado_aprobacion}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;