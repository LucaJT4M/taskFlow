// App-Icon von TaskFlow (gleiche Grafik wie das Favicon in public/favicon.svg)
function BrandIcon({ size = 28 }) {
  return (
    <svg className="brand-icon" width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <rect width="512" height="512" rx="112" fill="#66773F" />
      <path d="M243 404 C 244 352, 249 300, 258 250 L 270 252 C 262 302, 255 352, 249 404 C 248 410, 244 410, 243 404 Z" fill="#F5F2EA" />
      <path d="M258 258 C 200 266, 146 236, 124 176 C 188 162, 244 196, 258 258 Z" fill="#A9BA86" />
      <path d="M248 248 C 216 228, 184 206, 154 186" fill="none" stroke="#66773F" strokeWidth="8" strokeLinecap="round" opacity=".55" />
      <path d="M262 254 C 268 176, 330 128, 408 132 C 408 208, 346 262, 262 254 Z" fill="#F5F2EA" />
      <path d="M276 240 C 312 208, 350 180, 386 156" fill="none" stroke="#66773F" strokeWidth="9" strokeLinecap="round" />
    </svg>
  )
}

export default BrandIcon
