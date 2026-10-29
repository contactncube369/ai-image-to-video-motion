# MotionAI — AI Image-to-Video Creation Studio

MotionAI is a production-oriented web platform designed to transform static images into smooth, realistic, cinematic video clips with customizable camera motion controls, natural-language prompt synthesis, and role-based Studio Max access.

---

## Key Features

1. **AI Vision & Scene Analysis (Google Gemini 3.8 Flash)**
   - Automatically detects subject, foreground, background depth layers, and directional lighting.
   - Recommends optimal camera trajectories and motion intensities based on visual composition.
   - Identifies animation vectors (wind in hair, cloud drifting, water reflections, particle bokeh).

2. **Natural-Language Motion Prompting**
   - Natural-language motion direction with an "Enhance with Gemini" AI expansion tool.
   - Automatic negative prompt generator to prevent warping, facial deformation, and temporal jitter.
   - One-click prompt suggestions and preset bookmarking.

3. **12 Cinematic Camera Motion Presets**
   - **Static Camera**: Stationary framing; only in-scene physics animate.
   - **Slow Zoom In / Out**: Smooth optical push and reveal.
   - **Pan Left / Right**: Lateral horizontal camera rotation.
   - **Tilt Up / Down**: Vertical camera pivot.
   - **Dolly In / Out**: Physical 3D translation into or out of the scene.
   - **Orbit**: Continuous curved orbital trajectory around focal point.
   - **Cinematic Tracking**: Steadicam tracking with depth parallax.
   - **Handheld Cinematic**: Organic human operator breathing and micro-drift.

4. **Kinematic & Consistency Controls**
   - 0–100 Motion Intensity slider with calibrated ranges (*Subtle*, *Natural*, *Dynamic*, *Highly Expressive*).
   - Animation speed multiplier (0.5x – 2.0x).
   - Independent camera, subject, and background movement strength sliders.
   - Multi-plane 3D depth parallax toggle.
   - Seamless loop animation toggle.
   - Subject appearance & composition preservation toggles.

5. **Cinema Video Player & Comparison**
   - Timeline scrubber with accurate timecodes and duration.
   - Interactive **Split Wipe** slider (drag to compare original still frame vs. animated video).
   - Side-by-Side comparison mode.
   - Multi-variation support (1–4 clips).
   - Lossless **MP4/WebM video download**.
   - Project duplicate, favorite, and delete actions.

6. **Dual-Section Authentication & Studio Max Privileges**
   - **Normal User Portal**: Standard Creator Pro tier with 720p/1080p rendering and standard generation quotas.
   - **Admin Studio Max Portal**: 
     - **Infinite Generation**: Uncapped video generation credits (`∞`).
     - **Ultra 4K Quality**: 3840×2160 UHD cinematic rendering unlocked freely.
     - **SHA-256 Encrypted Authentication**: Passkeys are cryptographically verified using irreversible SHA-256 hashes (`crypto.subtle.digest`).
     - **Email Privacy Masking**: Administrator identity is masked with asterisks (`********************`) across the UI to protect privacy.
     - **Encrypted 1-Click Fast Unlock**: Optional local encrypted token caching.

7. **Zero-Secret GitHub Repository Safety**
   - Strict `.gitignore` configuration omitting `.env`, build artifacts, and local test captures.
   - Zero plaintext credentials or emails in the codebase or version control.
   - Client and server-side secret protection.

---

## Technical Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS.
- **Backend**: Express, Node.js (`server.ts`).
- **AI Engine**: `@google/genai` with model `gemini-3.8-flash` for vision perception and prompt expansion.
- **Rendering Engine**: HTML5 Canvas & `MediaRecorder` API video synthesis.
- **Security & Hashing**: Web Crypto API & Node `crypto` (SHA-256).
- **Testing**: `node:test` and `node:assert/strict` via `tsx`.

---

## Local Development & Testing

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npx --yes tsx --test src/utils/motionMath.test.ts src/utils/cryptoAuth.test.ts

# 3. Start development server (Port 3000)
npm run dev

# 4. Build for production
npm run build
```

---

## Environment Variables

- `GEMINI_API_KEY`: Required for server-side Gemini 3.8 Flash vision and prompt enhancement.
- `PORT`: Server port (defaults to 3000).

---

## GitHub Repository & Setup

Target Repository: `https://github.com/contactncube369/ai-image-to-video-motion.git`

```bash
# 1. Add remote (configured)
git remote add origin https://github.com/contactncube369/ai-image-to-video-motion.git

# 2. Verify branch
git branch -M main

# 3. Push to your GitHub repository
git push -u origin main
```

> **Note on GitHub Authentication**:
> GitHub requires a **Personal Access Token (Classic or Fine-Grained)** with `repo` permissions to authenticate `git push` over HTTPS. Use your GitHub username and Personal Access Token when prompted for password.

