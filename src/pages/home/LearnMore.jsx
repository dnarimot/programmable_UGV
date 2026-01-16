export const LearnMore = () => {
  return (
    <section className="min-h-screen bg-black text-gray-100 flex flex-col items-center px-6 py-10 pt-24">
      {/* --- Header --- */}
      <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-purple-500 to-blue-400 bg-clip-text text-transparent text-center">
        Learn More About Rovera
      </h1>

      <div className="max-w-5xl space-y-16">
        {/* --- Who We Are --- */}
        <div>
          <h2 className="text-3xl font-semibold mb-4 text-indigo-400">
            Who We Are
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Rovera is a student-led robotics initiative dedicated to advancing
            **unmanned ground vehicle (UGV)** research and development through
            open-source software and modular hardware systems. Our mission is to
            bridge the gap between **academic experimentation and real-world
            robotic applications**, allowing users to explore wireless
            communication, mobility control, and autonomous navigation from a
            unified platform.
          </p>
          <p className="text-gray-300 leading-relaxed mt-3">
            By combining networked control interfaces, onboard sensors, and
            software-defined radio (SDR) technology, we aim to make complex
            robotics systems **accessible, configurable, and interactive** — all
            from your web browser.
          </p>
        </div>

        {/* --- Our Vision --- */}
        <div>
          <h2 className="text-3xl font-semibold mb-4 text-blue-400">
            Our Vision
          </h2>
          <p className="text-gray-300 leading-relaxed">
            The Rovera platform empowers users to experiment with remote
            mobility, data collection, and signal processing in real time. We
            believe that future robotic systems should be both **intelligent**
            and **intuitive**, enabling anyone to test communication protocols,
            sensor feedback, and AI-driven control systems through an
            interactive web interface.
          </p>
        </div>

        {/* --- How to Use the Interface --- */}
        <div>
          <h2 className="text-3xl font-semibold mb-4 text-pink-400">
            How to Use the Interface
          </h2>

          <ol className="list-decimal list-inside space-y-4 text-gray-300 leading-relaxed">
            <li>
              Navigate to the{" "}
              <span className="text-indigo-400 font-semibold">Connect</span>{" "}
              page to enter your port number and establish a link with your UGV.
            </li>
            <li>
              Once connected, use the{" "}
              <span className="text-green-400 font-semibold">
                Test Grid Area
              </span>{" "}
              to simulate routes by clicking on the grid cells — these points
              will later represent movement commands.
            </li>
            <li>
              Adjust movement speed, steering, or servo controls through the{" "}
              <span className="text-blue-400 font-semibold">
                Control Commands
              </span>{" "}
              sliders.
            </li>
            <li>
              For advanced users, fine-tune radio parameters like frequency,
              gain, and bandwidth in the{" "}
              <span className="text-pink-400 font-semibold">
                SDR Parameters
              </span>{" "}
              panel to optimize communication performance.
            </li>
            <li>
              Real-time telemetry and feedback will be displayed in the interface
              as Rovera continues to expand its system monitoring capabilities.
            </li>
          </ol>
        </div>

        {/* --- Closing Note --- */}
        <div className="text-center mt-16">
          <p className="text-gray-400">
            The Rovera project is constantly evolving — stay tuned for updates
            as we integrate live streaming, path planning, and AI-assisted
            control.
          </p>
        </div>
      </div>
    </section>
  );
};
