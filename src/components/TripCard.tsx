import { Calendar, Users, DollarSign, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Trip } from '../types';
import { formatDate } from '../utils/date';
import UserLink from './UserLink';

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Disponible', FULL: 'Completo', COMPLETED: 'Finalizado', CANCELLED: 'Cancelado',
};
const STATUS_CLASS: Record<string, string> = {
  OPEN:      'bg-green-100 text-green-700',
  FULL:      'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

interface Props { trip: Trip; }

export default function TripCard({ trip }: Props) {
  const navigate = useNavigate();
  const booked = trip.seatsTotal - trip.seatsAvailable;

  return (
    <article
      onClick={() => navigate(`/trips/${trip.id}`)}
      className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Ruta + estado */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-base font-semibold text-gray-900">
          <span>{trip.origin}</span>
          <ChevronRight size={15} className="text-gray-400 shrink-0" />
          <span>{trip.destination}</span>
        </div>
        <span className={`badge shrink-0 ${STATUS_CLASS[trip.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABEL[trip.status] ?? trip.status}
        </span>
      </div>

      {/* Fecha */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
        <Calendar size={14} />
        <span>{formatDate(trip.departureDate)}</span>
      </div>

      {/* Asientos + costo */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5 text-sm">
          <Users size={14} className="text-gray-400" />
          <span className={`font-medium ${trip.seatsAvailable === 0 ? 'text-red-600' : 'text-green-600'}`}>
            {trip.seatsAvailable} libre{trip.seatsAvailable !== 1 ? 's' : ''}
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500">{trip.seatsTotal} total</span>
        </div>
        {trip.costPerPerson != null && (
          <div className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
            <DollarSign size={13} />
            <span>{trip.costPerPerson} NZD</span>
          </div>
        )}
      </div>

      {/* Barra de ocupación */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${trip.seatsTotal > 0 ? (booked / trip.seatsTotal) * 100 : 0}%` }}
        />
      </div>

      <UserLink user={trip.user} size={20} stopPropagation className="text-xs text-gray-400" />
    </article>
  );
}
