// Pre-configured high-resolution vector logos for each brand

export const DEFAULT_BRAND_LOGOS: Record<string, string> = {
  aquarium: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="aqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06B6D4" />
          <stop offset="50%" stop-color="#0EA5E9" />
          <stop offset="100%" stop-color="#14B8A6" />
        </linearGradient>
        <radialGradient id="aqGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#082f49" />
          <stop offset="100%" stop-color="#020b14" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="94" fill="url(#aqGlow)" stroke="url(#aqGrad)" stroke-width="4"/>
      <!-- Water ripples -->
      <path d="M 30 115 Q 65 95 100 115 T 170 115" fill="none" stroke="#38BDF8" stroke-width="2" opacity="0.4"/>
      <path d="M 30 135 Q 65 115 100 135 T 170 135" fill="none" stroke="#06B6D4" stroke-width="2" opacity="0.3"/>
      <!-- Ornamental Goldfish silhouette -->
      <path d="M 60 100 C 60 75, 95 70, 120 85 C 135 75, 155 68, 160 80 C 150 90, 140 95, 135 100 C 145 110, 158 115, 155 125 C 140 120, 130 112, 120 115 C 95 130, 60 125, 60 100 Z" fill="url(#aqGrad)"/>
      <circle cx="85" cy="92" r="3" fill="#030B17"/>
      <!-- Bubbles -->
      <circle cx="145" cy="55" r="5" fill="#38BDF8" opacity="0.6"/>
      <circle cx="155" cy="42" r="3" fill="#38BDF8" opacity="0.8"/>
      <circle cx="138" cy="38" r="2" fill="#38BDF8" opacity="0.5"/>
      <!-- Typography -->
      <text x="100" y="165" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="16" fill="#F0FDFA" text-anchor="middle" letter-spacing="2">SS AQUARIUM</text>
      <text x="100" y="180" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="9" fill="#38BDF8" text-anchor="middle" letter-spacing="1">EST. 2018</text>
    </svg>
  `)}`,

  kirubai: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="kbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F97316" />
          <stop offset="50%" stop-color="#FB923C" />
          <stop offset="100%" stop-color="#F59E0B" />
        </linearGradient>
        <radialGradient id="kbGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2d1305" />
          <stop offset="100%" stop-color="#0f172a" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="94" fill="url(#kbGlow)" stroke="url(#kbGrad)" stroke-width="4"/>
      <!-- Steaming Handi & Flame -->
      <path d="M 60 115 C 60 145, 140 145, 140 115 L 60 115 Z" fill="url(#kbGrad)"/>
      <rect x="52" y="108" width="96" height="8" rx="4" fill="#FBBF24"/>
      <!-- Steam vapors -->
      <path d="M 80 98 Q 72 82 82 68 Q 92 54 84 42" fill="none" stroke="#FDBA74" stroke-width="3" stroke-linecap="round"/>
      <path d="M 100 98 Q 108 80 98 64 Q 88 48 98 35" fill="none" stroke="#F97316" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 120 98 Q 128 82 118 68 Q 108 54 116 42" fill="none" stroke="#FDBA74" stroke-width="3" stroke-linecap="round"/>
      <!-- Typography -->
      <text x="100" y="165" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="15" fill="#FFF7ED" text-anchor="middle" letter-spacing="2">KIRUBAI KITCHEN</text>
      <text x="100" y="180" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="9" fill="#F97316" text-anchor="middle" letter-spacing="1">CLOUD KITCHEN</text>
    </svg>
  `)}`,

  'vision-360': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="v3Grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3B82F6" />
          <stop offset="50%" stop-color="#2563EB" />
          <stop offset="100%" stop-color="#38BDF8" />
        </linearGradient>
        <radialGradient id="v3Glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#090d16" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="94" fill="url(#v3Glow)" stroke="url(#v3Grad)" stroke-width="4"/>
      <!-- Surveillance Aperture & 360 Ring -->
      <circle cx="100" cy="92" r="42" fill="none" stroke="#1E3A8A" stroke-width="3" stroke-dasharray="8 4"/>
      <circle cx="100" cy="92" r="30" fill="none" stroke="url(#v3Grad)" stroke-width="4"/>
      <circle cx="100" cy="92" r="16" fill="#1D4ED8"/>
      <circle cx="94" cy="86" r="4" fill="#93C5FD"/>
      <!-- Camera Crosshair Grid -->
      <line x1="100" y1="42" x2="100" y2="52" stroke="#60A5FA" stroke-width="2"/>
      <line x1="100" y1="132" x2="100" y2="142" stroke="#60A5FA" stroke-width="2"/>
      <line x1="50" y1="92" x2="60" y2="92" stroke="#60A5FA" stroke-width="2"/>
      <line x1="140" y1="92" x2="150" y2="92" stroke="#60A5FA" stroke-width="2"/>
      <!-- Typography -->
      <text x="100" y="165" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="15" fill="#EFF6FF" text-anchor="middle" letter-spacing="2">SS VISION 360</text>
      <text x="100" y="180" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="9" fill="#60A5FA" text-anchor="middle" letter-spacing="1">CCTV &amp; SECURITY</text>
    </svg>
  `)}`,
};
