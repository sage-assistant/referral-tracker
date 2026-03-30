import { ReactNode } from "react";

export function Shell({
  title,
  description,
  action,
  children
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-32 pt-12 sm:px-6 md:ml-20 md:px-12 md:pt-20">
      <header className="mb-16 flex flex-col items-start justify-between gap-8 md:mb-24 md:flex-row md:items-end md:gap-0">
        <div className="max-w-2xl">
          <h1 className="heading-serif mb-4 text-4xl italic tracking-tight text-white sm:text-5xl md:mb-6 md:text-6xl">
            {title}
          </h1>
          <p className="text-base font-light leading-relaxed text-serene-muted md:text-lg">
            {description}
          </p>
        </div>
        {action ? <div className="w-full md:mt-0 md:w-auto">{action}</div> : null}
      </header>
      {children}
    </main>
  );
}
