import * as React from "react";

/** Line icons used on the landing page, path data copied from the design file. */
type IconProps = {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
  fill?: string;
};

function make(paths: React.ReactNode, defaults: Partial<IconProps> = {}) {
  return function Icon({
    size = 18,
    stroke = "currentColor",
    strokeWidth,
    className,
    fill = "none",
  }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth ?? defaults.strokeWidth ?? 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {paths}
      </svg>
    );
  };
}

export const IconArrow = make(<path d="M5 12h14M13 6l6 6-6 6" />, { strokeWidth: 2.4 });
export const IconCheck = make(<path d="M5 12l5 5L20 7" />, { strokeWidth: 2.6 });
export const IconUpload = make(<path d="M12 16V4M6 10l6-6 6 6M4 20h16" />, { strokeWidth: 2.2 });
export const IconGrid = make(
  <>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </>,
);
export const IconCalendar = make(
  <>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 9h18M8 2v4M16 2v4" />
  </>,
);
export const IconHome = make(
  <>
    <path d="M3 21V9l9-6 9 6v12" />
    <path d="M9 21v-6h6v6" />
  </>,
);
export const IconCoin = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2s1.3 1.7 3 2 3 .9 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2" />
  </>,
);
export const IconSun = make(
  <>
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3" />
  </>,
  { strokeWidth: 2.2 },
);
export const IconGrip = make(<path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" />, {
  strokeWidth: 2.4,
});
export const IconPin = make(
  <>
    <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </>,
);
export const IconConfirm = make(
  <>
    <path d="M9 11l3 3 8-8" />
    <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
  </>,
);
export const IconLock = make(
  <>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </>,
);
export const IconMail = make(
  <>
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="M22 7l-10 6L2 7" />
  </>,
);
export const IconGift = make(
  <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />,
);
export const IconUsers = make(
  <>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
  </>,
);
export const IconChat = make(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />);
export const IconRoute = make(<path d="M3.5 17.5c3-8.5 6-10.5 8.5-10.5s3 3 5 3 3.5-2.5 3.5-2.5" />, {
  strokeWidth: 2.4,
});
