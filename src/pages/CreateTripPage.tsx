import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateTrip } from '../hooks/useTrips';
import { NZ_CITIES } from '../constants';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const createTrip = useCreateTrip();
  const [form, setForm] = useState({
    origin: '', destination: '', departureAt: '', seatsTotal: '3', price: '', notes: '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      origin: form.origin,
      destination: form.destination,
      departureAt: form.departureAt,
      seatsTotal: Number(form.seatsTotal),
    };
    if (form.price) payload.price = Number(form.price);
    if (form.notes) payload.notes = form.notes;
    const trip = await createTrip.mutateAsync(payload);
    navigate(`/trips/${trip.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2">
        <ArrowLeft size={18} /> Volver
      </button>
      <h1 className="text-xl font-bold mb-5">Ofrecer viaje</h1>

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Origen</label>
            <select className="input" value={form.origin} onChange={set('origin')} required>
              <option value="">Selecciona</option>
              {NZ_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Destino</label>
            <select className="input" value={form.destination} onChange={set('destination')} required>
              <option value="">Selecciona</option>
              {NZ_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fecha y hora de salida</label>
          <input type="datetime-local" className="input" value={form.departureAt} onChange={set('departureAt')} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Asientos disponibles</label>
            <input type="number" min="1" max="8" className="input" value={form.seatsTotal} onChange={set('seatsTotal')} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Precio por asiento (NZD)</label>
            <input type="number" min="0" className="input" value={form.price} onChange={set('price')} placeholder="Opcional" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
          <textarea className="input resize-none" rows={3} value={form.notes} onChange={set('notes')} placeholder="Punto de encuentro, paradas, etc." />
        </div>
        <button type="submit" disabled={createTrip.isPending} className="btn-primary w-full">
          {createTrip.isPending ? 'Publicando...' : 'Publicar viaje'}
        </button>
      </form>
    </div>
  );
}
