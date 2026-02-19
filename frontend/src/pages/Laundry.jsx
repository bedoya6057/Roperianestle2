import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import axios from 'axios';
import { Truck, CheckCircle, AlertCircle, Plus, Trash2, RotateCcw, ArrowRight, Search } from 'lucide-react';

export function Laundry() {
    const [activeTab, setActiveTab] = useState('send'); // 'send' o 'receive'

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Truck className="text-blue-600" />
                Gestión de Lavandería
            </h2>

            {/* Selector de Pestañas */}
            <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('send')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'send'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Registrar Envío
                </button>
                <button
                    onClick={() => setActiveTab('receive')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'receive'
                            ? 'bg-white text-green-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Registrar Retorno
                </button>
            </div>

            {/* Renderizado condicional según la pestaña activa */}
            {activeTab === 'send' ? <LaundrySend /> : <LaundryReceive />}
        </div>
    );
}

function LaundrySend() {
    const [guideNumber, setGuideNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [items, setItems] = useState([
        { name: 'Chaqueta', qty: 0 },
        { name: 'Pantalon', qty: 0 },
        { name: 'Polo', qty: 0 }
    ]);

    const handleQtyChange = (index, value) => {
        const newItems = [...items];
        newItems[index].qty = parseInt(value) || 0;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { name: '', qty: 0, custom: true }]);
    };

    const updateItemName = (index, name) => {
        const newItems = [...items];
        newItems[index].name = name;
        setItems(newItems);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!guideNumber.trim()) {
            setError('Debe ingresar un número de guía.');
            return;
        }

        const itemsToRegister = items.filter(i => i.qty > 0 && i.name.trim() !== '');
        if (itemsToRegister.length === 0) {
            setError('Debe registrar al menos una prenda.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await axios.post('/api/laundry', {
                guide_number: guideNumber,
                items: itemsToRegister
            });
            setSuccess(true);
            setGuideNumber('');
            setItems([
                { name: 'Chaqueta', qty: 0 },
                { name: 'Pantalon', qty: 0 },
                { name: 'Polo', qty: 0 }
            ]);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al registrar servicio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-8 space-y-6">
            <div className="flex items-center gap-2 mb-4 border-b pb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <ArrowRight size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Envío de Prendas</h3>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número de Guía</label>
                <Input
                    placeholder="Ej: 001-000123"
                    value={guideNumber}
                    onChange={e => setGuideNumber(e.target.value)}
                    className="w-full uppercase"
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium text-slate-700">Detalle de Prendas</h4>
                    <Button variant="outline" size="sm" onClick={addItem}>+ Agregar Otro</Button>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <div className="flex-1">
                                {item.custom ? (
                                    <Input value={item.name} onChange={e => updateItemName(index, e.target.value)} placeholder="Nombre prenda" />
                                ) : (
                                    <div className="px-3 py-2 bg-white border rounded-md">{item.name}</div>
                                )}
                            </div>
                            <Input type="number" min="0" value={item.qty} onChange={e => handleQtyChange(index, e.target.value)} className="w-32" />
                            {item.custom && (
                                <button onClick={() => removeItem(index)} className="text-red-500"><Trash2 size={18} /></button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {error && <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}
            {success && <div className="text-green-600 bg-green-50 p-4 rounded-lg">Envío registrado exitosamente</div>}

            <Button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600">
                {loading ? 'Registrando...' : 'Registrar Envío'}
            </Button>
        </Card>
    );
}

function LaundryReceive() {
    const [guideNumber, setGuideNumber] = useState('');
    const [laundryData, setLaundryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [returnItems, setReturnItems] = useState({});

    const searchGuide = async (e) => {
        e.preventDefault();
        if (!guideNumber.trim()) return;

        setLoading(true);
        setError(null);
        setLaundryData(null);
        setReturnItems({});
        setSuccess(false);

        try {
            const res = await axios.get(`/api/laundry/${guideNumber.trim()}/status`);
            setLaundryData(res.data);
        } catch (err) {
            setError(err.response?.status === 404 ? 'Guía no encontrada' : 'Error al buscar guía');
        } finally {
            setLoading(false);
        }
    };

    const handleReturnQtyChange = (itemName, value, maxPending) => {
        let qty = parseInt(value) || 0;
        if (qty < 0) qty = 0;
        if (qty > maxPending) qty = maxPending;

        setReturnItems(prev => ({ ...prev, [itemName]: qty }));
    };

    const handleSubmit = async () => {
        const itemsToReturn = Object.entries(returnItems)
            .filter(([_, qty]) => qty > 0)
            .map(([name, qty]) => ({ name, qty }));

        if (itemsToReturn.length === 0) {
            setError('Debe ingresar cantidad a devolver.');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/laundry/return', {
                guide_number: guideNumber,
                items: itemsToReturn
            });
            setSuccess(true);
            const res = await axios.get(`/api/laundry/${guideNumber}/status`);
            setLaundryData(res.data);
            setReturnItems({});
        } catch (err) {
            setError('Error al registrar el retorno.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-8 space-y-6">
            <div className="flex items-center gap-2 mb-4 border-b pb-4">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                    <RotateCcw size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Recepción de Prendas</h3>
                </div>
            </div>

            <form onSubmit={searchGuide} className="flex gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="N° Guía de Remisión"
                        value={guideNumber}
                        onChange={e => setGuideNumber(e.target.value)}
                        className="w-full uppercase"
                    />
                </div>
                <Button type="submit" disabled={loading}>
                    <Search className="mr-2" size={18} />
                    Buscar
                </Button>
            </form>

            {error && <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}
            {success && <div className="text-green-600 bg-green-50 p-4 rounded-lg">Retorno registrado exitosamente</div>}

            {laundryData && (
                <div className="space-y-4">
                    {laundryData.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 items-center p-4 border rounded-lg">
                            <div className="col-span-6 font-medium">{item.name}</div>
                            <div className="col-span-3 text-orange-600 font-bold">Pte: {item.pending}</div>
                            <div className="col-span-3">
                                {item.pending > 0 && (
                                    <Input
                                        type="number"
                                        min="0"
                                        max={item.pending}
                                        value={returnItems[item.name] || ''}
                                        onChange={e => handleReturnQtyChange(item.name, e.target.value, item.pending)}
                                        className="text-center"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                    <Button onClick={handleSubmit} disabled={loading} className="w-full bg-green-600">
                        Confirmar Recepción
                    </Button>
                </div>
            )}
        </Card>
    );
}
