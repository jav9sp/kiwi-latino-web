import { MapPin } from 'lucide-react';
import { NZ_CITIES } from '../constants';

interface Props {
  value: string;
  onChange: (city: string) => void;
}

export default function CityFilter({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 card px-3 py-2.5 mb-5">
      <MapPin size={15} className="text-gray-400 shrink-0" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-sm bg-transparent outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
      >
        <option value="">Todas las ciudades</option>
        {NZ_CITIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
