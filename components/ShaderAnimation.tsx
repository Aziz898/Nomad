import React from 'react';

export function ShaderAnimation() {
  return (
    <div className="fixed inset-0 -z-10 bg-white">
      {/* Subtle Radial Gradient Glow (Brand Rose color) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#ffe4e6,transparent)]" />
      
      {/* Grid Pattern (Faint Red/Rose lines) */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e11d4810_1px,transparent_1px),linear-gradient(to_bottom,#e11d4810_1px,transparent_1px)] bg-[size:24px_24px]" />
    </div>
  );
}
