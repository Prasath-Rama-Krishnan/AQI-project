import React, { useState } from "react";

export default function CustomTick({ x, y, payload, formatter }) {
  const [hover, setHover] = useState(false);
  const display = formatter ? formatter(payload.value) : payload.value;
  return (
    <g transform={`translate(${x},${y+10})`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ cursor: 'default' }}>
      <text x={0} y={0} textAnchor="middle" fill={hover ? '#ffffff' : 'rgba(255,255,255,0.6)'} fontSize={12}>{display}</text>
    </g>
  );
}
