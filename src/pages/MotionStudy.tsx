import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import DispatchAnimation from "../components/dispatch/DispatchAnimation";
import { MOTION, clampTime } from "../motion";
import "./motion-study.css";

export default function MotionStudy() {
  const [params] = useSearchParams();
  const capture = params.get("capture") === "1";
  const initialTime = clampTime(Number(params.get("time") || 0));
  if (capture) {
    return (
      <main
        className="motion-capture"
        style={{ width: MOTION.viewport.width, height: MOTION.viewport.height }}
      >
        <DispatchAnimation key={initialTime} initialTime={initialTime} frozen />
      </main>
    );
  }
  return (
    <main className="motion-study">
      <header className="motion-study-header">
        <Link to="/" className="motion-study-brand">
          trucknex<span>.</span> <small>MOTION STUDIO</small>
        </Link>
        <Link to="/" className="motion-study-back">
          <ArrowLeft size={14} /> Back to the site
        </Link>
      </header>
      <div className="motion-study-intro">
        <span className="eyebrow">01 / A JOURNEY, IN MOTION</span>
        <h1>Every move has a story.</h1>
        <p>One parcel. One truck. One connected journey.</p>
      </div>
      <div className="motion-study-canvas">
        <div className="motion-study-canvas-label">
          <span>TRUCKNEX / DISPATCH STUDY</span>
          <span>ORIGINAL VECTOR ART</span>
        </div>
        <DispatchAnimation initialTime={initialTime} controls />
      </div>
      <div className="motion-study-notes">
        <p>
          Scrub the timeline or slow playback to explore loading, travel, and
          arrival. This is an illustrative journey.
        </p>
        <a
          href="https://github.com/shafiei/truck-order-animation"
          target="_blank"
          rel="noreferrer"
        >
          Motion reference <ArrowUpRight size={13} />
        </a>
      </div>
    </main>
  );
}
