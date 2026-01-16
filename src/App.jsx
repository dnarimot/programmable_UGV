import { useState } from "react";
import { LoadingScreen } from "./components/LoadingScreen";
import "./index.css";
import "./App.css";
import { Navbar } from "./components/NavBar";
import { MobileMenu } from "./components/MobileMenu";
import { Home } from "./pages/home/Home";
import { Connect } from "./pages/home/connect";
import { LearnMore } from "./pages/home/LearnMore";
import { Contact } from "./pages/home/Contact";
import Test from "./pages/home/Test";
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
            <Route path="/test" element={<Test />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
