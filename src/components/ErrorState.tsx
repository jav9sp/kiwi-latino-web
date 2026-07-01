import { CloudOff } from 'lucide-react';

interface Props {
  onRetry: () => void;
  message?: string;
}

export default function ErrorState({ onRetry, message = 'Ocurrió un error al cargar el contenido.' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <CloudOff size={28} className="text-red-400" />
      </div>
      <h3 className="font-semibold text-gray-700">Algo salió mal</h3>
      <p className="text-sm text-gray-500 max-w-xs">{message}</p>
      <button onClick={onRetry} className="btn-primary mt-2">Reintentar</button>
    </div>
  );
}
