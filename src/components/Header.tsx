import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-primary-gray-900 h-24 flex items-center justify-between p-4 shadow-lg">
      <Link href="/">
        <h1 className="text-3xl font-semibold font-sans">Albion Raid Manager</h1>
      </Link>
    </header>
  );
}
