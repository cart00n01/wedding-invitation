/** Edit this file first. All the important wedding details live here. */
export const wedding = {
  couple: {
    first: "Sandip",
    second: "Ajita",
    initials: "S & A",
  },
  tagline: "Together is our favorite place to be.",
  invitation: "Together with our families, we invite you to share in the joy of our wedding celebration. As we begin our forever, we would be honoured to have you by our side.",
  // Countdown target in AD, Nepal time (+05:45). Keep this in sync with dateBS.
  // 18 Kartik 2083 B.S. = 4 November 2026, at 10:00 AM Nepal time.
  dateISO: "2026-11-26T10:00:00+05:45",
  dateBS: { day: "10", month: "Mangsir", year: "2083" },
  dateHeading: "10 Mangsir 2083 B.S.",
  dayHeading: "Thursday, 10 Mangsir 2083 B.S.",
  timeHeading: "10:00 AM onwards",
  city: "Simara, Nepal",
  // These are placeholders until the actual invitation details are confirmed.
  venueName: "Home",
  venueAddress: "Simara, Kathmandu",
  mapUrl: "https://maps.app.goo.gl/EhHoWwTgpbnRQNGH7",
  // Optional. Add your email address to activate the RSVP-by-email button.
  rsvpEmail: "",
  // Optional media. Leave empty to keep the built-in elegant design.
  heroVideo: "", // Example: "/videos/hero.mp4"
  soundtrack: "/music/song1.mp3", // Example: "/music/song.mp3"
  // Add your photo files to public/images/ and update the paths below.
  photos: ["/images/ajita_di_1.jpeg", "/images/bh.jpeg", "/images/ajita_di_2.jpeg"], // e.g. "/images/photo-1.jpg"
} as const;
