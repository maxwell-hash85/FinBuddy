export default function BuddyAvatar({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      aria-hidden
      style={{ flexShrink: 0, display: "block" }}
    >
      <circle cx="36" cy="36" r="34" fill="#1a2a1a" stroke="#2bc62c" strokeWidth="2" />
      <rect x="16" y="22" width="40" height="26" rx="4" fill="#2bc62c" />
      <rect x="21" y="29" width="11" height="9" rx="2" fill="#0d0d0d" />
      <rect x="40" y="29" width="11" height="9" rx="2" fill="#0d0d0d" />
      <circle cx="26" cy="33" r="2.5" fill="#2bc62c" />
      <circle cx="45" cy="33" r="2.5" fill="#2bc62c" />
      <rect x="27" y="42" width="18" height="3" rx="1.5" fill="#0d0d0d" />
      <rect x="34" y="13" width="4" height="9" rx="2" fill="#2bc62c" />
      <circle cx="36" cy="12" r="3.5" fill="#2bc62c" />
      <rect x="10" y="30" width="6" height="3" rx="1.5" fill="#2bc62c" />
      <rect x="56" y="30" width="6" height="3" rx="1.5" fill="#2bc62c" />
      <rect x="10" y="35" width="6" height="3" rx="1.5" fill="#2bc62c" />
      <rect x="56" y="35" width="6" height="3" rx="1.5" fill="#2bc62c" />
    </svg>
  );
}
