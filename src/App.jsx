import { useState } from "react";
import { LoadingScreen } from "./components/LoadingScreen";
import "./index.css";
import "./App.css";
import { Navbar } from "./components/NavBar";
import { MobileMenu } from "./components/MobileMenu";
import { Home } from "./pages/home";
import { Connect } from "./pages/connect";
import { LearnMore } from "./pages/learnmore";
import { Contact } from "./pages/Contact";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      {!isLoaded && <LoadingScreen onComplete={() => setIsLoaded(true)} />}{" "}
      <div
        className={`min-h-screen transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } bg-black text-gray-100`}
      >
        <Router>
          <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />}/>
            <Route path="/connect" element={<Connect />} />
            <Route path="/learnmore" element={<LearnMore />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
