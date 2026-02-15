'use client';

export default function MatrixBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
      {/* Character background */}
      <div 
        className="absolute inset-0 opacity-[0.03] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/matrixsnek.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(transparent 50%, rgba(0, 255, 135, 0.03) 50%),
            linear-gradient(90deg, transparent 50%, rgba(0, 229, 255, 0.03) 50%)
          `,
          backgroundSize: '100% 4px, 4px 100%',
        }}
      />
    </div>
  );
}
