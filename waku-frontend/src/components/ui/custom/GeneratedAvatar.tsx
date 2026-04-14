import { useMemo } from 'react';

interface GeneratedAvatarProps {
  userId: string;
  size?: number;
}

export function GeneratedAvatar({ userId, size = 40 }: GeneratedAvatarProps) {
  // Generate deterministic values from userId
  const { gradient, pattern } = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    // Purple color palette
    const colors = [
      ['#A855F7', '#9333EA'],
      ['#C084FC', '#A855F7'],
      ['#D8B4FE', '#C084FC'],
      ['#7C3AED', '#6D28D9'],
      ['#8B5CF6', '#7C3AED'],
    ];

    const gradientIndex = Math.abs(hash) % colors.length;
    const patternType = Math.abs(hash >> 4) % 3;

    return {
      gradient: colors[gradientIndex],
      pattern: patternType,
    };
  }, [userId]);

  return (
    <div
      className="rounded-full overflow-hidden flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
      }}
    >
      {/* Pattern overlay */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        className="opacity-30"
      >
        {pattern === 0 && (
          // Circles pattern
          <>
            <circle cx="10" cy="10" r="6" fill="white" />
            <circle cx="30" cy="30" r="8" fill="white" />
            <circle cx="30" cy="10" r="4" fill="white" />
          </>
        )}
        {pattern === 1 && (
          // Triangles pattern
          <>
            <polygon points="20,5 30,25 10,25" fill="white" />
            <polygon points="10,30 20,15 30,30" fill="white" />
          </>
        )}
        {pattern === 2 && (
          // Lines pattern
          <>
            <rect x="5" y="8" width="30" height="4" fill="white" />
            <rect x="10" y="18" width="20" height="4" fill="white" />
            <rect x="5" y="28" width="30" height="4" fill="white" />
          </>
        )}
      </svg>
    </div>
  );
}
