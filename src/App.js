import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [universidades, setUniversidades] = useState([]);
    const [documentos, setDocumentos] = useState([]);
    const [selectedUniversidad, setSelectedUniversidad] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');

    // URL correcta de la API desplegada
    const API_URL = 'https://hs1-1.onrender.com';

    // Cargar universidades al inicio
    useEffect(() => {
        cargarUniversidades();
    }, []);

    // Cargar documentos cuando se selecciona una universidad
    useEffect(() => {
        if (selectedUniversidad) {
            cargarDocumentos();
        }
    }, [selectedUniversidad]);

    const cargarUniversidades = async () => {
        try {
            const response = await axios.get(`${API_URL}/universidades/`);
            console.log('Universidades cargadas:', response.data);
            setUniversidades(response.data.universidades);
        } catch (error) {
            console.error('Error al cargar universidades:', error);
            setMensaje('Error al cargar universidades');
        }
    };

    const cargarDocumentos = async () => {
        try {
            const response = await axios.get(`${API_URL}/documentos/${selectedUniversidad}`);
            console.log('Documentos cargados:', response.data);
            setDocumentos(response.data.documentos);
        } catch (error) {
            console.error('Error al cargar documentos:', error);
            setMensaje('Error al cargar documentos');
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !selectedUniversidad) {
            setMensaje('Por favor seleccione una universidad y un archivo');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(
                `${API_URL}/documentos/?universidad_id=${selectedUniversidad}`, 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setMensaje('Documento subido exitosamente');
            cargarDocumentos(); // Recargar la lista de documentos
        } catch (error) {
            console.error('Error al subir documento:', error);
            setMensaje('Error al subir el documento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Sistema de Gestión de Documentos</h1>
            
            {mensaje && (
                <div className="bg-blue-100 border-blue-500 text-blue-700 px-4 py-3 rounded mb-4">
                    {mensaje}
                </div>
            )}

            <div className="mb-6">
                <h2 className="text-xl mb-2">1. Seleccione su Universidad</h2>
                <select 
                    className="w-full p-2 border rounded"
                    value={selectedUniversidad}
                    onChange={(e) => setSelectedUniversidad(e.target.value)}
                >
                    <option value="">Seleccione una universidad...</option>
                    {universidades.map(univ => (
                        <option key={univ[0]} value={univ[0]}>
                            {univ[1]} - {univ[2]}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-6">
                <h2 className="text-xl mb-2">2. Subir Documento</h2>
                <input 
                    type="file"
                    onChange={handleFileUpload}
                    disabled={loading || !selectedUniversidad}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="mb-6">
                <h2 className="text-xl mb-2">3. Documentos Enviados</h2>
                {documentos.length > 0 ? (
                    <div className="border rounded divide-y">
                        {documentos.map(doc => (
                            <div key={doc[0]} className="p-4">
                                <p className="font-semibold">{doc[2]}</p>
                                <p className="text-sm text-gray-600">
                                    Fecha: {new Date(doc[3]).toLocaleDateString()}
                                </p>
                                <p className={`text-sm ${
                                    doc[4] === 'Pendiente' 
                                        ? 'text-yellow-600' 
                                        : 'text-green-600'
                                }`}>
                                    Estado: {doc[4]}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No hay documentos subidos</p>
                )}
            </div>
        </div>
    );
}

export default App;