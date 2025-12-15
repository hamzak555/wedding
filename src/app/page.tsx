"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import "./envelope.css";

function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const elements = document.querySelectorAll(
      ".scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale, .scroll-decoration"
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

interface Guest {
  id: number;
  name: string;
  dietaryRestrictions: string;
}

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [autoOpenProgress, setAutoOpenProgress] = useState(0);
  const [flowerTransform, setFlowerTransform] = useState({ rotate: 0, y: 0 });
  const weddingDate = new Date("2026-06-20T00:00:00");
  const { days, hours, minutes, seconds } = useCountdown(weddingDate);

  // RSVP form state
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [primaryDietary, setPrimaryDietary] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const supabase = createClient();

  const addGuest = () => {
    setGuests([...guests, { id: Date.now(), name: "", dietaryRestrictions: "" }]);
  };

  const removeGuest = (id: number) => {
    setGuests(guests.filter(guest => guest.id !== id));
  };

  const updateGuest = (id: number, field: keyof Guest, value: string) => {
    setGuests(guests.map(guest =>
      guest.id === id ? { ...guest, [field]: value } : guest
    ));
  };

  const handleRsvpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setRsvpLoading(true);

    try {
      const { error } = await supabase.from("rsvps").insert({
        name: rsvpName,
        email: rsvpEmail,
        primary_dietary: primaryDietary || null,
        guests: guests.map((g) => ({
          name: g.name,
          dietary_restrictions: g.dietaryRestrictions || null,
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

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);

      // Animate fixed flowers based on scroll
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollY / maxScroll;

      // Rotate between -10 and 10 degrees, move up/down slightly
      const rotate = Math.sin(scrollProgress * Math.PI * 4) * 10;
      const y = Math.sin(scrollProgress * Math.PI * 2) * 30;

      setFlowerTransform({ rotate, y });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-open envelope after 15 seconds with progress indicator
  useEffect(() => {
    if (isOpen) return;

    const duration = 15000; // 15 seconds
    const interval = 100; // Update every 100ms
    let elapsed = 0;

    const progressInterval = setInterval(() => {
      elapsed += interval;
      setAutoOpenProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        setIsOpen(true);
        clearInterval(progressInterval);
      }
    }, interval);

    return () => clearInterval(progressInterval);
  }, [isOpen]);

  useScrollAnimation();

  return (
    <>
    <Image
      src="/watercolor-peach-white-peony-bouquet-with-delicate-blooms.png"
      alt="Decorative flowers"
      width={300}
      height={400}
      className="fixed-flowers-left"
      style={{
        transform: `translateY(calc(-50% + ${flowerTransform.y}px)) rotate(${flowerTransform.rotate}deg)`,
      }}
    />
    <section className="cssletter">
      <h1 className="couple-names">Bogdana & Hamza</h1>
      <p className="wedding-date">JUNE 20, 2026</p>
      <div className="countdown">
        <div className="countdown-item">
          <span className="countdown-value">{days}</span>
          <span className="countdown-label">days</span>
        </div>
        <div className="countdown-item">
          <span className="countdown-value">{hours}</span>
          <span className="countdown-label">hours</span>
        </div>
        <div className="countdown-item">
          <span className="countdown-value">{minutes}</span>
          <span className="countdown-label">min</span>
        </div>
        <div className="countdown-item">
          <span className="countdown-value">{seconds}</span>
          <span className="countdown-label">sec</span>
        </div>
      </div>
      <div className={`envelope-container ${isOpen ? "active" : ""}`}>
        <div className={`envelope ${isOpen ? "active" : ""}`}>
          <div className="heart-wrapper">
            <button
              className="heart-button"
              onClick={() => setIsOpen(true)}
              aria-label="Open Envelope"
            >
              <svg viewBox="0 0 32 29" className="heart-svg">
                <defs>
                  <clipPath id="heartClip">
                    <path d="M16 28C16 28 0 18 0 8.5C0 3.8 3.8 0 8.5 0C11.5 0 14 1.5 16 4C18 1.5 20.5 0 23.5 0C28.2 0 32 3.8 32 8.5C32 18 16 28 16 28Z" />
                  </clipPath>
                </defs>
                {/* Base heart (dark red) */}
                <path
                  className="heart-base"
                  d="M16 28C16 28 0 18 0 8.5C0 3.8 3.8 0 8.5 0C11.5 0 14 1.5 16 4C18 1.5 20.5 0 23.5 0C28.2 0 32 3.8 32 8.5C32 18 16 28 16 28Z"
                  fill="#611D1C"
                />
                {/* Fill rectangle that grows from bottom */}
                {!isOpen && (
                  <rect
                    x="0"
                    y={29 - (29 * autoOpenProgress / 100)}
                    width="32"
                    height={29 * autoOpenProgress / 100}
                    fill="#f4a7b0"
                    clipPath="url(#heartClip)"
                  />
                )}
              </svg>
              <span className="heart-text">Open</span>
            </button>
          </div>
          <div className="envelope-flap"></div>
          <div className="envelope-folds">
            <div className="envelope-left"></div>
            <div className="envelope-right"></div>
            <div className="envelope-bottom"></div>
          </div>
          {isOpen && (
            <div className="closeLetter" aria-hidden="true">
              Close
            </div>
          )}
        </div>
        <Image
          src="/watercolor-bouquet-pink-roses-dahlia.png"
          alt="Floral decoration"
          width={400}
          height={400}
          className="floral-overlay"
        />
        <div className={`polaroid-wrapper polaroid-left ${isOpen ? "active" : ""}`}>
          <div className="polaroid">
            <Image
              src="/LEFT.jpg"
              alt="Wedding Polaroid"
              width={200}
              height={250}
              className="polaroid-image"
            />
            <span className="polaroid-date">06 · 20 · 2026</span>
          </div>
        </div>
        <div className={`polaroid-wrapper polaroid-right ${isOpen ? "active" : ""}`}>
          <div className="polaroid">
            <Image
              src="/RIGHT.jpg"
              alt="Wedding Polaroid"
              width={200}
              height={250}
              className="polaroid-image"
            />
            <span className="polaroid-date">&nbsp;</span>
          </div>
        </div>
      </div>
    </section>
    <section className="section-two">
      <div className="postcard-container scroll-animate">
        <Image
          src="/post card new.png"
          alt="Postcard"
          width={600}
          height={400}
          className="postcard"
        />
        <Image
          src="/rose-wax-seal-vector.png"
          alt="Wax seal"
          width={120}
          height={120}
          className="wax-seal"
        />
      </div>
      <h2 className="section-two-title scroll-animate scroll-animate-delay-1">We Can&apos;t Wait to Celebrate With You</h2>
      <p className="section-two-text scroll-animate scroll-animate-delay-2">
        We&apos;re so excited to share our special day with our favorite people! Below you&apos;ll find all the details you need to make the most of our wedding celebration.
      </p>
      <button
        className="rsvp-link-button scroll-animate scroll-animate-delay-3"
        onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })}
      >
        RSVP Now
      </button>
    </section>
    <section className="section-ceremonies">
      <Image
        src="/Elements/Circles.png"
        alt="Decorative circles"
        width={200}
        height={200}
        className="ceremony-decoration scroll-decoration"
      />
      <Image
        src="/Elements/Love.png"
        alt="Decorative love"
        width={150}
        height={150}
        className="ceremony-decoration-2 scroll-decoration"
      />
      <Image
        src="/Elements/Flower.png"
        alt="Decorative flower"
        width={150}
        height={150}
        className="ceremony-decoration-right scroll-decoration"
      />
      <Image
        src="/Elements/Cake.png"
        alt="Decorative cake"
        width={200}
        height={200}
        className="celebration-decoration scroll-decoration"
      />
      <Image
        src="/Elements/Glass.png"
        alt="Decorative glass"
        width={150}
        height={150}
        className="celebration-decoration-2 scroll-decoration"
      />
      <Image
        src="/Elements/Leaf 3.png"
        alt="Decorative leaf"
        width={80}
        height={80}
        className="ceremony-leaf-below-cake scroll-decoration"
      />
      <Image
        src="/Elements/Leaf 1.png"
        alt="Decorative leaf"
        width={80}
        height={80}
        className="ceremony-leaf-below-glass scroll-decoration"
      />
      <div className="ceremony-content-box scroll-animate-scale">
        <div className="ceremony-section">
          <h2 className="section-ceremony-title">Nikkah Ceremony</h2>
          <p className="section-ceremony-text">
            Our ceremony will begin at 4:00 PM at R Garden Boutique located at <a href="https://www.google.com/maps/search/?api=1&query=2120+Rosebank+Road,+Pickering,+ON,+L1X+0A1" target="_blank" rel="noopener noreferrer" className="address-link">2120 Rosebank Road, Pickering, ON, L1X 0A1</a>. We kindly ask guests to arrive by 3:00 PM for cocktail hour before we say &quot;I do.&quot;
          </p>
        </div>
        <div className="ceremony-divider"></div>
        <div className="celebration-section">
          <h2 className="section-celebration-title">The Celebration</h2>
          <p className="section-celebration-text">
            Following the ceremony, join us for cocktail hour in the gardens with drinks and canapés, followed by an evening of dinner, heartfelt speeches, and dancing the night away inside the estate.
          </p>
        </div>
      </div>
    </section>
    <section className="section-timeline">
      <h2 className="section-timeline-title scroll-animate">Timeline of Events</h2>
      <div className="timeline-horizontal scroll-animate scroll-animate-delay-1">
        <div className="timeline-times">
          <span className="timeline-time">3:00 PM</span>
          <span className="timeline-time">4:00 PM</span>
          <span className="timeline-time">5:00 PM</span>
          <span className="timeline-time">6:00 PM</span>
          <span className="timeline-time">8:00 PM</span>
          <span className="timeline-time">10:00 PM</span>
        </div>
        <div className="timeline-line-wrapper">
          <div className="timeline-line"></div>
          <div className="timeline-dots">
            <div className="timeline-dot"></div>
            <div className="timeline-dot"></div>
            <div className="timeline-dot"></div>
            <div className="timeline-dot"></div>
            <div className="timeline-dot"></div>
            <div className="timeline-dot"></div>
          </div>
        </div>
        <div className="timeline-items">
          <div className="timeline-item">
            <span className="timeline-item-time">3:00 PM</span>
            <div className="timeline-icon">
              <Image src="/Icons/Cocktail Hour.svg" alt="Cocktail Hour" width={50} height={50} />
            </div>
            <h3 className="timeline-event">Cocktail Hour</h3>
          </div>
          <div className="timeline-item">
            <span className="timeline-item-time">4:00 PM</span>
            <div className="timeline-icon">
              <Image src="/Icons/Ceremony.svg" alt="Nikkah" width={50} height={50} />
            </div>
            <h3 className="timeline-event">Nikkah</h3>
          </div>
          <div className="timeline-item">
            <span className="timeline-item-time">5:00 PM</span>
            <div className="timeline-icon">
              <Image src="/Icons/Cake Cutting.svg" alt="Cake Cutting" width={50} height={50} />
            </div>
            <h3 className="timeline-event">Cake Cutting</h3>
          </div>
          <div className="timeline-item">
            <span className="timeline-item-time">6:00 PM</span>
            <div className="timeline-icon">
              <Image src="/Icons/Dinner.svg" alt="Dinner" width={50} height={50} />
            </div>
            <h3 className="timeline-event">Dinner</h3>
          </div>
          <div className="timeline-item">
            <span className="timeline-item-time">8:00 PM</span>
            <div className="timeline-icon">
              <Image src="/Icons/Dancing.svg" alt="Party" width={50} height={50} />
            </div>
            <h3 className="timeline-event">Party</h3>
          </div>
          <div className="timeline-item">
            <span className="timeline-item-time">10:00 PM</span>
            <div className="timeline-icon">
              <Image src="/Icons/Send off.svg" alt="Send Off" width={50} height={50} />
            </div>
            <h3 className="timeline-event">Send Off</h3>
          </div>
        </div>
      </div>
      <button
        className="rsvp-link-button timeline-rsvp"
        onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })}
      >
        RSVP Now
      </button>
    </section>
    <section className="section-how-we-met">
      <div className="how-we-met-container">
        <div className="how-we-met-content scroll-animate-left">
          <h2 className="how-we-met-title">Ukraine to Canada</h2>
          <p className="how-we-met-text">
            Shortly after she made Canada her new home, our paths crossed and quickly became inseparable. What began as a simple connection grew into a life filled with adventure, traveling to new countries, building lasting friendships, and discovering a shared faith in Islam that shaped us in profound ways. Together, we faced challenges, celebrated milestones, and learned the true meaning of partnership. Every step of the journey led us here, grateful for the past and excited to begin this next chapter as husband and wife.
          </p>
        </div>
        <div className="how-we-met-polaroid-wrapper scroll-animate-right">
          <div className="how-we-met-polaroid">
            <Image
              src="/how they met photo.png"
              alt="How we met photo"
              width={300}
              height={375}
              className="how-we-met-polaroid-image"
            />
            <span className="how-we-met-polaroid-caption">How we met</span>
          </div>
          <Image
            src="/Flower and tape.png"
            alt="Flower and tape decoration"
            width={100}
            height={100}
            className="polaroid-flower-tape-decoration"
          />
        </div>
      </div>
    </section>
    <section className="section-venue">
      <h2 className="section-venue-title scroll-animate">The Venue</h2>
      <p className="section-venue-text scroll-animate scroll-animate-delay-1">R Garden Boutique located at 2120 Rosebank Road, Pickering, ON, L1X 0A1</p>
      <div className="map-container scroll-animate scroll-animate-delay-2">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2873.8076!2d-79.0631!3d43.8701!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4de9f5d3e3a5d%3A0x1234567890abcdef!2s2120%20Rosebank%20Rd%2C%20Pickering%2C%20ON%20L1X%200A1!5e0!3m2!1sen!2sca!4v1234567890"
          width="100%"
          height="400"
          style={{ border: 0, filter: 'sepia(20%) hue-rotate(50deg) saturate(80%)' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="R Garden Boutique Location"
        ></iframe>
      </div>
      <a
        href="https://www.google.com/maps/dir/?api=1&destination=2120+Rosebank+Road,+Pickering,+ON,+L1X+0A1"
        target="_blank"
        rel="noopener noreferrer"
        className="directions-button"
      >
        Get Directions
      </a>
    </section>
    <section id="rsvp" className="section-rsvp">
      <div className="rsvp-box-wrapper scroll-animate-scale">
        <div className="rsvp-decoration-container rsvp-decoration-desktop">
          <h2 className="rsvp-title-overlay">Rsvp</h2>
          <Image
            src="/vintage-typewriter-with-floral-arrangement.png"
            alt="Vintage typewriter with flowers"
            width={300}
            height={300}
            className="rsvp-decoration"
          />
        </div>
      {rsvpSubmitted ? (
        <div className="rsvp-form rsvp-thank-you">
          <h3>Thank You</h3>
          <p>We received your RSVP and are excited to celebrate together!</p>
        </div>
      ) : (
        <form className="rsvp-form" onSubmit={handleRsvpSubmit}>
          <div className="rsvp-decoration-container rsvp-decoration-mobile">
            <h2 className="rsvp-title-overlay">Rsvp</h2>
            <Image
              src="/vintage-typewriter-with-floral-arrangement.png"
              alt="Vintage typewriter with flowers"
              width={300}
              height={300}
              className="rsvp-decoration"
            />
          </div>
          <p className="rsvp-description">Kindly enter your details below. If you&apos;re responding on behalf of additional guests, use the + Add Guest button to include their names. We ask that all guests attending be listed individually.</p>
          <div className="rsvp-field">
            <label htmlFor="rsvp-name">Primary Guest Name</label>
            <input
              type="text"
              id="rsvp-name"
              value={rsvpName}
              onChange={(e) => setRsvpName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
            <input
              type="text"
              id="primary-dietary"
              value={primaryDietary}
              onChange={(e) => setPrimaryDietary(e.target.value)}
              placeholder="Dietary restrictions (optional)"
            />
          </div>
          <div className="rsvp-field">
            <label htmlFor="rsvp-email">Email Address</label>
            <input
              type="email"
              id="rsvp-email"
              value={rsvpEmail}
              onChange={(e) => setRsvpEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="rsvp-guests-section">
                <div className="rsvp-guests-header">
                  <label>Additional Guests</label>
                  <button type="button" className="rsvp-add-guest" onClick={addGuest}>
                    + Add Guest
                  </button>
                </div>
                {guests.map((guest, index) => (
                  <div key={guest.id} className="rsvp-guest-card">
                    <div className="rsvp-guest-header">
                      <span>Guest {index + 2}</span>
                      <button
                        type="button"
                        className="rsvp-remove-guest"
                        onClick={() => removeGuest(guest.id)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="rsvp-field">
                      <input
                        type="text"
                        value={guest.name}
                        onChange={(e) => updateGuest(guest.id, "name", e.target.value)}
                        placeholder="Guest name"
                        required
                      />
                    </div>
                    <div className="rsvp-field">
                      <input
                        type="text"
                        value={guest.dietaryRestrictions}
                        onChange={(e) => updateGuest(guest.id, "dietaryRestrictions", e.target.value)}
                        placeholder="Dietary restrictions (optional)"
                      />
                    </div>
                  </div>
                ))}
              </div>
          <button type="submit" className="rsvp-submit" disabled={rsvpLoading}>
            {rsvpLoading ? "Submitting..." : "Submit RSVP"}
          </button>
        </form>
      )}
      </div>
    </section>
    <section className="section-faq">
      <h2 className="section-faq-title scroll-animate">Faq</h2>
      <div className="faq-container">
        <div className="faq-item scroll-animate scroll-animate-delay-1">
          <h3 className="faq-question">Can I bring a plus one?</h3>
          <p className="faq-answer">Just you and your +1, please! Be sure to mention your plus one when you RSVP.</p>
        </div>
        <div className="faq-item scroll-animate scroll-animate-delay-2">
          <h3 className="faq-question">Can I bring my child/children?</h3>
          <p className="faq-answer">We love your little ones, but this party is adults-only!</p>
        </div>
        <div className="faq-item scroll-animate scroll-animate-delay-3">
          <h3 className="faq-question">Will there be parking at the venue?</h3>
          <p className="faq-answer">Yes, there are free spaces to park your car. However, parking is limited at the venue so we highly encourage ride sharing!</p>
        </div>
        <div className="faq-item scroll-animate scroll-animate-delay-4">
          <h3 className="faq-question">Can I take photos during the ceremony?</h3>
          <p className="faq-answer">We&apos;d love for you to be fully present with us during the ceremony, so we kindly ask that phones stay tucked away until afterward. Thank you for helping us keep this moment special!</p>
        </div>
        <div className="faq-item scroll-animate scroll-animate-delay-5">
          <h3 className="faq-question">Will alcohol be served?</h3>
          <p className="faq-answer">No alcohol will be served at the venue as we are not licensed to have alcohol on the premises. We&apos;ll have plenty of delicious mocktails, refreshments, and other beverages for you to enjoy!</p>
        </div>
      </div>
      <button
        className="rsvp-link-button faq-rsvp"
        onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })}
      >
        RSVP Now
      </button>
    </section>
    <footer className="footer">
      <Image
        src="/pink-wreaths-water-color-flower-bouquet.png"
        alt="Flower bouquet"
        width={150}
        height={150}
        className="footer-flowers-left"
      />
      <Image
        src="/Car.png"
        alt="Wedding car"
        width={200}
        height={100}
        className="footer-car"
      />
      <h2 className="footer-names scroll-animate">Bogdana & Hamza</h2>
      <p className="footer-date scroll-animate scroll-animate-delay-1">June 20, 2026</p>
      <p className="footer-dua scroll-animate scroll-animate-delay-2" dir="rtl" lang="ar">رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا</p>
      <p className="footer-dua-translation scroll-animate scroll-animate-delay-2">Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us an example for the righteous.</p>
      <a href="/login" className="footer-login-link scroll-animate scroll-animate-delay-3">Admin Login</a>
    </footer>
    {showBackToTop && (
      <button
        className="back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        ↑
      </button>
    )}
    </>
  );
}
