import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import axios from 'axios';
import { Truck, Search, RotateCcw, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

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
        setLoading(true);
        try {
            await axios.post('/api/laundry', {
                guide_number: guideNumber,
                items: items.filter(i => i.qty > 0)
            });
            alert("Envío registrado");
            setGuideNumber('');
        } catch (err) {
            alert("Error al registrar");
        } finally { setLoading(false); }
    };

    return (
        <Card className="p-8 space-y-6">
            <Input placeholder="N° de Guía" value={guideNumber} onChange={e => setGuideNumber(e.target.value)} />
            {items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                    <span className="flex-1">{item.name}</span>
                    <Input type="number" value={item.qty} onChange={e => {
                        const newI = [...items];
                        newI[idx].qty = parseInt(e.target.value) || 0;
                        setItems(newI);
                    }} className="w-24" />
                </div>
            ))}
            <Button onClick={handleSubmit} disabled={loading} className="w-full">Registrar Envío</Button>
        </Card>
    );
}

function LaundryReceive() {
    const [guideNumber, setGuideNumber] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const search = async () => {
        if (!guideNumber.trim()) return;
        setLoading(true);
        try {
            // Esta es la ruta clave que corregimos en el main.py
            const res = await axios.get(`/api/laundry/${guideNumber}/status`);
            setData(res.data);
        } catch (err) {
            alert("Guía no encontrada");
            setData(null);
        } finally { setLoading(false); }
    };

    return (
        <Card className="p-8 space-y-6">
            <div className="flex gap-2">
                <Input placeholder="N° Guía para retornar" value={guideNumber} onChange={e => setGuideNumber(e.target.value)} />
                <Button onClick={search} disabled={loading}><Search size={18} /></Button>
            </div>
            {data && data.map((item, idx) => (
                <div key={idx} className="flex justify-between p-2 border-b">
                    <span>{item.name}</span>
                    <span className="font-bold text-orange-600">Pendiente: {item.pending}</span>
                </div>
            ))}
        </Card>
    );
}
