import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateTrip } from '../hooks/useTrips';
import { NZ_CITIES } from '../constants';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const createTrip = useCreateTrip();
  const [form, setForm] = useState({
    origin: '', destination: '', departureDate: '', seatsTotal: '3', costPerPerson: '', notes: '',
  });
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const raw = form.departureDate.length === 16 ? form.departureDate + ':00' : form.departureDate;
    const departureDate = new Date(raw).toISOString();
    const payload: Record<string, unknown> = {
      origin: form.origin,
      destination: form.destination,
      departureDate,
      seatsTotal: Number(form.seatsTotal),
    };
    if (form.costPerPerson) payload.costPerPerson = Number(form.costPerPerson);
    if (form.notes) payload.notes = form.notes;
    try {
      const trip = await createTrip.mutateAsync(payload);
      navigate(`/trips/${trip.id}`);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      setError(data?.error ?? data?.message ?? 'Error al crear el viaje. Intenta de nuevo.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2">
        <ArrowLeft size={18} /> Volver
      </button>
      <h1 className="text-xl font-bold mb-5">Ofrecer viaje</h1>

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
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
          <input type="datetime-local" className="input" value={form.departureDate} onChange={set('departureDate')} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Asientos disponibles</label>
            <input type="number" min="1" max="8" className="input" value={form.seatsTotal} onChange={set('seatsTotal')} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Precio por asiento (NZD)</label>
            <input type="number" min="0" className="input" value={form.costPerPerson} onChange={set('costPerPerson')} placeholder="Opcional" />
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
