interface BackgroundGritProps {
  isActive: boolean;
  accentColor: string;
}

export function BackgroundGrit({ isActive, accentColor }: BackgroundGritProps) {
  const activeStroke = isActive ? accentColor : '#71717a';
  const trailOpacity = isActive ? 0.55 : 0.2;
  const gaugeOpacity = isActive ? 0.4 : 0.15;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* 1. BOTTOM-LEFT: Wireframe Alpine Mountain Peaks & Winding Summit Trail */}
      <svg
        viewBox="0 0 900 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 -left-12 h-[540px] w-[760px] transition-opacity duration-700 md:h-[660px] md:w-[920px]"
        style={{
          maskImage:
            'radial-gradient(ellipse 80% 80% at 32% 68%, black 30%, transparent 92%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 80% at 32% 68%, black 30%, transparent 92%)',
        }}
      >
        <defs>
          <linearGradient
            id="mountainFaceGrad"
            x1="280"
            y1="140"
            x2="280"
            y2="680"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0%"
              stopColor={isActive ? accentColor : '#ffffff'}
              stopOpacity={isActive ? '0.07' : '0.03'}
            />
            <stop offset="100%" stopColor="#0e1015" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Subtle Horizontal Altitude Reference Lines */}
        <g
          stroke="rgba(255, 255, 255, 0.025)"
          strokeWidth="1"
          strokeDasharray="4 8"
        >
          <line x1="0" y1="140" x2="580" y2="140" />
          <line x1="0" y1="290" x2="660" y2="290" />
          <line x1="0" y1="450" x2="740" y2="450" />
        </g>

        {/* Distant Background Peak (Left Shoulder) */}
        <path
          d="M -60 680 L 45 430 L 115 310 L 165 345 L 255 520 L 340 680 Z"
          stroke="rgba(255, 255, 255, 0.045)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Distant Peak Center Ridge */}
        <path
          d="M 115 310 L 135 430 L 105 560 L 120 680"
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth="1"
        />

        {/* Secondary Twin Peak (Right Shoulder) */}
        <path
          d="M 290 680 L 415 395 L 485 265 L 555 370 L 645 485 L 790 680 Z"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Twin Peak Ridge & Wireframe Facets */}
        <path
          d="M 485 265 L 465 385 L 510 510 L 490 680"
          stroke="rgba(255, 255, 255, 0.035)"
          strokeWidth="1"
        />
        <path
          d="M 415 395 L 465 385 L 555 370 M 465 385 L 380 540 M 510 510 L 645 485"
          stroke="rgba(255, 255, 255, 0.025)"
          strokeWidth="1"
        />

        {/* MAIN SUMMIT PEAK (Foreground Alpine Pyramid) */}
        <path
          d="M -20 680 L 115 470 L 195 315 L 280 140 L 355 285 L 430 445 L 590 680 Z"
          fill="url(#mountainFaceGrad)"
          stroke={isActive ? `${accentColor}40` : 'rgba(255, 255, 255, 0.09)'}
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="transition-colors duration-700"
        />

        {/* Main Peak 3D Wireframe Ridge & Slope Facets */}
        <g
          stroke="rgba(255, 255, 255, 0.045)"
          strokeWidth="1"
          strokeLinejoin="round"
        >
          {/* Central Spine Ridge from Summit to Base */}
          <path d="M 280 140 L 255 265 L 295 385 L 245 520 L 270 680" />
          {/* Left-Face Geometric Facets */}
          <path d="M 195 315 L 255 265 L 155 415 L 295 385 L 115 470" />
          <path d="M 115 470 L 245 520 L 65 595" />
          {/* Right-Face Geometric Facets */}
          <path d="M 255 265 L 355 285 L 295 385 L 430 445 L 245 520 L 495 575" />
        </g>

        {/* Winding Ultra-Marathon Summit Trail (Switchbacking up the Main Peak) */}
        <path
          d="M 110 665 C 140 615, 225 605, 210 555 C 195 505, 135 495, 165 445 C 195 395, 285 410, 295 355 C 305 300, 220 285, 240 230 C 255 190, 272 165, 280 140"
          stroke={activeStroke}
          strokeOpacity={trailOpacity}
          strokeWidth="2.2"
          strokeDasharray="6 6"
          strokeLinecap="round"
          className="transition-all duration-700"
        />

        {/* Checkpoint 01: Base Camp */}
        <g transform="translate(165, 445)">
          <circle
            r="4"
            fill="#0e1015"
            stroke={activeStroke}
            strokeOpacity={trailOpacity + 0.15}
            strokeWidth="1.75"
          />
        </g>

        {/* Checkpoint 02: High Ridge Camp */}
        <g transform="translate(295, 355)">
          <circle
            r="4.5"
            fill="#0e1015"
            stroke={activeStroke}
            strokeOpacity={trailOpacity + 0.2}
            strokeWidth="1.75"
          />
          <circle
            r="9"
            stroke={activeStroke}
            strokeOpacity={trailOpacity * 0.55}
            strokeWidth="1"
          />
        </g>

        {/* Checkpoint 03: Summit Peak Beacon (280, 140) */}
        <g transform="translate(280, 140)">
          <circle
            r="15"
            stroke={activeStroke}
            strokeOpacity={isActive ? 0.4 : 0.12}
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <circle
            r="4.5"
            fill={isActive ? accentColor : '#71717a'}
            fillOpacity={isActive ? 0.9 : 0.45}
          />
          {/* Summit Crosshair */}
          <line
            x1="-10"
            y1="0"
            x2="-6"
            y2="0"
            stroke={activeStroke}
            strokeOpacity={trailOpacity}
          />
          <line
            x1="6"
            y1="0"
            x2="10"
            y2="0"
            stroke={activeStroke}
            strokeOpacity={trailOpacity}
          />
          <line
            x1="0"
            y1="-10"
            x2="0"
            y2="-6"
            stroke={activeStroke}
            strokeOpacity={trailOpacity}
          />
        </g>
      </svg>

      {/* 2. TOP-RIGHT: The "40% Rule" Endurance Gauge Arc */}
      <svg
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -top-24 -right-24 h-[520px] w-[520px] transition-opacity duration-700 md:h-[640px] md:w-[640px]"
        style={{
          maskImage:
            'radial-gradient(circle at 65% 35%, black 25%, transparent 82%)',
          WebkitMaskImage:
            'radial-gradient(circle at 65% 35%, black 25%, transparent 82%)',
        }}
      >
        <g transform="translate(340, 260)">
          {/* Outer Subtle Reference Ring */}
          <circle r="250" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />

          {/* Main Endurance Track Ring (Dashed) */}
          <circle
            r="220"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1.5"
            strokeDasharray="2 8"
          />

          {/* Inner Callus Zone Arc (From 40% threshold onward) */}
          <circle
            r="192"
            stroke={activeStroke}
            strokeOpacity={gaugeOpacity}
            strokeWidth="1.5"
            strokeDasharray="360 850"
            strokeDashoffset="-140"
            strokeLinecap="round"
            className="transition-all duration-700"
          />

          {/* Innermost Fine Concentric Dial */}
          <circle r="164" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="1" />

          {/* Radial Tick Marks along the Bottom-Left Quadrant */}
          {Array.from({ length: 21 }).map((_, idx) => {
            const deg = 95 + idx * 4.5;
            const rad = (deg * Math.PI) / 180;
            const isFortyPercentTick = idx === 8;
            const isMajorTick = idx % 5 === 0;

            const innerR = isFortyPercentTick ? 176 : isMajorTick ? 208 : 214;
            const outerR = isFortyPercentTick ? 242 : isMajorTick ? 230 : 224;

            const x1 = Math.cos(rad) * innerR;
            const y1 = Math.sin(rad) * innerR;
            const x2 = Math.cos(rad) * outerR;
            const y2 = Math.sin(rad) * outerR;

            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={
                  isFortyPercentTick
                    ? activeStroke
                    : 'rgba(255, 255, 255, 0.08)'
                }
                strokeOpacity={isFortyPercentTick ? gaugeOpacity + 0.25 : 1}
                strokeWidth={
                  isFortyPercentTick ? '2' : isMajorTick ? '1.5' : '1'
                }
                strokeLinecap="round"
              />
            );
          })}

          {/* The "40% Rule" Threshold Callout Node */}
          <g transform="translate(-162, 186)">
            <circle
              r="4"
              fill={isActive ? accentColor : '#71717a'}
              fillOpacity={isActive ? 0.85 : 0.4}
            />
            <circle
              r="9"
              stroke={activeStroke}
              strokeOpacity={gaugeOpacity}
              strokeWidth="1"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
