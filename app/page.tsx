"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { wedding } from "@/lib/wedding";

function remainingTime(dateISO: string, now: number) {
  const distance = Math.max(0, new Date(dateISO).getTime() - now);
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  };
}

function Countdown() {
  const [remaining, setRemaining] = useState<ReturnType<typeof remainingTime> | null>(null);
  useEffect(() => {
    let disposed = false;
    let syncing = false;
    let clock: { serverNow: number; measuredAt: number } | null = null;
    const controller = new AbortController();
    const update = () => {
      if (!clock || disposed) return;
      const now = clock.serverNow + performance.now() - clock.measuredAt;
      setRemaining(remainingTime(wedding.dateISO, now));
    };
    const syncTime = async () => {
      if (syncing || disposed) return;
      syncing = true;
      const startedAt = performance.now();
      try {
        const response = await fetch("/api/time", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Time sync failed");
        const data: { now: number } = await response.json();
        if (!Number.isFinite(data.now)) throw new Error("Invalid server time");
        if (disposed) return;
        const receivedAt = performance.now();
        clock = { serverNow: data.now + (receivedAt - startedAt) / 2, measuredAt: receivedAt };
        update();
      } catch {
        // Retain the last synchronized clock and retry; do not trust the phone clock.
      } finally {
        syncing = false;
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void syncTime();
    };
    void syncTime();
    const tick = window.setInterval(update, 1000);
    const sync = window.setInterval(() => { void syncTime(); }, 30_000);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);
    return () => {
      disposed = true;
      controller.abort();
      window.clearInterval(tick);
      window.clearInterval(sync);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onVisible);
    };
  }, []);

  return (
    <div className="countdown" aria-label="Wedding countdown">
      {(["days", "hours", "minutes", "seconds"] as const).map((key) => (
        <div className="countdown-unit" key={key}>
          <strong suppressHydrationWarning>{remaining ? String(remaining[key]).padStart(2, "0") : "--"}</strong>
          <span>{key}</span>
        </div>
      ))}
    </div>
  );
}

function Confetti() {
  return <div className="confetti" aria-hidden="true">{Array.from({ length: 38 }, (_, i) => (
    <i key={i} style={{ left: `${(i * 73) % 100}%`, animationDelay: `${((i * 7) % 20) / 10}s`, animationDuration: `${2.5 + ((i * 3) % 15) / 10}s`, transform: `rotate(${i * 43}deg)` }} />
  ))}</div>;
}

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [textReady, setTextReady] = useState(false);
  const curtainRef = useRef<HTMLVideoElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const allRevealed = revealed.length === 3;
  const [revealLocked, setRevealLocked] = useState(false);
  const revealRef = useRef<HTMLElement>(null);
  const [countdownVisible, setCountdownVisible] = useState(false);
  const [celebrationBurst, setCelebrationBurst] = useState(0);
  const balloons = (["day", "month", "year"] as const).map((part) => ({
    label: part, value: wedding.dateBS[part],
  }));

  useEffect(() => {
    if (opened) return;
    const resetScroll = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    resetScroll();
    window.addEventListener("scroll", resetScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", resetScroll);
      window.history.scrollRestoration = previousRestoration;
    };
  }, [opened]);

  useEffect(() => {
    if (!opened || allRevealed) return;
    const enforceReveal = () => {
      const section = revealRef.current;
      if (!section) return;
      const top = section.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY >= top - 2) {
        window.scrollTo({ top, behavior: "instant" });
        setRevealLocked(true);
        section.focus({ preventScroll: true });
      }
    };
    window.addEventListener("scroll", enforceReveal, { passive: true });
    enforceReveal();
    return () => window.removeEventListener("scroll", enforceReveal);
  }, [opened, allRevealed]);

  useEffect(() => {
    document.body.style.overflow = opened && !(revealLocked && !allRevealed) ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [opened, revealLocked, allRevealed]);

  const finishOpening = () => {
    curtainRef.current?.pause();
    // A restored scroll position or an old section hash must not skip the invitation.
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setRevealLocked(false);
    setOpened(true);
    setOpening(false);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      mainRef.current?.focus({ preventScroll: true });
    });
  };

  const openInvitation = () => {
    if (opening || opened) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setOpening(true);
    const curtain = curtainRef.current;
    if (curtain && !curtain.error) {
      void curtain.play().catch(finishOpening);
    } else {
      finishOpening();
    }
    if (audioRef.current) {
      void audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
    }
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
    } else {
      audio.pause();
      setMusicPlaying(false);
    }
  };

  const rsvpHref = wedding.rsvpEmail
    ? `mailto:${wedding.rsvpEmail}?subject=${encodeURIComponent(`RSVP – ${wedding.couple.first} & ${wedding.couple.second}`)}&body=${encodeURIComponent("Hello! I would love to RSVP for the wedding.\n\nName:\nNumber of guests:\nAttendance: Yes / No\n")}`
    : "";

  return (
    <>
      {allRevealed && <Confetti key={celebrationBurst} />}
      {wedding.soundtrack && <audio ref={audioRef} src={wedding.soundtrack} loop preload="none" />}
      <div inert={!opened}>
        <header className="nav" inert={revealLocked && !allRevealed}>
          <a className="nav-monogram" href="#home">N <span>♥</span> K</a>
          <nav aria-label="Primary navigation">
            <a href="#home">Invitation</a><a href="#surprise">The surprise</a><a href="#details">Details</a><a href="#rsvp">RSVP</a>
          </nav>
          <span className="nav-date">22 · 11 · 26</span>
        </header>

        <main>
          <section id="home" ref={mainRef} tabIndex={-1} className="hero invitation-hero" inert={revealLocked && !allRevealed}>
            <video
              ref={curtainRef}
              className="hero-open-curtain"
              src="/videos/curtain_open_video.mp4"
              poster="/images/curtain_close.jpg"
              muted playsInline preload="auto" aria-hidden="true"
              onEnded={finishOpening}
              onTimeUpdate={(event) => {
                const video = event.currentTarget;
                if (opening && video.duration > 0 && video.currentTime >= video.duration * 0.6) {
                  setTextReady(true);
                }
              }}
              onError={() => { if (opening) finishOpening(); }}
            />
            {wedding.heroVideo && <video className="hero-video" autoPlay loop muted playsInline src={wedding.heroVideo} />}
            <div className={`invitation-paper ${opened || textReady ? "invitation-text-visible" : ""}`}>
              <p className="guest-greeting">A beautiful beginning,<br />a promise of forever</p>
              <h1><span>{wedding.couple.first}</span><em>&amp;</em><span>{wedding.couple.second}</span></h1>
              <div className="invitation-rule" />
              <p className="guest-message">{wedding.invitation}</p>
              <a href="#surprise" className="hero-scroll">SCROLL TO REVEAL <b>&darr;</b></a>
            </div>
          </section>

          <section className={`scratch-section balloon-section ${revealLocked && !allRevealed ? "reveal-locked" : ""}`} id="surprise" ref={revealRef} tabIndex={-1}>
            <div className="balloon-reveal">
              <p className="overline">A DATE TO REMEMBER</p>
              <h2>Reveal</h2>
              <p className="balloon-instruction" id="balloon-instruction">Pop the balloons to discover our wedding date </p>
              <div className="balloon-grid">
                {balloons.map(({ label, value }, index) => (
                  <div className={`balloon-slot ${revealed.includes(index) ? "balloon-popped" : ""}`} key={label}>
                    {revealed.includes(index) ? <div className="date-reveal"><span>{label}</span><strong>{value}</strong></div> : (
                      <button className={`date-balloon balloon-${index}`} aria-label={`Pop balloon to reveal the ${label}`} aria-describedby="balloon-instruction"
                        onClick={() => setRevealed((old) => old.includes(index) ? old : [...old, index])}>
                        <span className="balloon-glint" aria-hidden="true" />
                        <span className="balloon-label">{label}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {allRevealed && (
                <p className="married-script married-announcement" onAnimationEnd={() => setCountdownVisible(true)}>
                  We are getting married!
                </p>
              )}
              <p className="reveal-progress" role="status">{allRevealed ? "Our date is revealed!" : `${revealed.length} of 3 revealed ? Pop all three to continue`}</p>
            </div>
            {countdownVisible && <div className="balloon-countdown countdown-entrance" id="details">
              <h3>Countdown</h3>
              <Countdown />
              <p>{wedding.timeHeading}..{wedding.city}</p>
              {allRevealed && <a className="outline-link" href="#moments" onClick={() => setCelebrationBurst((burst) => burst + 1)}>CONTINUE THE CELEBRATION &darr;</a>}
            </div>}
          </section>

          <div inert={revealLocked && !allRevealed}>
            <section className="gallery-section" id="moments">
              <p className="overline">A STORY IN FRAMES</p>
              <h2>Little moments, <em>big love.</em></h2>
              <p className="section-copy">Every picture tells a story. Add your favorite photos to make this space your own.</p>
              <div className="gallery-grid">
                {wedding.photos.map((src, i) => (
                  <div className={`gallery-item gallery-${i + 1}`} key={i}>
                    {src && <Image src={src} alt={`Wedding memory ${i + 1}`} width={1200} height={1600} sizes="(max-width: 590px) 90vw, 30vw" className="gallery-photo" />}
                    {!src && <div className="gallery-placeholder"><span>✾</span><p>YOUR PHOTO {i + 1}</p></div>}
                  </div>
                ))}
              </div>
            </section>

            <section className="venue-section">
              <div className="venue-frame">
                <p className="overline">WHERE LOVE BRINGS US TOGETHER</p>
                <div className="venue-icon">⌖</div>
                <h2>Come celebrate <em>with us.</em></h2>
                <h3>{wedding.venueName}</h3>
                <p>{wedding.venueAddress}</p>
                <p>{wedding.dayHeading} · {wedding.timeHeading}</p>
                <a className="outline-link" href={wedding.mapUrl} target="_blank" rel="noopener noreferrer">VIEW LOCATION ↗</a>
              </div>
            </section>

            <section className="rsvp-section" id="rsvp">
              <p className="overline light">WE HOPE YOU CAN JOIN US</p>
              <h2>Your presence is <em>our present.</em></h2>
              <p>Love is better when shared. We would be delighted to have you with us on our special day.</p>
              {rsvpHref ? <a className="primary-link" href={rsvpHref}>KINDLY RSVP <span>↗</span></a> : <div className="closing-invitation"><p className="closing-invite-text">We invite you to our wedding</p><p className="with-love">With love <span role="img" aria-label="heart">&#10084;&#65039;</span></p></div>}
              <div className="rsvp-bottom">{wedding.couple.first} <em>&</em> {wedding.couple.second}</div>
            </section>
          </div>
        </main>

        <footer className="footer" inert={revealLocked && !allRevealed}><span>MADE WITH LOVE ♡</span><span>{wedding.dateHeading} · {wedding.city}</span></footer>

        {opened && wedding.soundtrack && (
          <button className="music-toggle" onClick={toggleMusic} aria-label={musicPlaying ? "Mute background music" : "Play background music"} title={musicPlaying ? "Mute music" : "Play music"}>
            {musicPlaying ? "♫" : "♪"}<span>{musicPlaying ? "ON" : "OFF"}</span>
          </button>
        )}

      </div>
      <div className={`invitation-gate ${opened ? "gate-opened" : ""}`} aria-hidden={opened}>
        {!opened && !opening && (
          <button onClick={openInvitation} className="curtain-open-button">
            <span>OPEN INVITATION</span>
          </button>
        )}
        <span className="gate-status" role="status">{opening ? "Opening invitation?" : ""}</span>
      </div>
    </>
  );
}
