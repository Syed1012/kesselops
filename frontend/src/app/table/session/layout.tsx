import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Midnight Lounge | Stuttgart",
  description: "Experience the art of the cocktail.",
};

export default function VenueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30 selection:text-amber-100">
      {/* 
        Intentionally NO Navbar here. 
        The Venue UI is an immersive scroll experience.
        Navigation is handled via floating elements or a burger menu in the page itself.
      */}
      {children}
    </div>
  );
}
