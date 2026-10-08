import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Check,
  Compass,
  RotateCw,
  Route,
  Pause,
  Play,
  Navigation,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Slider } from "./components/ui/slider";
import { Card } from "./components/ui/card";
import {
  destinations,
  stops,
  destination,
  normalOf,
  type DestinationId,
  type StopId,
} from "./destinations";

export function MoonMap({
  normal,
  visited,
  canTravel,
  onOpen,
  onTravel,
  onGuide,
}: {
  normal: [number, number, number];
  visited: StopId[];
  canTravel: boolean;
  onOpen: (id: DestinationId) => void;
  onTravel: (id: DestinationId) => void;
  onGuide: (id: DestinationId) => void;
}) {
  const [selected, setSelected] = useState<DestinationId>("work"),
    [back, setBack] = useState(false);
  const project = (n: [number, number, number]) => ({
    x: 100 + n[0] * 77 * (back ? -1 : 1),
    y: 100 + n[2] * 77,
    hidden: back ? n[1] > 0 : n[1] < 0,
  });
  const rover = project(normal);
  return (
    <div className="moon-map">
      <div className="map-visual">
        <div className="map-coordinate">
          <span>
            <span className="live-dot" />
            LUNAR ORBIT
          </span>
          <span>{back ? "SOUTH" : "NORTH"} / 01</span>
        </div>
        <div className="map-globe">
          <svg
            viewBox="0 0 200 200"
            role="img"
            aria-label={`Moon map, ${back ? "southern" : "northern"} hemisphere. Hollow markers are beyond the horizon. Your rover ${rover.hidden ? "is on the other side" : "is on this side"}.`}
          >
            <defs>
              <radialGradient id="map-moon" cx="35%" cy="28%" r="76%">
                <stop stopColor="#a5a5b2" />
                <stop offset=".7" stopColor="#666879" />
                <stop offset="1" stopColor="#343642" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="91" fill="none" stroke="#ffffff0f" />
            <circle cx="100" cy="100" r="83" fill="url(#map-moon)" />
            <ellipse
              cx="100"
              cy="100"
              rx="83"
              ry="30"
              fill="none"
              stroke="#ffffff24"
            />
            <ellipse
              cx="100"
              cy="100"
              rx="35"
              ry="83"
              fill="none"
              stroke="#ffffff24"
            />
            {destinations.map((stop) => {
              const point = project(normalOf(stop).toArray());
              return (
                <g key={stop.id} className={point.hidden ? "map-hidden" : ""}>
                  {selected === stop.id && (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="10"
                      fill="none"
                      stroke="#fff"
                      strokeOpacity=".5"
                    />
                  )}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={selected === stop.id ? 5 : 3.5}
                    fill={point.hidden ? "#414452" : stop.color}
                    stroke={stop.color}
                    strokeDasharray={point.hidden ? "2 2" : undefined}
                  />
                  <text
                    x={point.x}
                    y={point.y - 10}
                    textAnchor="middle"
                    fill="#fff"
                  >
                    {stop.short}
                  </text>
                </g>
              );
            })}
            <path
              d={`M ${rover.x} ${rover.y - 5} l 5 9 l -10 0 Z`}
              fill="#fff"
              stroke="#20212d"
              strokeWidth="1.4"
              opacity={rover.hidden ? 0.45 : 1}
            />
          </svg>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBack((v) => !v)}
          >
            <RotateCw />
            Show {back ? "near" : "far"} hemisphere
          </Button>
          <p>▲ You · Hollow markers are beyond the horizon</p>
        </div>
      </div>
      <div className="map-directory">
        <div className="map-directory-heading">
          <span>DESTINATIONS</span>
          <span>
            {visited.length}/{stops.length} visited
          </span>
        </div>
        <div
          className="map-stop-list"
          role="group"
          aria-label="Choose a destination"
        >
          {destinations.map((stop, index) => (
            <Button
              key={stop.id}
              variant="ghost"
              className={selected === stop.id ? "selected" : ""}
              aria-pressed={selected === stop.id}
              onClick={() => setSelected(stop.id)}
            >
              <span className="stop-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="stop-name">
                {stop.label}
                <small>
                  {visited.includes(stop.id as StopId)
                    ? "Visited"
                    : stop.id === "lookout"
                      ? "Bonus discovery"
                      : stop.action}
                </small>
              </span>
              {visited.includes(stop.id as StopId) ? (
                <Check />
              ) : (
                <ArrowUpRight />
              )}
            </Button>
          ))}
        </div>
      </div>
      <Card className="map-selection">
        <div>
          <span className="card-kicker">YOUR DESTINATION</span>
          <h3>{destination(selected).label}</h3>
          <p>
            {selected === "lookout"
              ? "A view worth the journey. Frame your very own lunar postcard."
              : "Open this stop now, or find your own way across the moon."}
          </p>
        </div>
        <div className="map-actions">
          <Button
            disabled={selected === "lookout" && !canTravel}
            onClick={() => onOpen(selected)}
          >
            Open {selected === "lookout" ? "photo mode" : "content"}
            <ArrowUpRight />
          </Button>
          <Button
            variant="outline"
            disabled={!canTravel}
            onClick={() => onTravel(selected)}
          >
            <Navigation />
            Quick travel
          </Button>
          <Button
            variant="ghost"
            disabled={!canTravel}
            onClick={() => onGuide(selected)}
          >
            <Route />
            Set route beacon
          </Button>
        </div>
        {!canTravel && (
          <p className="content-pending">
            Travel and photo mode need the 3D moon. Every portfolio stop is
            available here.
          </p>
        )}
      </Card>
    </div>
  );
}

export function OrbitSandbox() {
  const reduced = useReducedMotion();
  const [speed, setSpeed] = useState(1),
    [tilt, setTilt] = useState(20),
    [angle, setAngle] = useState(0),
    [paused, setPaused] = useState(!!reduced),
    [experiment, setExperiment] = useState<"orbit" | "gravity">("orbit");
  useEffect(() => {
    if (reduced) setPaused(true);
  }, [reduced]);
  useEffect(() => {
    let frame = 0,
      previous = 0;
    const tick = (time: number) => {
      if (previous && !document.hidden && !paused)
        setAngle(
          (v) =>
            (v + Math.min(40, time - previous) * 0.0007 * speed) %
            (Math.PI * 2),
        );
      previous = time;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [speed, paused]);
  const radius = experiment === "gravity" ? 65 + Math.sin(angle) * 12 : 74;
  const x = 120 + Math.cos(angle) * radius,
    y = 75 + Math.sin(angle) * radius * 0.42;
  return (
    <Card className="orbit-sandbox">
      <div
        className="experiment-tabs"
        role="group"
        aria-label="Choose an experiment"
      >
        <Button
          variant="ghost"
          onClick={() => setExperiment("orbit")}
          aria-pressed={experiment === "orbit"}
        >
          Orbit sandbox
        </Button>
        <Button
          variant="ghost"
          onClick={() => setExperiment("gravity")}
          aria-pressed={experiment === "gravity"}
        >
          Breathing orbit
        </Button>
      </div>
      <div className="orbit-stage">
        <span className="card-kicker">
          <Compass />
          LIVE EXPERIMENT
        </span>
        <svg
          viewBox="0 0 240 150"
          role="img"
          aria-label={`${experiment === "orbit" ? "Circular" : "Breathing"} orbit at ${speed} times speed and ${tilt} degrees tilt`}
        >
          <defs>
            <radialGradient id="sandbox-planet" cx="30%" cy="25%">
              <stop stopColor="#f9f9fc" />
              <stop offset="1" stopColor="#9396ab" />
            </radialGradient>
          </defs>
          <g transform={`rotate(${tilt} 120 75)`}>
            <ellipse
              cx="120"
              cy="75"
              rx="74"
              ry="31"
              fill="none"
              stroke="#b5b4ce"
              strokeWidth=".7"
            />
            <ellipse
              cx="120"
              cy="75"
              rx="88"
              ry="39"
              fill="none"
              stroke="#dad9e6"
              strokeDasharray="2 4"
              strokeWidth=".5"
            />
            <line x1="120" y1="75" x2={x} y2={y} stroke="#7166eb55" />
            <circle cx="120" cy="75" r="22" fill="url(#sandbox-planet)" />
            <circle cx={x} cy={y} r="9" fill="#7567e8" fillOpacity=".15" />
            <circle cx={x} cy={y} r="4.5" fill="#6e5ce6" />
          </g>
        </svg>
        <span className="orbit-readout">
          {paused ? "PAUSED" : "IN ORBIT"} <span>{speed.toFixed(1)}×</span>
        </span>
      </div>
      <div className="orbit-controls">
        <label>
          Orbital speed <output>{speed.toFixed(1)}×</output>
          <Slider
            aria-label="Orbital speed"
            min={0.2}
            max={3}
            step={0.1}
            value={[speed]}
            onValueChange={([value]) => setSpeed(value)}
          />
        </label>
        <label>
          Orbit tilt <output>{tilt}°</output>
          <Slider
            aria-label="Orbit tilt"
            min={-60}
            max={60}
            value={[tilt]}
            onValueChange={([value]) => setTilt(value)}
          />
        </label>
        <Button variant="outline" onClick={() => setPaused((v) => !v)}>
          {paused ? <Play /> : <Pause />}
          {paused ? "Resume" : "Pause"} experiment
        </Button>
      </div>
      <p className="content-pending">
        An interactive sketch. The breathing orbit is an artistic variation, not
        a physics simulation.
      </p>
    </Card>
  );
}
