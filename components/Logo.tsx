export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="DAYLY home">
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        role="img"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* D letterform — the day, given shape */}
        <path
          d="M15 9 V35 M15 9 H22.5 A13.5 13.5 0 0 1 22.5 35 H15"
          stroke="#1E4D3B"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Progress check inside the bowl */}
        <path
          d="M17.5 24.5l4 4 6.5-7.5"
          stroke="#1E4D3B"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Rising sun — a day that counts */}
        <circle cx="32" cy="10.5" r="4.6" fill="#D9A441" />
        <g stroke="#D9A441" strokeWidth="2.2" strokeLinecap="round">
          <line x1="32" y1="1.5" x2="32" y2="2.6" />
          <line x1="38.5" y1="4" x2="37.7" y2="5.4" />
          <line x1="41" y1="10.5" x2="39.4" y2="10.5" />
        </g>
      </svg>
      <span className="text-[22px] font-extrabold tracking-tight text-ink">DAYLY</span>
    </span>
  );
}
