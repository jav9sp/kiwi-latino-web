import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, ChevronRight, MessageCircle, DollarSign, StickyNote, Check, X, Clock } from 'lucide-react';
import UserLink from '../components/UserLink';
import { useTrip, useBookTrip, useCancelBooking, useAcceptBooking, useRejectBooking } from '../hooks/useTrips';
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
  const accept = useAcceptBooking(id!);
  const reject = useRejectBooking(id!);

  if (isError) return <div className="p-6"><ErrorState onRetry={refetch} /></div>;
  if (!trip)   return <div className="h-full flex items-center justify-center"><div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent" /></div>;

  const isDriver      = trip.user?.id === user?.id;
  const myBooking     = trip.bookings?.find((b) => b.user?.id === user?.id);
  const pendingList   = trip.bookings?.filter((b) => b.status === 'PENDING') ?? [];
  const acceptedList  = trip.bookings?.filter((b) => b.status === 'ACCEPTED') ?? [];
  const booked        = trip.seatsTotal - trip.seatsAvailable;
  const canBook       = trip.status === 'OPEN' && !isDriver && !myBooking;

  const PassengerAvatar = ({ name, avatarUrl }: { name?: string; avatarUrl?: string }) =>
    avatarUrl
      ? <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
      : <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
          {name?.[0]?.toUpperCase()}
        </div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6 space-y-4">
      <button onClick={() => navigate(-1)} className="btn-ghost -ml-2">
        <ArrowLeft size={18} /> Volver
      </button>

      {/* ── Card principal ── */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl font-bold">{trip.origin}</span>
          <ChevronRight size={20} className="text-gray-400 shrink-0" />
          <span className="text-xl font-bold">{trip.destination}</span>
          <span className={`ml-auto badge text-xs shrink-0 ${STATUS_CLASS[trip.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABEL[trip.status] ?? trip.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><Calendar size={13} /> Fecha y hora</div>
            <p className="text-sm font-semibold">{formatDate(trip.departureDate)}</p>
          </div>
          {trip.costPerPerson != null && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><DollarSign size={13} /> Costo por persona</div>
              <p className="text-sm font-semibold">${trip.costPerPerson} NZD</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><Users size={13} /> Asientos totales</div>
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

        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{booked} confirmado{booked !== 1 ? 's' : ''}</span>
            <span>{trip.seatsAvailable} libre{trip.seatsAvailable !== 1 ? 's' : ''}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(booked / trip.seatsTotal) * 100}%` }} />
          </div>
        </div>

        {trip.notes && (
          <div className="flex gap-2 text-sm text-gray-600 bg-amber-50 rounded-xl p-3 mb-4">
            <StickyNote size={15} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="whitespace-pre-line">{trip.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <UserLink user={trip.user} size={36} subtitle="Conductor" className="text-sm text-gray-500" />
          {!isDriver && (
            <button onClick={() => navigate(`/chat/${trip.user?.id}`)} className="btn-outline text-sm">
              <MessageCircle size={15} /> Contactar
            </button>
          )}
        </div>
      </div>

      {/* ── Solicitudes pendientes (solo conductor) ── */}
      {isDriver && pendingList.length > 0 && (
        <div className="card p-4 border-l-4 border-amber-400">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-amber-700">
            <Clock size={16} />
            Solicitudes pendientes ({pendingList.length})
          </h2>
          <div className="divide-y divide-gray-100">
            {pendingList.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <button
                  onClick={() => b.user?.id && navigate(`/profile/${b.user.id}`)}
                  className="flex items-center gap-2.5 hover:opacity-75 transition-opacity text-left"
                >
                  <PassengerAvatar name={b.user?.name} avatarUrl={b.user?.avatarUrl} />
                  <div>
                    <p className="text-sm font-medium">{b.user?.name ?? 'Pasajero'}</p>
                    {b.seats > 1 && <p className="text-xs text-gray-400">{b.seats} asientos</p>}
                  </div>
                </button>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => accept.mutate(b.id)}
                    disabled={accept.isPending}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Check size={12} /> Aceptar
                  </button>
                  <button
                    onClick={() => reject.mutate(b.id)}
                    disabled={reject.isPending}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <X size={12} /> Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pasajeros confirmados ── */}
      {acceptedList.length > 0 && (
        <div className="card p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Users size={16} />
            Pasajeros confirmados ({acceptedList.length})
          </h2>
          <div className="divide-y divide-gray-100">
            {acceptedList.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <button
                  onClick={() => b.user?.id && navigate(`/profile/${b.user.id}`)}
                  className="flex items-center gap-2.5 hover:opacity-75 transition-opacity text-left"
                >
                  <PassengerAvatar name={b.user?.name} avatarUrl={b.user?.avatarUrl} />
                  <div>
                    <p className="text-sm font-medium">{b.user?.name ?? 'Pasajero'}</p>
                    {b.seats > 1 && <p className="text-xs text-gray-400">{b.seats} asientos</p>}
                  </div>
                </button>
                {isDriver && b.user?.id && (
                  <div className="flex gap-1.5">
                    <button onClick={() => navigate(`/chat/${b.user!.id}`)} className="btn-ghost text-xs py-1 px-2">
                      <MessageCircle size={13} /> Mensaje
                    </button>
                    <button
                      onClick={() => reject.mutate(b.id)}
                      disabled={reject.isPending}
                      className="text-xs px-2 py-1 border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Estado de la solicitud (pasajero) ── */}
      {!isDriver && myBooking && (
        <div className={`card p-4 border-l-4 ${
          myBooking.status === 'ACCEPTED' ? 'border-green-500' :
          myBooking.status === 'REJECTED' ? 'border-red-400' :
          'border-amber-400'
        }`}>
          {myBooking.status === 'PENDING' && (
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-700">Solicitud pendiente</p>
                <p className="text-xs text-gray-500 mt-0.5">El conductor revisará tu solicitud y te confirmará pronto.</p>
              </div>
            </div>
          )}
          {myBooking.status === 'ACCEPTED' && (
            <div className="flex items-start gap-3">
              <Check size={18} className="text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-700">¡Reserva confirmada!</p>
                <p className="text-xs text-gray-500 mt-0.5">El conductor aceptó tu solicitud. Coordina los detalles con él.</p>
              </div>
            </div>
          )}
          {myBooking.status === 'REJECTED' && (
            <div className="flex items-start gap-3">
              <X size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-600">Solicitud rechazada</p>
                <p className="text-xs text-gray-500 mt-0.5">El conductor no pudo aceptarte en este viaje.</p>
              </div>
            </div>
          )}
          {myBooking.status !== 'REJECTED' && (
            <button
              onClick={() => cancel.mutate()}
              disabled={cancel.isPending}
              className="mt-3 text-xs text-red-500 hover:text-red-700 hover:underline transition-colors disabled:opacity-50"
            >
              {cancel.isPending ? 'Cancelando...' : myBooking.status === 'PENDING' ? 'Retirar solicitud' : 'Cancelar reserva'}
            </button>
          )}
        </div>
      )}

      {/* ── CTA — unirse al viaje ── */}
      {!isDriver && !myBooking && (
        <button
          onClick={() => book.mutate()}
          disabled={book.isPending || !canBook}
          className="btn-primary w-full"
        >
          {book.isPending
            ? 'Enviando solicitud...'
            : trip.status === 'FULL'
              ? 'Sin asientos disponibles'
              : trip.status !== 'OPEN'
                ? `Viaje ${STATUS_LABEL[trip.status]?.toLowerCase()}`
                : 'Solicitar unirse al viaje'}
        </button>
      )}
    </div>
  );
}
