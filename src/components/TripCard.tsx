import { MapPin, Calendar, Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Trip } from '../types';
import { formatDate } from '../utils/date';

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
        <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(trip.departureAt)}</span>
        <span className="flex items-center gap-1.5"><Users size={14} /> {trip.seatsAvailable}/{trip.seatsTotal} asientos</span>
        {trip.price != null && (
          <span className="flex items-center gap-1.5"><MapPin size={14} /> ${trip.price} NZD</span>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        {trip.driver?.avatarUrl ? (
          <img src={trip.driver.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
            {trip.driver?.name?.[0]?.toUpperCase()}
          </div>
        )}
        <span>{trip.driver?.name}</span>
      </div>
    </article>
  );
}
