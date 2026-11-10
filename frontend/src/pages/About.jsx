import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  CalendarDays, 
  Map, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Globe,
  TrendingUp,
  Ticket,
  Building2
} from "lucide-react";
import "./About.css";

export default function About() {
  const containerRef = useRef(null);

  // Scroll Reveal Animation Trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = containerRef.current?.querySelectorAll(".reveal-on-scroll");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page-wrapper" ref={containerRef}>
      
      {/* =========================================
          HERO SECTION
          ========================================= */}
      <section className="about-hero">
        {/* Background Decor */}
        <div className="hero-decorative-circle circle-1"></div>
        <div className="hero-decorative-circle circle-2"></div>
        <div className="hero-decorative-grid"></div>

        <div className="container position-relative z-1">
          <div className="row align-items-center">
            
            {/* Left Content */}
            <div className="col-lg-6 text-start mb-5 mb-lg-0">
              <span className="about-hero__badge">Welcome to EventStrat.ai</span>
              <h1 className="about-hero__title">
                Connecting People, Businesses & Opportunities Through Events.
              </h1>
              <p className="about-hero__subtitle">
                EventStrat.ai is an integrated event management platform designed to simplify how expos are organized, businesses participate, and attendees discover and book events.
              </p>
              <div className="d-flex gap-3 mt-5 flex-wrap">
                <Link to="/register" className="btn-premium-primary">
                  Explore Our Platform <ArrowRight size={18} className="ms-1" />
                </Link>
                <Link to="/events" className="btn-premium-secondary">
                  Browse Expos
                </Link>
              </div>
            </div>

            {/* Right CSS Mockup (Floating Animation) */}
            <div className="col-lg-6 d-none d-lg-block position-relative">
              <div className="hero-mockup-container">
                {/* Floating Card 1 */}
                <div className="mockup-card glass-card floating-anim-1">
                  <div className="mockup-icon bg-blue"><CalendarDays size={20} /></div>
                  <div>
                    <h6 className="mb-1 text-dark fw-bold">Tech Expo 2026</h6>
                    <p className="mb-0 text-muted small">Manage 150+ Exhibitors</p>
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="mockup-card glass-card floating-anim-2">
                  <div className="mockup-icon bg-green"><TrendingUp size={20} /></div>
                  <div>
                    <h6 className="mb-1 text-dark fw-bold">Ticket Sales</h6>
                    <p className="mb-0 text-muted small">+24% this week</p>
                  </div>
                </div>

                {/* Floating Card 3 */}
                <div className="mockup-card glass-card floating-anim-3">
                  <div className="mockup-icon bg-purple"><Map size={20} /></div>
                  <div>
                    <h6 className="mb-1 text-dark fw-bold">Floor Plan</h6>
                    <p className="mb-0 text-muted small">Booths 90% Booked</p>
                  </div>
                </div>

                {/* Center Main Dashboard Graphic */}
                <div className="main-dashboard-mockup">
                  <div className="dash-header d-flex gap-2 mb-4">
                    <div className="dash-dot bg-danger"></div>
                    <div className="dash-dot bg-warning"></div>
                    <div className="dash-dot bg-success"></div>
                  </div>
                  <div className="dash-body">
                    <div className="dash-sidebar">
                      <div className="dash-line w-100 mb-3 bg-primary opacity-50"></div>
                      <div className="dash-line w-75 mb-2"></div>
                      <div className="dash-line w-50 mb-2"></div>
                    </div>
                    <div className="dash-main-content">
                      <div className="dash-chart-bars">
                        <div className="dash-bar" style={{height: "40%"}}></div>
                        <div className="dash-bar" style={{height: "70%"}}></div>
                        <div className="dash-bar" style={{height: "50%"}}></div>
                        <div className="dash-bar" style={{height: "90%"}}></div>
                        <div className="dash-bar" style={{height: "60%"}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================
          MAIN CONTENT CONTAINER
          ========================================= */}
      <div className="container about-content-container">
        
        {/* 1. OUR STORY (Editorial Card) */}
        <section className="reveal-on-scroll mb-5">
          <div className="story-card text-center">
            <h2 className="section-heading text-center mb-4">Bringing the Entire Ecosystem Together</h2>
            <p className="section-text-lead">
              EventStrat.ai brings organizers, exhibitors, and attendees together through one connected platform. From expo planning and exhibitor applications to booth allocation and attendee ticket registration, we aim to make event management more organized, accessible, and efficient.
            </p>
          </div>
        </section>

        {/* 2. MISSION & VISION */}
        <section className="row g-4 mb-5 reveal-on-scroll">
          <div className="col-lg-6">
            <div className="animated-section h-100">
              <h3 className="section-heading">Our Mission</h3>
              <p className="section-text">
                To simplify event management by connecting organizers, exhibitors, and attendees through one integrated platform.
              </p>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="animated-section h-100">
              <h3 className="section-heading">Our Vision</h3>
              <p className="section-text">
                To build a connected event ecosystem where opportunities, businesses, and people can grow together.
              </p>
            </div>
          </div>
        </section>

        {/* 3. WHAT WE DO — OUR ECOSYSTEM */}
        <section className="mb-5 reveal-on-scroll">
          <h2 className="section-heading text-center mb-5">What We Do — Our Ecosystem</h2>
          <div className="row g-4">
            {/* For Organizers */}
            <div className="col-lg-4">
              <div className="animated-section h-100">
                <div className="icon-wrapper"><CalendarDays size={28} /></div>
                <h4 className="ecosystem-title">For Organizers</h4>
                <ul className="ecosystem-list">
                  <li><CheckCircle2 size={16} /> Manage expos and events.</li>
                  <li><CheckCircle2 size={16} /> Review exhibitor applications.</li>
                  <li><CheckCircle2 size={16} /> Manage booths and floor plans.</li>
                  <li><CheckCircle2 size={16} /> Manage attendees and registrations.</li>
                  <li><CheckCircle2 size={16} /> Coordinate schedules and communication.</li>
                </ul>
              </div>
            </div>
            {/* For Exhibitors */}
            <div className="col-lg-4">
              <div className="animated-section h-100">
                <div className="icon-wrapper"><Layers size={28} /></div>
                <h4 className="ecosystem-title">For Exhibitors</h4>
                <ul className="ecosystem-list">
                  <li><CheckCircle2 size={16} /> Discover upcoming expos.</li>
                  <li><CheckCircle2 size={16} /> Submit participation applications.</li>
                  <li><CheckCircle2 size={16} /> Request preferred booths.</li>
                  <li><CheckCircle2 size={16} /> Manage products and services.</li>
                  <li><CheckCircle2 size={16} /> Manage company profiles and staff.</li>
                </ul>
              </div>
            </div>
            {/* For Attendees */}
            <div className="col-lg-4">
              <div className="animated-section h-100">
                <div className="icon-wrapper"><Users size={28} /></div>
                <h4 className="ecosystem-title">For Attendees</h4>
                <ul className="ecosystem-list">
                  <li><CheckCircle2 size={16} /> Explore upcoming expos.</li>
                  <li><CheckCircle2 size={16} /> Discover event details.</li>
                  <li><CheckCircle2 size={16} /> Choose Standard or VIP tickets.</li>
                  <li><CheckCircle2 size={16} /> Book event tickets.</li>
                  <li><CheckCircle2 size={16} /> Access registration and ticket info.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS */}
        <section className="mb-5 reveal-on-scroll">
          <h2 className="section-heading text-center mb-5">How It Works</h2>
          <div className="row g-4 process-row">
            <div className="col-md-6 col-lg-3">
              <div className="process-step">
                <div className="process-number">1</div>
                <h5>Discover</h5>
                <p>Explore upcoming expos.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="process-step">
                <div className="process-number">2</div>
                <h5>Connect</h5>
                <p>Organizers, exhibitors, and attendees join.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="process-step">
                <div className="process-number">3</div>
                <h5>Manage</h5>
                <p>Applications, booths, and operations.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="process-step">
                <div className="process-number">4</div>
                <h5>Experience</h5>
                <p>Visit events and connect with opportunities.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. WHY CHOOSE EVENTSTRAT.AI? */}
        <section className="mb-5 reveal-on-scroll">
          <h2 className="section-heading text-center mb-5">Why Choose EventStrat.ai?</h2>
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="feature-card">
                <Globe className="feature-icon" size={24} />
                <h5>Centralized Event Management</h5>
                <p>One unified platform for all your event operations.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card">
                <CheckCircle2 className="feature-icon" size={24} />
                <h5>Simplified Registrations</h5>
                <p>Effortless registration process for attendees and exhibitors.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card">
                <Map className="feature-icon" size={24} />
                <h5>Exhibitor & Booth Management</h5>
                <p>Seamless booth allocation and floor plan management.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card">
                <Users className="feature-icon" size={24} />
                <h5>Organized Communication</h5>
                <p>Keep all stakeholders aligned with built-in tools.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card">
                <ShieldCheck className="feature-icon" size={24} />
                <h5>Registration Tracking</h5>
                <p>Real-time tracking of attendee registrations.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card">
                <Zap className="feature-icon" size={24} />
                <h5>Connected Event Ecosystem</h5>
                <p>Everything connected for a smoother experience.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. OUR CORE VALUES */}
        <section className="mb-5 text-center reveal-on-scroll">
          <h2 className="section-heading mb-5">Our Core Values</h2>
          <div className="d-flex flex-wrap justify-content-center gap-3 values-grid">
            <span className="value-pill">Transparency</span>
            <span className="value-pill">Accessibility</span>
            <span className="value-pill">Efficiency</span>
            <span className="value-pill">Innovation</span>
            <span className="value-pill">Collaboration</span>
            <span className="value-pill">Professionalism</span>
          </div>
        </section>

        {/* 7. FINAL CTA */}
        <section className="animated-section mb-5 text-center cta-section reveal-on-scroll">
          <h2 className="section-heading text-center">Every Great Event Starts With a Connection.</h2>
          <p className="section-text mb-4">
            Whether you're organizing an expo, showcasing your business, or looking for your next event experience, EventStrat.ai brings you closer to the opportunities that matter.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/events" className="btn-premium-primary">
              Explore Expos
            </Link>
            <Link to="/register" className="btn-premium-secondary">
              Join EventStrat.ai
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}