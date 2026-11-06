# KickIt — Recording plan: basic kicks and variations

Goal: record clean reference examples of each kick with 3 synchronized cameras, then use them to (1) tune the camera analyser and (2) build a parent/kid lesson for black belt terminology preparation (Korean kick names and counting 1–100).

> Korean names below are common romanizations and **must be verified by your coach/master** before they go into the lesson. Items marked **(?)** are the ones I'm least sure about. Romanization varies between schools (WT/Kukkiwon vs ITF).

## 1. Setup (once)

- Cameras: side, front, rear-45°. Same fps (1080p60), locked focus/exposure, fixed on stands. See sync notes: clap at the start and end of every take, say the take name aloud.
- In [the camera analyzer](./pose.html), use **Show alignment grid and center point** (enabled by default) while positioning each camera. Place one visible marker at the shared recording point and aim all three center points at that same marker. Use the grid to level each view and leave room for the full body and movement path. Hide it with the checkbox when finished. The guide is preview-only, is not included in exported pose data, and does not synchronize cameras or perform multi-camera calibration.
- Floor marker where the player starts, 1 m reference stick/tape visible to all cameras.
- Player in a contrasting uniform, fitted (no loose sleeves), barefoot or in the usual footwear.
- Space: at least 4 m in kick direction, 3 m to each side.
- File names: `T<take>_<kickId>_<variant>_<camera>.mp4`, e.g. `T012_AP_lead_air_side.mp4`.
- Keep the original files. Don't edit or compress.

## 2. Kick list

| ID | English | Korean (romanized) | Hangul | Notes |
|----|---------|--------------------|--------|-------|
| AP | Front kick | Ap chagi | 앞차기 | |
| DOL | Round house kick | Dollyeo chagi | 돌려차기 | |
| YEO | Side kick | Yeop chagi | 옆차기 | |
| NAE | Axe kick | Naeryeo chagi | 내려차기 | |
| DWI | Back kick | Dwit chagi | 뒤차기 | |
| HUR | Hook kick | Huryeo chagi | 후려차기 | |
| TRH | Turning round house kick | Dwi dollyeo chagi **(?)** | 뒤돌려차기 | Check if this is "turning" or "spinning" in your school |
| TAX | Turning axe kick | Dwi naeryeo chagi **(?)** | 뒤내려차기 | |
| SPH | Spinning hook kick | Dwi huryeo chagi **(?)** | 뒤후려차기 | |
| DT-R | Double target round house | **(?)** | | Two targets, one leg: two quick round kicks at different targets |
| DR | Double round house kick | **(?)** | | Two round kicks in a row, same target |
| DT-S | Double target side kick | **(?)** | | Two quick side kicks at different targets |
| JF | Jumping front kick | Twieo ap chagi | 뛰어앞차기 | |
| JS | Jumping side kick | Twieo yeop chagi | 뛰어옆차기 | |
| JR | Jumping round house kick | Twieo dollyeo chagi | 뛰어돌려차기 | |

Ask your coach for the exact names for the double-kick variants (`(?)`), and for the school's preferred Korean term for each.

## 3. Variations to record for every kick

Keep this matrix short so the session stays doable. "Rep" = one clean kick.

| Variant code | Description | Reps |
|--------------|-------------|------|
| `slow` | Slow demonstration, each phase clear (chamber, extension, retraction) | 2 per leg |
| `air` | Normal speed, in the air, no target | 3 per leg |
| `bag` | Normal speed on a bag or pad, mid-height target | 3 per leg |
| `high` | Normal speed, head-height target (if the player can do it safely) | 2 per leg |

- "Leg" means the **lead** leg and the **rear** leg for the kicks where this applies. Spinning and jumping kicks: record both sides of the stance (left-lead and right-lead).
- Jumping kicks: 2 reps each side only, with a mat and a coach next to the player.
- Double kicks: 3 reps each, one speed.

Rough count: about 15 kicks × 4 variants × 2 sides × 2.5 reps ≈ 300 reps. Plan on **2 short sessions** (about 45 minutes each) so the player doesn't get tired and the form stays clean.

## 4. Order of recording (easiest to hardest)

Block 1 (warm-up kicks): AP, DOL, YEO.
Block 2: NAE, HUR, DWI.
Block 3 (turning kicks): TRH, TAX, SPH.
Block 4 (doubles): DR, DT-R, DT-S.
Block 5 (jumping, last): JF, JS, JR.

## 5. Take script

Each take:

1. Say aloud the take number, kick ID, variant, and leg ("Take 12, AP, air, lead leg").
2. Clap once above head height. Wait one second.
3. Player stands in guard stance on the marker, performs the reps, and returns to guard between reps.
4. Clap again at the end.

Log each take in a note: take number, kick, variant, leg, anything that went wrong (fell, stepped off the marker, wrong kick). A short spreadsheet is enough:

| Take | Kick | Variant | Leg/stance | Reps | Quality (coach 1–5) | Notes |
|------|------|---------|------------|------|---------------------|-------|

The coach's quality score per take is what lets us later compare the camera numbers with a human judgement.

## 6. What the recordings will be used for

### Optional pose-point reference capture

In [the camera analyzer](./pose.html), start the camera or play a video you have permission to use, then use **Start point capture** and **Stop capture**. **Export points JSON** downloads all 33 estimated MediaPipe image and world landmarks with relative timestamps; it does not include video frames. Up to 24 samples per second are stored, for at most 120 seconds or 3,600 detected samples, whichever comes first. The actual rate can be lower due to camera or device performance. Check the full-body visibility message throughout the form; it is an estimate, and low-visibility points are still saved. The points remain in memory until deleted, the source is reset, or the page closes; the exported file remains wherever you save it.

For a hands-free camera start, select **Start on two claps**, allow the microphone, stand in the intended starting position, and clap twice roughly half a second apart. Wait until the status says point capture is active before moving. **Stop capture** cancels the wait; manual capture remains available. The microphone is used only while waiting, is processed locally, and audio is neither recorded nor uploaded. The trigger detects loud transient sounds, not claps with certainty: noise can trigger it or quiet claps may be missed. Microphone permission or a model refresh can fail; existing points remain available and manual capture can be used instead.

After the second sound, the analyzer creates a fresh pose landmarker and clears its leg-length and motion tracking state before starting the capture. This can take a moment and does not guarantee accurate body proportions: keep the full movement path in frame and review the result. Refreshing needs the same model resources as initial loading and may require a network connection.

Use the camera with the whole person visible and have a coach review the reference. Pose points may identify an individual: obtain a parent's permission before capturing a child, share files only deliberately, and delete them when no longer needed. This is reference data, not a Poomsae lesson or a technique assessment. The analyzer still requires an internet connection to load its model and library.

The analyzer also includes an unvalidated four-step Taegeuk Il Jang learning pilot with manual progression. A previously exported reference JSON can be loaded and replayed as a mirrored skeleton. The reference currently plays as one sequence, not as individual step demonstrations; no automatic technique grading or progression is available. Verify the instructions with a coach.

### Poomsae 3D playback

Open [Poomsae playback](./poomsae.html) from the home page or sparring game and select the `pose-landmarks.json` exported by **Export points JSON**. The browser reads it locally; playback does not upload it. Play, pause, restart, scrub or change speed, and drag the scene to rotate the view. The camera analyzer and playback use the same pose recording validation and timestamp lookup.

The 3D dobok avatar uses estimated image and world landmarks. It is not a recognition or grading system: body proportions, orientation and movement are approximate. Movement across the image is approximated; global camera depth and exact foot contact are not recorded. Low-visibility body parts are hidden, and gaps over 0.25 seconds hide the avatar rather than fabricate motion. The existing kick `frames.csv` and `kicks.json` exports contain measurements, not full-body coordinates, and cannot reproduce the form. Babylon.js and MediaPipe are currently loaded from the network. The file remains in memory until replaced or the page closes.

1. **Analyser tuning:** thresholds for kick detection per kick type (foot height, knee angle range, duration, hip/shoulder twist) in [pose.html](./pose.html).
2. **Reference ranges:** measured values per kick and player height, replacing the provisional numbers in [training_feedback.md](./training_feedback.md).
3. **Lesson clips:** short, labelled examples of each kick for the parent lesson.

## 7. Parent/kid lesson (draft structure)

Purpose: a black belt terminology preparation helper that parents can run at home with a phone camera.

**Part A — Kick names (about 10 minutes per session)**
1. Parent shows the kick card (picture and the English name).
2. Kid says the Korean name and does the kick in front of the camera.
3. The tool detects a kick and shows what it saw (which leg, rough height, knee bend). It doesn't judge technique. Naming and doing the right kick is the exercise.
4. Next card. Track which names the kid knows and which need repeating.

**Part B — Counting 1 to 100 in Korean**
- The lesson uses **native Korean numbers** (hana, dul, set …).

| # | Korean | # | Korean |
|---|--------|---|--------|
| 1 | hana | 10 | yeol |
| 2 | dul | 20 | seumul |
| 3 | set | 30 | seoreun |
| 4 | net | 40 | maheun |
| 5 | daseot | 50 | swin |
| 6 | yeoseot | 60 | yesun |
| 7 | ilgop | 70 | ilheun |
| 8 | yeodeol | 80 | yeodeun |
| 9 | ahop | 90 | aheun |

- Numbers 11–99 are the tens word plus the ones word: 11 yeol-hana, 12 yeol-dul, 15 yeol-daseot, 21 seumul-hana, 34 seoreun-net, 99 aheun-ahop.
- 100 is "on" in pure native Korean, but it is archaic and rarely used. Many schools say "baek" (the Sino-Korean word) for 100. **Ask your coach which one the black belt test expects.**
- Check the pronunciation and spelling of the tens with the coach, and add audio from a Korean speaker or the coach. Romanization varies (for example "yeoseot" is sometimes written "yosot").
- Combine counting with kicks: "kick on every count", kid says the number aloud, the tool counts the detected kicks and compares. Count targets: 1–10 first, then 1–20, then the tens, then up to 100.

**Part C — Short quiz**
- Random kick card, kid must name it in Korean and perform it.
- Streak and progress saved locally, shown to the parent.

**Parent guidance to include**
- Camera position (side, whole body in frame), safe space, short sessions.
- Praise effort and naming. Don't use the numbers to compare kids.
- The tool is a practice aid and is not a replacement for the coach.

## 8. Open questions for the coach

- Exact Korean names for the `(?)` kicks and which romanization the school uses.
- How the test expects 100 to be said (on or baek), and the range required.
- Is "turning" in the kick list the same as "spinning" in the school's terminology?
- Minimum age/level for the jumping kicks.
