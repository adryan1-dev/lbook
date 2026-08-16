/** Ícones Lucide (Iconify). Traço único; `currentColor` herda do texto. */

function Icon({ className = "", filled = false, children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export function Eye({ className }) {
  return (
    <Icon className={className}>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 19.876 0a1 1 0 0 1 0 .696a10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function EyeOff({ className }) {
  return (
    <Icon className={className}>
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575a1 1 0 0 1 0 .696a10.8 10.8 0 0 1-1.444 2.49m-6.41-.679a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 4.446-5.143" />
      <path d="M2 2l20 20" />
    </Icon>
  );
}

export function Star({ className, filled = false }) {
  return (
    <Icon className={className} filled={filled}>
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z" />
    </Icon>
  );
}

export function Close({ className }) {
  return (
    <Icon className={className}>
      <path d="M18 6L6 18M6 6l12 12" />
    </Icon>
  );
}

export function Search({ className }) {
  return (
    <Icon className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.34-4.34" />
    </Icon>
  );
}

export function BookPlus({ className }) {
  return (
    <Icon className={className}>
      <path d="M12 7v6m-8 6.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20M9 10h6" />
    </Icon>
  );
}

export function LogOut({ className }) {
  return (
    <Icon className={className}>
      <path d="m16 17 5-5-5-5m5 5H9m0 9H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    </Icon>
  );
}

export function Trash({ className }) {
  return (
    <Icon className={className}>
      <path d="M10 11v6m4-6v6m5-11v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Icon>
  );
}

export function Pencil({ className }) {
  return (
    <Icon className={className}>
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497zM15 5l4 4" />
    </Icon>
  );
}

export function Library({ className }) {
  return (
    <Icon className={className}>
      <path d="m16 6 4 14M12 6v14M8 8v12M4 4v16" />
    </Icon>
  );
}

export function Refresh({ className }) {
  return (
    <Icon className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </Icon>
  );
}
