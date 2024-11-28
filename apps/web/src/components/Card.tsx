export default function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-lg bg-primary-gray-800/25">
      {title && <h1 className="text-lg font-medium mb-4">{title}</h1>}
      {children}
    </div>
  );
}
