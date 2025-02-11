import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [universidades, setUniversidades] = useState([]);
    const [documentos, setDocumentos] = useState([]);
    const [selectedUniversidad, setSelectedUniversidad] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = 'https://hs1-l0b3.onrender.com';

    useEffect(() => {
        cargarUniversidades();
    }, []);

    const cargarUniversidades = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/universidades/`, {
                headers: {
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
            console.log('Respuesta de universidades:', response.data);
            if (response.data && response.data.universidades) {
                setUniversidades(response.data.universidades);
            }
        } catch (err) {
            console.error('Error detallado:', err);
            setError(err.message || 'Error al cargar universidades');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !selectedUniversidad) {
            setError('Por favor seleccione una universidad y un archivo');
            return;
        }

        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(
                `${API_URL}/documentos/?universidad_id=${selectedUniversidad}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json'
                    }
                }
            );
            console.log('Respuesta de subida:', response.data);
            cargarDocumentos();
        } catch (err) {
            console.error('Error al subir:', err);
            setError('Error al subir el documento: ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const cargarDocumentos = async () => {
        if (!selectedUniversidad) return;
        
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/documentos/${selectedUniversidad}`);
            console.log('Respuesta de documentos:', response.data);
            if (response.data && response.data.documentos) {
                setDocumentos(response.data.documentos);
            }
        } catch (err) {
            console.error('Error al cargar documentos:', err);
            setError('Error al cargar documentos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedUniversidad) {
            cargarDocumentos();
        }
    }, [selectedUniversidad]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Sistema de Gestión de Documentos</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                    Cargando...
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
                            {univ[1]}
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
                <p className="text-sm text-gray-600 mt-1">
                    {!selectedUniversidad && "Seleccione una universidad primero"}
                </p>
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