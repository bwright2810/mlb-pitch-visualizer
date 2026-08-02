# Code Context — MLB Pitch Visualizer Bug Video Frame Analysis

## Files Retrieved (screenshots, not source)
1. `/tmp/video-frames/frame_001.jpg` — mobile screenshot, app in "reset/ready" state, camera view showing full scene with strike zone, ball, home plate.
2. `/tmp/video-frames/frame_003.jpg` — mid-animation, camera/scene mostly black, only a sliver of green outfield visible, "Pitching..." status shown, main play area otherwise empty (visual glitch/blank render).
3. `/tmp/video-frames/frame_005.jpg` — scene shows only a horizontal split (black sky / tan dirt, no green infield grass, no strike zone, no ball) with "Throw Pitch" button active — status bar clock changed to "9:07" from the red recording indicator seen in frame 1, confirming this is a screen-recording capture.
4. `/tmp/video-frames/frame_007.jpg` — scene renders green outfield strip + strike zone box positioned near top-center of infield, but no baseball model visible and no pitcher's mound/trajectory arc; "Throw Pitch" button idle.
5. `/tmp/video-frames/frame_009.jpg` — trajectory line visible arcing from upper-left down into the strike zone box; small white/oval mark on the dirt (ball shadow or landing mark) but no visible ball sphere; status = "Pitching...".
6. `/tmp/video-frames/frame_011.jpg` — scene returns to full "reset" view identical to frame_001: strike zone rendered as translucent blue box near plate, thin blue horizontal trajectory line, small ball resting near plate, "✓ STRIKE" result banner showing, "Throw Pitch" / "Reset" buttons both enabled.

## Key Observations / Bugs

### 1. 3D Visualization — Rendering Instability (Severity: High)
- Across the 6 frames, the visible 3D scene content varies wildly in completeness: frame_001 and frame_011 show a fully rendered field (grass, dirt, strike zone, plate, ball, trajectory line), but frame_003 and frame_005 show almost nothing — large blank/black regions with only a thin sliver of green or a flat two-tone split with no strike zone, plate, or ball at all.
- This strongly suggests the Three.js/R3F canvas is failing to render mid-pitch-animation frames consistently — either the camera is briefly repositioning to an extreme/invalid angle, key meshes (field, plate, strike zone, ball) are being unmounted/remounted during the pitch animation causing pop-in, or there's a frame-drop/GPU stall causing incomplete scene composition during those captured frames.
- Frame_005 in particular shows a nearly featureless view: just a black upper half and tan lower half with a barely visible boundary line — this looks like the field mesh or camera framing is broken/degenerate during that portion of animation.

### 2. Strike Zone Box — Positioning Glitch (Severity: Medium)
- In frame_007, the semi-transparent blue strike-zone rectangle appears positioned unusually high/centered directly over the infield dirt near the pitcher's-mound side, disconnected from home plate (which is not visible in that frame at all).
- In frame_009, the strike zone box is shown but shifted, with the trajectory line terminating into its left/top edge rather than centered — the box appears smaller and off to the side compared to frames 001/011 where it sits properly straddling home plate.
- This inconsistency in strike-zone screen position across frames (sometimes near top of infield, sometimes properly at plate) suggests the strike zone's 3D position or the camera's view matrix is not synced correctly during animation playback, only settling into correct position once the pitch completes (frame_011).

### 3. Ball Trajectory Rendering (Severity: Medium)
- The thin blue trajectory line is visible in frames 001, 005 (partial), 009, 011 but is inconsistent in shape/length: in frame_001/011 it's a fairly flat horizontal line running from left edge to the strike zone; in frame_009 it's a diagonal line arcing down into the zone.
- No actual 3D baseball sphere with seams is visible flying along the trajectory during "Pitching..." states (frames_003, 005, 009) — only a small dot/oval mark on the ground is seen, suggesting either the ball mesh isn't rendering during animation, or the frames captured were between/before the ball's flight (before spawn or after it already dropped to the plate mark).

### 4. UI Overlay Artifact — Watermark/Branding Overlap (Severity: Low, cosmetic)
- In ALL 6 frames, a "pitches.just-dev.us" watermark text overlaps the bottom stat row (velocity/spin rate numbers), rendered directly on top of "92-100+ ..." and "...2600 rpm" text with a colored blurry badge/pill background behind it. This is a persistent visual artifact/overlay bug across every frame — it's not a recording artifact since it's positioned identically in every frame, suggesting a fixed overlay element (likely a screen-recording watermark tool or an intentional branding overlay) that visually collides with and obscures the pitch stats UI (velocity and spin rate labels), a genuine UI overlap bug if this is in-app content rather than external tooling.

### 5. Button/State Flow (Severity: Low, informational)
- Button states correctly cycle: `Throw Pitch` (idle) → `Pitching...` (disabled/loading, spinner icon) → `✓ STRIKE` result banner + `Throw Pitch` + `Reset` both re-enabled. This part of the state machine looks functionally correct across frames 001→003→005→007→009→011, i.e., idle→pitching→pitching→idle(new? or still setting up)→pitching→result. No obvious logic bug in the button/status text flow itself.
- Frame_007 shows "Throw Pitch" as idle/enabled while a strike zone box is rendered oddly — this could indicate the animation reset mid-sequence or there are two distinct pitch attempts captured within these 11 sampled frames (not a continuous single pitch).

### 6. Status Bar / Recording Indicator (Severity: Informational)
- Frame_001, frame_003 show a red "recording" pill in the status bar (screen recording in progress); frame_005, 007, 009, 011 show the normal clock "9:07" — indicates recording state toggled during capture, not an app bug.

## Architecture Context (not verified directly, inferred)
Per repo docs (AGENTS.md) the relevant source files are:
- `src/components/Scene3D.tsx` — Three.js/R3F 3D visualization (field, ball, strike zone, camera, trajectory) — **primary suspect for rendering instability and strike-zone positioning bugs**
- `src/components/PitchHero.tsx` — main UI component (buttons, stat display, watermark placement, "Throw Pitch"/"Pitching..."/"Reset" state machine)
- `src/types/pitch.ts` — pitch data/trajectory type defs
- `tests/3d-visualization.spec.ts` — existing Playwright test suite, good place to add regression coverage for these render-consistency issues

## Start Here
Open `src/components/Scene3D.tsx` first — the frame-to-frame render instability (blank/degenerate scenes in frame_003/005, strike-zone box misplacement in frame_007/009) is almost certainly caused by camera/mesh state changes during the pitch animation lifecycle in this file. Cross-reference with `src/components/PitchHero.tsx` to see how animation state ("idle"/"pitching"/"result") is passed down to Scene3D and whether meshes are conditionally mounted/unmounted per state (a common cause of pop-in/blank-frame bugs). Also check for a watermark/overlay component that visually collides with the stat row.

## Supervisor Coordination
None required — findings are self-contained observations from image inspection; no blocking decisions needed.

# Acceptance Report
