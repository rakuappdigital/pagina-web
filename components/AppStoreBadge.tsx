export default function AppStoreBadge({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 135 40"
      aria-label="App Store'dan İndir"
    >
      <rect width="135" height="40" rx="8" fill="#1A1A1A" />
      {/* Apple logo */}
      <path
        d="M17.5 10.8c1.1-1.4 1.9-3.2 1.7-5.1-1.6.1-3.6 1.1-4.7 2.5-1 1.2-1.9 3.1-1.7 4.9 1.8.1 3.6-.9 4.7-2.3zm1.6 2.6c-2.6-.2-4.8 1.5-6 1.5-1.3 0-3.2-1.4-5.3-1.4-2.7 0-5.3 1.6-6.6 4.1-2.9 5-.7 12.3 2 16.4 1.4 2 3 4.2 5.1 4.1 2-.1 2.8-1.3 5.2-1.3s3.1 1.3 5.3 1.3c2.2 0 3.6-2 5-4 1.5-2.2 2.2-4.4 2.2-4.5-.1 0-4.2-1.6-4.3-6.4-.1-4 3.3-5.9 3.4-6-1.9-2.7-4.7-3-5.7-3z"
        fill="white"
        transform="scale(0.65) translate(4, 4)"
      />
      {/* Text */}
      <text x="38" y="13" fontFamily="Arial, sans-serif" fontSize="7" fill="white" opacity="0.8">
        Download on the
      </text>
      <text x="38" y="26" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="600" fill="white">
        App Store
      </text>
    </svg>
  );
}
