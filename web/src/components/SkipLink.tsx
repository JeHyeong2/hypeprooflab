'use client';

export default function SkipLink() {
  return (
    <a
      href="#main"
      className="absolute top-0 left-0 z-[9999] px-4 py-2 bg-purple-600 text-white rounded-br-lg transform -translate-y-full focus:translate-y-0 transition-transform duration-200"
    >
      Skip to main content
    </a>
  );
}