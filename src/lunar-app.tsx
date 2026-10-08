import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import {
  Asterisk,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Volume2,
  VolumeX,
  Music2,
  RotateCcw,
  MousePointer2,
  Keyboard,
  Orbit,
  Settings2,
  Satellite,
  Sparkles,
  Globe2,
  Move,
  Radio,
  Accessibility,
} from "lucide-react";
import {
  WorkPanel,
  AboutPanel,
  ResumePanel,
  ContactPanel,
  LabPanel,
} from "./portfolio-panels";
import { Slider } from "./components/ui/slider";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "./components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./components/ui/tooltip";
import { BlurFade } from "./components/magicui/blur-fade";
import { TextGenerateEffect } from "./components/aceternity/text-generate-effect";
import {
  WorkshopAudio,
  readAudioPreferences,
  type AudioSnapshot,
} from "./audio";
import type { LunarGame, LunarState } from "./lunar-game";
import { type AreaId } from "./content";
import {
  stops,
  destination,
  type DestinationId,
  type StopId,
} from "./destinations";
import { readStamps, writeStamps } from "./stamps";
import { MoonMap } from "./destination-ui";
import { Arcade } from "./arcade";
const initial: LunarState = {
  ready: false,
  started: false,
  nearby: null,
  visitor: null,
  visitorX: 50,
  visitorY: 25,
  distance: 0,
  phase: "waiting",
  fps: 0,
  error: null,
  normal: [0.05, 0.95, 0.29],
  target: null,
  targetDistance: 0,
  routeProgress: 0,
};
type Panel = AreaId | "controls" | "map" | null;
function Tool({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
export function LunarApp() {
  const host = useRef<HTMLDivElement>(null),
    game = useRef<LunarGame | null>(null),
    audio = useRef<WorkshopAudio | null>(null),
    returnFocus = useRef<HTMLElement | null>(null),
    dialogHeading = useRef<HTMLHeadingElement | null>(null);
  const [state, setState] = useState(initial),
    [panel, setPanel] = useState<Panel>(null),
    [visited, setVisited] = useState<StopId[]>(readStamps),
    [photo, setPhoto] = useState(false),
    [photoStatus, setPhotoStatus] = useState(""),
    [exporting, setExporting] = useState(false),
    [audioState, setAudioState] = useState<AudioSnapshot>(() => ({
      preferences: readAudioPreferences(),
      unlocked: false,
      loading: false,
      errors: [],
    })),
    [visitors, setVisitors] = useState(
      () => !matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [flat, setFlat] = useState(
      new URLSearchParams(location.search).has("flat"),
    );
  const sound = !audioState.preferences.muted;
  const music = audioState.preferences.music;
  const reduced = useReducedMotion();
  const paused = useRef(false);
  const open = (area: Panel) => {
    game.current?.clear();
    if (
      !(
        document.activeElement instanceof HTMLElement &&
        document.activeElement.closest("[role=dialog]")
      )
    )
      returnFocus.current = document.activeElement as HTMLElement;
    setPanel(area);
  };
  const enterPhoto = () => {
    game.current?.clear();
    if (!game.current?.state.ready) return;
    setPanel(null);
    game.current.travel("lookout");
    game.current.setPhoto(true);
    setPhoto(true);
    setPhotoStatus("Drag to frame the moon. Scroll or pinch to zoom.");
  };
  const openDestination = (id: DestinationId) =>
    id === "lookout" ? enterPhoto() : open(id);
  const travel = (id: DestinationId) => {
    game.current?.travel(id);
    setPanel(null);
    requestAnimationFrame(() => host.current?.querySelector("canvas")?.focus());
  };
  const exportPhoto = async () => {
    if (!game.current || exporting) return;
    setExporting(true);
    setPhotoStatus("Preparing your postcard…");
    try {
      const blob = await game.current.capturePostcard();
      const url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = "nikhil-raj-lunar-postcard.png";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setPhotoStatus("Postcard exported as a PNG.");
    } catch (error) {
      setPhotoStatus(
        error instanceof Error
          ? error.message
          : "Export failed. Please try again.",
      );
    } finally {
      setExporting(false);
    }
  };
  useEffect(() => {
    const instance = new WorkshopAudio(setAudioState);
    audio.current = instance;
    return () => {
      instance.dispose();
      audio.current = null;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    if (flat) return;
    void import("./lunar-game").then(async ({ LunarGame }) => {
      if (cancelled || !host.current) return;
      const instance = new LunarGame(
        host.current,
        audio.current!,
        (s) => {
          if (!cancelled) setState(s);
        },
        (area) => openDestination(area),
      );
      game.current = instance;
      await instance.init();
      instance.setVisitors(visitors);
      instance.setPaused(paused.current);
    });
    return () => {
      cancelled = true;
      game.current?.dispose();
      game.current = null;
    };
  }, [flat]);
  useEffect(() => {
    if (!panel) return;
    const frame = requestAnimationFrame(() => {
      dialogHeading.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [panel]);
  useEffect(() => {
    paused.current = !!panel || flat || photo;
    game.current?.setPaused(paused.current);
  }, [panel, flat, photo]);
  useEffect(() => {
    if (
      !state.ready ||
      !state.started ||
      !state.nearby ||
      state.nearby === "lookout"
    )
      return;
    const id = state.nearby;
    setVisited((values) => {
      if (values.includes(id)) return values;
      const next = [...values, id];
      writeStamps(next);
      return next;
    });
  }, [state.nearby, state.ready, state.started]);
  useEffect(() => {
    const map = (event: KeyboardEvent) => {
      if (
        event.code === "KeyM" &&
        !event.repeat &&
        !photo &&
        !panel &&
        !(
          event.target instanceof HTMLElement &&
          event.target.closest("input,textarea,select,[role=dialog]")
        )
      ) {
        event.preventDefault();
        open("map");
      }
    };
    window.addEventListener("keydown", map);
    return () => window.removeEventListener("keydown", map);
  }, [panel, photo]);
  const simple = flat || !!state.error;
  const reset = () => {
    game.current?.home();
    document.querySelector<HTMLCanvasElement>("canvas")?.focus();
  };
  const visit = () => {
    game.current?.hailVisitor();
    setPanel(null);
  };
  const toggleVisitors = () => {
    setVisitors((v) => {
      game.current?.setVisitors(!v);
      return !v;
    });
  };
  const direction =
    (x: number, z: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      game.current?.setTouch(x, z);
    };
  const stop = () => game.current?.setTouch(0, 0);
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={250}>
        <a className="skip-link" href="#portfolio-navigation">
          Skip to portfolio navigation
        </a>
        <main
          className={`lunar-app ${state.started ? "is-exploring" : ""} ${simple ? "is-simple" : ""} ${photo ? "is-photo" : ""}`}
        >
          {!flat && (
            <div
              ref={host}
              id="lunar-world"
              data-testid="lunar-world"
              aria-label="Interactive spherical lunar world"
            />
          )}
          <header className="lunar-header">
            <Button
              variant="ghost"
              className="brand-button"
              onClick={() => (simple ? setPanel("about") : reset())}
              aria-label="Nikhil Raj, return home"
            >
              <Asterisk strokeWidth={1.3} />
              <span>Nikhil Raj</span>
            </Button>
            <nav
              id="portfolio-navigation"
              className="nav-pill"
              aria-label="Portfolio"
            >
              {stops.map((stop) => (
                <Button
                  key={stop.id}
                  variant="ghost"
                  className="nav-item"
                  aria-current={panel === stop.id ? "page" : undefined}
                  onClick={() => open(stop.id as StopId)}
                >
                  {stop.short}
                </Button>
              ))}
            </nav>
            <div className="audio-controls">
              <Tool
                label={
                  sound && !audioState.unlocked
                    ? "Sound starts when you move"
                    : sound
                      ? "Mute all sound"
                      : "Turn sound on"
                }
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="sound-button"
                  onClick={() => audio.current?.toggle()}
                  aria-label={sound ? "Mute all sound" : "Turn sound on"}
                  aria-pressed={sound}
                >
                  {sound ? <Volume2 /> : <VolumeX />}
                  <span>
                    {sound
                      ? audioState.unlocked
                        ? "Sound on"
                        : "Sound ready"
                      : "Sound off"}
                  </span>
                </Button>
              </Tool>
              <Tool
                label={
                  music
                    ? "Turn background music off"
                    : "Turn background music on"
                }
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="music-button"
                  onClick={() => audio.current?.toggleMusic()}
                  aria-label={
                    music
                      ? "Turn background music off"
                      : "Turn background music on"
                  }
                  aria-pressed={music}
                >
                  <Music2 />
                </Button>
              </Tool>
            </div>
          </header>
          <AnimatePresence>
            {!simple && !photo && !state.started && (
              <motion.section
                className="arrival-copy"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ delay: state.ready ? 0.1 : 0 }}
                aria-label="Welcome"
              >
                <span className="eyebrow">A SMALL WORLD, OPEN TO EXPLORE</span>
                <TextGenerateEffect
                  words="Make yourself at home."
                  className="arrival-title"
                  duration={reduced ? 0 : 0.7}
                />
                <p>
                  {state.ready
                    ? "Just start moving. Curiosity does the rest."
                    : "Gathering a little moon dust…"}
                </p>
              </motion.section>
            )}
          </AnimatePresence>
          {!simple && !state.ready && !state.error && (
            <div className="loading-note" role="status">
              <Orbit className={reduced ? "" : "loading-orbit"} />
              <span>Building your view of the moon</span>
            </div>
          )}
          <AnimatePresence>
            {!simple && state.visitor && (
              <motion.aside
                key={state.visitor}
                className="visitor-bubble"
                role="status"
                aria-live="polite"
                style={{
                  left: `${state.visitorX}%`,
                  top: `${state.visitorY}%`,
                }}
                initial={{ opacity: 0, y: 9, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -7 }}
              >
                <div>
                  <Radio size={12} />
                  <span>INCOMING · FRIENDLY VISITOR</span>
                </div>
                <p>{state.visitor}</p>
              </motion.aside>
            )}
          </AnimatePresence>
          {!simple && !photo && state.started && state.nearby && !panel && (
            <motion.div
              className="nearby-action"
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                variant="outline"
                onClick={() => state.nearby && openDestination(state.nearby)}
              >
                <kbd>E</kbd>
                {destination(state.nearby).action}
                <ArrowUpRight size={14} />
              </Button>
            </motion.div>
          )}
          {simple && (
            <section className="simple-view">
              <BlurFade blur="0px" duration={0.2}>
                <span className="eyebrow">NIKHIL RAJ / PERSONAL PORTFOLIO</span>
                <h1>
                  A small world.
                  <br />
                  An open mind.
                </h1>
                <p>
                  {state.error ||
                    "Work, experiments, and a little curiosity. Everything is available here without the 3D world."}
                </p>
                <div className="simple-actions">
                  {stops.map((stop) => (
                    <Button
                      key={stop.id}
                      variant="outline"
                      onClick={() => open(stop.id as StopId)}
                    >
                      {stop.label}
                      <ArrowUpRight />
                    </Button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    location.href = location.pathname;
                  }}
                >
                  Return to the moon <Orbit />
                </Button>
              </BlurFade>
            </section>
          )}
          {!photo && (
            <div className="map-launch">
              <Button variant="outline" onClick={() => open("map")}>
                <Globe2 size={15} />
                Map <kbd>M</kbd>
                <span>{visited.length}/6</span>
              </Button>
            </div>
          )}
          {!simple && !photo && state.target && !panel && (
            <aside className="route-guidance" aria-label="Route guidance">
              <strong>{destination(state.target).label}</strong>
              <span>
                {state.nearby === state.target
                  ? "You’ve arrived · E to explore"
                  : `${state.targetDistance.toFixed(1)} m around the moon`}
              </span>
              <progress
                aria-label="Route progress"
                max="1"
                value={state.routeProgress}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => game.current?.setTarget(null)}
              >
                Cancel route
              </Button>
            </aside>
          )}
          {photo && (
            <aside className="photo-controls" aria-label="Photo mode">
              <strong>Far-side postcard</strong>
              <p role="status">{photoStatus}</p>
              <Button disabled={exporting} onClick={exportPhoto}>
                {exporting ? "Exporting…" : "Export PNG"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  game.current?.setPhoto(false);
                  setPhoto(false);
                  requestAnimationFrame(() =>
                    host.current?.querySelector("canvas")?.focus(),
                  );
                }}
              >
                Exit photo mode
              </Button>
            </aside>
          )}
          <footer className="lunar-footer">
            {!simple && (
              <div className="movement-hint">
                <Keyboard size={15} />
                <span>
                  <strong>WASD</strong> / arrows to move
                </span>
                <span className="hint-divider" />
                <MousePointer2 size={14} />
                <span>Drag to orbit</span>
              </div>
            )}
            <div className="footer-right">
              {!simple && (
                <span className="world-note">
                  <span className="live-dot" />A LITTLE MOON, ALL YOURS
                </span>
              )}
              <Tool label="Return to home base">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Return to home base"
                  onClick={reset}
                  disabled={simple || !state.ready}
                >
                  <RotateCcw size={16} />
                </Button>
              </Tool>
              <Tool label="Controls and settings">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Controls and settings"
                  onClick={() => open("controls")}
                >
                  <Settings2 size={17} />
                </Button>
              </Tool>
            </div>
          </footer>
          {!simple && state.ready && !photo && (
            <div className="touch-directions" aria-label="Move the robot">
              <Button
                variant="outline"
                size="icon"
                aria-label="Move forward"
                className="touch-up"
                onPointerDown={direction(0, -1)}
                onPointerUp={stop}
                onPointerCancel={stop}
                onLostPointerCapture={stop}
              >
                <ArrowUp />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Move left"
                className="touch-left"
                onPointerDown={direction(-1, 0)}
                onPointerUp={stop}
                onPointerCancel={stop}
                onLostPointerCapture={stop}
              >
                <ArrowLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Move backward"
                className="touch-down"
                onPointerDown={direction(0, 1)}
                onPointerUp={stop}
                onPointerCancel={stop}
                onLostPointerCapture={stop}
              >
                <ArrowDown />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Move right"
                className="touch-right"
                onPointerDown={direction(1, 0)}
                onPointerUp={stop}
                onPointerCancel={stop}
                onLostPointerCapture={stop}
              >
                <ArrowRight />
              </Button>
            </div>
          )}
          <Dialog
            open={!!panel}
            onOpenChange={(v) => {
              if (!v) setPanel(null);
            }}
          >
            <DialogContent
              className={`portfolio-dialog ${panel === "work" ? "work-dialog" : ""} ${panel === "arcade" ? "arcade-dialog" : panel === "map" ? "map-dialog" : panel === "controls" ? "settings-dialog" : ""}`}
              onOpenAutoFocus={(e) => {
                e.preventDefault();
                dialogHeading.current?.focus({ preventScroll: true });
              }}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                if (returnFocus.current?.isConnected)
                  returnFocus.current.focus();
                else host.current?.querySelector("canvas")?.focus();
              }}
            >
              <DialogHeader className="panel-heading">
                <span className="eyebrow">
                  {panel && stops.some((s) => s.id === panel)
                    ? `${String(stops.findIndex((s) => s.id === panel) + 1).padStart(2, "0")} / ${destination(panel as StopId).label.toUpperCase()}`
                    : panel === "map"
                      ? "YOUR MOON / SIX STOPS + A HIDDEN LOOKOUT"
                      : "A LITTLE FIELD GUIDE"}
                </span>
                <DialogTitle ref={dialogHeading} tabIndex={-1}>
                  {panel === "work"
                    ? "Selected work."
                    : panel === "lab"
                      ? "Room to experiment."
                      : panel === "about"
                        ? "Hello, I’m Nikhil."
                        : panel === "resume"
                          ? "The résumé."
                          : panel === "contact"
                            ? "Let’s connect."
                            : panel === "arcade"
                              ? "A little play time."
                              : panel === "map"
                                ? "Your next discovery."
                                : "Make it your own."}
                </DialogTitle>
                <DialogDescription>
                  {panel === "map"
                    ? "Choose a destination. Open its content, follow a beacon, or take a shortcut."
                    : panel === "arcade"
                      ? "Two playable games in a quiet corner of the moon."
                      : panel === "resume"
                        ? "A closer look at the work behind the world."
                        : panel === "contact"
                          ? "A small signal can start something good."
                          : panel === "about"
                            ? "A little context behind this little world."
                            : panel === "lab"
                              ? "Try a small interactive sketch or hail a passing visitor."
                              : panel === "work"
                                ? "Things I’m building, one idea at a time."
                                : "Your soundscape, controls, and small personal touches."}
                </DialogDescription>
              </DialogHeader>
              <div className="panel-body" key={panel}>
                {panel === "map" && (
                  <MoonMap
                    normal={state.normal}
                    visited={visited}
                    canTravel={state.ready && !simple}
                    onOpen={openDestination}
                    onTravel={travel}
                    onGuide={(id) => {
                      game.current?.setTarget(id);
                      setPanel(null);
                    }}
                  />
                )}
                {panel === "resume" && <ResumePanel />}
                {panel === "contact" && <ContactPanel />}
                {panel === "arcade" && <Arcade />}
                {panel === "work" && (
                  <WorkPanel onExplore={() => setPanel(null)} />
                )}
                {panel === "lab" && (
                  <LabPanel
                    canSignal={state.ready && !simple}
                    visitors={visitors}
                    onSignal={visit}
                  />
                )}
                {panel === "about" && <AboutPanel />}
                {panel === "controls" && (
                  <div className="control-content">
                    <section
                      className="controls-guide"
                      aria-label="Movement controls"
                    >
                      <h3>Get around</h3>
                      <div className="control-row">
                        <Move />
                        <div>
                          <strong>Find your own path</strong>
                          <p>
                            WASD / arrows to move. Shift to boost. On touch, use
                            the direction pad.
                          </p>
                        </div>
                      </div>
                      <div className="control-row">
                        <Orbit />
                        <div>
                          <strong>A different perspective</strong>
                          <p>
                            Drag to orbit. Scroll / pinch to zoom. R to return
                            home.
                          </p>
                        </div>
                      </div>
                      <div className="control-row">
                        <Sparkles />
                        <div>
                          <strong>Follow your curiosity</strong>
                          <p>
                            E at any landmark. M opens the map with all six
                            stops, routes and quick travel. The navigation also
                            opens every stop directly.
                          </p>
                        </div>
                      </div>
                    </section>
                    <div className="stamp-settings">
                      <span>Lunar passport · {visited.length}/6 stamps</span>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          writeStamps([]);
                          setVisited([]);
                        }}
                      >
                        Reset stamps
                      </Button>
                      <p className="content-pending">
                        Optional device-only souvenirs. Resetting stamps keeps
                        audio preferences and game scores.
                      </p>
                    </div>
                    <AudioSettings state={audioState} audio={audio.current} />
                    <Button
                      variant="outline"
                      className="setting-button"
                      onClick={toggleVisitors}
                      aria-pressed={visitors}
                    >
                      <Satellite />
                      <span>Passing visitors</span>
                      <strong>{visitors ? "On" : "Off"}</strong>
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setPanel(null);
                        setState((s) => ({
                          ...s,
                          target: null,
                          targetDistance: 0,
                          routeProgress: 0,
                        }));
                        setFlat(true);
                      }}
                    >
                      <Accessibility />
                      Use the simple portfolio <ArrowUpRight />
                    </Button>
                    <p className="motion-note">
                      {reduced
                        ? "Reduced motion is on. Camera transitions and ambient motion are minimized."
                        : "Motion follows your device’s accessibility preferences."}
                    </p>
                  </div>
                )}
              </div>
              <div className="dialog-footer">
                <span>
                  <span className="footer-orbit" />
                  Nikhil’s little corner of the cosmos
                </span>
                <Button variant="ghost" onClick={() => setPanel(null)}>
                  Back to {simple ? "portfolio" : "the moon"}
                  <ArrowRight size={14} />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </TooltipProvider>
    </MotionConfig>
  );
}

function AudioSettings({
  state,
  audio,
}: {
  state: AudioSnapshot;
  audio: WorkshopAudio | null;
}) {
  const prefs = state.preferences;
  return (
    <Card className="audio-settings">
      <div className="audio-settings-heading">
        <Volume2 size={17} />
        <strong>Soundscape</strong>
      </div>
      <p className="audio-description">
        A soundtrack for wandering. Sounds by{" "}
        <a href="https://elevenlabs.io/" target="_blank" rel="noreferrer">
          elevenlabs.io
        </a>
        .
      </p>
      {(
        [
          {
            key: "music",
            volume: "musicVolume",
            label: "Background music",
            icon: Music2,
          },
          {
            key: "effects",
            volume: "effectsVolume",
            label: "Robot & visitors",
            icon: Satellite,
          },
          {
            key: "ambience",
            volume: "ambienceVolume",
            label: "Space ambience",
            icon: Orbit,
          },
        ] as const
      ).map(({ key, volume, label, icon: Icon }) => (
        <div className="audio-channel" key={key}>
          <div className="audio-channel-heading">
            <span>
              <Icon size={14} />
              {label}
            </span>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`${prefs[key] ? "Disable" : "Enable"} ${label.toLowerCase()}`}
              aria-pressed={prefs[key]}
              onClick={() => {
                audio?.setPreferences({ [key]: !prefs[key] });
                audio?.unlock();
              }}
            >
              {prefs[key] ? "On" : "Off"}
            </Button>
          </div>
          <div className="audio-level">
            <Slider
              aria-label={`${label} volume`}
              min={0}
              max={100}
              step={1}
              value={[Math.round(prefs[volume] * 100)]}
              onValueChange={([value]) =>
                audio?.setPreferences({ [volume]: value / 100 })
              }
            />
            <output aria-hidden="true">
              {Math.round(prefs[volume] * 100)}%
            </output>
          </div>
        </div>
      ))}
      <p className="audio-status" role="status">
        {state.errors.length
          ? "Some sounds couldn’t load."
          : state.loading
            ? "Preparing the soundscape…"
            : prefs.muted
              ? "All sound is muted. Use the speaker above to listen."
              : !state.unlocked
                ? "Sound begins with your first move. Music is optional."
                : "Your sound preferences are saved on this device."}
      </p>
      {state.errors.length > 0 && (
        <Button variant="outline" onClick={() => audio?.unlock()}>
          Retry audio
        </Button>
      )}
    </Card>
  );
}
