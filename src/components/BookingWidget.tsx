import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowRightLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  PackageSearch,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import "./booking-widget.css";

const cities = [
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Pune",
  "Chennai",
  "Ahmedabad",
  "Jaipur",
  "Hyderabad",
];
const trucks = [
  {
    name: "Everyday mover",
    capacity: "Up to 5 tonnes",
    price: 18500,
    detail: "For everyday commercial loads",
    label: "STANDARD",
  },
  {
    name: "Express carrier",
    capacity: "Up to 9 tonnes",
    price: 24200,
    detail: "Extra space for your next move",
    label: "EXTENDED",
  },
  {
    name: "Heavy hauler",
    capacity: "Up to 16 tonnes",
    price: 32500,
    detail: "Built for larger consignments",
    label: "HEAVY DUTY",
  },
];

export default function BookingWidget() {
  const [tab, setTab] = useState<"find" | "track">("find");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [truckType, setTruckType] = useState("20 ft");
  const [shipmentId, setShipmentId] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<{
    pickup: string;
    dropoff: string;
    type: string;
  } | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const id = useId();
  const navigate = useNavigate();
  const submitRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const keyboardInteraction = useRef(false);

  useEffect(() => {
    if (dialogOpen) headingRef.current?.focus();
  }, [selectedTruck]);

  function findTruck(event: FormEvent) {
    event.preventDefault();
    const from = pickup.trim();
    const to = dropoff.trim();
    if (!from || !to) {
      setError("Add your pickup and drop-off cities to find your next move.");
      return;
    }
    if (from.toLowerCase() === to.toLowerCase()) {
      setError("Choose a different drop-off city for your journey.");
      return;
    }
    setError("");
    setResults({ pickup: from, dropoff: to, type: truckType });
    setSelectedTruck(null);
    setDialogOpen(true);
  }

  function trackShipment(event: FormEvent) {
    event.preventDefault();
    if (!shipmentId.trim()) {
      setError("Enter a shipment ID to see its journey.");
      return;
    }
    setError("");
    navigate(`/track?id=${encodeURIComponent(shipmentId.trim())}`);
  }

  function switchTab(value: "find" | "track") {
    setTab(value);
    setError("");
  }

  const selected = selectedTruck !== null ? trucks[selectedTruck] : null;
  const contactQuery = results
    ? new URLSearchParams({
        pickup: results.pickup,
        dropoff: results.dropoff,
        truck: results.type,
        ...(selected ? { service: selected.name } : {}),
      }).toString()
    : "";

  return (
    <>
      <section
        className="booking-widget container"
        aria-label="Plan your shipment"
      >
        <div className="booking-header">
          <div
            className="booking-tabs"
            role="tablist"
            aria-label="Shipment tools"
            data-value={tab}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const nextTab =
                event.key === "Home"
                  ? "find"
                  : event.key === "End"
                    ? "track"
                    : tab === "find"
                      ? "track"
                      : "find";
              switchTab(nextTab);
              event.currentTarget
                .querySelectorAll<HTMLButtonElement>("button")
                [nextTab === "find" ? 0 : 1]?.focus();
            }}
          >
            <button
              id={`${id}-find-tab`}
              type="button"
              role="tab"
              tabIndex={tab === "find" ? 0 : -1}
              aria-selected={tab === "find"}
              aria-controls={`${id}-find-panel`}
              className="booking-tab"
              onClick={() => switchTab("find")}
            >
              <Truck size={16} /> Find a truck
            </button>
            <button
              id={`${id}-track-tab`}
              type="button"
              role="tab"
              tabIndex={tab === "track" ? 0 : -1}
              aria-selected={tab === "track"}
              aria-controls={`${id}-track-panel`}
              className="booking-tab"
              onClick={() => switchTab("track")}
            >
              <PackageSearch size={16} /> Track a shipment
            </button>
            <div className="booking-tabs-active" aria-hidden="true">
              <span>
                <Truck size={16} /> Find a truck
              </span>
              <span>
                <PackageSearch size={16} /> Track a shipment
              </span>
            </div>
          </div>
          <span className="booking-live">
            <span /> A simpler way to get moving.
          </span>
        </div>
        {tab === "find" ? (
          <form
            id={`${id}-find-panel`}
            role="tabpanel"
            aria-labelledby={`${id}-find-tab`}
            className="booking-form"
            onSubmit={findTruck}
            noValidate
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ")
                keyboardInteraction.current = true;
            }}
          >
            <div className="booking-location-fields">
              <div className="booking-field">
                <MapPin
                  className="booking-field-icon"
                  size={19}
                  strokeWidth={1.5}
                />
                <div>
                  <label htmlFor={`${id}-pickup`}>Pickup city</label>
                  <input
                    id={`${id}-pickup`}
                    value={pickup}
                    onChange={(event) => {
                      setPickup(event.target.value);
                      setError("");
                    }}
                    list={`${id}-cities`}
                    placeholder="Where from?"
                    autoComplete="off"
                    enterKeyHint="next"
                    required
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                  />
                </div>
              </div>
              <button
                className="booking-swap"
                type="button"
                aria-label="Swap pickup and drop-off cities"
                title="Swap cities"
                onClick={() => {
                  setPickup(dropoff);
                  setDropoff(pickup);
                  setError("");
                }}
              >
                <ArrowRightLeft size={15} />
              </button>
              <div className="booking-field">
                <MapPin
                  className="booking-field-icon"
                  size={19}
                  strokeWidth={1.5}
                />
                <div>
                  <label htmlFor={`${id}-dropoff`}>Drop-off city</label>
                  <input
                    id={`${id}-dropoff`}
                    value={dropoff}
                    onChange={(event) => {
                      setDropoff(event.target.value);
                      setError("");
                    }}
                    list={`${id}-cities`}
                    placeholder="Where to?"
                    autoComplete="off"
                    enterKeyHint="search"
                    required
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                  />
                </div>
              </div>
            </div>
            <div className="booking-field booking-truck-field">
              <Truck
                className="booking-field-icon"
                size={20}
                strokeWidth={1.5}
              />
              <div>
                <label htmlFor={`${id}-truck`}>Truck type</label>
                <div className="booking-select-wrap">
                  <select
                    id={`${id}-truck`}
                    value={truckType}
                    onChange={(event) => setTruckType(event.target.value)}
                  >
                    <option value="14 ft">14 ft · Light truck</option>
                    <option value="20 ft">20 ft · Medium truck</option>
                    <option value="32 ft">32 ft · Large truck</option>
                    <option value="Trailer">Trailer · Heavy load</option>
                  </select>
                  <ChevronDown size={13} aria-hidden="true" />
                </div>
              </div>
            </div>
            <button
              ref={submitRef}
              className="booking-submit"
              type="submit"
              onPointerDown={() => {
                keyboardInteraction.current = false;
              }}
            >
              Find a truck <ArrowUpRight size={18} />
            </button>
            <datalist id={`${id}-cities`}>
              {cities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </form>
        ) : (
          <form
            id={`${id}-track-panel`}
            role="tabpanel"
            aria-labelledby={`${id}-track-tab`}
            className="booking-form booking-track-form"
            onSubmit={trackShipment}
            noValidate
          >
            <div className="booking-field booking-tracking-field">
              <PackageSearch
                className="booking-field-icon"
                size={21}
                strokeWidth={1.5}
              />
              <div>
                <label htmlFor={`${id}-shipment`}>Shipment ID</label>
                <input
                  id={`${id}-shipment`}
                  value={shipmentId}
                  onChange={(event) => {
                    setShipmentId(event.target.value);
                    setError("");
                  }}
                  placeholder="e.g. TNX12345"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="search"
                  required
                  aria-invalid={!!error}
                  aria-describedby={error ? `${id}-error` : undefined}
                />
              </div>
            </div>
            <p className="booking-track-hint">
              From pickup to arrival, in one place.
            </p>
            <button className="booking-submit" type="submit">
              Track shipment <ArrowUpRight size={18} />
            </button>
          </form>
        )}
        {error && (
          <p id={`${id}-error`} className="booking-error" role="alert">
            {error}
          </p>
        )}
      </section>

      <Dialog.Root
        open={dialogOpen}
        onOpenChange={(open, details) => {
          if (details.event.type === "keydown")
            keyboardInteraction.current = true;
          setDialogOpen(open);
        }}
        onOpenChangeComplete={(open) => {
          if (!open) {
            setResults(null);
            setSelectedTruck(null);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop
            className="booking-modal-backdrop"
            data-keyboard={keyboardInteraction.current || undefined}
          />
          <Dialog.Viewport className="booking-modal-viewport">
            <Dialog.Popup
              className="booking-modal"
              initialFocus={headingRef}
              finalFocus={submitRef}
              data-keyboard={keyboardInteraction.current || undefined}
            >
              <Dialog.Close
                className="booking-modal-close"
                aria-label="Close truck results"
              >
                <X size={18} />
              </Dialog.Close>
              {results && (
                <>
                  <span className="booking-demo-badge">YOUR NEXT MOVE</span>
                  <Dialog.Title ref={headingRef} tabIndex={-1}>
                    {selected
                      ? "A good move starts here."
                      : "Your route. Your possibilities."}
                  </Dialog.Title>
                  <div className="booking-result-route">
                    <span>{results.pickup}</span>
                    <ArrowRight size={16} />
                    <span>{results.dropoff}</span>
                    <small>{results.type}</small>
                  </div>
                  <Dialog.Description className="booking-demo-note">
                    Sample trucks and estimates. Our team will confirm
                    availability and your final quote before you book.
                  </Dialog.Description>
                  {selected ? (
                    <div className="booking-selected">
                      <button
                        className="booking-back"
                        onClick={() => setSelectedTruck(null)}
                      >
                        <ArrowLeft size={14} /> All transport options
                      </button>
                      <div className="booking-selected-summary">
                        <span className="booking-selected-icon">
                          <Truck size={29} strokeWidth={1.3} />
                        </span>
                        <div>
                          <span className="booking-card-label">
                            {selected.label}
                          </span>
                          <h3>{selected.name}</h3>
                          <p>
                            {selected.capacity} · {results.type} truck
                          </p>
                        </div>
                        <strong>
                          ₹{selected.price.toLocaleString("en-IN")}
                          <small>Indicative estimate</small>
                        </strong>
                      </div>
                      <div className="booking-inquiry-benefits">
                        <span>
                          <Check size={15} /> Dedicated route support
                        </span>
                        <span>
                          <ShieldCheck size={15} /> Verified transport partners
                        </span>
                        <span>
                          <Clock3 size={15} /> Flexible scheduling
                        </span>
                      </div>
                      <p className="booking-selected-note">
                        A little more about your cargo and preferred date will
                        help us plan the right truck for the journey.
                      </p>
                      <Link
                        className="booking-inquiry-cta"
                        to={`/contact?${contactQuery}`}
                        onClick={() => setDialogOpen(false)}
                      >
                        Request this truck <ArrowUpRight size={18} />
                      </Link>
                    </div>
                  ) : (
                    <div className="booking-results-grid">
                      {trucks.map((truck, index) => (
                        <article
                          className="booking-result-card"
                          key={truck.name}
                        >
                          <div className="booking-card-truck">
                            <Truck size={28} strokeWidth={1.3} />
                          </div>
                          <div className="booking-card-info">
                            <span className="booking-card-label">
                              {truck.label}
                            </span>
                            <h3>{truck.name}</h3>
                            <p>{truck.detail}</p>
                            <div className="booking-card-capacity">
                              {truck.capacity}
                              <span>·</span>Full truckload
                            </div>
                          </div>
                          <div className="booking-card-bottom">
                            <strong>
                              ₹{truck.price.toLocaleString("en-IN")}
                              <small>Indicative estimate</small>
                            </strong>
                            <button
                              onClick={() => setSelectedTruck(index)}
                              aria-label={`View ${truck.name}`}
                            >
                              View <ArrowUpRight size={15} />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                  <div className="booking-modal-foot">
                    <ShieldCheck size={14} /> A real team for every step of the
                    journey.
                  </div>
                </>
              )}
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
