import React from 'react';

export const PersonalIllustration = () => (
  <svg viewBox="0 0 200 150" fill="none" className="w-full max-h-32 mx-auto" xmlns="http://www.w3.org/2000/svg">
    {/* Background Circle */}
    <circle cx="100" cy="75" r="55" fill="#F3EEFF" />
    <circle cx="140" cy="40" r="10" fill="#E8DFFF" />
    
    {/* Floating elements */}
    <circle cx="45" cy="55" r="4" fill="#C4B5FD" />
    <circle cx="160" cy="95" r="5" fill="#A78BFA" />

    {/* Location Pin */}
    <g transform="translate(42, 28) scale(0.8)">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#7C3AED" />
    </g>

    {/* Main Cushion */}
    <ellipse cx="100" cy="115" rx="55" ry="12" fill="#E9E3FF" />
    <ellipse cx="100" cy="118" rx="45" ry="8" fill="#D3C7FF" />

    {/* Person Character */}
    {/* Sitting legs/torso (stylized) */}
    <path d="M75 110C75 90 90 85 105 85C115 85 125 90 125 110H75Z" fill="#6366F1" />
    
    {/* Arms holding phone */}
    <path d="M88 95C93 100 102 100 106 97L114 93" stroke="#FEE2E2" strokeWidth="4" strokeLinecap="round" />
    
    {/* Phone */}
    <rect x="110" y="84" width="6" height="12" rx="1.5" transform="rotate(15 110 84)" fill="#1E293B" />
    <circle cx="113" cy="90" r="1" fill="#10B981" />

    {/* Head */}
    <circle cx="100" cy="70" r="10" fill="#FEE2E2" />
    {/* Hair */}
    <path d="M90 70C90 60 110 60 110 70C110 65 105 62 100 64C95 62 90 65 90 70Z" fill="#1E293B" />
    <path d="M100 60C104 60 109 63 110 67C105 67 101 64 100 60Z" fill="#1E293B" />

    {/* Glow from phone */}
    <path d="M112 90L135 70M112 92L132 85" stroke="#A78BFA" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export const EducationIllustration = () => (
  <svg viewBox="0 0 200 150" fill="none" className="w-full max-h-32 mx-auto" xmlns="http://www.w3.org/2000/svg">
    {/* Background elements */}
    <circle cx="100" cy="75" r="50" fill="#F3EEFF" />
    <circle cx="150" cy="100" r="12" fill="#E0F2FE" />
    
    {/* Sparkles */}
    <path d="M152 40L154 44L158 46L154 48L152 52L150 48L146 46L150 44L152 40Z" fill="#FBBF24" />
    <path d="M46 80L47.5 83L50.5 84L47.5 85L46 88L44.5 85L41.5 84L44.5 83L46 80Z" fill="#C4B5FD" />

    {/* Stack of books */}
    {/* Bottom Book */}
    <path d="M60 110H140V120H60V110Z" fill="#7C3AED" />
    <path d="M135 110V120H142V110H135Z" fill="#E9E3FF" /> {/* Pages block */}
    
    {/* Middle Book */}
    <path d="M65 98H135V108H65V98Z" fill="#A78BFA" />
    <path d="M130 98V108H137V98H130Z" fill="#F3EEFF" />

    {/* Top Book */}
    <path d="M72 86H128V96H72V86Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1" />
    <path d="M72 86H77V96H72V86Z" fill="#EF4444" /> {/* Red spine */}

    {/* Graduation Cap */}
    <g transform="translate(10, -5)">
      {/* Cap Base */}
      <path d="M80 82C80 82 82 88 90 88C98 88 100 82 100 82V76H80V82Z" fill="#1E293B" />
      {/* Cap Diamond */}
      <path d="M90 62L120 72L90 82L60 72L90 62Z" fill="#1E293B" />
      {/* Tassel */}
      <path d="M90 72L112 79V88" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="112" cy="89" r="2.5" fill="#FBBF24" />
    </g>

    {/* Small Plant on the right */}
    <g transform="translate(142, 85)">
      {/* Pot */}
      <path d="M4 15L12 15L14 27H2L4 15Z" fill="#D1A3FF" />
      {/* Leaves */}
      <path d="M8 15C8 10 13 8 13 8C13 8 10 12 8 15Z" fill="#10B981" />
      <path d="M8 15C8 10 3 8 3 8C3 8 6 12 8 15Z" fill="#059669" />
      <path d="M8 15V4" stroke="#059669" strokeWidth="1.5" />
      <path d="M8 9C10 6 15 6 15 6C15 6 12 9 8 9Z" fill="#34D399" />
    </g>
  </svg>
);

export const PaymentIllustration = () => (
  <svg viewBox="0 0 200 150" fill="none" className="w-full max-h-32 mx-auto" xmlns="http://www.w3.org/2000/svg">
    {/* Background Circle */}
    <circle cx="100" cy="75" r="50" fill="#F3EEFF" />

    {/* Shield (Security representation) */}
    <g opacity="0.15">
      <path d="M100 35C118 35 130 40 130 40V70C130 90 100 110 100 110C100 110 70 90 70 70V40C70 40 82 35 100 35Z" fill="#7C3AED" />
    </g>

    {/* Credit Card Graphic */}
    <g transform="translate(62, 50)">
      {/* Card Body */}
      <rect x="0" y="0" width="80" height="52" rx="8" fill="#7C3AED" shadow="lg" />
      
      {/* Card Dark Band */}
      <rect x="0" y="8" width="80" height="10" fill="#5B21b6" />
      
      {/* Chip */}
      <rect x="8" y="24" width="12" height="10" rx="2" fill="#FBBF24" />
      
      {/* Details (Mock Lines) */}
      <rect x="26" y="26" width="30" height="3" rx="1.5" fill="#EDE9FE" />
      <rect x="26" y="33" width="18" height="3" rx="1.5" fill="#EDE9FE" />
      
      {/* Logo Circles (Visa/Mastercard mock) */}
      <circle cx="64" cy="40" r="5" fill="#EF4444" opacity="0.9" />
      <circle cx="70" cy="40" r="5" fill="#F59E0B" opacity="0.9" />
    </g>

    {/* Security Shield Overlay (Foreground) */}
    <g transform="translate(112, 72)">
      {/* Shield Base */}
      <path d="M15 5C22 5 27 8 27 8V18C27 25 15 32 15 32C15 32 3 25 3 18V8C3 8 8 5 15 5Z" fill="#10B981" stroke="white" strokeWidth="2" />
      {/* Checkmark inside Shield */}
      <path d="M10 16L13 19L20 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

export const ConfirmationIllustration = () => (
  <svg viewBox="0 0 200 150" fill="none" className="w-full max-h-32 mx-auto" xmlns="http://www.w3.org/2000/svg">
    {/* Background glow */}
    <circle cx="100" cy="75" r="45" fill="#ECFDF5" />
    <circle cx="100" cy="75" r="35" fill="#D1FAE5" />
    
    {/* Sparkles & Confetti */}
    <path d="M60 40L62 45L67 47L62 49L60 54L58 49L53 47L58 45L60 40Z" fill="#10B981" />
    <path d="M135 35L136.5 39L140.5 40L136.5 41L135 45L133.5 41L129.5 40L133.5 39L135 35Z" fill="#F59E0B" />
    <path d="M145 80L147 84L152 86L147 88L145 93L143 88L138 86L143 84L145 80Z" fill="#3B82F6" />
    <path d="M50 95L51.5 98L54.5 99L51.5 100L50 103L48.5 100L45.5 99L48.5 98L50 95Z" fill="#EC4899" />

    {/* Floating ribbon style confetti */}
    <path d="M72 32C75 32 75 38 78 38" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
    <path d="M120 100C123 100 122 106 125 106" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />

    {/* Big Check Circle */}
    <circle cx="100" cy="75" r="28" fill="#10B981" />
    
    {/* Checkmark */}
    <path d="M88 75L96 83L112 67" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LoginIllustration = () => (
  <svg viewBox="0 0 200 150" fill="none" className="w-full max-h-32 mx-auto" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="75" r="50" fill="#F3EEFF" />
    <circle cx="50" cy="50" r="5" fill="#C4B5FD" />
    <circle cx="150" cy="90" r="4" fill="#A78BFA" />
    <g transform="translate(75, 40)">
      <rect x="0" y="24" width="50" height="40" rx="8" fill="#7C3AED" />
      <path d="M10 24V14C10 7.37 16.72 2 25 2C33.28 2 40 7.37 40 14V24" stroke="#7C3AED" strokeWidth="6" fill="none" />
      <circle cx="25" cy="40" r="4" fill="white" />
      <path d="M23 42H27L29 54H21L23 42Z" fill="white" />
    </g>
  </svg>
);

export const SignupIllustration = () => (
  <svg viewBox="0 0 200 150" fill="none" className="w-full max-h-32 mx-auto" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="75" r="50" fill="#F3EEFF" />
    <g transform="translate(70, 42)">
      <rect x="0" y="0" width="60" height="60" rx="10" fill="#A78BFA" />
      <circle cx="30" cy="22" r="10" fill="white" />
      <path d="M12 48C12 39.72 20.06 36 30 36C39.94 36 48 39.72 48 48H12Z" fill="white" />
    </g>
    <circle cx="132" cy="92" r="12" fill="#10B981" stroke="white" strokeWidth="2" />
    <path d="M132 87V97M127 92H137" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
