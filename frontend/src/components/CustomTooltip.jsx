import React from 'react';

export default function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div style={{ background: 'rgba(2,6,23,0.95)', color: '#e6f0f6', padding: 8, borderRadius: 6, boxShadow: '0 8px 20px rgba(0,0,0,0.6)', minWidth: 140 }}>
      <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ color: '#cfeefe', fontSize: 13 }}>{p.name || p.dataKey}</div>
          <div style={{ color: '#ffffff', fontWeight: 700 }}>{p.value}</div>
        </div>
      ))}
    </div>
  );
}
