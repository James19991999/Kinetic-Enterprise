import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a146b 0%, #312e81 100%)',
          color: '#ffffff',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700 }}>WorkPulse</div>
        <div style={{ fontSize: 32, marginTop: 16, color: '#c3c0ff' }}>Hybrid Work Analytics</div>
      </div>
    ),
    { ...size }
  );
}
