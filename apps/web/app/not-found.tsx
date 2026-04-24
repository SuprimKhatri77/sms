import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f1ec] px-6">
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] opacity-60"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(232,85,42,0.08) 0%, transparent 65%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] opacity-60"
        style={{
          background:
            "radial-gradient(circle at bottom left, rgba(107,158,107,0.08) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-lg text-center">
        {/* Big 404 */}
        <p
          className="mb-2 select-none text-[clamp(7rem,20vw,10rem)] font-extrabold leading-none text-[#2d4a3e]/[0.06]"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          404
        </p>

        {/* Icon */}
        <div className="-mt-8 mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#2d4a3e]/10 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <svg
              className="h-9 w-9 text-[#2d4a3e]/30"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              />
            </svg>
          </div>
        </div>

        <h1
          className="mb-3 text-[clamp(1.6rem,4vw,2.2rem)] font-bold leading-tight text-[#2d4a3e]"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Page Not Found
        </h1>
        <p
          className="mb-8 text-[1rem] leading-[1.7] text-[#2d4a3e]/55"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Double-check the URL or head back home.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2d4a3e] px-6 py-3 text-[0.9rem] font-semibold text-white shadow-[0_4px_16px_rgba(45,74,62,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(45,74,62,0.3)]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12 11.204 3.045c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            Back to Home
          </Link>
          <Link
            href="#inquiry"
            className="inline-flex items-center gap-2 rounded-xl border border-[#2d4a3e]/15 bg-white px-6 py-3 text-[0.9rem] font-medium text-[#2d4a3e] transition-all duration-200 hover:border-[#2d4a3e]/30 hover:bg-[#2d4a3e]/05"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
