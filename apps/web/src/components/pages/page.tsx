interface DefaultPageProps {
  children: React.ReactNode;
}

export function Page({ children }: DefaultPageProps) {
  return <div className="grow h-full flex flex-col px-4">{children}</div>;
}

export function PageTitle({ children }: DefaultPageProps) {
  return <h2 className="text-2xl font-semibold text-center py-4">{children}</h2>;
}
