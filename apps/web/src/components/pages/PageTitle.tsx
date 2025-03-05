interface Props {
  children: React.ReactNode;
}

export default function PageTitle({ children }: Props) {
  return <h2 className="text-2xl font-semibold text-center py-4">{children}</h2>;
}
