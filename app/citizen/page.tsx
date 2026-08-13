import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function CitizenHome() {
  return (
    <div className="relative min-h-screen flex flex-col m-0 p-0 overflow-x-hidden">
      {/* Full-screen background image */}
      <div
        className="fixed inset-0 -z-10 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat"
      />
      {/* Dark overlay for text readability */}
      <div className="fixed inset-0 -z-10 bg-black/55" />

      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center text-white px-4 pt-16">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide leading-tight drop-shadow-lg">
            Federal Democratic Republic of Ethiopia
          </h1>
          <p className="text-lg md:text-xl text-white-200 tracking-widest uppercase drop-shadow">
            Digital Rental Agreement System
          </p>
          <div className="w-28 h-1 mx-auto rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500" />
          <p className="text-white/80 text-base leading-relaxed">
            Welcome to the official citizen portal. Register to submit and manage
            your rental agreements, or log in to your existing account.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <Link
              href="/citizen/register"
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              Register Now
            </Link>
            <Link
              href="/citizen/login"
              className="px-8 py-3 border border-white/60 hover:bg-white/10 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              Log In
            </Link>
          </div>
        </div>
      </main>

    </div>
  );
}
