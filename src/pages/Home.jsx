import { RevealOnScroll } from "../components/RevealOnScroll";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();

  const handleConnect = () => {
    navigate("/connect");
  };

  const handleLearnMore = () => {
    navigate("/learnmore");
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative"
    >
      <RevealOnScroll>
        <div className="text-center z-10 px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-blue-400 bg-clip-text text-transparent leading-right">
            Rovera
          </h1>

          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
            Take command of your UGV from anywhere. Rovera provides a seamless
            web interface to control movement, monitor system telemetry, and
            configure the onboard software-defined radio in real-time-unifying
            mobility and dynamic wireless experimentation on a single platform.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleConnect}
              className="bg-indigo-500 text-white py-3 px-6 rounded font-medium transition relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(59, 130, 246, 0.4)]"
            >
              Connect to a Vehicle
            </button>

            <button
              onClick={handleLearnMore}
              className="border border-indigo-500/50 text-indigo-500 py-3 px-6 rounded font-medium transition-all duration-200 
             hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(59, 130, 246, 0.2)] hover:bg-blue-500/10"
            >
              Learn More
            </button>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
};
