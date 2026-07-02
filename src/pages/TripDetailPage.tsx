import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, ChevronRight, MessageCircle, DollarSign, StickyNote } from 'lucide-react';
import UserLink from '../components/UserLink';
import { useTrip, useBookTrip, useCancelBooking } from '../hooks/useTrips';
import { useAuthStore } from '../stores/authStore';
import ErrorState from '../components/ErrorState';
import { formatDate } from '../utils/date';

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Disponible', FULL: 'Completo', COMPLETED: 'Finalizado', CANCELLED: 'Cancelado',
};
const STATUS_CLASS: Record<string, string> = {
  OPEN:      'bg-green-100 text-green-700',
  FULL:      'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: trip, isError, refetch } = useTrip(id!);
  const book   = useBookTrip(id!);
  const cancel = useCancelBooking(id!);

  if (isError) return <div className="p-6"><ErrorState onRetry={refetch} /></div>;
  if (!trip)   return <div className="h-full flex items-center justify-center"><div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent" /></div>;

  const isDriver  = trip.user?.id === user?.id;
  const myBooking = trip.bookings?.find((b) => b.user?.id === user?.id);
  const booked    = trip.seatsTotal - trip.seatsAvailable;
  const canBook   = trip.status === 'OPEN' && !isDriver && !myBooking;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6 space-y-4">
      <button onClick={() => navigate(-1)} className="btn-ghost -ml-2">
        <ArrowLeft size={18} /> Volver
      </button>

      {/* ── Card principal ── */}
      <div className="card p-5">
        {/* Ruta + estado */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl font-bold">{trip.origin}</span>
          <ChevronRight size={20} className="text-gray-400 shrink-0" />
          <span className="text-xl font-bold">{trip.destination}</span>
          <span className={`ml-auto badge text-xs shrink-0 ${STATUS_CLASS[trip.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABEL[trip.status] ?? trip.status}
          </span>
        </div>

        {/* Datos clave */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Calendar size={13} /> Fecha y hora
            </div>
            <p className="text-sm font-semibold">{formatDate(trip.departureDate)}</p>
          </div>

          {trip.costPerPerson != null && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <DollarSign size={13} /> Costo por persona
              </div>
              <p className="text-sm font-semibold">${trip.costPerPerson} NZD</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Users size={13} /> Asientos totales
            </div>
            <p className="text-sm font-semibold">{trip.seatsTotal}</p>
          </div>

          <div className={`rounded-xl p-3 ${trip.seatsAvailable === 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className={`flex items-center gap-1.5 text-xs mb-1 ${trip.seatsAvailable === 0 ? 'text-red-500' : 'text-green-600'}`}>
              <Users size={13} /> Asientos disponibles
            </div>
            <p className={`text-sm font-semibold ${trip.seatsAvailable === 0 ? 'text-red-600' : 'text-green-700'}`}>
              {trip.seatsAvailable}
            </p>
          </div>
        </div>

        {/* Barra de ocupación */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{booked} reservado{booked !== 1 ? 's' : ''}</span>
            <span>{trip.seatsAvailable} libre{trip.seatsAvailable !== 1 ? 's' : ''}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(booked / trip.seatsTotal) * 100}%` }}
            />
          </div>
        </div>

        {/* Notas */}
        {trip.notes && (
          <div className="flex gap-2 text-sm text-gray-600 bg-amber-50 rounded-xl p-3 mb-4">
            <StickyNote size={15} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="whitespace-pre-line">{trip.notes}</p>
          </div>
        )}

        {/* Conductor */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <UserLink user={trip.user} size={36} subtitle="Conductor" className="text-sm text-gray-500" />
          {!isDriver && (
            <button onClick={() => navigate(`/chat/${trip.user?.id}`)} className="btn-outline text-sm">
              <MessageCircle size={15} /> Contactar
            </button>
          )}
        </div>
      </div>

      {/* ── Lista de pasajeros ── */}
      {trip.bookings && trip.bookings.length > 0 && (
        <div className="card p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Users size={16} />
            Pasajeros ({trip.bookings.length})
          </h2>
          <div className="divide-y divide-gray-100">
            {trip.bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <button
                  onClick={() => b.user?.id && navigate(`/profile/${b.user.id}`)}
                  className="flex items-center gap-2.5 hover:opacity-75 transition-opacity text-left"
                >
                  {b.user?.avatarUrl ? (
                    <img src={b.user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                      {b.user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{b.user?.name ?? 'Pasajero'}</p>
                    {b.seats > 1 && (
                      <p className="text-xs text-gray-400">{b.seats} asientos</p>
                    )}
                  </div>
                </button>
                {isDriver && b.user?.id && (
                  <button
                    onClick={() => navigate(`/chat/${b.user!.id}`)}
                    className="btn-ghost text-xs py-1 px-2"
                  >
                    <MessageCircle size={13} /> Mensaje
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Acción principal ── */}
      {!isDriver && (
        myBooking ? (
          <button
            onClick={() => cancel.mutate()}
            disabled={cancel.isPending}
            className="btn w-full border border-red-300 text-red-600 hover:bg-red-50"
          >
            {cancel.isPending ? 'Cancelando...' : 'Cancelar mi reserva'}
          </button>
        ) : (
          <button
            onClick={() => book.mutate()}
            disabled={book.isPending || !canBook}
            className="btn-primary w-full"
          >
            {book.isPending
              ? 'Reservando...'
              : trip.status === 'FULL'
                ? 'Sin asientos disponibles'
                : trip.status !== 'OPEN'
                  ? `Viaje ${STATUS_LABEL[trip.status]?.toLowerCase()}`
                  : 'Reservar asiento'}
          </button>
        )
      )}
    </div>
  );
}
