import { cn } from "@albion-raid-manager/core/helpers";
import { Route, Routes } from "react-router-dom";
import { AuthCallback } from "./auth/callback";
import { Home } from "./home/page";

export default function App() {
  return (
    <div
      className={cn(
        "bg-background text-foreground flex h-screen flex-col items-center font-sans antialiased",
        "font-dm-sans",
      )}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </div>
  );
}
