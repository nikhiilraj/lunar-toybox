import {
  ArrowUpRight,
  ArrowDownToLine,
  FileText,
  CodeXml,
  ArrowRight,
  BriefcaseBusiness,
  NotebookPen,
  Radio,
  Satellite,
} from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { BlurFade } from "./components/magicui/blur-fade";
import { identity, safeLink, contactEmptyState } from "./content";
import { OrbitSandbox } from "./destination-ui";

function ProfileLinks() {
  return (
    <div className="contact-links">
      {(["github", "linkedin", "email"] as const).map((key) => {
        const href = safeLink(
          key === "email" && identity.email
            ? `mailto:${identity.email}`
            : identity[key],
        );
        return href ? (
          <Button asChild key={key} variant="outline">
            <a href={href} target="_blank" rel="noreferrer">
              {key === "github"
                ? "GitHub"
                : key === "linkedin"
                  ? "LinkedIn"
                  : "Email"}
              <ArrowUpRight />
            </a>
          </Button>
        ) : null;
      })}
    </div>
  );
}

export function WorkPanel({ onExplore }: { onExplore: () => void }) {
  return (
    <BlurFade delay={0} duration={0.2} blur="0px">
      <Card className="project-card">
        <div className="project-cover">
          <img
            src="/images/lunar-world.png"
            alt="Nikhil’s robot outside the workshop on the moon, with Earth in the distance"
          />
          <Badge className="cover-badge">You’re here</Badge>
        </div>
        <CardHeader>
          <div className="card-kicker">
            <span>01 / INTERACTIVE EXPERIENCE</span>
            <span>2026</span>
          </div>
          <h3>Lunar Toybox</h3>
          <p>
            A small world for big ideas. A curious robot, an entire moon to
            explore, and a portfolio along the way.
          </p>
        </CardHeader>
        <CardContent>
          <div className="project-tags">
            <Badge variant="secondary">Three.js</Badge>
            <Badge variant="secondary">React</Badge>
            <Badge variant="secondary">Creative development</Badge>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onExplore}>
            Explore the moon <ArrowUpRight />
          </Button>
          <Button asChild variant="ghost">
            <a
              href="https://github.com/nikhiilraj/lunar-toybox"
              target="_blank"
              rel="noreferrer"
            >
              <CodeXml />
              View source
            </a>
          </Button>
        </CardFooter>
      </Card>
      <p className="content-pending">
        More projects will land here as they’re ready.
      </p>
    </BlurFade>
  );
}

export function AboutPanel() {
  return (
    <BlurFade delay={0} duration={0.2} blur="0px">
      <Card className="profile-card">
        <div className="profile-monogram" aria-hidden="true">
          nr.
        </div>
        <div>
          <span className="card-kicker">THE PERSON BEHIND THE MOON</span>
          <h3>Nikhil Raj</h3>
          <p>
            {identity.bio ||
              "The personal story is still being written. For now, take a look around."}
          </p>
          <ProfileLinks />
        </div>
      </Card>
      <div className="two-up">
        <Card className="empty-shelf">
          <BriefcaseBusiness />
          <h3>Experience</h3>
          <p>No experience entries published yet.</p>
          <span className="quiet-label">Coming soon</span>
        </Card>
        <Card className="empty-shelf">
          <NotebookPen />
          <h3>Field notes</h3>
          <p>A space for thoughts, discoveries, and things worth sharing.</p>
          <span className="quiet-label">Coming soon</span>
        </Card>
      </div>
    </BlurFade>
  );
}

export function ResumePanel() {
  return (
    <div className="resume-content">
      <Card className="document-toolbar">
        <div className="document-icon">
          <FileText />
        </div>
        <div>
          <strong>Backend résumé</strong>
          <span>Original document · PDF</span>
        </div>
        <Button asChild>
          <a href={identity.resume} download="Nikhil-Raj-Backend-Resume.pdf">
            <ArrowDownToLine />
            Download<span className="sr-only"> PDF</span>
          </a>
        </Button>
      </Card>
      <a
        className="document-preview"
        href={identity.resume}
        target="_blank"
        rel="noreferrer"
        aria-label="Open the original résumé PDF"
      >
        <img
          className="resume-preview"
          src="/resume/nikhil-raj-backend-preview.png"
          alt="Nikhil Raj’s supplied backend résumé. Open the PDF for selectable text and full size reading."
        />
        <span>
          Open full-size PDF <ArrowUpRight />
        </span>
      </a>
      <p className="content-pending">
        The original résumé is provided unchanged. Open the preview to read or
        zoom.
      </p>
    </div>
  );
}

export function ContactPanel() {
  return (
    <div className="contact-content">
      <Card className="contact-card">
        <div className="contact-symbol">
          <CodeXml size={32} />
          <span className="connection-line" />
          <Radio size={28} />
        </div>
        <span className="card-kicker">LET’S CONNECT</span>
        <h3>
          Good things start
          <br />
          with a hello.
        </h3>
        <p>
          Find my public work, explore the code, and follow what I’m building on
          GitHub.
        </p>
        <Button asChild>
          <a href={identity.github} target="_blank" rel="noreferrer">
            Find me on GitHub <ArrowUpRight />
          </a>
        </Button>
        <span className="profile-handle">@nikhiilraj</span>
      </Card>
      <div className="contact-links">
        {(["linkedin", "email"] as const).map((key) => {
          const href = safeLink(
            key === "email" && identity.email
              ? `mailto:${identity.email}`
              : identity[key],
          );
          return href ? (
            <Button asChild key={key} variant="outline">
              <a href={href} target="_blank" rel="noreferrer">
                {key === "linkedin" ? "LinkedIn" : "Email"}
                <ArrowUpRight />
              </a>
            </Button>
          ) : null;
        })}
      </div>
      {identity.availability.trim() && (
        <p className="about-copy">{identity.availability}</p>
      )}
      {contactEmptyState(identity) && (
        <p className="content-pending">{contactEmptyState(identity)}</p>
      )}
    </div>
  );
}

export function LabPanel({
  canSignal,
  visitors,
  onSignal,
}: {
  canSignal: boolean;
  visitors: boolean;
  onSignal: () => void;
}) {
  return (
    <BlurFade delay={0} duration={0.2} blur="0px">
      <OrbitSandbox />
      <Card className="experiment-card">
        <div className="icon-tile">
          <Satellite />
        </div>
        <div>
          <h3>A signal into space.</h3>
          <p>A friendly visitor might just have something to say.</p>
          {!visitors && (
            <p className="content-pending">
              Enable visitors in settings to send a signal.
            </p>
          )}
        </div>
        <Button
          variant="outline"
          disabled={!canSignal || !visitors}
          onClick={onSignal}
        >
          Send a signal <ArrowRight />
        </Button>
      </Card>
      <p className="content-pending">
        Keep exploring. There’s a little surprise on the far side, too.
      </p>
    </BlurFade>
  );
}
