import React, { useEffect, useState } from 'react';

const Snowfall: React.FC = () => {
  const [flakes, setFlakes] = useState<number[]>([]);

  useEffect(() => {
    // Add a new flake every 500ms
    const interval = setInterval(() => {
      setFlakes(prev => [...prev, Date.now()]);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Clean up old flakes to prevent memory leaks
    if (flakes.length > 50) {
      setFlakes(prev => prev.slice(1));
    }
  }, [flakes]);

  return (
    <>
      {flakes.map((id) => (
        <div
          key={id}
          className="snow-flake pointer-events-none opacity-70"
          style={{
            left: `${Math.random() * 100}vw`,
            fontSize: `${Math.random() * 20 + 10}px`,
            animationDuration: `${Math.random() * 3 + 2}s`
          }}
        >
          ❄
        </div>
      ))}
    </>
  );
};

export default Snowfall;