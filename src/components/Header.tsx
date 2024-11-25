import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-primary-gray-900/85 z-10 border border-primary-gray/50 shadow-lg">
      <div className="h-24 flex items-center space-x-4 px-6">
        <Link href="/">
          <h1 className="text-3xl font-semibold font-sans">Albion Raid Manager</h1>
        </Link>
      </div>
    </header>
  );
}
