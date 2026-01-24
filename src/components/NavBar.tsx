import { useEffect, Dispatch, SetStateAction, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export const Navbar = ({ menuOpen, setMenuOpen }: NavbarProps) => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    // Initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [menuOpen]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 w-full z-40 bg-[rgba(10,10,10,0.8)] backdrop-blur-lg border-b border-white/10 shadow-lg">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <a href="#home" className="font-sans text-xl font-bold text-white">
            rovera<span className="text-indigo-500">.uci</span>
          </a>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#home">Home</a>
            <a href="#connect">Connect</a>
            <a href="#learnmore">Learn More</a>
            <a href="#test">Test</a>
            <a href="#contact">Contact</a>

            {user ? (
              <button
                onClick={logout}
                className="border border-red-500 text-red-400 px-3 py-1 rounded hover:bg-red-500/10 transition"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="border border-indigo-500 text-indigo-400 px-3 py-1 rounded hover:bg-indigo-500/10 transition"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div
            className="w-7 h-5 relative cursor-pointer z-40 md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            &#9776;
          </div>
        </div>
      </div>
    </nav>
  );
};
