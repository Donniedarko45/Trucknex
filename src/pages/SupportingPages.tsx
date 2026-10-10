import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Globe2,
  Headphones,
  HeartHandshake,
  Layers3,
  Mail,
  MapPin,
  Navigation,
  PackageCheck,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import "./supporting-pages.css";

function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return <div className={className}>{children}</div>;
}

function PageHero({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  children?: ReactNode;
}) {
  const label = eyebrow.split(" / ")[0];
  const functional = label === "GET IN TOUCH" || label === "SHIPMENT TRACKING";
  return (
    <section className={`sub-hero ${functional ? "sub-hero-functional" : ""}`}>
      <div className="container">
        <nav className="sub-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={13} />
          <span>
            {label === "GET IN TOUCH"
              ? "Contact"
              : label === "SHIPMENT TRACKING"
                ? "Tracking"
                : label === "THE NETWORK"
                  ? "Network"
                  : label === "OUR STORY"
                    ? "About"
                    : "Solutions"}
          </span>
        </nav>
        <div
          className={`sub-hero-grid ${functional ? "" : "sub-marketing-enter"}`}
        >
          <div className="sub-hero-copy">
            <div className="eyebrow">{eyebrow}</div>
            <h1>
              {title}
              {" "}<br />
              <span>{accent}</span>
            </h1>
          </div>
          <div className="sub-hero-rail">
            <div className="sub-hero-glyph" aria-hidden="true">
              <ArrowUpRight />
            </div>
            <p>{description}</p>
            <span className="sub-hero-utility">
              INDIA IN MOTION <ArrowUpRight size={17} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PageCTA({
  title = "Let’s move your business.",
  description = "Tell us where you’re headed. We’ll take it from there.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="sub-cta container">
      <div>
        <div className="eyebrow">YOUR NEXT MOVE</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <Link className="button button-primary" to="/contact">
        Start a conversation <ArrowUpRight size={19} />
      </Link>
    </section>
  );
}

const solutions = {
  shippers: {
    eyebrow: "FOR BUSINESSES THAT MOVE INDIA",
    title: "Your freight. Our full focus.",
    description:
      "From your first booking to the final delivery, give your team one clear view of every move.",
    features: [
      {
        icon: Truck,
        title: "The right truck, every time",
        text: "Find a vehicle that fits your cargo, route and schedule. From a single dispatch to a regular lane.",
      },
      {
        icon: Navigation,
        title: "Visibility from end to end",
        text: "Follow your shipment’s progress and stay in the loop with milestones that make sense.",
      },
      {
        icon: ShieldCheck,
        title: "Confidence built in",
        text: "Work with verified transport partners and a team that cares about your cargo as much as you do.",
      },
      {
        icon: Layers3,
        title: "Less work. More movement.",
        text: "Keep bookings, route details and shipment documents together. Leave the spreadsheet juggling behind.",
      },
    ],
    steps: [
      "Tell us what’s moving",
      "Find your perfect fit",
      "Stay close to every mile",
    ],
  },
  carriers: {
    eyebrow: "FOR THE PEOPLE BEHIND THE WHEEL",
    title: "More opportunity. Every mile.",
    description:
      "Build a stronger transport business with meaningful connections, useful tools and less time spent waiting.",
    features: [
      {
        icon: Route,
        title: "Loads along your lanes",
        text: "Discover business that fits where you go, with opportunities across India’s major freight corridors.",
      },
      {
        icon: TrendingUp,
        title: "Make every return count",
        text: "Explore return-load opportunities and keep your fleet moving with fewer empty kilometres.",
      },
      {
        icon: HeartHandshake,
        title: "Partners, not just bookings",
        text: "Connect with businesses looking for dependable transport partners and grow lasting relationships.",
      },
      {
        icon: Headphones,
        title: "A team in your corner",
        text: "Get a real point of contact to help with onboarding, route questions and the everyday details.",
      },
    ],
    steps: [
      "Introduce your fleet",
      "Discover the right loads",
      "Build your next chapter",
    ],
  },
};

export function SolutionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [audience, setAudience] = useState<"shippers" | "carriers">(
    searchParams.get("for") === "carriers" ? "carriers" : "shippers",
  );
  useEffect(() => {
    setAudience(
      searchParams.get("for") === "carriers" ? "carriers" : "shippers",
    );
  }, [searchParams]);
  const selected = solutions[audience];
  return (
    <main className="sub-page sub-page-solutions">
      <PageHero
        eyebrow="SOLUTIONS / BUILT AROUND YOU"
        title="Freight, without"
        accent="the friction."
        description="For the people shipping goods. And the people driving them. Better logistics starts with a better connection."
      />
      <section className="container sub-solutions">
        <div
          className="sub-tabs"
          role="tablist"
          aria-label="Solutions audience"
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
              return;
            event.preventDefault();
            const next =
              event.key === "Home"
                ? "shippers"
                : event.key === "End"
                  ? "carriers"
                  : audience === "shippers"
                    ? "carriers"
                    : "shippers";
            setAudience(next);
            setSearchParams({ for: next }, { replace: true });
            event.currentTarget
              .querySelectorAll<HTMLButtonElement>("button")
              [next === "shippers" ? 0 : 1]?.focus();
          }}
        >
          {(["shippers", "carriers"] as const).map((type) => (
            <button
              id={`tab-${type}`}
              key={type}
              className={audience === type ? "active" : ""}
              type="button"
              role="tab"
              tabIndex={audience === type ? 0 : -1}
              aria-selected={audience === type}
              aria-controls="solution-panel"
              onClick={() => {
                setAudience(type);
                setSearchParams({ for: type }, { replace: true });
              }}
            >
              {type === "shippers" ? "For shippers" : "For transporters"}
              <ArrowUpRight size={18} />
            </button>
          ))}
        </div>
        <div
          id="solution-panel"
          role="tabpanel"
          aria-labelledby={`tab-${audience}`}
        >
          <div className="sub-section-heading">
            <div>
              <div className="eyebrow">{selected.eyebrow}</div>
              <h2 className="section-title">{selected.title}</h2>
            </div>
            <p>{selected.description}</p>
          </div>
          <div className="sub-feature-grid">
            {selected.features.map(({ icon: Icon, title, text }, index) => (
              <Reveal
                className="sub-feature-card"
                key={title}
                delay={index * 0.06}
              >
                <div className="sub-feature-top">
                  <div className="sub-icon">
                    <Icon size={26} strokeWidth={1.5} />
                  </div>
                  <span>0{index + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="container sub-service-options">
        <div className="sub-section-heading">
          <div>
            <div className="eyebrow">MADE TO FIT YOUR NEXT MOVE</div>
            <h2 className="section-title">Built to fit the load.</h2>
          </div>
          <p>
            Every load has its own journey. Find the approach that makes sense
            for yours.
          </p>
        </div>
        <div className="sub-service-grid">
          {[
            {
              id: "full-truckload",
              icon: Truck,
              title: "Full truckload",
              text: "A dedicated truck for your goods. Ideal for larger shipments, regular lanes and businesses that need the whole space.",
              tag: "YOUR GOODS. YOUR DEDICATED TRUCK.",
            },
            {
              id: "part-truckload",
              icon: Layers3,
              title: "Part truckload",
              text: "A smarter fit for smaller shipments. Explore shared vehicle space and a connected network to help your goods go further.",
              tag: "LESS SPACE. MORE FLEXIBILITY.",
            },
            {
              id: "enterprise",
              icon: Globe2,
              title: "Enterprise logistics",
              text: "Bring your routes, volumes and ambitions together. Talk to us about a transport approach shaped around your business.",
              tag: "A PLAN AS AMBITIOUS AS YOU.",
            },
          ].map(({ id, icon: Icon, title, text, tag }, index) => (
            <Reveal key={id} delay={index * 0.07}>
              <article className="sub-service-option" id={id}>
                <div className="sub-icon">
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <span>{tag}</span>
                <Link to="/contact" className="sub-text-link">
                  Explore this solution <ArrowUpRight size={16} />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="sub-process">
        <div className="container">
          <Reveal className="sub-section-heading">
            <div>
              <div className="eyebrow">SIMPLE FROM THE START</div>
              <h2 className="section-title">Three steps. Then we move.</h2>
            </div>
            <p>
              Great logistics should make your day easier. Start with a
              conversation. We’ll help with the rest.
            </p>
          </Reveal>
          <div className="sub-process-grid">
            {selected.steps.map((step, index) => (
              <Reveal
                className="sub-process-step"
                key={step}
                delay={index * 0.08}
              >
                <span className="sub-process-number">0{index + 1}</span>
                <h3>{step}</h3>
                <p>
                  {index === 0
                    ? "Share a little about your business and where you want to go."
                    : index === 1
                      ? "Our team helps you explore the options that work for you."
                      : "Keep things moving with people and tools you can count on."}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <PageCTA />
    </main>
  );
}

const cities = [
  { name: "Delhi NCR", region: "North", x: 43, y: 27 },
  { name: "Jaipur", region: "North", x: 36, y: 37 },
  { name: "Ahmedabad", region: "West", x: 22, y: 48 },
  { name: "Mumbai", region: "West", x: 25, y: 63 },
  { name: "Pune", region: "West", x: 32, y: 67 },
  { name: "Hyderabad", region: "South", x: 48, y: 72 },
  { name: "Bengaluru", region: "South", x: 40, y: 86 },
  { name: "Chennai", region: "South", x: 53, y: 88 },
  { name: "Kolkata", region: "East", x: 78, y: 49 },
  { name: "Lucknow", region: "North", x: 59, y: 36 },
  { name: "Nagpur", region: "Central", x: 49, y: 56 },
  { name: "Indore", region: "Central", x: 36, y: 49 },
];
const routes = [
  {
    origin: "Delhi NCR",
    destination: "Mumbai",
    distance: "1,420 km",
    duration: "2–3 days",
    type: "Industrial goods · FMCG",
    description:
      "A vital connection between the capital region and India’s western commercial hub.",
  },
  {
    origin: "Mumbai",
    destination: "Bengaluru",
    distance: "980 km",
    duration: "1–2 days",
    type: "Retail · Manufacturing",
    description:
      "Keep goods moving between two of India’s most dynamic business centres.",
  },
  {
    origin: "Delhi NCR",
    destination: "Kolkata",
    distance: "1,530 km",
    duration: "2–3 days",
    type: "Consumer goods · Textiles",
    description:
      "Connect northern production centres with the gateway to eastern India.",
  },
];

function IndiaMap({ selectedRoute }: { selectedRoute: number }) {
  const route = routes[selectedRoute];
  const origin = cities.find((city) => city.name === route.origin)!;
  const destination = cities.find((city) => city.name === route.destination)!;
  return (
    <div className="sub-map">
      <div className="sub-map-label">
        <span className="sub-dot" />
        CONNECTED ACROSS INDIA
      </div>
      <svg
        viewBox="0 0 400 440"
        aria-label={`Illustrative India network map highlighting ${route.origin} to ${route.destination}`}
        role="img"
      >
        <defs>
          <pattern
            id="sub-map-dots"
            width="13"
            height="13"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="#7c7c7c" opacity=".5" />
          </pattern>
          <linearGradient id="sub-route-gradient">
            <stop stopColor="#f15a24" />
            <stop offset="1" stopColor="#f15a24" />
          </linearGradient>
        </defs>
        <path
          d="M160 30 191 20 206 38 226 40 237 63 225 88 247 101 265 123 278 122 288 140 325 129 353 110 365 124 346 156 319 174 292 173 285 193 268 202 257 231 238 263 223 284 218 319 194 347 182 388 166 412 151 386 141 350 130 328 123 300 111 279 98 250 73 236 60 202 29 190 23 170 46 157 62 156 54 130 80 117 103 120 120 103 118 85 135 73 130 54Z"
          fill="url(#sub-map-dots)"
          stroke="#666666"
          strokeWidth="1.1"
        />
        {cities.map((city) => (
          <g key={city.name}>
            <circle cx={city.x * 4} cy={city.y * 4.4} r="4" fill="#777777" />
            <text
              x={city.x * 4 + (city.name === "Mumbai" ? -9 : 9)}
              y={city.y * 4.4 + 4}
              fill="#b8b8b8"
              textAnchor={city.name === "Mumbai" ? "end" : "start"}
              fontSize="9"
              fontFamily="DM Sans, sans-serif"
            >
              {city.name}
            </text>
          </g>
        ))}
        <path
          d={`M ${origin.x * 4} ${origin.y * 4.4} Q ${(origin.x + destination.x) * 2 + 40} ${(origin.y + destination.y) * 2.2} ${destination.x * 4} ${destination.y * 4.4}`}
          stroke="url(#sub-route-gradient)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 5"
          className="sub-map-route"
        />
        {[origin, destination].map((city) => (
          <g key={city.name}>
            <circle
              cx={city.x * 4}
              cy={city.y * 4.4}
              r="10"
              fill="#f15a24"
              opacity=".15"
            />
            <circle cx={city.x * 4} cy={city.y * 4.4} r="4" fill="#f15a24" />
          </g>
        ))}
      </svg>
      <div className="sub-map-note">
        <span className="sub-map-line" />
        Illustrative network · Talk to us for availability
      </div>
    </div>
  );
}

export function NetworkPage() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All regions");
  const [selectedRoute, setSelectedRoute] = useState(0);
  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(query.toLowerCase()) &&
      (region === "All regions" || city.region === region),
  );
  return (
    <main className="sub-page sub-page-network">
      <PageHero
        eyebrow="THE NETWORK / EVERY ROAD CONNECTED"
        title="More roads."
        accent="One network."
        description="Explore the cities and corridors connecting your business to its next opportunity."
      />
      <section className="container sub-network-layout">
        <Reveal className="sub-network-content">
          <div className="eyebrow">OUR CONNECTED CITIES</div>
          <h2 className="section-title">
            Pick a city. Find your
            {" "}<br />
            destination.
          </h2>
          <p className="sub-description">
            Explore our illustrative network. Our team can help you find the
            right connection for your journey.
          </p>
          <div className="sub-network-filters">
            <label className="sub-search">
              <Search size={18} />
              <input
                aria-label="Search network cities"
                enterKeyHint="search"
                placeholder="Search a city"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <select
              aria-label="Filter cities by region"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              {["All regions", "North", "West", "South", "East", "Central"].map(
                (item) => (
                  <option key={item}>{item}</option>
                ),
              )}
            </select>
          </div>
          <div className="sub-city-grid" aria-live="polite">
            {filteredCities.length ? (
              filteredCities.map((city) => (
                <div className="sub-city" key={city.name}>
                  <MapPin size={15} />
                  <span>{city.name}</span>
                  <small>{city.region}</small>
                </div>
              ))
            ) : (
              <p className="sub-empty">
                No cities match your search. Try another city or region.
              </p>
            )}
          </div>
          <Link className="sub-text-link" to="/contact">
            Don’t see your city? Let’s talk <ArrowUpRight size={17} />
          </Link>
        </Reveal>
        <Reveal>
          <IndiaMap selectedRoute={selectedRoute} />
        </Reveal>
      </section>
      <section className="sub-popular">
        <div className="container">
          <div className="sub-section-heading">
            <div>
              <div className="eyebrow">CONNECTIONS THAT COUNT</div>
              <h2 className="section-title">Explore the major lanes.</h2>
            </div>
            <p>
              Select a route to explore it on the map. Distances and transit
              times are illustrative estimates.
            </p>
          </div>
          <div className="sub-route-grid">
            {routes.map((route, index) => (
              <button
                className={`sub-route-card ${selectedRoute === index ? "active" : ""}`}
                key={route.origin + route.destination}
                onClick={() => setSelectedRoute(index)}
                aria-pressed={selectedRoute === index}
              >
                <span className="sub-route-card-top">
                  POPULAR CORRIDOR <ArrowUpRight size={20} />
                </span>
                <strong>
                  {route.origin}
                  <ArrowRight size={20} />
                  {route.destination}
                </strong>
                <span className="sub-route-meta">
                  <span>
                    <Route size={15} />
                    {route.distance}
                  </span>
                  <span>
                    <Clock3 size={15} />
                    {route.duration}
                  </span>
                </span>
                <span className="sub-route-description">
                  {route.description}
                </span>
                <span className="sub-route-types">{route.type}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
      <PageCTA title="Your lane. Our next conversation." />
    </main>
  );
}

export function AboutPage() {
  return (
    <main className="sub-page sub-page-about">
      <PageHero
        eyebrow="OUR STORY / A BETTER WAY FORWARD"
        title="Built around"
        accent="the people."
        description="Technology makes the connection. People make it matter. This is the thinking behind Trucknex."
      />
      <section className="container sub-about-story">
        <Reveal className="sub-about-image">
          <img
            src="/images/warehouse.jpg"
            alt="A modern logistics warehouse with organised freight operations"
            loading="lazy"
          />
          <div className="sub-image-badge">
            <span className="sub-icon">
              <Globe2 size={26} />
            </span>
            <div>
              The work behind the journey.
              {" "}<br />
              <strong>People. Precision. Progress.</strong>
            </div>
          </div>
        </Reveal>
        <Reveal className="sub-story-text">
          <div className="eyebrow">WHY WE’RE HERE</div>
          <h2 className="section-title">
            A big country.
            {" "}<br />A shared purpose.
          </h2>
          <p>
            Behind every shipment is someone counting on it. A business taking
            its next step. A driver building a livelihood. A community waiting
            for what comes next.
          </p>
          <p>
            Trucknex is our vision for a more connected logistics ecosystem:
            bringing businesses and transport partners together with clarity,
            care and the confidence to move.
          </p>
          <p>
            We’re building for the people who keep India moving. Because when
            their journey gets better, everyone moves forward.
          </p>
          <Link className="sub-text-link" to="/solutions">
            Discover what we’re building <ArrowUpRight size={18} />
          </Link>
        </Reveal>
      </section>
      <section className="sub-values">
        <div className="container">
          <div className="sub-section-heading">
            <div>
              <div className="eyebrow">THE THINGS THAT DRIVE US</div>
              <h2 className="section-title">The principles we move by.</h2>
            </div>
            <p>
              The way we work matters as much as where we’re going. These are
              the values we bring to every connection.
            </p>
          </div>
          <div className="sub-values-grid">
            {[
              {
                icon: HeartHandshake,
                title: "People at the centre",
                text: "Listen first. Understand the journey. Build relationships that go beyond the next booking.",
              },
              {
                icon: ShieldCheck,
                title: "Trust in every mile",
                text: "Be clear, be accountable and follow through. Confidence grows from the little things done right.",
              },
              {
                icon: Sparkles,
                title: "Always moving forward",
                text: "Stay curious. Make things simpler. Find better answers to the challenges on the road.",
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <Reveal
                className="sub-value-card"
                key={title}
                delay={index * 0.08}
              >
                <Icon size={33} strokeWidth={1.4} />
                <span className="sub-value-number">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="container sub-belief">
        <Reveal>
          <span className="sub-quote-mark">“</span>
          <h2>
            Progress isn’t a destination.
            {" "}<br />
            It’s what we make possible
            {" "}<br />
            <span>for each other.</span>
          </h2>
          <p>THE TRUCKNEX BELIEF</p>
        </Reveal>
        <div className="sub-belief-art" aria-hidden="true">
          <div />
          <div />
          <div />
          <Truck size={65} strokeWidth={1} />
        </div>
      </section>
      <PageCTA
        title="A better way forward. Together."
        description="A new connection can be the beginning of something bigger."
      />
    </main>
  );
}

type ContactFields = {
  name: string;
  email: string;
  company: string;
  interest: string;
  message: string;
};
const initialFields: ContactFields = {
  name: "",
  email: "",
  company: "",
  interest: "Move my goods",
  message: "",
};

export function ContactPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [fields, setFields] = useState<ContactFields>(() => {
    const pickup = searchParams.get("pickup")?.trim();
    const dropoff = searchParams.get("dropoff")?.trim();
    const truck = searchParams.get("truck")?.trim();
    const service = searchParams.get("service")?.trim();
    if (!pickup && !dropoff && !truck && !service) return initialFields;
    const route =
      pickup && dropoff
        ? ` from ${pickup} to ${dropoff}`
        : pickup
          ? ` from ${pickup}`
          : dropoff
            ? ` to ${dropoff}`
            : "";
    const vehicle = truck ? ` using a ${truck} truck` : "";
    const selectedService = service
      ? ` I’m interested in the ${service} option.`
      : "";
    return {
      ...initialFields,
      message: `I’d like to arrange a shipment${route}${vehicle}.${selectedService} Please help me explore availability and the next steps.`,
    };
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFields, string>>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const update = (key: keyof ContactFields, value: string) => {
    setFields((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof ContactFields, string>> = {};
    if (!fields.name.trim()) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))
      nextErrors.email = "Please enter a valid email address.";
    if (fields.message.trim().length < 10)
      nextErrors.message = "Tell us a little more (at least 10 characters).";
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) setSubmitted(true);
  };
  return (
    <main className="sub-page sub-page-contact">
      <PageHero
        eyebrow="GET IN TOUCH / START SOMETHING GOOD"
        title="Let’s get"
        accent="moving."
        description="A shipment. A partnership. A new idea. Tell us what you have in mind."
      />
      <section className="container sub-contact-layout">
        <Reveal className="sub-contact-info">
          <div className="eyebrow">LET’S CONNECT</div>
          <h2 className="section-title">
            Your next move.
            {" "}<br />
            Starts here.
          </h2>
          <p className="sub-description">
            Tell us about your business and where you’d like to go. Start the
            conversation here.
          </p>
          <div className="sub-contact-detail">
            <div className="sub-icon">
              <Mail size={21} />
            </div>
            <div>
              <span>YOUR NEXT OPPORTUNITY</span>
              <h3>Start with a hello.</h3>
              <p>
                Use the form to explore partnerships,
                {" "}<br />
                transport needs or a new idea.
              </p>
            </div>
          </div>
          <div className="sub-contact-detail">
            <div className="sub-icon">
              <MapPin size={21} />
            </div>
            <div>
              <span>OUR FOCUS</span>
              <h3>India. Every direction.</h3>
              <p>
                Connecting businesses and transport
                {" "}<br />
                partners across the country.
              </p>
            </div>
          </div>
          <div className="sub-contact-note">
            <span className="sub-dot" />
            <p>
              This is an interactive website demo. The form lets you preview the
              experience; messages are not sent.
            </p>
          </div>
        </Reveal>
        <Reveal className="sub-contact-form-wrap">
          {submitted ? (
            <div className="sub-form-success" role="status">
              <div className="sub-success-icon">
                <CheckCircle2 size={39} strokeWidth={1.5} />
              </div>
              <div className="eyebrow">
                LOOKING GOOD, {fields.name.split(" ")[0].toUpperCase()}
              </div>
              <h2>
                Your next move
                {" "}<br />
                looks promising.
              </h2>
              <p>
                Your form passed validation. This is a demo, so your message has{" "}
                <strong>not been sent or saved</strong>.
              </p>
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  setSubmitted(false);
                  setFields(initialFields);
                  setErrors({});
                  setSearchParams({}, { replace: true });
                }}
              >
                Try another message <ArrowUpRight size={18} />
              </button>
            </div>
          ) : (
            <form className="sub-contact-form" onSubmit={submit} noValidate>
              <div className="sub-form-heading">
                <h3>A few details. A clear starting point.</h3>
                <span>
                  01 / THE INTRODUCTION <ArrowUpRight size={18} />
                </span>
              </div>
              <div className="sub-form-row">
                <div className="sub-form-field">
                  <label htmlFor="contact-name">
                    Full name <span>*</span>
                  </label>
                  <input
                    id="contact-name"
                    autoComplete="name"
                    placeholder="Your name"
                    value={fields.name}
                    onChange={(event) => update("name", event.target.value)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    required
                  />
                  {errors.name && (
                    <p id="name-error" className="sub-error">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="sub-form-field">
                  <label htmlFor="contact-email">
                    Email address <span>*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={fields.email}
                    onChange={(event) => update("email", event.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    required
                  />
                  {errors.email && (
                    <p id="email-error" className="sub-error">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="sub-form-row">
                <div className="sub-form-field">
                  <label htmlFor="contact-company">
                    Company <span className="sub-optional">(optional)</span>
                  </label>
                  <input
                    id="contact-company"
                    autoComplete="organization"
                    placeholder="Your company"
                    value={fields.company}
                    onChange={(event) => update("company", event.target.value)}
                  />
                </div>
                <div className="sub-form-field">
                  <label htmlFor="contact-interest">I’d like to</label>
                  <select
                    id="contact-interest"
                    value={fields.interest}
                    onChange={(event) => update("interest", event.target.value)}
                  >
                    <option>Move my goods</option>
                    <option>Partner as a transporter</option>
                    <option>Explore a partnership</option>
                    <option>Ask a question</option>
                  </select>
                </div>
              </div>
              <div className="sub-form-field">
                <label htmlFor="contact-message">
                  Your message <span>*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder="A little about your business, your routes, or what you have in mind…"
                  value={fields.message}
                  onChange={(event) => update("message", event.target.value)}
                  aria-invalid={!!errors.message}
                  aria-describedby={
                    errors.message ? "message-error" : undefined
                  }
                  required
                />
                {errors.message && (
                  <p id="message-error" className="sub-error">
                    {errors.message}
                  </p>
                )}
              </div>
              <div className="sub-form-footer">
                <p>
                  Preview your next move.
                  {" "}<br />
                  This form is a demo.
                </p>
                <button className="button button-primary" type="submit">
                  Preview submission <ArrowUpRight size={18} />
                </button>
              </div>
              {Object.keys(errors).some(
                (key) => errors[key as keyof ContactFields],
              ) && (
                <p className="sub-error" role="alert">
                  Please check the highlighted fields above.
                </p>
              )}
            </form>
          )}
        </Reveal>
      </section>
      <section className="container sub-contact-bottom">
        <div>
          <span className="sub-icon">
            <Users size={24} />
          </span>
          <h3>Here for businesses.</h3>
          <p>From a single shipment to your next growth chapter.</p>
        </div>
        <div>
          <span className="sub-icon">
            <Truck size={24} />
          </span>
          <h3>Here for transporters.</h3>
          <p>Build stronger connections and a better road ahead.</p>
        </div>
        <div>
          <span className="sub-icon">
            <HeartHandshake size={24} />
          </span>
          <h3>Here for possibilities.</h3>
          <p>Have something in mind? We’re all ears.</p>
        </div>
      </section>
    </main>
  );
}

const shipmentEvents = [
  {
    title: "Shipment booked",
    description: "Booking confirmed and vehicle assigned.",
    date: "14 Oct · 09:15 AM",
    completed: true,
  },
  {
    title: "Picked up in Delhi NCR",
    description: "Your goods are loaded and the journey has begun.",
    date: "14 Oct · 02:30 PM",
    completed: true,
  },
  {
    title: "In transit · near Jaipur",
    description: "The shipment is making its way to Mumbai.",
    date: "15 Oct · 08:45 AM",
    completed: true,
    current: true,
  },
  {
    title: "Arriving in Mumbai",
    description: "Final delivery milestone will appear here.",
    date: "Expected 16 Oct",
    completed: false,
  },
];

export function TrackPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const incomingId = searchParams.get("id");
  const [trackingId, setTrackingId] = useState(incomingId || "");
  const [result, setResult] = useState<"idle" | "found" | "missing" | "empty">(
    () => {
      if (incomingId === null) return "idle";
      const normalized = incomingId.trim().replace(/-/g, "").toUpperCase();
      return !normalized
        ? "empty"
        : normalized === "TNX12345"
          ? "found"
          : "missing";
    },
  );
  useEffect(() => {
    if (incomingId === null) return;
    setTrackingId(incomingId);
    const normalized = incomingId.trim().replace(/-/g, "").toUpperCase();
    setResult(
      !normalized ? "empty" : normalized === "TNX12345" ? "found" : "missing",
    );
  }, [incomingId]);
  const search = (event: FormEvent) => {
    event.preventDefault();
    const normalized = trackingId.trim().replace(/-/g, "").toUpperCase();
    setResult(
      !normalized ? "empty" : normalized === "TNX12345" ? "found" : "missing",
    );
    if (normalized)
      setSearchParams({ id: trackingId.trim() }, { replace: true });
  };
  return (
    <main className="sub-page sub-page-track">
      <PageHero
        eyebrow="SHIPMENT TRACKING / STAY IN THE KNOW"
        title="Know where."
        accent="Know when."
        description="A clear view of your shipment, from the first mile to the final delivery."
      />
      <section className="container sub-tracking">
        <Reveal className="sub-track-search">
          <div className="sub-track-search-top">
            <div className="sub-icon">
              <PackageCheck size={26} strokeWidth={1.6} />
            </div>
            <div>
              <h2>Where’s your shipment?</h2>
              <p>Enter your tracking ID to explore the demo.</p>
            </div>
          </div>
          <form onSubmit={search} noValidate>
            <label className="sub-search">
              <Search size={19} />
              <input
                aria-label="Shipment tracking ID"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="search"
                aria-invalid={result === "empty"}
                aria-describedby="track-feedback"
                placeholder="Enter tracking ID"
                value={trackingId}
                onChange={(event) => {
                  setTrackingId(event.target.value);
                  if (result === "empty") setResult("idle");
                }}
              />
              <button className="button button-primary" type="submit">
                Track shipment <ArrowRight size={18} />
              </button>
            </label>
          </form>
          <p className="sub-track-hint">
            Just looking around? Try{" "}
            <button
              type="button"
              onClick={() => {
                setTrackingId("TNX12345");
                setResult("found");
                setSearchParams({ id: "TNX12345" }, { replace: true });
              }}
            >
              TNX12345 <ArrowUpRight size={13} />
            </button>
            <span>Illustrative demo data · No live tracking</span>
          </p>
          <div id="track-feedback" aria-live="polite">
            {result === "empty" && (
              <p className="sub-error">
                Please enter a tracking ID to continue.
              </p>
            )}
            {result === "missing" && (
              <div className="sub-track-not-found">
                <Search size={25} />
                <div>
                  <h3>We couldn’t find that shipment.</h3>
                  <p>
                    This demo recognises TNX12345. Check the ID, or try the
                    sample shipment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Reveal>
        {result === "found" ? (
          <Reveal className="sub-shipment">
            <div className="sub-shipment-header">
              <div>
                <div className="eyebrow">SAMPLE SHIPMENT</div>
                <h2>TNX12345</h2>
              </div>
              <span className="sub-status">
                <span className="sub-dot" />
                In transit
              </span>
            </div>
            <div className="sub-shipment-route">
              <div>
                <span>ORIGIN</span>
                <h3>Delhi NCR</h3>
                <p>Picked up · 14 October</p>
              </div>
              <div className="sub-shipment-road">
                <span />
                <Truck size={26} />
                <span />
              </div>
              <div>
                <span>DESTINATION</span>
                <h3>Mumbai</h3>
                <p>Expected · 16 October</p>
              </div>
            </div>
            <div className="sub-shipment-body">
              <div className="sub-timeline">
                <h3>A clear view of the journey.</h3>
                {shipmentEvents.map((event, index) => (
                  <div
                    className={`sub-timeline-event ${event.current ? "current" : ""} ${!event.completed ? "pending" : ""}`}
                    key={event.title}
                  >
                    <div className="sub-timeline-symbol">
                      {event.current ? (
                        <Truck size={16} />
                      ) : event.completed ? (
                        <Check size={15} />
                      ) : (
                        <span />
                      )}
                    </div>
                    <div>
                      <h4>{event.title}</h4>
                      <p>{event.description}</p>
                      <span>{event.date}</span>
                    </div>
                    {index < shipmentEvents.length - 1 && (
                      <div className="sub-timeline-line" />
                    )}
                  </div>
                ))}
              </div>
              <aside className="sub-shipment-summary">
                <div className="eyebrow">THE JOURNEY AT A GLANCE</div>
                <div>
                  <span>Vehicle type</span>
                  <strong>32 ft · Closed body</strong>
                </div>
                <div>
                  <span>Shipment type</span>
                  <strong>Full truckload</strong>
                </div>
                <div>
                  <span>Distance</span>
                  <strong>Approx. 1,420 km</strong>
                </div>
                <div>
                  <span>Last update</span>
                  <strong>15 October · 08:45 AM</strong>
                </div>
                <p>
                  <Clock3 size={16} />
                  All details are illustrative demo data. This is not a live
                  shipment.
                </p>
              </aside>
            </div>
          </Reveal>
        ) : result === "idle" || result === "empty" ? (
          <div className="sub-tracking-benefits">
            {[
              {
                icon: Navigation,
                title: "A clearer picture",
                text: "Follow the important milestones along the way.",
              },
              {
                icon: Clock3,
                title: "A little less guessing",
                text: "See an estimated arrival at a glance.",
              },
              {
                icon: HeartHandshake,
                title: "Help along the way",
                text: "Our team is a conversation away.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <Reveal key={title}>
                <Icon size={25} strokeWidth={1.5} />
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        ) : null}
      </section>
      <PageCTA
        title="Need a hand with your journey?"
        description="We’re here to help you find your way forward."
      />
    </main>
  );
}
