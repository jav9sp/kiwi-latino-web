import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
        <Icon size={28} className="text-gray-400" />
      </div>
      <h3 className="font-semibold text-gray-700">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 max-w-xs">{subtitle}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary mt-2">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
