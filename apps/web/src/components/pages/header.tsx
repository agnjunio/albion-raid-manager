import Link from "next/link";
import { ThemeButton } from "../ui/theme";

export function Header() {
  return (
    <header className="w-full dark:bg-gray-600/90 bg-gray-100/50 z-10 border-0 border-b-4 border-gray-500/25 bg-[url(/wallpapper.jpeg)] bg-blend-multiply bg-no-repeat bg-cover bg-[center_center]">
      <div className="h-24 flex items-center justify-between space-x-4 px-48">
        <Link href="/">
          <h1 className="text-3xl font-semibold font-sans text-gray-50 drop-shadow-md">Albion Raid Manager</h1>
        </Link>

        <ThemeButton />
      </div>
    </header>
  );
}
