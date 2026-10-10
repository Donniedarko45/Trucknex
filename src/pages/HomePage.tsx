import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Accordion } from "@base-ui/react/accordion";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronDown,
  Clock3,
  Headphones,
  MapPin,
  Package,
  Route,
  ShieldCheck,
  Truck,
} from "lucide-react";
import BookingWidget from "../components/BookingWidget";

const DispatchAnimation = lazy(
  () => import("../components/dispatch/DispatchAnimation"),
);

let introductionSeen = false;

const questions = [
  [
    "What can I move with Trucknex?",
    "Commercial freight, from retail inventory and manufacturing materials to agricultural produce. Choose a dedicated full truckload, share a part load, or discuss a tailored enterprise solution. Specialist goods require a suitable transport service.",
  ],
  [
    "How do I find the right truck?",
    "Enter your pickup city, destination, and truck size above. Explore the sample transport options, then send your route details through our contact form to preview an inquiry.",
  ],
  [
    "How does shipment tracking work?",
    "Open the tracking page and enter TNX12345 to explore a shipment’s journey, route, and delivery milestones. This is an interactive frontend demo; live data will require a tracking integration.",
  ],
  [
    "Can I join as a fleet partner?",
    "Absolutely. Explore the transporter experience on our solutions page, then contact us with your fleet size and preferred routes to preview a partnership inquiry.",
  ],
];
const lanes = [
  {
    from: "Delhi",
    to: "Mumbai",
    km: "1,420 km",
    days: "2–3 days",
    x1: 225,
    y1: 145,
    x2: 148,
    y2: 289,
  },
  {
    from: "Mumbai",
    to: "Bengaluru",
    km: "980 km",
    days: "1–2 days",
    x1: 148,
    y1: 289,
    x2: 224,
    y2: 393,
  },
  {
    from: "Delhi",
    to: "Kolkata",
    km: "1,530 km",
    days: "2–3 days",
    x1: 225,
    y1: 145,
    x2: 342,
    y2: 222,
  },
];

function FreightMap({ selected }: { selected: number }) {
  const lane = lanes[selected];
  return (
    <div className="freight-map">
      <div className="map-utility">
        <span className="status-dot" /> CONNECTED ACROSS INDIA{" "}
        <span>TNX / NETWORK</span>
      </div>
      <svg
        viewBox="0 0 500 500"
        role="img"
        aria-label={`Illustrative India network showing ${lane.from} to ${lane.to}`}
      >
        <defs>
          <pattern
            id="tnx-map-pattern"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.3" fill="#666660" />
          </pattern>
        </defs>
        <path
          d="M188 31l23 15 25-3 13 19 26-8 8 29-20 20 11 25 36 10 15 22 37-5 28 16 38-15 22 11-6 21-39 10-5 23-19 8-26-9-30 15-9 30-33 27-17 52-20 33-19 58-20 40-12 37-14-2-7-29-19-25-14-33-16-27-5-39-25-39-17-37-34-7-25-30-33-13 2-22 31 4 23-18 1-24 27-21 12-22 21-9-11-22 7-29-13-16 12-30z"
          fill="url(#tnx-map-pattern)"
          stroke="#696960"
          strokeWidth=".6"
        />
        <g fill="none" stroke="#606058" strokeWidth="1">
          <path d="M225 145Q94 216 148 289Q198 336 224 393" />
          <path d="M225 145Q284 165 342 222Q290 266 224 320Q253 352 262 390" />
        </g>
        <path
          d={`M${lane.x1} ${lane.y1} Q${(lane.x1 + lane.x2) / 2 + 50} ${(lane.y1 + lane.y2) / 2} ${lane.x2} ${lane.y2}`}
          stroke="#ff7542"
          fill="none"
          strokeWidth="2"
          strokeDasharray="5 5"
        />
        {[
          [225, 145, "Delhi"],
          [148, 289, "Mumbai"],
          [224, 393, "Bengaluru"],
          [342, 222, "Kolkata"],
          [262, 390, "Chennai"],
          [224, 320, "Hyderabad"],
        ].map(([x, y, name]) => (
          <g key={name}>
            <circle cx={x} cy={y} r="4" fill="#ff7542" />
            <text
              x={Number(x) + 10}
              y={Number(y) + 4}
              fill="#d6d5cd"
              fontSize="11"
              fontFamily="Geist"
            >
              {name}
            </text>
          </g>
        ))}
        <circle
          cx={lane.x1}
          cy={lane.y1}
          r="10"
          fill="#f15a24"
          fillOpacity=".2"
        />
        <circle
          cx={lane.x2}
          cy={lane.y2}
          r="10"
          fill="#f15a24"
          fillOpacity=".2"
        />
      </svg>
      <div className="network-map-card">
        <div>
          <Route size={17} />
          <span>EXPLORE A CORRIDOR</span>
        </div>
        <strong>
          {lane.from} <ArrowRight size={20} /> {lane.to}
        </strong>
        <p>
          <span>{lane.km}</span>
          <span>
            <Clock3 size={13} />
            {lane.days}
          </span>
          <span className="demo-tag">Sample route</span>
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [playIntroduction] = useState(() => !introductionSeen);
  useEffect(() => {
    introductionSeen = true;
  }, []);
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  const [selectedLane, setSelectedLane] = useState(0);
  const [keyboardFAQ, setKeyboardFAQ] = useState(false);
  return (
    <main className="new-home">
      <section
        className="home-hero container"
        aria-labelledby="hero-title"
        data-intro-complete={!playIntroduction || undefined}
      >
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="status-dot" /> THE NEXT MOVE IN LOGISTICS
          </div>
          <h1 id="hero-title">
            <span>Freight that</span>
            <span>moves you</span>
            <span className="hero-accent">
              forward
              <svg viewBox="0 0 74 74" aria-hidden="true">
                <path
                  d="M12 62 62 12M13 12h49v49"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                />
              </svg>
            </span>
          </h1>
          <p>
            The right truck. The right connection.
            <br />A simpler way to move your business across India.
          </p>
          <div className="hero-actions">
            <a href="#get-moving" className="button button-dark">
              Move your cargo <ArrowUpRight size={18} />
            </a>
            <Link to="/solutions?for=carriers" className="hero-partner-link">
              Drive with us <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-proof">
            <div className="hero-avatars" aria-hidden="true">
              <span>TN</span>
              <span>
                <Truck size={17} />
              </span>
              <span>
                <Package size={16} />
              </span>
            </div>
            <p>
              Built for the businesses
              <br />
              <strong>that keep India moving.</strong>
            </p>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-frame">
            <img
              src="/images/hero-truck.jpg"
              alt="A freight truck approaching on a wide open highway"
              fetchPriority="high"
            />
            <div className="hero-image-shade" />
            <span className="hero-photo-label">EVERY LOAD. EVERY ROAD.</span>
            <div className="hero-visual-number">
              <span>TNX</span>
              <span>01—∞</span>
            </div>
          </div>
          <div className="hero-direction" aria-hidden="true">
            <ArrowUpRight strokeWidth={1.5} />
          </div>
          <div className="hero-route-card">
            <div className="hero-route-top">
              <span>
                <span className="status-dot" /> EVERY MILE, IN MOTION
              </span>
              <Link
                to="/track?id=TNX12345"
                aria-label="Explore the tracking demo"
              >
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="hero-route-cities">
              <strong>Delhi</strong>
              <div>
                <i />
                <ArrowRight size={18} />
                <i />
              </div>
              <strong>Mumbai</strong>
            </div>
            <div className="hero-dispatch-demo">
              <Suspense fallback={<div className="dispatch-loading-pose" />}>
                <DispatchAnimation autoPlay loop compact />
              </Suspense>
            </div>
            <div className="hero-route-meta">
              <span>TNX12345 · Sample shipment</span>
              <Link to="/track?id=TNX12345">
                Explore tracking <ArrowRight size={12} />
              </Link>
            </div>
          </div>
          <div className="hero-visual-caption">
            <span>LESS WAITING. MORE MOVING.</span>
            <span>EST. FOR WHAT’S NEXT</span>
          </div>
        </div>
      </section>
      <section id="get-moving" className="home-booking-section">
        <BookingWidget />
      </section>
      <section className="home-assurance container" aria-label="Our approach">
        <span>
          <ShieldCheck size={19} /> Confidence in every connection
        </span>
        <span>
          <Route size={19} /> Visibility from start to finish
        </span>
        <span>
          <Headphones size={19} /> Real people, in your corner
        </span>
      </section>
      <section className="home-services container" id="solutions">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">01 / BUILT AROUND YOUR BUSINESS</span>
            <h2>
              One platform.
              <br />
              Every kind of move.
            </h2>
          </div>
          <p>
            From your first shipment to your next growth chapter,
            <br />
            find a solution that fits where you’re going.
          </p>
        </div>
        <div className="home-service-grid">
          <Link
            className="home-service-card service-ink"
            to="/solutions#full-truckload"
          >
            <div className="service-image">
              <img
                src="/images/fleet.jpg"
                alt="A dedicated freight truck on the road"
                loading="lazy"
              />
              <span className="service-label">YOUR CARGO. YOUR TRUCK.</span>
            </div>
            <div className="service-content">
              <span className="service-number">
                01 <Truck size={20} />
              </span>
              <h3>Full truckload</h3>
              <p>
                A dedicated vehicle for bigger loads.
                <br />
                Straightforward. Reliable. All yours.
              </p>
              <span className="service-action">
                Explore FTL <ArrowUpRight size={18} />
              </span>
            </div>
          </Link>
          <Link className="home-service-card" to="/solutions#part-truckload">
            <div className="service-image">
              <img
                src="/images/warehouse.jpg"
                alt="Goods organised in a modern freight warehouse"
                loading="lazy"
              />
              <span className="service-label">
                SHARE THE SPACE. GO FURTHER.
              </span>
            </div>
            <div className="service-content">
              <span className="service-number">
                02 <Package size={20} />
              </span>
              <h3>Part truckload</h3>
              <p>
                Smaller shipments. The same attention.
                <br />A smarter use of space and spend.
              </p>
              <span className="service-action">
                Explore PTL <ArrowUpRight size={18} />
              </span>
            </div>
          </Link>
          <Link
            className="home-service-card service-enterprise"
            to="/solutions#enterprise"
          >
            <div className="service-enterprise-art" aria-hidden="true">
              <span>
                <Package size={32} />
              </span>
              <i />
              <span className="enterprise-hub">
                <Truck size={39} />
              </span>
              <i />
              <span>
                <MapPin size={32} />
              </span>
              <small>CONNECTED. FROM END TO END.</small>
            </div>
            <div className="service-content">
              <span className="service-number">
                03 <Route size={20} />
              </span>
              <h3>Enterprise logistics</h3>
              <p>
                A connected solution for your supply chain.
                <br />
                Designed around how you do business.
              </p>
              <span className="service-action">
                Build your solution <ArrowUpRight size={18} />
              </span>
            </div>
          </Link>
        </div>
      </section>
      <section className="home-network">
        <div className="container home-network-inner">
          <div className="home-network-copy">
            <span className="eyebrow">
              02 / LOCAL KNOWLEDGE. NATIONAL AMBITION.
            </span>
            <h2>
              A bigger network.
              <br />
              <span>A closer connection.</span>
            </h2>
            <p>
              Busy metros. Growing industrial towns. The roads in between.
              Connect to the people and routes that open up your next
              opportunity.
            </p>
            <div
              className="home-lane-options"
              aria-label="Explore illustrative routes"
            >
              {lanes.map((lane, index) => (
                <button
                  key={lane.to}
                  onClick={() => setSelectedLane(index)}
                  aria-pressed={selectedLane === index}
                  className={selectedLane === index ? "active" : ""}
                >
                  {lane.from} <ArrowRight size={13} /> {lane.to}
                </button>
              ))}
            </div>
            <Link className="button button-primary" to="/network">
              Explore the network <ArrowUpRight size={18} />
            </Link>
            <small>
              Illustrative corridors. Explore the network for more detail.
            </small>
          </div>
          <FreightMap selected={selectedLane} />
        </div>
      </section>
      <section className="home-process container" id="how-it-works">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">03 / FROM COMPLEX TO CONNECTED</span>
            <h2>
              Less to manage.
              <br />
              More to look forward to.
            </h2>
          </div>
          <Link to="/contact" className="text-link">
            Make your next move <ArrowUpRight size={19} />
          </Link>
        </div>
        <div className="home-process-grid">
          {[
            {
              number: "01",
              icon: MapPin,
              title: "Tell us the where.",
              text: "Your pickup, destination, and cargo. A few details to get things moving.",
            },
            {
              number: "02",
              icon: Truck,
              title: "Find the right fit.",
              text: "Explore truck options and connect with a transport partner that fits your route.",
            },
            {
              number: "03",
              icon: Route,
              title: "Keep every mile in sight.",
              text: "Follow the milestones. Stay informed. Get a clearer picture of the journey.",
            },
          ].map(({ number, icon: Icon, title, text }) => (
            <div className="home-process-step" key={number}>
              <div>
                <span>{number}</span>
                <Icon size={26} strokeWidth={1.5} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="home-story container">
        <div className="home-story-image">
          <img
            src="/images/truck.jpg"
            alt="Freight moving along a mountain road"
            loading="lazy"
          />
          <div>
            <span>THE JOURNEY IS HUMAN.</span>
            <ArrowUpRight size={28} />
          </div>
        </div>
        <div className="home-story-copy">
          <span className="eyebrow">04 / TECHNOLOGY MEETS REAL LIFE</span>
          <h2>
            Behind every load,
            <br />
            there’s a <span>person.</span>
          </h2>
          <p>
            A business taking its next step. A driver building a livelihood.
            Someone counting on a promise being kept.
          </p>
          <p>
            We’re building Trucknex for the people behind the progress. Clearer
            connections. Better tools. A team that cares about where you’re
            headed.
          </p>
          <Link to="/about" className="text-link">
            This is our story <ArrowUpRight size={19} />
          </Link>
        </div>
      </section>
      <section className="home-faq container">
        <div>
          <span className="eyebrow">05 / BEFORE YOU GO</span>
          <h2>
            A little more
            <br />
            clarity.
          </h2>
          <p>
            Something else on your mind?
            <br />
            <Link to="/contact">
              Ask us anything <ArrowUpRight size={15} />
            </Link>
          </p>
        </div>
        <Accordion.Root
          className="home-faq-list"
          value={openQuestion === null ? [] : [openQuestion]}
          onValueChange={(next, details) => {
            setOpenQuestion(next[0] ?? null);
            setKeyboardFAQ(
              details.event.type === "keydown" ||
                ("detail" in details.event && details.event.detail === 0),
            );
          }}
          data-keyboard={keyboardFAQ || undefined}
        >
          {questions.map(([question, answer], index) => (
            <Accordion.Item
              className="home-faq-item"
              key={question}
              value={index}
            >
              <Accordion.Header>
                <Accordion.Trigger className="home-faq-trigger">
                  <span>{question}</span>
                  <ChevronDown size={18} />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="home-faq-panel">
                <p>{answer}</p>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>
      <section className="home-cta container">
        <div>
          <span className="eyebrow">YOUR NEXT CHAPTER, CONNECTED.</span>
          <h2>
            Let’s make
            <br />
            your next <span>move.</span>
          </h2>
          <Link to="/contact" className="button button-dark">
            Get in touch <ArrowUpRight size={19} />
          </Link>
        </div>
        <Link
          to="/contact"
          className="home-cta-arrow"
          aria-label="Start a conversation"
        >
          <ArrowUpRight strokeWidth={1} />
        </Link>
      </section>
    </main>
  );
}
