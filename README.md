# Nayan & Kavya — Wedding Invitation (Next.js)

A self-contained, editable **Next.js App Router + React + TypeScript** wedding invitation starter, inspired by the user's earlier cinematic invitation project.

## 1. Install requirements

Install Node.js **20.9+** (Node.js 22 LTS is a good option). Check:

```powershell
node --version
npm.cmd --version
```

On Windows PowerShell, `npm.cmd` is used in the commands below to avoid common PowerShell script execution-policy errors.

## 2. Open and run

Extract this ZIP, then open **wedding-invitation-nextjs** in VS Code. Open Terminal and run:

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000

To check the production build:

```powershell
npm.cmd run build
```

## 3. Customize the details

Open `lib/wedding.ts`. Edit the names, date, time, venue and address, Google Maps URL, RSVP email, and media paths. The date is an ISO date with Nepal's `+05:45` time offset.

## 4. Add your old media (optional)

- Hero video: add `public/videos/hero.mp4`, then set `heroVideo: "/videos/hero.mp4"`.
- Background music: add `public/music/song.mp3`, then set `soundtrack: "/music/song.mp3"`. Audio starts *after* the guest opens the invitation, which respects browser autoplay requirements.
- Photos: add `public/images/photo-1.jpg`, etc., and set `photos: ["/images/photo-1.jpg", ...]`.

The website works without media files; it uses styled placeholders until you add real media.

## 5. What works now

- Cinematic curtain-opening invitation
- Responsive hero and elegant scrolling sections
- Three interactive canvas scratch cards (with accessible reveal button)
- Celebration confetti after all three scratch cards are opened
- Live wedding countdown based on your configured date
- Venue/map link and gallery placeholders
- Optional audio toggle and optional autoplaying muted background video
- Optional RSVP-by-email button once an email address is configured

> This is a complete **starter**, not a recovered byte-for-byte copy of the lost source. RSVP does **not** save guest responses to a database; add a backend later if you need a guest-management dashboard.

## 6. Back up immediately

After the site runs, create a fresh private GitHub repository. Do not add `node_modules` or `.next`. Store photos/videos separately if large (or use Git LFS/cloud storage), because ordinary GitHub pushes can reject files over the size limit. Make sure `.gitignore` excludes local build artifacts.

Useful commands:

```powershell
git init
git add .
git commit -m "Start wedding invitation website"
```

Then follow GitHub's instructions to add your new remote and push.
