import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [universidades, setUniversidades] = useState([]);
    const [documentos, setDocumentos] = useState([]);
    const [selectedUniversidad, setSelectedUniversidad] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Configuración base de axios
    axios.defaults.baseURL = 'https://hs1-1.onrender.com';
    axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
    axios.defaults.timeout = 10000; // 10 segundos de timeout

    useEffect(() => {
        const fetchUniversidades = async () => {
            setLoading(true);
            setError(null);
            try {
                // Primero verificamos si la API está funcionando
                const healthCheck = await axios.get('/', { 
                    validateStatus: function (status) {
                        return status < 500; // Acepta cualquier estado que no sea error del servidor
                    }
                });
                console.log('API Health Check:', healthCheck.data);

                // Si la API responde, intentamos obtener las universidades
                const response = await axios.get('/universidades/', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Datos de universidades:', response.data);
                
                if (response.data && response.data.universidades) {
                    setUniversidades(response.data.universidades);
                }
            } catch (err) {
                console.error('Error completo:', err);
                if (err.code === 'ECONNABORTED') {
                    setError('La conexión tardó demasiado. Por favor, intente nuevamente.');
                } else if (err.code === 'ERR_NETWORK') {
                    setError('No se pudo conectar con el servidor. Por favor, verifique su conexión a internet.');
                } else {
                    setError(`Error al cargar universidades: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUniversidades();
    }, []);

    const handleFileUpload = async (event) => {
        if (!selectedUniversidad) {
            setError('Por favor seleccione una universidad primero');
            return;
        }

        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(
                `/documentos/?universidad_id=${selectedUniversidad}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 30000 // 30 segundos para subida de archivos
                }
            );
            console.log('Respuesta de subida:', response.data);
            cargarDocumentos();
        } catch (err) {
            console.error('Error al subir:', err);
            setError(err.code === 'ERR_NETWORK' 
                ? 'Error de conexión al subir el archivo. Por favor, intente nuevamente.' 
                : 'Error al subir el documento');
        } finally {
            setLoading(false);
        }
    };

    const cargarDocumentos = async () => {
        if (!selectedUniversidad) return;
        
        setLoading(true);
        try {
            const response = await axios.get(`/documentos/${selectedUniversidad}`);
            console.log('Documentos cargados:', response.data);
            if (response.data && response.data.documentos) {
                setDocumentos(response.data.documentos);
            }
        } catch (err) {
            console.error('Error al cargar documentos:', err);
            setError(err.code === 'ERR_NETWORK' 
                ? 'Error de conexión al cargar documentos' 
                : 'Error al cargar los documentos');
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
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
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
                    disabled={loading}
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
                {!selectedUniversidad && (
                    <p className="text-red-600 text-sm mt-1">
                        Seleccione una universidad primero
                    </p>
                )}
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