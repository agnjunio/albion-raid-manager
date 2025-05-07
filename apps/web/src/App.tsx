import { Toaster } from "@/components/ui/toaster";
import { Routes } from "react-router-dom";

// Import your pages here
// Example:
// import Home from '@/pages/Home'
// import About from '@/pages/About'

export default function App() {
  return (
    <>
      <Routes>
        {/* Add your routes here */}
        {/* Example:
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        */}
      </Routes>
      <Toaster />
    </>
  );
}
