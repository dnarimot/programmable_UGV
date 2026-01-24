import { useState, ChangeEvent, FormEvent } from "react";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export const Contact = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // TODO: integrate with backend or email API
    setFormData({ name: "", email: "", message: "" });
    alert("Thank you for reaching out! We'll get back to you soon.");
  };

  return (
    <section className="min-h-screen bg-black text-gray-100 flex flex-col items-center px-6 py-10 pt-24">
      {/* --- Header --- */}
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-blue-400 bg-clip-text text-transparent text-center">
        Contact the Rovera Team
      </h1>

      <p className="text-gray-400 max-w-2xl text-center mb-12">
        Have questions, collaboration ideas, or technical feedback?
        We&apos;d love to hear from you. Fill out the form below or reach out
        through our listed channels.
      </p>

      {/* --- Contact Form --- */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/60 w-full max-w-2xl p-8 rounded-2xl border border-gray-700 shadow-lg flex flex-col space-y-6"
      >
        <div>
          <label className="block text-sm text-gray-400 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your full name"
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Type your message..."
            rows={5}
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded transition"
        >
          Send Message
        </button>
      </form>

      {/* --- Team Info / Footer --- */}
      <div className="text-center mt-16">
        <p className="text-gray-400 text-sm">
          Email us directly at{" "}
          <a
            href="mailto:roveraproject@gmail.com"
            className="text-indigo-400 hover:underline"
          >
            roveraproject@gmail.com
          </a>
        </p>
        <p className="text-gray-500 text-xs mt-2">
          &copy; {new Date().getFullYear()} Rovera Research Group — All rights reserved.
        </p>
      </div>
    </section>
  );
};
