function StarIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 2.6l2.9 5.88 6.49.95-4.7 4.57 1.11 6.46L12 17.41l-5.8 3.05 1.1-6.46-4.69-4.57 6.49-.95z"
      />
    </svg>
  );
}

export default StarIcon;
