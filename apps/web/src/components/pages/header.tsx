import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-gray-500/90 z-10 border-0 border-b-4 border-gray/50 shadow-lg bg-[url(/wallpapper.jpeg)] bg-blend-multiply bg-no-repeat bg-cover bg-[center_center]">
      <div className="h-24 flex items-center justify-between space-x-4 px-48">
        <Link href="/">
          <h1 className="text-3xl font-semibold font-sans">Albion Raid Manager</h1>
        </Link>
      </div>
    </header>
  );
}
