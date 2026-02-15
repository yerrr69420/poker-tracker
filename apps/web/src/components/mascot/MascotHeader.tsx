import MascotAvatar from './MascotAvatar';

interface Props {
  title: string;
  subtitle?: string;
  mood?: 'neutral' | 'profit' | 'loss';
}

export default function MascotHeader({ title, subtitle, mood = 'neutral' }: Props) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <MascotAvatar size={40} mood={mood} />
      <div>
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
      </div>
    </div>
  );
}
