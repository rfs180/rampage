import { cn } from '../lib/utils'; // Optional if using clsx or similar for class merging

interface AvatarProps {
  src: string;
  alt?: string;
  size?: number; // default: 40
  onClick?: () => void;
  clickable?: boolean;
  className?: string;
}

export default function Avatar({
  src,
  alt = '',
  size = 40,
  onClick,
  clickable = false,
  className = '',
}: AvatarProps) {
  const avatarStyle = `rounded-full overflow-hidden border border-discord-border ${
    clickable ? 'cursor-pointer hover:ring-2 hover:ring-discord-gold' : ''
  }`;

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={cn(avatarStyle, className)}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
