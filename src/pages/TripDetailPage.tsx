import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, MapPin, ChevronRight, MessageCircle } from 'lucide-react';
import UserLink from '../components/UserLink';
import { useTrip, useBookTrip, useCancelBooking } from '../hooks/useTrips';
import { useAuthStore } from '../stores/authStore';
import ErrorState from '../components/ErrorState';
import { formatDate } from '../utils/date';

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: trip, isError, refetch } = useTrip(id!);
  const book = useBookTrip(id!);
  const cancel = useCancelBooking(id!);

  if (isError) return <div className="p-6"><ErrorState onRetry={refetch} /></div>;
  if (!trip) return <div className="h-full flex items-center justify-center"><div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent" /></div>;

  const isDriver = trip.user?.id === user?.id;
  const myBooking = trip.bookings?.find((b) => b.passengerId === user?.id && b.status === 'CONFIRMED');
  const isFull = trip.status === 'FULL';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2">
        <ArrowLeft size={18} /> Volver
      </button>

      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2 text-xl font-bold mb-4">
          <span>{trip.origin}</span>
          <ChevronRight className="text-gray-400" />
          <span>{trip.destination}</span>
          <span className={`ml-auto badge text-xs ${isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {isFull ? 'Completo' : 'Disponible'}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1.5"><Calendar size={16} /> {formatDate(trip.departureDate)}</span>
          <span className="flex items-center gap-1.5"><Users size={16} /> {trip.seatsAvailable}/{trip.seatsTotal} asientos</span>
          {trip.costPerPerson != null && <span className="flex items-center gap-1.5"><MapPin size={16} /> ${trip.costPerPerson} NZD</span>}
        </div>

        {trip.notes && <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">{trip.notes}</p>}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <UserLink user={trip.user} size={32} subtitle="Conductor" className="text-sm text-gray-500" />
          {!isDriver && (
            <button
              onClick={() => navigate(`/chat/${trip.user?.id}`)}
              className="btn-outline text-sm"
            >
              <MessageCircle size={15} /> Contactar
            </button>
          )}
        </div>
      </div>

      {!isDriver && (
        myBooking ? (
          <button onClick={() => cancel.mutate()} disabled={cancel.isPending} className="btn w-full border border-red-300 text-red-600 hover:bg-red-50">
            {cancel.isPending ? 'Cancelando...' : 'Cancelar reserva'}
          </button>
        ) : (
          <button onClick={() => book.mutate()} disabled={book.isPending || isFull} className="btn-primary w-full">
            {book.isPending ? 'Reservando...' : isFull ? 'Sin asientos disponibles' : 'Reservar asiento'}
          </button>
        )
      )}

      {/* Passenger list for driver */}
      {isDriver && trip.bookings && trip.bookings.length > 0 && (
        <div className="card p-4 mt-4">
          <h2 className="font-semibold mb-3">Pasajeros ({trip.bookings.filter((b) => b.status === 'CONFIRMED').length})</h2>
          <div className="space-y-2">
            {trip.bookings.filter((b) => b.status === 'CONFIRMED').map((b) => (
              <div key={b.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {b.passenger?.name?.[0]?.toUpperCase()}
                  </div>
                  <span>{b.passenger?.name}</span>
                </div>
                <button onClick={() => navigate(`/chat/${b.passengerId}`)} className="btn-ghost text-xs py-1">
                  <MessageCircle size={13} /> Mensaje
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
