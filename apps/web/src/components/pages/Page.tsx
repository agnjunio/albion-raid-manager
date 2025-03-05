interface Props {
  children: React.ReactNode;
}

export default function Page({ children }: Props) {
  return <div className="grow h-full flex flex-col px-4">{children}</div>;
}
