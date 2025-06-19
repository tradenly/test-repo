
export const FloatingHippos = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute text-4xl animate-bounce opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        >
          🦛
        </div>
      ))}
      {[...Array(8)].map((_, i) => (
        <div
          key={`poop-${i}`}
          className="absolute text-2xl animate-pulse opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        >
          💩
        </div>
      ))}
    </div>
  );
};
