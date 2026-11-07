(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const translations = {
    en: {
      title: "Poomsae playback", language: "Language", game: "← Sparring game", analyzer: "Camera analyzer",
      intro: "Load a pose-landmarks JSON file exported from the camera analyzer. Files remain on your device.",
      file: "Camera A points JSON:", file2: "Camera B points JSON (optional):", canvas: "3D Poomsae avatar", play: "Play", pause: "Pause", restart: "Restart", seek: "Position", speed: "Speed",
      limitations: "Experimental reconstruction, not technique recognition or assessment. Turn the view by dragging. Hidden or uncertain joints and long gaps are not reconstructed. Screen movement is approximate; camera depth and exact foot contact cannot be recovered from these recordings.",
      formats: "The kick CSV and kicks JSON do not contain arm or full-body points and cannot reproduce choreography. In the analyzer, stop point capture and choose “Export points JSON”.",
      idle: "Choose an exported pose-points JSON file.", loading: "Loading pose points…", ready: "Recording loaded. Press Play.", playing: "Playing recorded pose points.", paused: "Playback paused.", ended: "Playback finished.", gap: "No reliable pose in this recording gap.", low: "Some body points are not visible; the avatar is incomplete.",
      invalid: "Cannot use this file. Select a valid pose-landmarks JSON with image and world points; kick JSON and CSV are not full-body recordings.",
      view: "View", viewFused: "Fused (A+B)", viewBoth: "A and B side by side", viewA: "Camera A only", viewB: "Camera B only",
      synced: "Cameras synchronised and fused. Press Play.", noSync: "These two recordings could not be matched in time, so they are not fused.", noYaw: "The camera angle could not be estimated, so the recordings are not fused.",
      tooLarge: "File exceeds the 50 MiB limit.", readError: "Could not read the file.", engineError: "Could not load the 3D engine. Check your connection and reload.", storageError: "Language preference could not be saved."
    },
    pl: {
      title: "Odtwarzanie Poomsae", language: "Język", game: "← Gra sparingowa", analyzer: "Analizator kamery",
      intro: "Wczytaj plik JSON pose-landmarks wyeksportowany z analizatora. Pliki pozostają na Twoim urządzeniu.",
      file: "Kamera A, punkty pozy JSON:", file2: "Kamera B, punkty pozy JSON (opcjonalnie):", canvas: "Awatar Poomsae 3D", play: "Odtwórz", pause: "Pauza", restart: "Od początku", seek: "Pozycja", speed: "Prędkość",
      limitations: "Eksperymentalna rekonstrukcja, nie rozpoznawanie ani ocena techniki. Obróć widok przeciągając. Ukryte lub niepewne punkty i długie przerwy nie są rekonstruowane. Przemieszczenie jest przybliżone; głębi i dokładnego kontaktu stóp z podłożem nie da się odzyskać z tych danych.",
      formats: "CSV i JSON kopnięć nie zawierają punktów rąk ani całej sylwetki i nie odtworzą choreografii. W analizatorze zatrzymaj przechwytywanie punktów i wybierz „Eksport punktów JSON”.",
      idle: "Wybierz wyeksportowany plik punktów pozy JSON.", loading: "Wczytywanie punktów pozy…", ready: "Wczytano nagranie. Naciśnij Odtwórz.", playing: "Odtwarzanie punktów pozy.", paused: "Odtwarzanie wstrzymane.", ended: "Koniec nagrania.", gap: "Brak wiarygodnej pozy w tej przerwie nagrania.", low: "Niektóre punkty są niewidoczne; awatar jest niekompletny.",
      invalid: "Nie można użyć tego pliku. Wybierz poprawny JSON punktów obrazu i świata; JSON kopnięć i CSV nie zawierają pełnej sylwetki.",
      view: "Widok", viewFused: "Połączony (A+B)", viewBoth: "A i B obok siebie", viewA: "Tylko kamera A", viewB: "Tylko kamera B",
      synced: "Kamery zsynchronizowane i połączone. Naciśnij Odtwórz.", noSync: "Nie udało się dopasować tych nagrań w czasie, więc nie są połączone.", noYaw: "Nie udało się oszacować kąta kamer, więc nagrania nie są połączone.",
      tooLarge: "Plik przekracza limit 50 MiB.", readError: "Nie udało się odczytać pliku.", engineError: "Nie udało się wczytać silnika 3D. Sprawdź połączenie i odśwież.", storageError: "Nie udało się zapisać języka."
    },
    ko: {
      title: "품새 재생", language: "언어", game: "← 겨루기 게임", analyzer: "카메라 분석기",
      intro: "카메라 분석기에서 내보낸 pose-landmarks JSON 파일을 불러오세요. 파일은 기기에 남습니다.",
      file: "카메라 A 자세 점 JSON:", file2: "카메라 B 자세 점 JSON (선택):", canvas: "3D 품새 아바타", play: "재생", pause: "일시정지", restart: "처음부터", seek: "위치", speed: "속도",
      limitations: "실험적인 재구성이며 기술 인식이나 평가가 아닙니다. 드래그하여 시점을 돌리세요. 보이지 않거나 불확실한 관절과 긴 공백은 재구성하지 않습니다. 이동은 대략적이며 카메라 깊이와 정확한 발 접지는 복원할 수 없습니다.",
      formats: "발차기 CSV 및 JSON에는 팔이나 전신 점이 없어 동작을 재생할 수 없습니다. 분석기에서 점 기록을 중지하고 '점 JSON 내보내기'를 선택하세요.",
      idle: "내보낸 자세 점 JSON 파일을 선택하세요.", loading: "자세 점을 불러오는 중…", ready: "기록을 불러왔습니다. 재생을 누르세요.", playing: "기록된 자세 점을 재생 중입니다.", paused: "재생이 일시정지되었습니다.", ended: "재생이 끝났습니다.", gap: "이 구간에는 신뢰할 수 있는 자세가 없습니다.", low: "일부 신체 점이 보이지 않아 아바타가 불완전합니다.",
      invalid: "이 파일은 사용할 수 없습니다. 이미지 및 월드 점이 있는 자세 JSON을 선택하세요. 발차기 JSON과 CSV는 전신 기록이 아닙니다.",
      view: "보기", viewFused: "융합 (A+B)", viewBoth: "A와 B 나란히", viewA: "카메라 A만", viewB: "카메라 B만",
      synced: "카메라를 동기화하고 융합했습니다. 재생을 누르세요.", noSync: "두 기록의 시간을 맞출 수 없어 융합하지 않았습니다.", noYaw: "카메라 각도를 추정할 수 없어 융합하지 않았습니다.",
      tooLarge: "파일이 50 MiB 제한을 초과합니다.", readError: "파일을 읽지 못했습니다.", engineError: "3D 엔진을 불러오지 못했습니다. 연결을 확인하고 새로고침하세요.", storageError: "언어 설정을 저장하지 못했습니다."
    }
  };
  let language = "en", status = "idle", storageFailed = false;
  try { language = localStorage.getItem("kickit-language") || "en"; }
  catch (error) { console.error("Could not read language preference.", error); storageFailed = true; }
  if (!translations[language]) language = "en";
  const t = (key) => translations[language][key];
  function renderLanguage() {
    document.documentElement.lang = language;
    document.title = `${t("title")} — KickIt`;
    $("language").value = language;
    document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => { element.setAttribute("aria-label", t(element.dataset.i18nAria)); });
    $("status").textContent = t(status) + (storageFailed ? ` ${t("storageError")}` : "");
  }
  function setStatus(key) { if (status !== key) { status = key; renderLanguage(); } }
  $("language").addEventListener("change", () => {
    language = $("language").value;
    try { localStorage.setItem("kickit-language", language); storageFailed = false; }
    catch (error) { console.error("Could not save language preference.", error); storageFailed = true; }
    renderLanguage();
  });
  renderLanguage();
  if (typeof BABYLON === "undefined" || !window.KickitMotion) {
    $("file").disabled = $("file2").disabled = true;
    setStatus("engineError");
    return;
  }

  const canvas = $("canvas");
  let engine;
  try { engine = new BABYLON.Engine(canvas, true); }
  catch (error) { console.error("Could not create 3D engine.", error); $("file").disabled = $("file2").disabled = true; setStatus("engineError"); return; }
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = BABYLON.Color4.FromHexString("#b6c1caff");
  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, 1.35, 6, new BABYLON.Vector3(0, 0.95, 0), scene);
  camera.lowerRadiusLimit = 2.2;
  camera.upperRadiusLimit = 12;
  camera.attachControl(canvas, true);
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.9;
  function material(name, color) {
    const result = new BABYLON.StandardMaterial(name, scene);
    result.diffuseColor = BABYLON.Color3.FromHexString(color);
    return result;
  }
  const dobok = material("dobok", "#f0eee7"), belt = material("belt", "#20252b");
  const skin = material("skin", "#c9906b"), mat = material("mat", "#67849b");
  const floor = BABYLON.MeshBuilder.CreateGround("floor", { width: 12, height: 12 }, scene);
  floor.material = mat;
  const tintB = material("dobok-b", "#bcd7f2");
  function createAvatar(name, cloth) {
    const segments = [
      [11, 12, .17, cloth], [11, 23, .16, cloth], [12, 24, .16, cloth], [23, 24, .11, belt],
      [11, 13, .12, cloth], [13, 15, .10, cloth], [12, 14, .12, cloth], [14, 16, .10, cloth],
      [23, 25, .16, cloth], [25, 27, .12, cloth], [24, 26, .16, cloth], [26, 28, .12, cloth],
      [27, 31, .09, cloth], [28, 32, .09, cloth]
    ].map(([a, b, diameter, color], index) => {
      const mesh = BABYLON.MeshBuilder.CreateCylinder(`${name}-limb-${index}`, { height: 1, diameter, tessellation: 12 }, scene);
      mesh.material = color;
      mesh.setEnabled(false);
      return { a, b, mesh };
    });
    const joints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].map((index) => {
      const mesh = BABYLON.MeshBuilder.CreateSphere(`${name}-joint-${index}`, { diameter: index === 15 || index === 16 ? .12 : .14, segments: 8 }, scene);
      mesh.material = index === 15 || index === 16 ? skin : cloth;
      mesh.setEnabled(false);
      return { index, mesh };
    });
    const head = BABYLON.MeshBuilder.CreateSphere(`${name}-head`, { diameter: .24, segments: 12 }, scene);
    head.material = skin;
    head.setEnabled(false);
    const torso = BABYLON.MeshBuilder.CreateCylinder(`${name}-torso`, { height: 1, diameterTop: .38, diameterBottom: .30, tessellation: 12 }, scene);
    torso.material = cloth;
    torso.scaling.z = .7;
    torso.setEnabled(false);
    return { segments, joints, head, torso };
  }
  // Two cameras are shown side by side; their clocks are not synchronised, so both start at 0 s.
  const tintF = material("dobok-f", "#cfe9d4");
  const slots = [
    { name: "a", recording: null, origin: null, avatar: createAvatar("a", dobok), offset: -.9, input: "file", shift: 0 },
    { name: "b", recording: null, origin: null, avatar: createAvatar("b", tintB), offset: .9, input: "file2", shift: 0 },
    { name: "fused", recording: null, origin: null, avatar: createAvatar("fused", tintF), offset: 0, input: null, shift: 0 }
  ];
  let fusion = null;
  // Fused view needs both recordings; otherwise A and B are shown unsynchronised, each starting at 0 s.
  function activeSlots() {
    const [a, b, fused] = slots;
    const mode = fusion ? $("view").value : "viewBoth";
    const chosen = mode === "viewFused" ? [fused] : mode === "viewA" ? [a] : mode === "viewB" ? [b] : [a, b];
    chosen.forEach((slot) => { slot.offset = chosen.length === 2 ? (slot === a ? -.9 : .9) : 0; });
    return chosen;
  }
  const durationOf = (slot) => slot.recording ? slot.shift + slot.recording.frames[slot.recording.frames.length - 1].timeSeconds - slot.recording.frames[0].timeSeconds : 0;
  const totalDuration = () => Math.max(0, ...activeSlots().map(durationOf));
  let position = 0, playing = false, loading = false, previousTime = null, generation = 0;
  const visible = (p) => p && (p.visibility === undefined || p.visibility >= .4);
  const mid = (a, b, axis) => (a[axis] + b[axis]) / 2;
  function hideAvatar({ segments, joints, head, torso }) {
    segments.forEach(({ mesh }) => mesh.setEnabled(false));
    joints.forEach(({ mesh }) => mesh.setEnabled(false));
    head.setEnabled(false);
    torso.setEnabled(false);
  }
  function updateControls() {
    const has = slots.some((slot) => slot.recording) && !loading;
    $("play").disabled = !has || playing;
    $("pause").disabled = !has || !playing;
    $("restart").disabled = !has;
    $("seek").disabled = !has;
    const duration = has ? totalDuration() : 0;
    $("seek").max = duration;
    $("seek").value = position;
    $("time").textContent = `${position.toFixed(1)} / ${duration.toFixed(1)} s`;
  }
  function renderSlot(slot) {
    const { recording, origin, avatar } = slot;
    const { segments, joints, head, torso } = avatar;
    if (!recording || position < slot.shift || position > durationOf(slot)) { hideAvatar(avatar); return "off"; }
    const frames = recording.frames;
    const result = KickitMotion.sample(frames, frames[0].timeSeconds + position - slot.shift);
    if (result.gap) { hideAvatar(avatar); return "gap"; }
    const image = result.frame.landmarks, world = result.frame.worldLandmarks;
    if (![23, 24].every((i) => visible(image[i]) && visible(world[i]))) { hideAvatar(avatar); return "low"; }
    const hip = { x: mid(world[23], world[24], "x"), y: mid(world[23], world[24], "y"), z: mid(world[23], world[24], "z") };
    const x = slot.offset + (mid(image[23], image[24], "x") - origin.x) * 3;
    const y = 1 - (mid(image[23], image[24], "y") - origin.y) * 2;
    const point = (index) => new BABYLON.Vector3(x + world[index].x - hip.x, y - world[index].y + hip.y, hip.z - world[index].z);
    const valid = (index) => visible(image[index]) && visible(world[index]);
    function placeSegment(mesh, from, to) {
      const direction = to.subtract(from);
      const length = direction.length();
      if (length < 0.001) { mesh.setEnabled(false); return; }
      mesh.setEnabled(true);
      mesh.position.copyFrom(from.add(to).scale(.5));
      mesh.scaling.y = length;
      const axis = BABYLON.Vector3.Cross(BABYLON.Axis.Y, direction.normalize());
      const dot = BABYLON.Vector3.Dot(BABYLON.Axis.Y, direction);
      mesh.rotationQuaternion = axis.lengthSquared() < 1e-10
        ? BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, dot < 0 ? Math.PI : 0)
        : BABYLON.Quaternion.RotationAxis(axis.normalize(), Math.acos(Math.max(-1, Math.min(1, dot))));
    }
    segments.forEach(({ a, b, mesh }) => {
      if (!valid(a) || !valid(b)) { mesh.setEnabled(false); return; }
      placeSegment(mesh, point(a), point(b));
    });
    if ([11, 12, 23, 24].every(valid)) {
      placeSegment(torso, point(23).add(point(24)).scale(.5), point(11).add(point(12)).scale(.5));
    } else torso.setEnabled(false);
    joints.forEach(({ index, mesh }) => {
      mesh.setEnabled(valid(index));
      if (valid(index)) mesh.position.copyFrom(point(index));
    });
    head.setEnabled(valid(0));
    if (valid(0)) head.position.copyFrom(point(0));
    return [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].every(valid) ? "ok" : "low";
  }
  function renderPose() {
    const active = activeSlots();
    slots.filter((slot) => !active.includes(slot)).forEach((slot) => hideAvatar(slot.avatar));
    const states = active.filter((slot) => slot.recording).map(renderSlot);
    active.filter((slot) => !slot.recording).forEach((slot) => hideAvatar(slot.avatar));
    if (!states.length) return;
    if (states.includes("ok")) setStatus(playing ? "playing" : "paused");
    else setStatus(states.includes("gap") ? "gap" : states.includes("low") ? "low" : status);
  }
  async function loadSlot(slot, event) {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    playing = false;
    loading = true;
    previousTime = null;
    updateControls();
    const request = ++generation;
    if (file.size > KickitMotion.MAX_FILE_BYTES) { loading = false; updateControls(); setStatus("tooLarge"); return; }
    setStatus("loading");
    try {
      const data = JSON.parse(await file.text());
      if (request !== generation) return;
      if (!KickitMotion.validate(data, { requireWorld: true })) { setStatus("invalid"); return; }
      const hips = data.frames.find((frame) => [23, 24].every((i) => visible(frame.landmarks[i]) && visible(frame.worldLandmarks[i])));
      if (!hips) { setStatus("invalid"); return; }
      slot.origin = { x: mid(hips.landmarks[23], hips.landmarks[24], "x"), y: mid(hips.landmarks[23], hips.landmarks[24], "y") };
      slot.recording = data;
      let readyKey = "ready";
      const [a, b, fused] = slots;
      fusion = null; fused.recording = null; a.shift = 0; b.shift = 0; fused.origin = null;
      if (a.recording && b.recording && window.KickitFusion) {
        const result = KickitFusion.fuse(a.recording, b.recording);
        if (result.frames && result.frames.length > 1) {
          const hipsF = result.frames.find((frame) => [23, 24].every((i) => visible(frame.landmarks[i]) && visible(frame.worldLandmarks[i])));
          if (hipsF) {
            fusion = result;
            fused.recording = { frames: result.frames };
            fused.origin = { x: mid(hipsF.landmarks[23], hipsF.landmarks[24], "x"), y: mid(hipsF.landmarks[23], hipsF.landmarks[24], "y") };
            a.shift = Math.max(0, -result.lag / result.fps);
            b.shift = a.shift + result.lag / result.fps;
            readyKey = "synced";
            $("syncInfo").textContent = `Δt = ${result.lag >= 0 ? "+" : ""}${(result.lag / result.fps).toFixed(2)} s · z = ${result.sync.zScore.toFixed(1)} · ${(result.bothFraction * 100).toFixed(0)}%`;
          }
        } else readyKey = result.reason === "no-yaw" ? "noYaw" : "noSync";
      }
      $("viewRow").hidden = !fusion;
      if (!fusion) $("syncInfo").textContent = "";
      else $("view").value = "viewFused";
      position = 0;
      playing = false;
      previousTime = null;
      renderPose();
      updateControls();
      setStatus(readyKey);
    } catch (error) {
      console.error("Could not read pose recording.", error);
      if (request === generation) setStatus(error instanceof SyntaxError ? "invalid" : "readError");
    } finally {
      if (request === generation) { loading = false; updateControls(); }
    }
  }
  slots.filter((slot) => slot.input).forEach((slot) => $(slot.input).addEventListener("change", (event) => loadSlot(slot, event)));
  $("view").addEventListener("change", () => { previousTime = null; renderPose(); updateControls(); });
  $("play").addEventListener("click", () => {
    if (position >= totalDuration()) position = 0;
    playing = true; previousTime = null; updateControls(); renderPose();
  });
  $("pause").addEventListener("click", () => { playing = false; previousTime = null; updateControls(); renderPose(); });
  $("restart").addEventListener("click", () => { position = 0; previousTime = null; renderPose(); updateControls(); });
  $("seek").addEventListener("input", () => { position = Number($("seek").value); previousTime = null; renderPose(); updateControls(); });
  engine.runRenderLoop(() => {
    const now = performance.now();
    if (playing && slots.some((slot) => slot.recording)) {
      if (previousTime !== null) position += (now - previousTime) / 1000 * Number($("speed").value);
      previousTime = now;
      const duration = totalDuration();
      if (position >= duration) { position = duration; playing = false; previousTime = null; }
      renderPose(); updateControls();
      if (!playing && status !== "gap" && status !== "low") setStatus("ended");
    }
    scene.render();
  });
  window.addEventListener("resize", () => engine.resize());
})();
