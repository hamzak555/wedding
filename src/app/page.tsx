"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Playfair_Display, Great_Vibes } from 'next/font/google';
import { createClient } from '@/lib/supabase/client';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
});

interface Guest {
  id: number;
  name: string;
}

export default function Home() {
  // RSVP form state
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const supabase = createClient();

  // Show/hide back to top button based on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addGuest = () => {
    setGuests([...guests, { id: Date.now(), name: "" }]);
  };

  const removeGuest = (id: number) => {
    setGuests(guests.filter(guest => guest.id !== id));
  };

  const updateGuest = (id: number, value: string) => {
    setGuests(guests.map(guest =>
      guest.id === id ? { ...guest, name: value } : guest
    ));
  };

  const handleRsvpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setRsvpLoading(true);

    try {
      const { error } = await supabase.from("rsvps").insert({
        name: rsvpName,
        email: rsvpEmail,
        guests: guests.map((g) => ({
          name: g.name,
        })),
      });

      if (error) throw error;
      setRsvpSubmitted(true);
    } catch (err) {
      console.error("Error submitting RSVP:", err);
      alert("Failed to submit RSVP. Please try again.");
    } finally {
      setRsvpLoading(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#7d1b1b' }}>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 md:px-24 py-4 md:py-8">
        {/* Cream inner frame */}
        <div
          className="relative w-full max-w-[95vw] md:max-w-[85vw] mx-auto flex flex-col"
          style={{
            backgroundColor: '#e8e4dc',
            minHeight: 'calc(100vh - 2rem)',
          }}
        >
          {/* Decorative corners */}
          <img src="/Hero Corner.svg" alt="" className="absolute top-2 left-2 md:top-4 md:left-4 h-12 md:h-24" />
          <img src="/Hero Corner.svg" alt="" className="absolute top-2 right-2 md:top-4 md:right-4 h-12 md:h-24" style={{ transform: 'rotate(90deg)' }} />
          <img src="/Hero Corner.svg" alt="" className="absolute bottom-2 left-2 md:bottom-4 md:left-4 h-12 md:h-24" style={{ transform: 'rotate(-90deg)' }} />
          <img src="/Hero Corner.svg" alt="" className="absolute bottom-2 right-2 md:bottom-4 md:right-4 h-12 md:h-24" style={{ transform: 'rotate(180deg)' }} />


          {/* Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-16 pt-8 pb-4">
            <a href="#rsvp" className={`text-xs tracking-[0.2em] hover:opacity-70 ${playfair.className}`} style={{ color: '#7d1b1b' }}>RSVP</a>
            <a href="#timeline" className={`text-xs tracking-[0.2em] hover:opacity-70 ${playfair.className}`} style={{ color: '#7d1b1b' }}>TIMELINE</a>
            <a href="#ceremony" className={`text-xs tracking-[0.2em] hover:opacity-70 ${playfair.className}`} style={{ color: '#7d1b1b' }}>CEREMONY</a>
            <a href="#faq" className={`text-xs tracking-[0.2em] hover:opacity-70 ${playfair.className}`} style={{ color: '#7d1b1b' }}>FAQ</a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=2120+Rosebank+Road,+Pickering,+ON,+L1X+0A1" target="_blank" rel="noopener noreferrer" className={`text-xs tracking-[0.2em] hover:opacity-70 ${playfair.className}`} style={{ color: '#7d1b1b' }}>GET DIRECTIONS</a>
          </nav>

          {/* Main content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-8">
            <div className="relative">
              <h1 className={`text-5xl sm:text-6xl md:text-8xl lg:text-9xl tracking-wide ${playfair.className}`} style={{ color: '#7d1b1b' }}>
                BOGDANA
              </h1>
              <span
                className="absolute left-1/2 -translate-x-1/2 text-5xl sm:text-6xl md:text-8xl lg:text-9xl"
                style={{
                  fontFamily: 'var(--font-diploma-script)',
                  color: '#7d1b1b',
                  top: '68%',
                  textShadow: '-2px -2px 0 #EAE4DB, 2px -2px 0 #EAE4DB, -2px 2px 0 #EAE4DB, 2px 2px 0 #EAE4DB, 0 -2px 0 #EAE4DB, 0 2px 0 #EAE4DB, -2px 0 0 #EAE4DB, 2px 0 0 #EAE4DB',
                }}
              >
                and
              </span>
            </div>
            <h1 className={`text-5xl sm:text-6xl md:text-8xl lg:text-9xl tracking-wide -mt-2 ${playfair.className}`} style={{ color: '#7d1b1b' }}>
              HAMZA
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mt-6 md:mt-8" style={{ fontFamily: 'var(--font-diploma-script)', color: '#7d1b1b' }}>
              are getting married
            </p>
          </div>

          {/* Date and Address at bottom */}
          <div className="pb-6 md:pb-10 text-center">
            <p className={`text-sm md:text-lg tracking-[0.3em] ${playfair.className}`} style={{ color: '#7d1b1b', fontVariantNumeric: 'lining-nums' }}>
              20<sup>TH</sup> JUNE 2026 <span className="mx-2 md:mx-4">|</span> 2120 ROSEBANK ROAD, PICKERING
            </p>
          </div>
        </div>
      </section>

      {/* You Are Invited Section */}
      <section className="flex items-center justify-center px-4 md:px-24 py-8">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-48 px-6 md:px-12 py-16 md:py-24" style={{ backgroundColor: '#7d1b1b' }}>
        <div className="max-w-xl flex-shrink-0">
          {/* Title */}
          <div className="relative mb-8">
            <h2 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide ${playfair.className}`} style={{ color: '#e8e4dc' }}>
              YOU ARE
            </h2>
            <span
              className="absolute text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
              style={{
                fontFamily: 'var(--font-diploma-script)',
                color: '#e8e4dc',
                left: '1rem',
                top: '85%',
                textShadow: '-2px -2px 0 #7d1b1b, 2px -2px 0 #7d1b1b, -2px 2px 0 #7d1b1b, 2px 2px 0 #7d1b1b',
              }}
            >
              Invited
            </span>
          </div>

          {/* Content */}
          <div className="mt-12 md:mt-16" style={{ color: '#e8e4dc' }}>
            <p className={`text-base md:text-lg leading-relaxed mb-8 max-w-xl ${playfair.className}`} style={{ textAlign: 'justify' }}>
              We&apos;re so excited to share this special day with you! As we begin our journey together, we&apos;d love for you to join us in celebrating our big day. Here, you&apos;ll find all the details you need — our love story, event schedule, venue information, RSVP, and more. Your presence means the world to us, and we can&apos;t wait to create unforgettable memories together. Let&apos;s celebrate love, laughter, and happily ever after!
            </p>
            <p className={`text-base mt-8 ${playfair.className}`}>
              With Love,
            </p>
            <p className="text-2xl md:text-3xl" style={{ fontFamily: 'var(--font-diploma-script)' }}>
              Bogdana & Hamza
            </p>
          </div>
        </div>

        {/* Overlapping images on the right - hidden on mobile */}
        <div className="hidden md:block relative group cursor-pointer">
          <img
            src="/LEFT.jpg"
            alt=""
            className="w-72 h-auto object-cover absolute shadow-lg transition-all duration-500 ease-in-out group-hover:z-10 group-hover:translate-x-12 group-hover:translate-y-8"
            style={{ transform: 'rotate(-8deg)', top: '-20px', left: '-40px' }}
          />
          <img
            src="/RIGHT.jpg"
            alt=""
            className="w-72 h-auto object-cover relative shadow-lg transition-all duration-500 ease-in-out group-hover:-translate-x-12 group-hover:-translate-y-8"
            style={{ transform: 'rotate(5deg)' }}
          />
        </div>
        </div>
      </section>


      {/* RSVP Section */}
      <section id="rsvp" className="flex items-center justify-center px-4 md:px-24 py-8">
        <div className="relative w-full max-w-[95vw] md:max-w-[85vw] mx-auto flex items-center justify-center" style={{ backgroundColor: '#e8e4dc' }}>
          <img src="/RSVP Top Right Corner.png" alt="" className="absolute top-6 right-6 md:top-10 md:right-10 h-10 md:h-16" />
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-center md:items-center justify-between gap-8 md:gap-16 px-6 md:px-12 py-28 md:py-52">
        <div className="max-w-md flex-shrink-0">
          {/* Title */}
          <div className="relative mb-8">
            <h2 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide ${playfair.className}`} style={{ color: '#7d1b1b' }}>
              KINDLY
            </h2>
            <span
              className="absolute text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
              style={{
                fontFamily: 'var(--font-diploma-script)',
                color: '#7d1b1b',
                left: '1rem',
                top: '85%',
                textShadow: '-2px -2px 0 #e8e4dc, 2px -2px 0 #e8e4dc, -2px 2px 0 #e8e4dc, 2px 2px 0 #e8e4dc',
              }}
            >
              Respond
            </span>
          </div>

          {/* Content */}
          <div className="mt-12 md:mt-16" style={{ color: '#7d1b1b' }}>
            <p className={`text-base md:text-lg leading-relaxed max-w-md ${playfair.className}`} style={{ textAlign: 'justify', fontVariantNumeric: 'lining-nums' }}>
              We can&apos;t wait to celebrate with you! Please let us know if you&apos;ll be able to join us by filling out the RSVP form. We kindly ask that you respond by May 1st, 2026 so we can finalize all the details for our special day.
            </p>
          </div>
        </div>

        {/* RSVP Form */}
        <div className="w-full max-w-sm flex-shrink-0">
          {rsvpSubmitted ? (
            <div className="text-center" style={{ color: '#7d1b1b' }}>
              <h3 className={`text-4xl mb-4 ${greatVibes.className}`}>Thank You!</h3>
              <p className={`text-base ${playfair.className}`}>We received your RSVP and are excited to celebrate together!</p>
            </div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className={`text-xs tracking-[0.15em] ${playfair.className}`} style={{ color: '#7d1b1b' }}>
                  YOUR NAME
                </label>
                <input
                  type="text"
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className={`w-full px-4 py-3 text-sm placeholder:opacity-40 ${playfair.className}`}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #7d1b1b',
                    color: '#7d1b1b',
                    outline: 'none'
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className={`text-xs tracking-[0.15em] ${playfair.className}`} style={{ color: '#7d1b1b' }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={rsvpEmail}
                  onChange={(e) => setRsvpEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className={`w-full px-4 py-3 text-sm placeholder:opacity-40 ${playfair.className}`}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #7d1b1b',
                    color: '#7d1b1b',
                    outline: 'none'
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className={`text-xs tracking-[0.15em] ${playfair.className}`} style={{ color: '#7d1b1b' }}>
                    ADDITIONAL GUESTS
                  </label>
                  <button
                    type="button"
                    onClick={addGuest}
                    className={`text-xs tracking-[0.1em] hover:opacity-70 px-3 py-1 ${playfair.className}`}
                    style={{ color: '#7d1b1b', border: '1px solid #7d1b1b' }}
                  >
                    + Add Guest
                  </button>
                </div>
                {guests.map((guest, index) => (
                  <div key={guest.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={guest.name}
                      onChange={(e) => updateGuest(guest.id, e.target.value)}
                      placeholder={`Guest ${index + 2} name`}
                      required
                      className={`w-full px-4 py-3 text-sm placeholder:opacity-40 ${playfair.className}`}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #7d1b1b',
                        color: '#7d1b1b',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeGuest(guest.id)}
                      className="text-xl hover:opacity-70"
                      style={{ color: '#7d1b1b' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="submit"
                disabled={rsvpLoading}
                className={`w-full px-8 py-3 text-sm tracking-[0.2em] transition-opacity hover:opacity-80 mt-4 ${playfair.className}`}
                style={{
                  backgroundColor: '#7d1b1b',
                  color: '#e8e4dc',
                  border: 'none'
                }}
              >
                {rsvpLoading ? "SUBMITTING..." : "SUBMIT RSVP"}
              </button>
            </form>
          )}
        </div>
        </div>
          {/* Border pattern at bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <img
                key={i}
                src="/Border pattern 1.svg"
                alt=""
                className="h-6 md:h-8 flex-shrink-0"
                style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(32%) saturate(2476%) hue-rotate(337deg) brightness(91%) contrast(93%)' }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="flex items-center justify-center px-4 md:px-24 py-8">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center px-6 md:px-12 py-16 md:py-24" style={{ backgroundColor: '#7d1b1b' }}>
          {/* Title */}
          <div className="relative mb-12 md:mb-16">
            <div className="flex items-center justify-center gap-3 md:gap-4">
              <img
                src="/Timeline Icon.svg"
                alt=""
                className="h-6 md:h-8 lg:h-10 mt-2"
                style={{ filter: 'brightness(0) saturate(100%) invert(93%) sepia(7%) saturate(337%) hue-rotate(336deg) brightness(103%) contrast(87%)', transform: 'rotate(-90deg)' }}
              />
              <div className="relative">
                <h2 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide ${playfair.className}`} style={{ color: '#e8e4dc' }}>
                  TIMELINE
                </h2>
                <span
                  className="absolute text-5xl sm:text-6xl md:text-7xl lg:text-8xl left-1/2 -translate-x-1/2"
                  style={{
                    fontFamily: 'var(--font-diploma-script)',
                    color: '#e8e4dc',
                    top: '85%',
                    textShadow: '-2px -2px 0 #7d1b1b, 2px -2px 0 #7d1b1b, -2px 2px 0 #7d1b1b, 2px 2px 0 #7d1b1b',
                    whiteSpace: 'nowrap',
                  }}
                >
                  of Events
                </span>
              </div>
              <img
                src="/Timeline Icon.svg"
                alt=""
                className="h-6 md:h-8 lg:h-10 mt-2"
                style={{ filter: 'brightness(0) saturate(100%) invert(93%) sepia(7%) saturate(337%) hue-rotate(336deg) brightness(103%) contrast(87%)', transform: 'rotate(90deg)' }}
              />
            </div>
          </div>

          {/* Horizontal Timeline */}
          <div className="w-full overflow-x-auto pb-4 mt-8 md:mt-12 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex justify-between items-start min-w-[800px] px-8">
              {[
                { time: '3:00 PM', event: 'Cocktail Hour' },
                { time: '4:00 PM', event: 'Nikkah' },
                { time: '5:00 PM', event: 'Cake Cutting' },
                { time: '6:00 PM', event: 'Dinner' },
                { time: '8:00 PM', event: 'Party' },
                { time: '10:00 PM', event: 'Send Off' },
              ].map((item, index, arr) => (
                <div key={index} className="flex flex-col items-center flex-1 relative">
                  {/* Time */}
                  <span className={`text-xs md:text-sm tracking-wide mb-4 ${playfair.className}`} style={{ color: '#e8e4dc', fontVariantNumeric: 'lining-nums' }}>
                    {item.time}
                  </span>

                  {/* Dot with connecting line */}
                  <div className="relative flex items-center justify-center w-full">
                    {/* Line segment */}
                    {index < arr.length - 1 && (
                      <div className="absolute left-1/2 w-full h-[2px]" style={{ backgroundColor: '#e8e4dc' }} />
                    )}
                    {/* Dot */}
                    <div className="w-3 h-3 rounded-full relative z-10" style={{ backgroundColor: '#e8e4dc' }} />
                  </div>

                  {/* Event name */}
                  <span className="text-lg md:text-xl text-center mt-4" style={{ fontFamily: 'var(--font-diploma-script)', color: '#e8e4dc' }}>
                    {item.event}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ceremony Section */}
      <section id="ceremony" className="flex items-center justify-center px-4 md:px-24 py-8">
        <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center px-6 md:px-12 py-16 md:py-24" style={{ backgroundColor: '#e8e4dc' }}>
          {/* Border pattern at bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <img
                key={i}
                src="/Border pattern 1.svg"
                alt=""
                className="h-6 md:h-8 flex-shrink-0"
                style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(32%) saturate(2476%) hue-rotate(337deg) brightness(91%) contrast(93%)' }}
              />
            ))}
          </div>
          <div className="max-w-4xl w-full">
            {/* Nikkah Ceremony */}
            <div className="text-center mb-16">
              <div className="relative inline-block mb-6">
                <h3 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-wide ${playfair.className}`} style={{ color: '#7d1b1b' }}>
                  NIKKAH
                </h3>
                <span
                  className="absolute text-3xl sm:text-4xl md:text-5xl lg:text-6xl left-1/2 -translate-x-1/2"
                  style={{
                    fontFamily: 'var(--font-diploma-script)',
                    color: '#7d1b1b',
                    top: '85%',
                    textShadow: '-2px -2px 0 #e8e4dc, 2px -2px 0 #e8e4dc, -2px 2px 0 #e8e4dc, 2px 2px 0 #e8e4dc',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Ceremony
                </span>
              </div>
              <p className={`text-base leading-relaxed max-w-2xl mx-auto mt-10 ${playfair.className}`} style={{ color: '#7d1b1b', fontVariantNumeric: 'lining-nums' }}>
                Our ceremony will begin at 4:00 PM at R Garden Boutique located at{' '}
                <a
                  href="https://www.google.com/maps/search/?api=1&query=2120+Rosebank+Road,+Pickering,+ON,+L1X+0A1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-70"
                >
                  2120 Rosebank Road, Pickering, ON, L1X 0A1
                </a>. We kindly ask guests to arrive by 3:00 PM for cocktail hour.
              </p>
            </div>

            {/* The Celebration */}
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <h3 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-wide ${playfair.className}`} style={{ color: '#7d1b1b' }}>
                  THE
                </h3>
                <span
                  className="absolute text-3xl sm:text-4xl md:text-5xl lg:text-6xl left-1/2 -translate-x-1/2"
                  style={{
                    fontFamily: 'var(--font-diploma-script)',
                    color: '#7d1b1b',
                    top: '85%',
                    textShadow: '-2px -2px 0 #e8e4dc, 2px -2px 0 #e8e4dc, -2px 2px 0 #e8e4dc, 2px 2px 0 #e8e4dc',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Celebration
                </span>
              </div>
              <p className={`text-base leading-relaxed max-w-2xl mx-auto mt-10 ${playfair.className}`} style={{ color: '#7d1b1b' }}>
                After the ceremony, we invite you to celebrate with cake cutting, dinner, and an evening together, followed by a send-off.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="flex items-center justify-center px-4 md:px-24 py-8">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center px-6 md:px-12 py-16 md:py-24" style={{ backgroundColor: '#7d1b1b' }}>
          {/* Title */}
          <div className="relative mb-12 md:mb-16">
            <div className="flex items-center justify-center gap-3 md:gap-4">
              <div className="relative">
                <h2 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide ${playfair.className}`} style={{ color: '#e8e4dc' }}>
                  FREQUENTLY
                </h2>
                <span
                  className="absolute text-5xl sm:text-6xl md:text-7xl lg:text-8xl left-1/2 -translate-x-1/2"
                  style={{
                    fontFamily: 'var(--font-diploma-script)',
                    color: '#e8e4dc',
                    top: '85%',
                    textShadow: '-2px -2px 0 #7d1b1b, 2px -2px 0 #7d1b1b, -2px 2px 0 #7d1b1b, 2px 2px 0 #7d1b1b',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Asked Questions
                </span>
              </div>
            </div>
          </div>

          {/* FAQ Items */}
          <div className="w-full max-w-3xl flex flex-col gap-10 md:gap-12 mt-8">
            <div>
              <h3 className={`text-lg md:text-xl mb-3 ${playfair.className}`} style={{ color: '#e8e4dc' }}>
                Can I bring my child/children?
              </h3>
              <p className={`text-sm md:text-base leading-relaxed ${playfair.className}`} style={{ color: '#e8e4dc', opacity: 0.85 }}>
                The venue is an open space without a dedicated children&apos;s area, so we don&apos;t encourage it, but you&apos;re welcome to bring them if needed. Just be sure to mention them when you RSVP!
              </p>
            </div>
            <div>
              <h3 className={`text-lg md:text-xl mb-3 ${playfair.className}`} style={{ color: '#e8e4dc' }}>
                Will there be parking at the venue?
              </h3>
              <p className={`text-sm md:text-base leading-relaxed ${playfair.className}`} style={{ color: '#e8e4dc', opacity: 0.85 }}>
                Yes, there is free parking at the venue. However, there are only 30 spots available, so carpooling is highly encouraged!
              </p>
            </div>
            <div>
              <h3 className={`text-lg md:text-xl mb-3 ${playfair.className}`} style={{ color: '#e8e4dc' }}>
                Will alcohol be served?
              </h3>
              <p className={`text-sm md:text-base leading-relaxed ${playfair.className}`} style={{ color: '#e8e4dc', opacity: 0.85 }}>
                No alcohol will be served at the venue as we are not licensed to have alcohol on the premises. We&apos;ll have plenty of delicious mocktails, refreshments, and other beverages for you to enjoy!
              </p>
            </div>
            <div>
              <h3 className={`text-lg md:text-xl mb-3 ${playfair.className}`} style={{ color: '#e8e4dc' }}>
                What is the dress code?
              </h3>
              <p className={`text-sm md:text-base leading-relaxed ${playfair.className}`} style={{ color: '#e8e4dc', opacity: 0.85 }}>
                Business casual or formal. Feel free to wear any color you like — you&apos;ll be included in photos, so dress to impress!
              </p>
            </div>
            <div>
              <h3 className={`text-lg md:text-xl mb-3 ${playfair.className}`} style={{ color: '#e8e4dc' }}>
                What if I&apos;m late?
              </h3>
              <p className={`text-sm md:text-base leading-relaxed ${playfair.className}`} style={{ color: '#e8e4dc', opacity: 0.85 }}>
                Don&apos;t be late..
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-center px-4 md:px-24 py-8">
        <div
          className="relative w-full max-w-[95vw] md:max-w-[85vw] mx-auto flex flex-col px-6 md:px-12 py-12 md:py-16"
          style={{ backgroundColor: '#e8e4dc' }}
        >
          {/* Decorative corners */}
          <img src="/Border top left.png" alt="" className="absolute top-2 left-2 md:top-4 md:left-4 h-8 md:h-12" />
          <img src="/border top right.png" alt="" className="absolute top-2 right-2 md:top-4 md:right-4 h-8 md:h-12" />
          <img src="/border bottom left.png" alt="" className="absolute bottom-2 left-2 md:bottom-4 md:left-4 h-8 md:h-12" />
          <img src="/border bottom right.png" alt="" className="absolute bottom-2 right-2 md:bottom-4 md:right-4 h-8 md:h-12" />

          {/* Content */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full px-4 md:px-8">
            {/* Left - Names */}
            <div className="flex flex-col items-start">
              <div className="relative">
                <h2 className={`text-3xl sm:text-4xl md:text-5xl tracking-wide ${playfair.className}`} style={{ color: '#7d1b1b' }}>
                  BOGDANA
                </h2>
                <span
                  className="absolute left-1/2 -translate-x-1/2 text-3xl sm:text-4xl md:text-5xl"
                  style={{
                    fontFamily: 'var(--font-diploma-script)',
                    color: '#7d1b1b',
                    top: '68%',
                    textShadow: '-2px -2px 0 #e8e4dc, 2px -2px 0 #e8e4dc, -2px 2px 0 #e8e4dc, 2px 2px 0 #e8e4dc',
                  }}
                >
                  and
                </span>
              </div>
              <h2 className={`text-3xl sm:text-4xl md:text-5xl tracking-wide -mt-1 ${playfair.className}`} style={{ color: '#7d1b1b' }}>
                HAMZA
              </h2>
              <p className={`text-xs md:text-sm tracking-[0.3em] mt-4 ${playfair.className}`} style={{ color: '#7d1b1b', fontVariantNumeric: 'lining-nums' }}>
                20<sup>TH</sup> JUNE 2026
              </p>
            </div>

            {/* Right - Links, RSVP, Address */}
            <div className="flex flex-col items-start md:items-end mt-8 md:mt-0 gap-4">
              {/* Links and RSVP Button */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <a href="#rsvp" className={`text-xs tracking-[0.15em] hover:opacity-70 ${playfair.className}`} style={{ color: '#7d1b1b' }}>RSVP</a>
                <a href="#timeline" className={`text-xs tracking-[0.15em] hover:opacity-70 ${playfair.className}`} style={{ color: '#7d1b1b' }}>TIMELINE</a>
                <a href="#ceremony" className={`text-xs tracking-[0.15em] hover:opacity-70 ${playfair.className}`} style={{ color: '#7d1b1b' }}>CEREMONY</a>
                <a href="#faq" className={`text-xs tracking-[0.15em] hover:opacity-70 ${playfair.className}`} style={{ color: '#7d1b1b' }}>FAQ</a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=2120+Rosebank+Road,+Pickering,+ON,+L1X+0A1" target="_blank" rel="noopener noreferrer" className={`text-xs tracking-[0.15em] hover:opacity-70 ${playfair.className}`} style={{ color: '#7d1b1b' }}>GET DIRECTIONS</a>
                <a
                  href="#rsvp"
                  className={`px-6 py-2 text-xs tracking-[0.2em] hover:opacity-80 ${playfair.className}`}
                  style={{ backgroundColor: '#7d1b1b', color: '#e8e4dc' }}
                >
                  RSVP NOW
                </a>
              </div>

              {/* Address */}
              <a
                href="https://www.google.com/maps/search/?api=1&query=2120+Rosebank+Road,+Pickering,+ON,+L1X+0A1"
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs tracking-[0.1em] hover:opacity-70 ${playfair.className}`}
                style={{ color: '#7d1b1b', fontVariantNumeric: 'lining-nums' }}
              >
                2120 Rosebank Road, Pickering, ON
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity z-50"
          style={{ backgroundColor: 'transparent', border: '2px solid #e8e4dc' }}
          aria-label="Back to top"
        >
          <img
            src="/back to top.svg"
            alt=""
            className="w-6 h-6 md:w-7 md:h-7"
            style={{ filter: 'brightness(0) saturate(100%) invert(93%) sepia(7%) saturate(337%) hue-rotate(336deg) brightness(103%) contrast(87%)' }}
          />
        </button>
      )}

    </main>
  );
}
