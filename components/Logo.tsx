export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="DAYLY home">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        role="img"
        aria-hidden="true"
        className="shrink-0 drop-shadow-sm"
      >
        <rect x="3" y="6" width="34" height="30" rx="8" fill="#4F46E5" />
        <rect x="3" y="6" width="34" height="9" rx="4.5" fill="#6366F1" />
        <rect x="11" y="3" width="3.4" height="7" rx="1.7" fill="#C7D2FE" />
        <rect x="25.6" y="3" width="3.4" height="7" rx="1.7" fill="#C7D2FE" />
        <path
          d="M13 24.5l6 6 8.5-11"
          stroke="#fff"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M31 9l1.1 2.6L34.7 12.7l-2.6 1.1L31 16.4l-1.1-2.6-2.6-1.1 2.6-1.1L31 9z"
          fill="#A5B4FC"
        />
      </svg>
      <span className="text-[22px] font-extrabold tracking-tight text-ink">DAYLY</span>
    </span>
  );
}
