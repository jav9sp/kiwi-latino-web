import { MapPin, Calendar, Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Trip } from '../types';
import { formatDate } from '../utils/date';
import UserLink from './UserLink';

interface Props {
  trip: Trip;
}

export default function TripCard({ trip }: Props) {
  const navigate = useNavigate();
  const isFull = trip.status === 'FULL';

  return (
    <article
      onClick={() => navigate(`/trips/${trip.id}`)}
      className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <span>{trip.origin}</span>
            <ChevronRight size={16} className="text-gray-400" />
            <span>{trip.destination}</span>
          </div>
        </div>
        <span className={`badge ${isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {isFull ? 'Completo' : 'Disponible'}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
        <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(trip.departureDate)}</span>
        <span className="flex items-center gap-1.5"><Users size={14} /> {trip.seatsAvailable}/{trip.seatsTotal} asientos</span>
        {trip.costPerPerson != null && (
          <span className="flex items-center gap-1.5"><MapPin size={14} /> ${trip.costPerPerson} NZD</span>
        )}
      </div>

      <UserLink user={trip.user} size={20} stopPropagation className="text-xs text-gray-400" />
    </article>
  );
}
