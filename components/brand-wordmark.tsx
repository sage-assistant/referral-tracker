type BrandWordmarkProps = {
  className?: string;
  stacked?: boolean;
};

export function BrandWordmark({ className = "", stacked = false }: BrandWordmarkProps) {
  if (stacked) {
    return (
      <div className={`brand-wordmark brand-wordmark-stacked ${className}`.trim()} aria-label="Silicon Grip">
        <span>SILICON</span>
        <span className="brand-wordmark-divider" aria-hidden="true">
          |
        </span>
        <span className="brand-wordmark-accent">GRIP</span>
      </div>
    );
  }

  return (
    <div className={`brand-wordmark ${className}`.trim()} aria-label="Silicon Grip">
      <span>SILICON</span>
      <span className="brand-wordmark-divider" aria-hidden="true">
        |
      </span>
      <span className="brand-wordmark-accent">GRIP</span>
    </div>
  );
}
