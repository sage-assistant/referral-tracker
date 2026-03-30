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
    <main className="mx-auto ml-20 max-w-7xl px-12 pb-32 pt-20">
      <header className="mb-24 flex flex-col items-end justify-between md:flex-row">
        <div className="max-w-2xl">
          <h1 className="heading-serif mb-6 text-6xl italic tracking-tight text-white">{title}</h1>
          <p className="text-lg font-light leading-relaxed text-serene-muted">{description}</p>
        </div>
        {action ? <div className="mt-8 md:mt-0">{action}</div> : null}
      </header>
      {children}
    </main>
  );
}
