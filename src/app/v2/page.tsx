export default function HomeV2() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FAF5EE' }}>
      <section
        className="h-[60vh] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
        style={{ backgroundImage: "url('/BG.jpeg')" }}
      >
        <h2 className="text-8xl text-white" style={{ fontFamily: 'var(--font-parisienne)' }}>
          Bogdana & Hamza
        </h2>
        <p className="text-xl text-white mt-4 tracking-wide">
          June 20th, 2026
        </p>
      </section>

      <nav
        className="flex items-center justify-center gap-24 px-8 py-4"
        style={{ borderBottom: '1px solid #899270' }}
      >
        <a href="#location" className="text-sm tracking-wide hover:opacity-70">Location</a>
        <a href="#timeline" className="text-sm tracking-wide hover:opacity-70">Timeline</a>
        <a href="#rsvp" className="text-sm tracking-wide hover:opacity-70">RSVP</a>
        <a href="#faq" className="text-sm tracking-wide hover:opacity-70">FAQ</a>
      </nav>

      <section className="py-16 px-12">
        <h2 className="flex flex-col">
          <span className="text-5xl" style={{ fontFamily: 'var(--font-pt-serif)' }}>YOU'RE</span>
          <span className="text-7xl" style={{ fontFamily: 'var(--font-parisienne)' }}>Invited</span>
        </h2>
      </section>
    </main>
  );
}
