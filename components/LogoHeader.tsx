export function LogoHeader() {
  return (
    <svg
      viewBox="0 0 200 80"
      width="180"
      height="72"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg"
    >
      {/* Fondo decorativo */}
      <rect width="200" height="80" fill="transparent" rx="10" />

      {/* Tomate rojo */}
      <circle cx="40" cy="30" r="16" fill="#ef4444" />
      <ellipse cx="40" cy="28" rx="14" ry="12" fill="#dc2626" opacity="0.3" />
      {/* Tallo tomate */}
      <path d="M 40 14 Q 35 10 38 5" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="40" cy="12" rx="2" ry="3" fill="#22c55e" />

      {/* Lechuga verde */}
      <g transform="translate(100, 25)">
        <ellipse cx="0" cy="0" rx="18" ry="20" fill="#22c55e" />
        <ellipse cx="-8" cy="-5" rx="6" ry="12" fill="#16a34a" opacity="0.6" />
        <ellipse cx="8" cy="-5" rx="6" ry="12" fill="#16a34a" opacity="0.6" />
        <ellipse cx="-10" cy="5" rx="5" ry="10" fill="#15803d" />
        <ellipse cx="10" cy="5" rx="5" ry="10" fill="#15803d" />
        {/* Detalles de hojas */}
        <path d="M -12 -8 Q -15 -5 -12 2" stroke="#15803d" strokeWidth="1.5" fill="none" opacity="0.8" />
        <path d="M 12 -8 Q 15 -5 12 2" stroke="#15803d" strokeWidth="1.5" fill="none" opacity="0.8" />
      </g>

      {/* Zanahoria naranja */}
      <g transform="translate(160, 35)">
        {/* Cuerpo */}
        <polygon points="0,-15 -8,15 8,15" fill="#f97316" />
        <polygon points="0,-15 -6,15 6,15" fill="#ea580c" opacity="0.4" />
        {/* Hojas verdes */}
        <path d="M -4 -15 L -8 -25 L -2 -18" fill="#22c55e" />
        <path d="M 0 -17 L 2 -28 L 1 -18" fill="#22c55e" />
        <path d="M 4 -15 L 10 -25 L 4 -18" fill="#22c55e" />
      </g>

      {/* Manzana roja */}
      <g transform="translate(70, 55)">
        <circle cx="0" cy="0" r="14" fill="#dc2626" />
        <circle cx="4" cy="-8" r="8" fill="#ef4444" opacity="0.6" />
        {/* Tallo */}
        <rect x="-1" y="-16" width="2" height="8" fill="#78350f" />
        {/* Hoja */}
        <ellipse cx="5" cy="-12" rx="6" ry="4" fill="#22c55e" transform="rotate(-30 5 -12)" />
      </g>

      {/* Brócoli verde oscuro */}
      <g transform="translate(130, 60)">
        {/* Corona */}
        <circle cx="0" cy="-5" r="10" fill="#15803d" />
        <circle cx="-6" cy="-2" r="6" fill="#166534" />
        <circle cx="6" cy="-2" r="6" fill="#166534" />
        <circle cx="0" cy="3" r="7" fill="#166534" />
        {/* Tallo */}
        <rect x="-2" y="8" width="4" height="10" fill="#78a644" />
      </g>

      {/* Texto */}
      <text
        x="100"
        y="72"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="#1f2937"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        Frutas & Verduras
      </text>
    </svg>
  )
}
