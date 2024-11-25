import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-primary-gray/90 z-10 border-0 border-b-4 border-primary-gray/50 shadow-lg bg-wallpapper bg-blend-multiply bg-no-repeat bg-cover bg-[center_center]">
      <div className="h-24 flex items-center space-x-4 px-6">
        <Link href="/">
          <h1 className="text-3xl font-semibold font-sans">Albion Raid Manager</h1>
        </Link>
      </div>
    </header>
  );
}
