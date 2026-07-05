import { useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Car } from 'lucide-react';
import { useTrips } from '../hooks/useTrips';
import TripCard from '../components/TripCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { TripFilters } from '../types';

export default function TripsPage() {
  const [filters, setFilters] = useState<TripFilters>({});
  const navigate = useNavigate();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError, refetch } = useTrips(filters);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  const trips = data?.pages.flatMap((p) => p.items) ?? [];

  if (isError) return <div className="p-6"><ErrorState onRetry={refetch} /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Viajes compartidos</h1>
        <button onClick={() => navigate('/trips/new')} className="btn-primary">
          <Plus size={16} /> Ofrecer
        </button>
      </div>

      <div className="card p-3 mb-5">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            className="input text-sm py-1.5"
            placeholder="Origen"
            value={filters.origin ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, origin: e.target.value || undefined }))}
          />
          <input
            type="text"
            className="input text-sm py-1.5"
            placeholder="Destino"
            value={filters.destination ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, destination: e.target.value || undefined }))}
          />
          <input type="date" className="input text-sm py-1.5" value={filters.date ?? ''} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value || undefined }))} />
          <select className="input text-sm py-1.5" value={filters.status ?? ''} onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value as TripFilters['status']) || undefined }))}>
            <option value="">Todos</option>
            <option value="OPEN">Disponibles</option>
            <option value="FULL">Completos</option>
            <option value="COMPLETED">Finalizados</option>
          </select>
        </div>
      </div>

      {trips.length === 0 && !isFetchingNextPage ? (
        <EmptyState icon={Car} title="Sin viajes" subtitle="No hay viajes disponibles con estos filtros." actionLabel="Ofrecer viaje" onAction={() => navigate('/trips/new')} />
      ) : (
        <div className="space-y-4">
          {trips.map((t, i) => {
            if (i === trips.length - 1) return <div ref={lastRef} key={t.id}><TripCard trip={t} /></div>;
            return <TripCard key={t.id} trip={t} />;
          })}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <div className="animate-spin w-6 h-6 rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
