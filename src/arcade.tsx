import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import {
  newSnake,
  turnSnake,
  stepSnake,
  SNAKE_SIZE,
  type Direction,
  moveToken,
  rollDie,
  boardCell,
  transitions,
} from "./arcade-rules";
import { readBest, saveBest } from "./stamps";
function useAutoPause(pause: () => void) {
  const ref = useRef(pause);
  ref.current = pause;
  useEffect(() => {
    const stop = () => ref.current();
    const hide = () => {
      if (document.hidden) stop();
    };
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", hide);
    return () => {
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", hide);
    };
  }, []);
}
export function Arcade() {
  const [game, setGame] = useState<"snake" | "ladders" | null>(null);
  const selector = useRef<HTMLButtonElement>(null);
  const exit = () => {
    setGame(null);
    requestAnimationFrame(() => selector.current?.focus());
  };
  return (
    <div className="arcade-content">
      {!game ? (
        <>
          <div className="arcade-picks">
            <Card className="game-pick">
              <div className="game-art snake-art" aria-hidden="true">
                <svg viewBox="0 0 240 140">
                  <defs>
                    <pattern
                      id="snake-grid"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M20 0H0V20"
                        fill="none"
                        stroke="#e3e2ec"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="240" height="140" fill="url(#snake-grid)" />
                  <path
                    d="M60 100H100V60H160"
                    stroke="#7164e8"
                    strokeWidth="17"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="164" cy="56" r="2" fill="white" />
                  <circle cx="164" cy="64" r="2" fill="white" />
                  <circle cx="200" cy="40" r="7" fill="#24242a" />
                </svg>
              </div>
              <div className="game-pick-copy">
                <span className="card-kicker">THE CLASSIC / 01</span>
                <h3>One more bite.</h3>
                <p>
                  A familiar little challenge. Grow your snake, find your
                  rhythm, and beat your best.
                </p>
                <Button
                  ref={selector}
                  variant="outline"
                  onClick={() => setGame("snake")}
                >
                  Play Snake <ArrowRight />
                </Button>
              </div>
            </Card>
            <Card className="game-pick">
              <div className="game-art ladders-art" aria-hidden="true">
                <svg viewBox="0 0 240 140">
                  <rect
                    x="50"
                    y="10"
                    width="140"
                    height="120"
                    rx="6"
                    fill="#fff"
                    stroke="#dddce6"
                  />
                  {Array.from({ length: 12 }, (_, i) => (
                    <rect
                      key={i}
                      x={50 + (i % 4) * 35}
                      y={10 + Math.floor(i / 4) * 40}
                      width="35"
                      height="40"
                      fill={i % 2 ? "#f2f0fb" : "#fbfbfd"}
                      stroke="#e5e2ee"
                    />
                  ))}
                  <path
                    d="M88 110L140 30M98 117L150 37M96 98L107 105M106 83L117 90M116 68L127 75M126 53L137 60M136 38L147 45"
                    stroke="#8577cf"
                    strokeWidth="3"
                  />
                  <circle cx="172" cy="111" r="9" fill="#27272d" />
                  <circle cx="172" cy="111" r="3" fill="white" />
                </svg>
              </div>
              <div className="game-pick-copy">
                <span className="card-kicker">A LITTLE LUCK / 02</span>
                <h3>Up, up. Or down.</h3>
                <p>
                  Roll the dice, climb a little higher, and take the scenic
                  route to square 100.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setGame("ladders")}
                >
                  Play Snakes & Ladders <ArrowRight />
                </Button>
              </div>
            </Card>
          </div>
          <p className="content-pending">
            Two small games. Scores stay on this device when storage is
            available.
          </p>
        </>
      ) : game === "snake" ? (
        <Snake onExit={exit} />
      ) : (
        <Ladders onExit={exit} />
      )}
    </div>
  );
}
function Snake({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState(newSnake),
    [running, setRunning] = useState(false),
    [best, setBest] = useState(() => readBest("snake"));
  const surface = useRef<HTMLDivElement>(null);
  const turn = (direction: Direction) =>
    setState((s) => turnSnake(s, direction));
  useAutoPause(() => setRunning(false));
  useEffect(() => {
    surface.current?.focus();
  }, []);
  useEffect(() => {
    if (!running || state.status !== "playing") return;
    const timer = setInterval(() => setState((s) => stepSnake(s)), 140);
    return () => clearInterval(timer);
  }, [running, state.status]);
  useEffect(() => {
    if (state.score > best) {
      setBest(state.score);
      saveBest("snake", state.score);
    }
  }, [state.score, best]);
  const reset = () => {
    setState(newSnake());
    setRunning(false);
    surface.current?.focus();
  };
  const keys: Record<string, Direction> = {
    ArrowUp: "up",
    KeyW: "up",
    ArrowDown: "down",
    KeyS: "down",
    ArrowLeft: "left",
    KeyA: "left",
    ArrowRight: "right",
    KeyD: "right",
  };
  return (
    <section className="game-session" aria-label="Snake game">
      <div className="game-stats">
        <h3>Snake</h3>
        <span>
          Score {state.score} · Best {best}
        </span>
      </div>
      <p className="game-rules">
        Collect the violet dots. Avoid the wall and your tail. Arrows / WASD or
        the direction buttons steer.
      </p>
      <div
        ref={surface}
        className="snake-board"
        tabIndex={0}
        role="group"
        aria-label="Snake board. Use arrow keys or WASD to steer."
        onKeyDown={(e) => {
          if (keys[e.code]) {
            e.preventDefault();
            e.stopPropagation();
            if (running) turn(keys[e.code]);
          }
          if (e.code === "Space") {
            e.preventDefault();
            e.stopPropagation();
            setRunning((v) => !v);
          }
        }}
      >
        {Array.from({ length: SNAKE_SIZE * SNAKE_SIZE }, (_, i) => {
          const x = i % SNAKE_SIZE,
            y = Math.floor(i / SNAKE_SIZE);
          const index = state.body.findIndex((p) => p.x === x && p.y === y);
          return (
            <span
              key={i}
              className={
                index === 0
                  ? "snake-head"
                  : index > 0
                    ? "snake-body"
                    : state.food?.x === x && state.food?.y === y
                      ? "snake-food"
                      : ""
              }
            />
          );
        })}
      </div>
      <p className="game-status" role="status">
        {state.status === "over"
          ? "That’s a wrap. Restart for another orbit."
          : state.status === "won"
            ? "Every square explored. You win!"
            : running
              ? "In motion. Space pauses."
              : "Paused. Start when you’re ready."}
      </p>
      <div className="game-actions">
        <Button
          disabled={state.status !== "playing"}
          onClick={() => {
            setRunning((v) => !v);
            surface.current?.focus();
          }}
        >
          {running ? "Pause" : "Start"}
        </Button>
        <Button variant="outline" onClick={reset}>
          Restart
        </Button>
        <Button variant="ghost" onClick={onExit}>
          Exit game
        </Button>
      </div>
      <div className="snake-pad" aria-label="Snake directions">
        {(
          [
            ["up", ArrowUp],
            ["left", ArrowLeft],
            ["down", ArrowDown],
            ["right", ArrowRight],
          ] as const
        ).map(([direction, Icon]) => (
          <Button
            key={direction}
            variant="outline"
            size="icon"
            disabled={!running || state.status !== "playing"}
            aria-label={`Steer ${direction}`}
            onClick={() => {
              turn(direction);
              surface.current?.focus();
            }}
          >
            <Icon />
          </Button>
        ))}
      </div>
    </section>
  );
}
function Ladders({ onExit }: { onExit: () => void }) {
  const [position, setPosition] = useState(0),
    [rolls, setRolls] = useState(0),
    [die, setDie] = useState<number | null>(null),
    [paused, setPaused] = useState(true),
    [message, setMessage] = useState(
      "Start at the launch pad. Reach 100 in as few rolls as you can.",
    ),
    [best, setBest] = useState(() => readBest("ladders")),
    [animating, setAnimating] = useState(false),
    [moving, setMoving] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setAnimating(false);
    setMoving(null);
  };
  useAutoPause(() => {
    setPaused(true);
    clear();
  });
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const reset = () => {
    clear();
    setPosition(0);
    setRolls(0);
    setDie(null);
    setPaused(true);
    setMessage("A fresh mission. Start when you’re ready.");
  };
  const roll = () => {
    if (paused || animating || position === 100) return;
    const value = rollDie(),
      result = moveToken(position, value),
      count = rolls + 1;
    setDie(value);
    setRolls(count);
    setPosition(result.position);
    setMoving(result.landed);
    setAnimating(true);
    if (result.won && (!best || count < best)) {
      setBest(count);
      saveBest("ladders", count);
    }
    setMessage(
      `Rolled ${value}. Landed on ${result.landed}.${result.transition ? ` Follow the ${result.transition} to ${result.position}.` : result.landed === position ? " An exact roll is needed to finish." : ""}`,
    );
    timer.current = setTimeout(() => {
      setMoving(null);
      setAnimating(false);
      if (result.won) {
        setMessage(`Moonwalk complete in ${count} rolls!`);
        if (!best || count < best) {
          setBest(count);
          saveBest("ladders", count);
        }
      }
    }, 650);
  };
  return (
    <section className="game-session" aria-label="Snakes and Ladders game">
      <div className="game-stats">
        <h3>Snakes & Ladders</h3>
        <span>
          {rolls} rolls · Best {best || "—"}
        </span>
      </div>
      <p className="game-rules">
        Solo mission: roll 1–6, climb ladders ↗ and slide down snakes ↘. A
        ladder or snake applies on landing. Reach 100 exactly; an overshoot
        stays put.
      </p>
      <div
        className="ladder-board"
        role="img"
        aria-label={`Serpentine board. Your token is ${moving ?? position}. Ladders rise and snakes descend.`}
      >
        {Array.from({ length: 100 }, (_, i) => {
          const square = i + 1,
            { row, col } = boardCell(square),
            target = transitions[square];
          return (
            <div
              key={square}
              style={{ gridRow: row + 1, gridColumn: col + 1 }}
              className={`ladder-cell ${target ? (target > square ? "ladder-start" : "snake-start") : ""} ${(moving ?? position) === square ? "token-cell" : ""}`}
            >
              <span>{square}</span>
              {target && (
                <small>
                  {target > square ? "↗" : "↘"}
                  {target}
                </small>
              )}
              {(moving ?? position) === square && <b aria-hidden="true">●</b>}
            </div>
          );
        })}
        <svg className="board-paths" viewBox="0 0 100 100" aria-hidden="true">
          {Object.entries(transitions).map(([start, end]) => {
            const a = boardCell(Number(start)),
              b = boardCell(end),
              snake = end < Number(start);
            return (
              <path
                key={start}
                d={
                  snake
                    ? `M ${a.col * 10 + 5} ${a.row * 10 + 5} Q ${b.col * 10 + 18} ${a.row * 10 + 5} ${b.col * 10 + 5} ${b.row * 10 + 5}`
                    : `M ${a.col * 10 + 5} ${a.row * 10 + 5} L ${b.col * 10 + 5} ${b.row * 10 + 5}`
                }
                className={snake ? "snake-path" : "ladder-path"}
              />
            );
          })}
        </svg>
      </div>
      <p className="game-status" role="status" aria-live="polite">
        {paused ? "Paused. " : ""}
        {message}
      </p>
      <div className="game-actions">
        <Button
          onClick={() => {
            if (!paused) clear();
            setPaused((v) => !v);
          }}
          disabled={position === 100}
        >
          {paused ? "Start" : "Pause"}
        </Button>
        <Button
          variant="outline"
          disabled={paused || animating || position === 100}
          onClick={roll}
        >
          Roll {die ? `· ${die}` : "dice"}
        </Button>
        <Button variant="outline" onClick={reset}>
          Reset
        </Button>
        <Button variant="ghost" onClick={onExit}>
          Exit game
        </Button>
      </div>
      <details className="transition-key">
        <summary>Ladder and snake routes</summary>
        <p>
          {Object.entries(transitions)
            .map(([a, b]) => `${a} ${b > Number(a) ? "↗" : "↘"} ${b}`)
            .join(" · ")}
        </p>
      </details>
    </section>
  );
}
