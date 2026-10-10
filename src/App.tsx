import { lazy, Suspense, useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Menu,
  X,
  ScanLine,
} from "lucide-react";
import HomePage from "./pages/HomePage";
import {
  SolutionsPage,
  NetworkPage,
  AboutPage,
  ContactPage,
  TrackPage,
} from "./pages/SupportingPages";

const MotionStudy = lazy(() => import("./pages/MotionStudy"));

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="Trucknex home"
      className={`brand ${light ? "brand-light" : ""}`}
    >
      <span className="brand-mark">
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <path d="M5 9h26v7H17v16H9V16H5z" fill="currentColor" />
          <path d="m22 20 8-5v17h-8z" fill="currentColor" />
        </svg>
      </span>
      <span>
        trucknex<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav aria-label="Main navigation" className="desktop-nav">
          <NavLink to="/solutions" className="nav-link">
            Solutions
          </NavLink>
          <NavLink to="/network" className="nav-link">
            Our network
          </NavLink>
          <NavLink to="/about" className="nav-link">
            Our story
          </NavLink>
        </nav>
        <div className="header-actions">
          <Link to="/track" className="track-link">
            <ScanLine size={17} />
            Track a shipment
          </Link>
          <Link to="/contact" className="button button-dark header-cta">
            Let’s get moving <ArrowUpRight size={17} />
          </Link>
        </div>
        <button
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="mobile-nav"
        >
          <Link to="/solutions">
            Solutions <ArrowUpRight />
          </Link>
          <Link to="/network">
            Our network <ArrowUpRight />
          </Link>
          <Link to="/about">
            Our story <ArrowUpRight />
          </Link>
          <Link to="/track">
            Track a shipment <ScanLine />
          </Link>
          <Link to="/contact">
            Let’s get moving <ArrowUpRight />
          </Link>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-intro">
            <Brand light />
            <h2>
              Built for
              <br />
              what’s next.
            </h2>
            <span className="footer-made">
              <span /> INDIA. EVERY DIRECTION.
            </span>
          </div>
          <div className="footer-links">
            <span>THE PLATFORM</span>
            <Link to="/solutions">Freight solutions</Link>
            <Link to="/network">Our network</Link>
            <Link to="/track">Track a shipment</Link>
            <Link to="/solutions?for=carriers">Fleet partners</Link>
          </div>
          <div className="footer-links">
            <span>THE COMPANY</span>
            <Link to="/about">Our story</Link>
            <Link to="/contact">Get in touch</Link>
            <Link to="/contact">Work with us</Link>
          </div>
          <div className="footer-newsletter">
            <span>KEEP YOUR NEXT MOVE IN SIGHT.</span>
            <p>Fresh thinking from a world in motion.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
              }}
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Email for updates
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSubscribed(false);
                }}
                autoComplete="email"
                enterKeyHint="send"
              />
              <button aria-label="Subscribe to updates">
                {subscribed ? <Check size={19} /> : <ArrowRight size={19} />}
              </button>
            </form>
            {subscribed && (
              <small role="status">
                You’re on the demo list. No email was sent.
              </small>
            )}
          </div>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          trucknex<span>.</span>
          <ArrowUpRight strokeWidth={0.7} />
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Trucknex</span>
          <span>Frontend concept · sample data</span>
          <a href="#top">
            Back to top <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
}

function NotFound() {
  return (
    <main className="container not-found">
      <span className="eyebrow">404 / A SMALL DETOUR</span>
      <h1>
        Back to
        <br />
        the right road.
      </h1>
      <p>This page doesn’t exist. Let’s find your next move.</p>
      <Link to="/" className="button button-dark">
        Back to home <ArrowUpRight size={18} />
      </Link>
    </main>
  );
}

export default function App() {
  const location = useLocation();
  useEffect(() => {
    const keyboard = () => {
      document.documentElement.dataset.input = "keyboard";
    };
    const pointer = () => {
      document.documentElement.dataset.input = "pointer";
    };
    document.addEventListener("keydown", keyboard, { passive: true });
    document.addEventListener("pointerdown", pointer, { passive: true });
    return () => {
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("pointerdown", pointer);
    };
  }, []);
  useEffect(() => {
    if (location.hash) {
      requestAnimationFrame(() =>
        document.getElementById(location.hash.slice(1))?.scrollIntoView(),
      );
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    const titles: Record<string, string> = {
      "/": "Freight that moves you forward",
      "/solutions": "Freight solutions",
      "/network": "Our network",
      "/about": "Built for what’s next",
      "/contact": "Let’s get moving",
      "/track": "Track your shipment",
      "/motion-study": "Motion studio",
    };
    document.title = `Trucknex — ${titles[location.pathname] || "Page not found"}`;
  }, [location.pathname, location.hash]);
  if (location.pathname === "/motion-study")
    return (
      <Suspense fallback={<main className="motion-study-loading" />}>
        <MotionStudy />
      </Suspense>
    );
  return (
    <div id="top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <div id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
