import { supabase } from "../../lib/supabaseClient";

export const Login = () => {
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-gray-900/70 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl p-8">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-blue-400 bg-clip-text text-transparent">
            Rovera
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Sign in to personalize your platform experience
          </p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition shadow"
        >
          {/* Google Logo */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C35.9 2.34 30.47 0 24 0 14.61 0 6.51 5.38 2.56 13.22l7.98 6.19C12.4 13.6 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.5 24.5c0-1.64-.15-3.21-.43-4.73H24v9.46h12.7c-.55 2.97-2.24 5.49-4.78 7.18l7.39 5.74c4.32-3.98 6.79-9.85 6.79-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.54 28.41c-.48-1.44-.76-2.97-.76-4.56s.27-3.12.76-4.56l-7.98-6.19C.92 16.36 0 20.05 0 24c0 3.95.92 7.64 2.56 10.9l7.98-6.49z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.14 15.91-5.81l-7.39-5.74c-2.05 1.38-4.68 2.19-8.52 2.19-6.26 0-11.6-4.1-13.46-9.91l-7.98 6.49C6.51 42.62 14.61 48 24 48z"
            />
          </svg>

          <span>Continue with Google</span>
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          By signing in, you agree to Rovera’s usage policies.
        </p>
      </div>
    </div>
  );
};
