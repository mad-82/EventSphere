import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom"; // ✅ Link import add kiya
import eventService from "../../services/eventService"; 
import "./Home.css";


/* =========================================================
   DATA
   ========================================================= */

const CLIENT_LOGOS = [
  { name: "Aga Khan University Hospital", src: "https://marcem.com.pk/wp-content/uploads/2026/07/The-Agha-Khan-University-Hospital-Logo.webp" },
  { name: "NLC", src: "https://marcem.com.pk/wp-content/uploads/2026/07/NLC-Logo.webp" },
  { name: "Karachi Port Trust", src: "https://marcem.com.pk/wp-content/uploads/2026/08/Karachi-Port-Trust-Logo-Marcem.webp" },
  { name: "High-Q Pharma", src: "https://marcem.com.pk/wp-content/uploads/2026/07/High-Q-Pharma-Logo.webp" },
  { name: "DHA", src: "https://marcem.com.pk/wp-content/uploads/2026/08/DHA-Defence-Housing-Authority-Logo.webp" },
  { name: "Utopia", src: "https://marcem.com.pk/wp-content/uploads/2026/08/Utopia-Logo.webp" },
  { name: "Habib Bank Limited", src: "https://marcem.com.pk/wp-content/uploads/2026/07/Habib-Bank-Limited-Logo.webp" },
  { name: "National Bank of Pakistan", src: "https://marcem.com.pk/wp-content/uploads/2026/08/National-bank-of-pakistan-Logo.webp" },
  { name: "Advantest", src: "https://marcem.com.pk/wp-content/uploads/2026/07/Advantest-Logo.webp" },
  { name: "Emirates", src: "https://marcem.com.pk/wp-content/uploads/2026/07/Emirates-Logo.webp" },
  { name: "DHA Suffa University", src: "https://marcem.com.pk/wp-content/uploads/2026/07/Dha-Suffa-University-Logo.webp" },
  { name: "Faysal Bank", src: "https://marcem.com.pk/wp-content/uploads/2026/07/Faysal-bank-Logo.webp" },
  { name: "Berger Paints", src: "https://marcem.com.pk/wp-content/uploads/2026/07/Berger-Paints-Logo-1.webp" },
  { name: "Engro Fertilizers", src: "https://marcem.com.pk/wp-content/uploads/2026/07/Engro-Fertilizers-logo.webp" },
  { name: "Master Motors", src: "https://marcem.com.pk/wp-content/uploads/2026/07/Master-Motors-Logo.webp" },
  { name: "Shanghai Electric", src: "https://marcem.com.pk/wp-content/uploads/2026/08/shanghai-electric-Logo.webp" },
  { name: "ICAP", src: "https://marcem.com.pk/wp-content/uploads/2026/07/ICAP-Logo.webp" },
  { name: "Habib Metro Bank", src: "https://marcem.com.pk/wp-content/uploads/2026/07/Habib-Metro-Bank-Logo.webp" },
];

const SERVICES = [
  { name: "Corporate Events", desc: "Conferences, AGMs, and executive gatherings engineered with precision.", img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80", size: "large" },
  { name: "Wedding Events", desc: "Refined celebrations designed around the couple's story.", img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80", size: "tall" },
  { name: "Brand Activations", desc: "Experiential campaigns that turn audiences into advocates.", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80", size: "small" },
  { name: "Corporate Exhibitions", desc: "Curated showcases that place your brand centre stage.", img: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1000&q=80", size: "small" },
  { name: "Private Events", desc: "Intimate moments produced with quiet, considered luxury.", img: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1000&q=80", size: "tall" },
  { name: "Conferences", desc: "Large-scale forums with flawless speaker and delegate flow.", img: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1000&q=80", size: "small" },
  { name: "Product Launches", desc: "Reveal moments that carry lasting media momentum.", img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1000&q=80", size: "small" },
  { name: "Team Building", desc: "Purpose-built experiences that strengthen workplace culture.", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=80", size: "small" },
  { name: "Trade Shows", desc: "End-to-end trade show management from booth to buyer.", img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80", size: "small" },
  { name: "Catering", desc: "Menus and hospitality that leave a lasting impression.", img: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=80", size: "small" },
];

const TESTIMONIALS = [
  { 
    quote: "EventSphere managed our annual banking conference with extraordinary precision. The attention to detail and execution was flawless.", 
    name: "Sarah Ahmed", 
    role: "Marketing Head, HBL", 
    featured: true 
  },
  { 
    quote: "The brand activation campaign exceeded all our expectations. A highly professional team that truly understands corporate audiences.", 
    name: "Ali Raza", 
    role: "Brand Manager, Emirates" 
  },
  { 
    quote: "From the stage design to the delegate flow, everything was seamless. They took all the stress away from our team.", 
    name: "Fatima Noor", 
    role: "HR Director, DHA" 
  },
  { 
    quote: "I attended the Tech Innovators Meetup and was blown away by the arrangements. The networking opportunities were top-notch.", 
    name: "Zainab Khan", 
    role: "Attendee, Tech Summit 2026" 
  },
  { 
    quote: "A team that understands the healthcare sector. They delivered our pharmaceutical launch event on time and on budget.", 
    name: "Dr. Usman", 
    role: "Operations Lead, High-Q Pharma" 
  },
];
const CITIES = [
  { name: "Karachi", detail: "Mazar-e-Quaid", img: "https://images.unsplash.com/photo-1585084886543-2f3c8c7b3f1c?auto=format&fit=crop&w=1200&q=80" },
  { name: "Lahore", detail: "Badshahi Mosque", img: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1200&q=80" },
  { name: "Islamabad", detail: "Faisal Mosque", img: "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&w=1200&q=80" },
  { name: "Peshawar", detail: "Mahabat Khan Mosque", img: "https://images.unsplash.com/photo-1615832494873-b0c52d519696?auto=format&fit=crop&w=1200&q=80" },
  { name: "Multan", detail: "Shah Rukn-e-Alam", img: "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80" },
  { name: "Rawalpindi", detail: "Raja Bazaar", img: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=80" },
  { name: "Hyderabad", detail: "Pacco Qillo", img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80" },
  { name: "Quetta", detail: "Pacco Qillo", img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80" },
  { name: "Faisalabad", detail: "Clock Tower", img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80" },
  { name: "DI Khan", detail: "Clock Tower", img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80" },
];

const GALLERY = [
  { id: 1, caption: "Annual Leadership Summit", img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80", span: "wide" },
  { id: 2, caption: "Wedding Reception Décor", img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80", span: "portrait" },
  { id: 3, caption: "Product Launch Stage", img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80", span: "standard" },
  { id: 4, caption: "Exhibition Hall", img: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1000&q=80", span: "portrait" },
  { id: 5, caption: "Brand Activation", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80", span: "standard" },
  { id: 6, caption: "Private Celebration", img: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1000&q=80", span: "portrait" },
  { id: 7, caption: "Conference Keynote", img: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1600&q=80", span: "wide" },
  { id: 8, caption: "Gala Dinner", img: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80", span: "standard" },
];

const INDUSTRIES = [
  { name: "Banking & Finance", desc: "Professional events for financial industry growth.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/1_3_11zon.webp" },
  { name: "Telecommunications", desc: "Connecting audiences through impactful industry events.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/2_4_11zon.webp" },
  { name: "Technology & IT", desc: "Innovative events for technology-driven organizations.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/3_5_11zon.webp" },
  { name: "Pharmaceuticals & Healthcare", desc: "Trusted events for healthcare professionals.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/4_6_11zon.webp" },
  { name: "FMCG", desc: "Strategic events for consumer-focused brands.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/5_7_11zon.webp" },
  { name: "Legal Service", desc: "Professional events for legal organizations.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/16_5_11zon.webp" },
  { name: "Insurance", desc: "Corporate events supporting insurance industry engagement.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/17_6_11zon.webp" },
  { name: "Real Estate", desc: "Events that showcase property developments.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/6_8_11zon.webp" },
  { name: "Manufacturing", desc: "Business events for manufacturing sector growth.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/7_9_11zon.webp" },
  { name: "Education", desc: "Academic events fostering learning and collaboration.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/8_10_11zon.webp" },
  { name: "Energy & Oil/Gas", desc: "Industry events for energy sector leaders.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/10_12_11zon.webp" },
  { name: "Aviation & Airlines", desc: "Professional events for aviation industry stakeholders.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/18_1_11zon.webp" },
  { name: "NGOs & Nonprofits", desc: "Purpose-driven events supporting community engagement.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/19_2_11zon.webp" },
  { name: "Logistics", desc: "Efficient events for logistics and transportation.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/11_13_11zon.webp" },
  { name: "Media & Entertainment", desc: "Engaging events for creative industries.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/12_14_11zon.webp" },
  { name: "Government", desc: "Professional management for public sector events.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/13_15_11zon.webp" },
  { name: "Automotive", desc: "Dynamic events for automotive industry brands.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/14_1_11zon.webp" },
  { name: "E-commerce & Retail", desc: "Customer-focused events for retail growth.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/15_2_11zon.webp" },
  { name: "Food & Beverage", desc: "Brand-building events for food businesses.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/20_3_11zon.webp" },
  { name: "Fashion & Lifestyle", desc: "Stylish events enhancing brand visibility.", img: "https://marcem.com.pk/wp-content/uploads/2026/05/21_4_11zon.webp" },
];

/* =========================================================
   REVEAL HOOK
   ========================================================= */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".es-reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* =========================================================
   HERO
   ========================================================= */

function Hero() {
  const heroRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  // Real Events Data
  const [liveEvents, setLiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Events from Database
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await eventService.list();
        setLiveEvents((res.expos || []).slice(0, 5));
      } catch (err) {
        console.error("Error fetching hero events:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Reveal Animation
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    io.observe(el);

    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      className={`es-hero ${revealed ? "is-revealed" : ""}`}
      aria-labelledby="hero-title"
    >
      <div className="es-hero__overlay" aria-hidden="true" />

      <div className="es-hero__grid">

        {/* LEFT CONTENT */}
        <div className="es-hero__copy">

          <p className="es-hero__eyebrow">
            <span className="es-hero__eyebrow-dot" />
            Welcome to EventSphere Pvt Ltd
          </p>

          <h1 id="hero-title" className="es-hero__title">
            Best Event
            <br />
            Planners In
            <br />
            <em>Pakistan</em>
          </h1>

          <p className="es-hero__lead">
            An experienced event management company with offices in Karachi,
            Lahore, and Islamabad — serving clients nationwide. We plan and
            deliver weddings, corporate events, brand activations, exhibitions,
            and private celebrations.
          </p>

          <p className="es-hero__lead es-hero__lead--small">
            With 12+ years of industry experience, our planners and designers
            handle everything from concept and planning to final execution.
          </p>

          <div className="es-hero__actions">

            <Link to="/events" className="es-hero__cta">
              <span>Explore Events</span>

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>

            <Link to="/gallery" className="es-hero__cta-outline">
              View Gallery
            </Link>

          </div>

          {/* SOCIAL LINKS */}
          <ul className="es-hero__social">

            <li>
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </a>
            </li>

            <li>
              <a href="#" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </li>

            <li>
              <a href="#" aria-label="Pinterest">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 20c2-4 3-7 3-7M11 13c0-2 1-4 3-4s3 2 3 4c0 3-2 5-4 5" />
                </svg>
              </a>
            </li>

            <li>
              <a href="#" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
            </li>

          </ul>
        </div>

        {/* RIGHT LIVE EVENTS PANEL */}
        <div className="es-hero__panel">

          <div className="es-hero__panel-header">
            <h2 className="es-hero__panel-title">Live Events</h2>
            <span className="es-hero__panel-sub">Happening Now</span>
          </div>

          <div className="es-hero__events-scroll">

            {loading ? (
              <p className="es-events-message">
                Loading events...
              </p>
            ) : liveEvents.length === 0 ? (
              <p className="es-events-message">
                No live events at the moment.
              </p>
            ) : (
              liveEvents.map((event) => {
                const eventId = event._id || event.id;

                return (
                  <div key={eventId} className="es-event-card">

                    <div className="es-event-card__img">
                      <img
                        src={
                          event.cover ||
                          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80"
                        }
                        alt={event.title || "Event"}
                      />
                    </div>

                    <div className="es-event-card__content">

                      <span className="es-event-card__date">
                        {event.startDate || "TBA"} • {event.location || "TBA"}
                      </span>

                      <h3 className="es-event-card__title">
                        {event.title}
                      </h3>

                    </div>

                    <div className="es-event-card__hover">
                      <Link
                        to={`/events/${eventId}`}
                        className="es-event-card__btn"
                      >
                        Join Event →
                      </Link>
                    </div>

                  </div>
                );
              })
            )}

          </div>
        </div>
      </div>

      {/* FLOATING BOTTOM NAVIGATION */}
      <nav className="es-hero__floating-nav" aria-label="Explore EventStrat">

        <Link to="/events" className="es-floating-item">
          <span className="es-floating-icon">✦</span>
          <span>Explore Expos</span>
        </Link>

        <Link to="/events" className="es-floating-item active">
          <span className="es-floating-icon">◈</span>
          <span>Upcoming Events</span>
        </Link>

        <Link to="/events" className="es-floating-item">
          <span className="es-floating-icon">▧</span>
          <span>For Exhibitors</span>
        </Link>

        <Link to="/events" className="es-floating-item">
          <span className="es-floating-icon">♧</span>
          <span>For Attendees</span>
        </Link>

      </nav>

    </section>
  );
}



/* =========================================================
   CLIENTS
   ========================================================= */
function Clients() {
  const loop = [...CLIENT_LOGOS, ...CLIENT_LOGOS];
  return (
    <section className="es-clients es-section" aria-labelledby="clients-title">
      <div className="es-container">
        <div className="es-section-head es-reveal">
          <div className="es-section-head__text">
            <span className="es-eyebrow">Our Clients</span>
            <h2 id="clients-title" className="es-section-title">
              Trusted By Leading Organizations
            </h2>
            <p className="es-section-desc">
              Leading businesses and organisations across Pakistan choose
              EventSphere for corporate events, conferences, exhibitions and
              brand activations that reflect their goals and brand identity.
            </p>
          </div>
          <a
            href="https://marcem.com.pk/our-clients"
            className="es-link-cta"
            target="_blank"
            rel="noreferrer"
          >
            Explore All <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="es-clients__marquee" aria-label="Client logos">
          <div className="es-clients__track">
            {loop.map((logo, i) => (
              <div className="es-clients__item" key={`${logo.name}-${i}`}>
                <img
                  src={logo.src}
                  alt={`${logo.name} logo`}
                  loading="lazy"
                  className="client-logo-img"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SERVICES
   ========================================================= */

function Services() {
  const scrollRef = useRef(null);
  const [servicesData, setServicesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Real Data Fetching
  useEffect(() => {
    async function fetchRealEvents() {
      try {
        const res = await eventService.list();
        // Top 10 events uthayen jo database mein hain
        setServicesData((res.expos || []).slice(0, 10)); 
      } catch (err) {
        console.error("Error fetching services (events):", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRealEvents();
  }, []);

  // Infinite scroll loop ke liye data ko double kar rahe hain
  const scrollList = servicesData.length > 0 ? [...servicesData, ...servicesData] : [];

  // ✅ Scroll Buttons Functions
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  return (
    <section className="es-services es-section" aria-labelledby="services-title">
      <div className="es-services-header">
        <div className="es-section-head__text">
          <span className="es-eyebrow">What We Do</span>
          <h2 id="services-title" className="es-section-title">
            Explore Our Events
          </h2>
          <p className="es-section-desc">
            A curated set of live experiences — from corporate summits to grand exhibitions.
          </p>
        </div>

        {/* ✅ Scroll Buttons Wapis Add Kar Diye */}
        <div className="es-services-nav">
          <button onClick={scrollLeft} className="es-slider-btn" aria-label="Previous">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={scrollRight} className="es-slider-btn" aria-label="Next">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <div className="es-services-slider-wrap es-reveal">
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#A7B0C0" }}>
            Loading events...
          </div>
        ) : scrollList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#A7B0C0" }}>
            No events found.
          </div>
        ) : (
          <div className="es-services-carousel" ref={scrollRef}>
            {scrollList.map((s, i) => {
              const eventId = s._id || s.id;
              
              return (
                <Link 
                  to="/events" 
                  key={`${eventId}-${i}`} 
                  className="es-service-panel"
                  style={{ textDecoration: 'none' }}
                >
                  <img 
                    src={s.cover || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80"} 
                    alt={s.title || "Event"} 
                    className="es-service-panel__bg" 
                    loading="lazy" 
                  />
                  <div className="es-service-panel__overlay"></div>
                  
                  <div className="es-service-panel__content">
                    <h3 className="es-service-panel__title">{s.title || "Untitled Event"}</h3>
                    <p className="es-service-panel__desc">
                      {s.category || s.location || "Explore Event Details"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   REGISTRATION PANELS
   ========================================================= */


function Registration() {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Scroll Listener: Agar user section se aage scroll kare toh wapis close kardo
  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("registration-section");
      if (!section) return;

      const rect = section.getBoundingClientRect();
      
      // Agar section screen se bahar chala jaye (upar ya neeche)
      if (rect.top > window.innerHeight || rect.bottom < 0) {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
     <section id="registration-section" className="es-register es-section" aria-labelledby="register-title">
      <div className="es-container">
        
        {/* Top Header */}
        <div className="es-section-head es-reveal" style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="es-section-head__text">
            {/* Inline style hata diya taake CSS apply ho sake */}
            <span className="es-eyebrow">
              Join Us
            </span>
            <h2 id="register-title" className="es-section-title">
              Choose Your Path
            </h2>
            <p className="es-section-desc" style={{ margin: "1rem auto 0", maxWidth: "600px" }}>
              Whether you're here to learn, network, or showcase your brand — there is a place for you at EventSphere.
            </p>
          </div>
        </div>

        {/* ✅ NAYA: Main Heading (Sirf open hone par show hogi, black color) */}
        <div className={`es-inner-main-heading ${isOpen ? "show" : ""}`}>
          <h2>Select Your Role</h2>
          <p>Are you joining us as an Attendee or an Exhibitor?</p>
        </div>

        <div className={`es-expand-wrapper ${isOpen ? "is-open" : ""}`}>
          
          {/* Bada Card (Default View) */}
          <div className="es-trigger-card" onClick={() => setIsOpen(true)}>
            <div className="es-trigger-bg">
              <img src="https://images.unsplash.com/photo-1666030853687-426a8eb56636?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" alt="Choose Path" />
            </div>
            <div className="es-trigger-overlay"></div>
            <div className="es-trigger-content">
              <span className="es-eyebrow">Registrations Open</span>
              <h3>Season is Starting Soon</h3>
              <p>Click here to choose your path and secure your spot.</p>
              <span className="es-trigger-btn">Choose Your Path →</span>
            </div>
          </div>

          {/* 2 Cards (Jab click hoga tab show honge) */}
          <div className="es-dual-wrap-inner">
            
            {/* Card 1: Attendee */}
            <div className="es-dual-card es-card-attendee">
              <div className="es-glow-bg es-glow-blue"></div>
              <div className="es-card-inner">
                <div className="es-card-badge">
                  <span className="es-badge-dot"></span> Attendee
                </div>
                <h3 className="es-card-title">Experience the Future</h3>
                <p className="es-card-text">
                  Immerse yourself in groundbreaking keynotes, hands-on workshops, and exclusive networking events.
                </p>
                <ul className="es-card-perks">
                  <li><span className="tick">✓</span> Full access to all stages</li>
                  <li><span className="tick">✓</span> VIP networking lounge</li>
                  <li><span className="tick">✓</span> Official Event Kit</li>
                </ul>
                <Link to="/events/register-attendee" className="es-btn-action">
                  Register as Attendee <span className="arrow">→</span>
                </Link>
              </div>
            </div>

            {/* Divider */}
            <div className="es-divider">
              <span className="es-divider-line"></span>
              <span className="es-divider-text">OR</span>
              <span className="es-divider-line"></span>
            </div>

            {/* Card 2: Exhibitor */}
            <div className="es-dual-card es-card-exhibitor">
              <div className="es-glow-bg es-glow-cyan"></div>
              <div className="es-card-inner">
                <div className="es-card-badge es-badge-cyan">
                  <span className="es-badge-dot"></span> Exhibitor
                </div>
                <h3 className="es-card-title">Showcase Your Brand</h3>
                <p className="es-card-text">
                  Put your company in front of thousands. Book prime booths and connect directly with decision-makers.
                </p>
                <ul className="es-card-perks">
                  <li><span className="tick">✓</span> Premium booth allocation</li>
                  <li><span className="tick">✓</span> Lead generation tools</li>
                  <li><span className="tick">✓</span> Dedicated staff support</li>
                </ul>
                <Link to="/events/register-exhibitor" className="es-btn-action es-btn-cyan">
                  Book a Booth <span className="arrow">→</span>
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}



/* =========================================================
   TESTIMONIALS
   ========================================================= */

function Testimonials() {
  const featured = TESTIMONIALS.find((t) => t.featured) || TESTIMONIALS[0];
  const rest = TESTIMONIALS.filter((t) => t !== featured);
  const [active, setActive] = useState(0);

  return (
    <section className="es-testimonials es-section" aria-labelledby="testi-title">
      <div className="es-container">
        <div className="es-section-head es-reveal">
          <div className="es-section-head__text">
            <span className="es-eyebrow">Client Reviews</span>
            <h2 id="testi-title" className="es-section-title">
              Our Client Testimonials
            </h2>
          </div>
        </div>

        <div className="es-testimonials__layout">
          <figure className="es-testi-feature es-reveal">
            <span className="es-testi-feature__mark" aria-hidden="true">“</span>
            <blockquote className="es-testi-feature__quote">
              {featured.quote}
            </blockquote>
            <figcaption className="es-testi-feature__meta">
              <span className="es-testi-feature__name">{featured.name}</span>
              <span className="es-testi-feature__role">{featured.role}</span>
            </figcaption>
          </figure>

          <div className="es-testi-stack es-reveal">
            <div className="es-testi-stack__head">
              <span className="es-testi-stack__count">
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(rest.length).padStart(2, "0")}
              </span>
              <div className="es-testi-stack__nav">
                <button
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={() => setActive((p) => (p - 1 + rest.length) % rest.length)}
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Next testimonial"
                  onClick={() => setActive((p) => (p + 1) % rest.length)}
                >
                  →
                </button>
              </div>
            </div>
            <div className="es-testi-stack__body" key={active}>
              <p className="es-testi-stack__quote">“{rest[active].quote}”</p>
              <p className="es-testi-stack__name">{rest[active].name}</p>
              <p className="es-testi-stack__role">{rest[active].role}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CITIES
   ========================================================= */

function Cities() {
  return (
    <section className="es-cities es-section" aria-labelledby="cities-title">
      
      {/* 1. Background Image Layer (Poore section ke peeche) */}
      <div className="es-cities__bg" aria-hidden="true" />

      {/* 2. Main Container (Taake content center rahe) */}
      <div className="es-container" style={{ position: "relative", zIndex: 2 }}>
        
        {/* 3. Gradient Bar (Heading ke peeche) */}
        <div className="es-cities__gradient-bar">
          <div className="es-section-head es-reveal">
            <div className="es-section-head__text">
              <span className="es-eyebrow">Nationwide</span>
              <h2 id="cities-title" className="es-section-title">
                Cities We Serve
              </h2>
            </div>
          </div>
        </div>

        {/* 4. Cards Container (Image ke upar) */}
        <div className="es-cities__grid">
          {CITIES.map((c, i) => {
            const isLarge = i === 0 || i === 3 || i === 6;
            
            return (
              <article
                key={c.name}
                className={`es-city ${isLarge ? "es-city--large" : ""} es-reveal`}
                style={{ transitionDelay: `${(i % 4) * 80}ms` }}
              >
                <div className="es-city__media">
                  <img src={c.img} alt={`${c.name} — ${c.detail}`} loading="lazy" />
                </div>
                
                {/* Overlay hataya gaya hai taake image clear dikhe */}
                
                <div className="es-city__content">
                  <span className="es-city__detail">{c.detail}</span>
                  <h3 className="es-city__name">{c.name}</h3>
                </div>
                <span className="es-city__arrow" aria-hidden="true">→</span>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}

/* =========================================================
   GALLERY + LIGHTBOX
   ========================================================= */

function Gallery() {
  const [openIndex, setOpenIndex] = useState(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(
    () => setOpenIndex((p) => (p === null ? p : (p + 1) % GALLERY.length)),
    []
  );
  const prev = useCallback(
    () =>
      setOpenIndex((p) =>
        p === null ? p : (p - 1 + GALLERY.length) % GALLERY.length
      ),
    []
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, next, prev]);

  const sliderImages = [...GALLERY, ...GALLERY];

  return (
    <section className="es-gallery es-section" aria-labelledby="gallery-title">
      <div className="es-container">
        <div className="es-section-head es-reveal">
          <div className="es-section-head__text text-center" style={{ margin: "0 auto 3rem", textAlign: "center" }}>
            <span className="es-eyebrow">Gallery</span>
            <h2 id="gallery-title" className="es-section-title">
              Our Gallery Showcase
            </h2>
            <p className="es-section-desc">
              Moments from conferences, weddings, exhibitions, brand activations
              and private celebrations we have had the privilege to produce.
            </p>
          </div>
        </div>
      </div>

      <div className="es-gallery-3d-wrapper">
        <div className="es-gallery-3d-track">
          {sliderImages.map((g, i) => (
            <div
              key={`${g.id}-${i}`}
              className="es-gallery-3d-item"
              onClick={() => setOpenIndex(i % GALLERY.length)}
            >
              <img src={g.img} alt={g.caption} loading="lazy" />
              <div className="es-gallery-3d-caption">
                <span>{g.caption}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {openIndex !== null && (
        <div className="es-lightbox" onClick={close}>
          <button className="es-lightbox__close" onClick={close}>×</button>
          <button className="es-lightbox__nav es-lightbox__nav--prev" onClick={(e) => { e.stopPropagation(); prev(); }}>←</button>
          <figure className="es-lightbox__figure" onClick={(e) => e.stopPropagation()}>
            <img src={GALLERY[openIndex].img} alt={GALLERY[openIndex].caption} />
            <figcaption>{GALLERY[openIndex].caption} — {openIndex + 1} / {GALLERY.length}</figcaption>
          </figure>
          <button className="es-lightbox__nav es-lightbox__nav--next" onClick={(e) => { e.stopPropagation(); next(); }}>→</button>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   INDUSTRIES
   ========================================================= */

function Industries() {
  const rowOne = INDUSTRIES.slice(0, 10);
  const rowTwo = INDUSTRIES.slice(10);

  return (
    <section className="es-industries es-section" aria-labelledby="industries-title">
      <div className="es-container">
        <div className="es-industries__head es-reveal">
          <h2 id="industries-title" className="es-section-title">
            Industries We Serve
          </h2>
          <p className="es-section-desc">
            Best Event Management Services for Diverse Industries and Corporate
            Sectors
          </p>
        </div>

        <div className="es-ind-tree">
          <div className="es-ind-tree__spine" aria-hidden="true" />

          {[rowOne, rowTwo].map((row, rowIdx) => (
            <div
              key={rowIdx}
              className={`es-ind-tree__row es-ind-tree__row--${rowIdx + 1}`}
            >
              {row.map((ind, i) => (
                <div
                  key={ind.name}
                  className="es-ind es-reveal"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <span className="es-ind__connector" aria-hidden="true" />
                  <div className="es-ind__card">
                    <div className="es-ind__img">
                      <img src={ind.img} alt={ind.name} loading="lazy" />
                    </div>
                    <div className="es-ind__text">
                      <h3 className="es-ind__name">{ind.name}</h3>
                      <p className="es-ind__desc">{ind.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* =========================================================
   PAGE (ROOT)
   ========================================================= */

export default function Home() {
  useReveal();

  return (
    <main className="es-home">
      <Hero />
      <Clients />
      <Services />
      <Registration />
      <Testimonials />
      <Cities />
      <Industries />
      <Gallery />
    </main>
  );
}