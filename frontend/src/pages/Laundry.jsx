import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import axios from 'axios';
import { Truck, Search, CheckCircle, AlertCircle } from 'lucide-react';

export function Laundry() {
    const [activeTab, setActiveTab] = useState('send');

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Truck className="text-blue-600" /> Gestión de Lavandería
            </h2>

            <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
                <button onClick={() => setActiveTab('send')} className={`px-6 py-2 rounded-md text-sm font-medium ${activeTab === 'send' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                    Registrar Envío
                </button>
                <button onClick={() => setActiveTab('receive')} className={`px-6 py-2 rounded-md text-sm font-medium ${activeTab === 'receive' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'}`}>
                    Registrar Retorno
                </button>
            </div>

            {activeTab === 'send' ? <LaundrySend /> : <LaundryReceive />}
        </div>
    );
}

function LaundrySend() {
    const [guideNumber, setGuideNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([{ name: 'Chaqueta', qty: 0 }, { name: 'Pantalon', qty: 0 }, { name: 'Polo', qty: 0 }]);

    const handleSubmit = async () => {
        if (!guideNumber.trim()) return alert("Ingrese N° Guía");
        const itemsToSend = items.filter(i => i.qty > 0);
        if (itemsToSend.length === 0) return alert("Ingrese al menos una cantidad");

        setLoading(true);
        try {
            await axios.post('/api/laundry', {
                guide_number: guideNumber,
                items: itemsToSend
            });
            alert("Envío registrado correctamente");
            setGuideNumber('');
            setItems([{ name: 'Chaqueta', qty: 0 }, { name: 'Pantalon', qty: 0 }, { name: 'Polo', qty: 0 }]);
        } catch (err) {
            alert("Error al registrar: " + (err.response?.data?.detail || "Error desconocido"));
        } finally { setLoading(false); }
    };

    return (
        <Card className="p-8 space-y-6">
            <Input placeholder="N° de Guía" value={guideNumber} onChange={e => setGuideNumber(e.target.value)} />
            {items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                    <span className="flex-1 font-medium">{item.name}</span>
                    <Input type="number" min="0" value={item.qty} onChange={e => {
                        const newI = [...items];
                        newI[idx].qty = parseInt(e.target.value) || 0;
                        setItems(newI);
                    }} className="w-24" />
                </div>
            ))}
            <Button onClick={handleSubmit} disabled={loading} className="w-full h-12">
                {loading ? 'Procesando...' : 'Registrar Envío a Lavandería'}
            </Button>
        </Card>
    );
}

function LaundryReceive() {
    const [guideNumber, setGuideNumber] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [returnQtys, setReturnQtys] = useState({}); // Estado para manejar lo que se recibe

    const search = async () => {
        if (!guideNumber.trim()) return;
        setLoading(true);
        setData(null);
        try {
            const res = await axios.get(`/api/laundry/${guideNumber.trim()}/status`);
            setData(res.data);
            // Inicializar las cantidades de retorno en 0
            const initialQtys = {};
            res.data.forEach(item => { initialQtys[item.name] = 0; });
            setReturnQtys(initialQtys);
        } catch (err) {
            alert("Guía no encontrada");
        } finally { setLoading(false); }
    };

    const handleReturnQtyChange = (name, val, max) => {
        let num = parseInt(val) || 0;
        if (num > max) num = max; // No permitir recibir más de lo pendiente
        setReturnQtys(prev => ({ ...prev, [name]: num }));
    };

    const submitReturn = async () => {
        const itemsToReturn = Object.entries(returnQtys)
            .filter(([_, qty]) => qty > 0)
            .map(([name, qty]) => ({ name, qty }));

        if (itemsToReturn.length === 0) return alert("Ingrese al menos una cantidad para retornar");

        setLoading(true);
        try {
            await axios.post('/api/laundry/return', {
                guide_number: guideNumber,
                items: itemsToReturn
            });
            alert("Retorno registrado con éxito");
            setData(null);
            setGuideNumber('');
        } catch (err) {
            alert("Error al registrar retorno");
        } finally { setLoading(false); }
    };

    return (
        <Card className="p-8 space-y-6">
            <div className="flex gap-2">
                <Input placeholder="N° Guía para retornar" value={guideNumber} onChange={e => setGuideNumber(e.target.value)} />
                <Button onClick={search} disabled={loading} variant="outline">
                    <Search size={18} />
                </Button>
            </div>

            {data && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <h4 className="font-bold text-slate-700 border-b pb-2">Prendas Pendientes de Recepción</h4>
                    {data.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex-1">
                                <span className="block font-medium">{item.name}</span>
                                <span className="text-sm text-orange-600 font-semibold">Pendiente: {item.pending}</span>
                            </div>
                            <div className="w-32">
                                <label className="text-[10px] uppercase text-slate-400 block mb-1">Ingresar Recibido</label>
                                <Input 
                                    type="number" 
                                    min="0" 
                                    max={item.pending}
                                    value={returnQtys[item.name] || ''} 
                                    onChange={e => handleReturnQtyChange(item.name, e.target.value, item.pending)}
                                />
                            </div>
                        </div>
                    ))}
                    <Button onClick={submitReturn} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 h-12">
                        {loading ? 'Guardando...' : 'Confirmar Recepción de Prendas'}
                    </Button>
                </div>
            )}
        </Card>
    );
}
