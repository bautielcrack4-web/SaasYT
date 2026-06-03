export default function Footer() {
  return (
    <footer className="bg-white/60 border-t border-white/20 w-full py-16 backdrop-blur-[40px] mt-32">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto gap-8">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-display text-title-md font-black text-primary tracking-tighter">
            CreatorLens AI
          </span>
          <p className="text-caption text-on-surface-variant mt-3 font-medium opacity-60">
            © 2025 CreatorLens AI. Precision for Visionaries.
          </p>
        </div>
        <div className="flex gap-10">
          {["Privacy", "Terms", "API"].map((x) => (
            <a
              key={x}
              className="text-caption text-on-surface-variant font-bold hover:text-primary smooth-transition uppercase tracking-widest"
              href="#"
            >
              {x}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
