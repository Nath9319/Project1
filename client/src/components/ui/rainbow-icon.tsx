export function RainbowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
        fill="url(#rainbow-gradient)"
      />
      <defs>
        <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E40303" />
          <stop offset="16.66%" stopColor="#FF8C00" />
          <stop offset="33.33%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#00C300" />
          <stop offset="66.66%" stopColor="#0050FF" />
          <stop offset="83.33%" stopColor="#800080" />
          <stop offset="100%" stopColor="#E40303" />
        </linearGradient>
      </defs>
    </svg>
  );
}