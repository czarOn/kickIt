(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const translations = {
    en: {
      title: "Poomsae playback", language: "Language", game: "← Sparring game", analyzer: "Camera analyzer",
      intro: "Load pose-landmarks.json exported from the camera analyzer. Files remain on your device.",
      file: "Pose points JSON:", canvas: "3D Poomsae avatar", play: "Play", pause: "Pause", restart: "Restart", seek: "Position", speed: "Speed",
      limitations: "Experimental reconstruction, not technique recognition or assessment. Turn the view by dragging. Hidden or uncertain joints and long gaps are not reconstructed. Screen movement is approximate; camera depth and exact foot contact cannot be recovered from these recordings.",
      formats: "The kick CSV and kicks JSON do not contain arm or full-body points and cannot reproduce choreography. In the analyzer, stop point capture and choose “Export points JSON”.",
      idle: "Choose an exported pose-points JSON file.", loading: "Loading pose points…", ready: "Recording loaded. Press Play.", playing: "Playing recorded pose points.", paused: "Playback paused.", ended: "Playback finished.", gap: "No reliable pose in this recording gap.", low: "Some body points are not visible; the avatar is incomplete.",
      invalid: "Cannot use this file. Select a valid pose-landmarks JSON with image and world points; kick JSON and CSV are not full-body recordings.",
      tooLarge: "File exceeds the 50 MiB limit.", readError: "Could not read the file.", engineError: "Could not load the 3D engine. Check your connection and reload.", storageError: "Language preference could not be saved."
    },
    pl: {
      title: "Odtwarzanie Poomsae", language: "Język", game: "← Gra sparingowa", analyzer: "Analizator kamery",
      intro: "Wczytaj pose-landmarks.json wyeksportowany z analizatora. Pliki pozostają na Twoim urządzeniu.",
      file: "Punkty pozy JSON:", canvas: "Awatar Poomsae 3D", play: "Odtwórz", pause: "Pauza", restart: "Od początku", seek: "Pozycja", speed: "Prędkość",
      limitations: "Eksperymentalna rekonstrukcja, nie rozpoznawanie ani ocena techniki. Obróć widok przeciągając. Ukryte lub niepewne punkty i długie przerwy nie są rekonstruowane. Przemieszczenie jest przybliżone; głębi i dokładnego kontaktu stóp z podłożem nie da się odzyskać z tych danych.",
      formats: "CSV i JSON kopnięć nie zawierają punktów rąk ani całej sylwetki i nie odtworzą choreografii. W analizatorze zatrzymaj przechwytywanie punktów i wybierz „Eksport punktów JSON”.",
      idle: "Wybierz wyeksportowany plik punktów pozy JSON.", loading: "Wczytywanie punktów pozy…", ready: "Wczytano nagranie. Naciśnij Odtwórz.", playing: "Odtwarzanie punktów pozy.", paused: "Odtwarzanie wstrzymane.", ended: "Koniec nagrania.", gap: "Brak wiarygodnej pozy w tej przerwie nagrania.", low: "Niektóre punkty są niewidoczne; awatar jest niekompletny.",
      invalid: "Nie można użyć tego pliku. Wybierz poprawny JSON punktów obrazu i świata; JSON kopnięć i CSV nie zawierają pełnej sylwetki.",
      tooLarge: "Plik przekracza limit 50 MiB.", readError: "Nie udało się odczytać pliku.", engineError: "Nie udało się wczytać silnika 3D. Sprawdź połączenie i odśwież.", storageError: "Nie udało się zapisać języka."
    },
    ko: {
      title: "품새 재생", language: "언어", game: "← 겨루기 게임", analyzer: "카메라 분석기",
      intro: "카메라 분석기에서 내보낸 pose-landmarks.json을 불러오세요. 파일은 기기에 남습니다.",
      file: "자세 점 JSON:", canvas: "3D 품새 아바타", play: "재생", pause: "일시정지", restart: "처음부터", seek: "위치", speed: "속도",
      limitations: "실험적인 재구성이며 기술 인식이나 평가가 아닙니다. 드래그하여 시점을 돌리세요. 보이지 않거나 불확실한 관절과 긴 공백은 재구성하지 않습니다. 이동은 대략적이며 카메라 깊이와 정확한 발 접지는 복원할 수 없습니다.",
      formats: "발차기 CSV 및 JSON에는 팔이나 전신 점이 없어 동작을 재생할 수 없습니다. 분석기에서 점 기록을 중지하고 '점 JSON 내보내기'를 선택하세요.",
      idle: "내보낸 자세 점 JSON 파일을 선택하세요.", loading: "자세 점을 불러오는 중…", ready: "기록을 불러왔습니다. 재생을 누르세요.", playing: "기록된 자세 점을 재생 중입니다.", paused: "재생이 일시정지되었습니다.", ended: "재생이 끝났습니다.", gap: "이 구간에는 신뢰할 수 있는 자세가 없습니다.", low: "일부 신체 점이 보이지 않아 아바타가 불완전합니다.",
      invalid: "이 파일은 사용할 수 없습니다. 이미지 및 월드 점이 있는 자세 JSON을 선택하세요. 발차기 JSON과 CSV는 전신 기록이 아닙니다.",
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
    $("file").disabled = true;
    setStatus("engineError");
    return;
  }

  const canvas = $("canvas");
  let engine;
  try { engine = new BABYLON.Engine(canvas, true); }
  catch (error) { console.error("Could not create 3D engine.", error); $("file").disabled = true; setStatus("engineError"); return; }
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = BABYLON.Color4.FromHexString("#b6c1caff");
  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, 1.35, 4, new BABYLON.Vector3(0, 0.95, 0), scene);
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
  const segments = [
    [11, 12, .17, dobok], [11, 23, .16, dobok], [12, 24, .16, dobok], [23, 24, .11, belt],
    [11, 13, .12, dobok], [13, 15, .10, dobok], [12, 14, .12, dobok], [14, 16, .10, dobok],
    [23, 25, .16, dobok], [25, 27, .12, dobok], [24, 26, .16, dobok], [26, 28, .12, dobok],
    [27, 31, .09, dobok], [28, 32, .09, dobok]
  ].map(([a, b, diameter, color], index) => {
    const mesh = BABYLON.MeshBuilder.CreateCylinder(`limb-${index}`, { height: 1, diameter, tessellation: 12 }, scene);
    mesh.material = color;
    mesh.setEnabled(false);
    return { a, b, mesh };
  });
  const joints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].map((index) => {
    const mesh = BABYLON.MeshBuilder.CreateSphere(`joint-${index}`, { diameter: index === 15 || index === 16 ? .12 : .14, segments: 8 }, scene);
    mesh.material = index === 15 || index === 16 ? skin : dobok;
    mesh.setEnabled(false);
    return { index, mesh };
  });
  const head = BABYLON.MeshBuilder.CreateSphere("head", { diameter: .24, segments: 12 }, scene);
  head.material = skin;
  head.setEnabled(false);
  const torso = BABYLON.MeshBuilder.CreateCylinder("dobok-torso", { height: 1, diameterTop: .38, diameterBottom: .30, tessellation: 12 }, scene);
  torso.material = dobok;
  torso.scaling.z = .7;
  torso.setEnabled(false);

  let recording = null, origin = null, position = 0, playing = false, loading = false, previousTime = null, generation = 0;
  const visible = (p) => p && (p.visibility === undefined || p.visibility >= .4);
  const mid = (a, b, axis) => (a[axis] + b[axis]) / 2;
  function hideAvatar() {
    segments.forEach(({ mesh }) => mesh.setEnabled(false));
    joints.forEach(({ mesh }) => mesh.setEnabled(false));
    head.setEnabled(false);
    torso.setEnabled(false);
  }
  function updateControls() {
    const has = !!recording && !loading;
    $("play").disabled = !has || playing;
    $("pause").disabled = !has || !playing;
    $("restart").disabled = !has;
    $("seek").disabled = !has;
    const duration = has ? recording.frames[recording.frames.length - 1].timeSeconds - recording.frames[0].timeSeconds : 0;
    $("seek").max = duration;
    $("seek").value = position;
    $("time").textContent = `${position.toFixed(1)} / ${duration.toFixed(1)} s`;
  }
  function renderPose() {
    if (!recording) return;
    const frames = recording.frames;
    const result = KickitMotion.sample(frames, frames[0].timeSeconds + position);
    if (result.gap) { hideAvatar(); setStatus("gap"); return; }
    const image = result.frame.landmarks, world = result.frame.worldLandmarks;
    if (![23, 24].every((i) => visible(image[i]) && visible(world[i]))) { hideAvatar(); setStatus("low"); return; }
    const hip = { x: mid(world[23], world[24], "x"), y: mid(world[23], world[24], "y"), z: mid(world[23], world[24], "z") };
    const x = (mid(image[23], image[24], "x") - origin.x) * 3;
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
    setStatus([0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].every(valid) ? (playing ? "playing" : "paused") : "low");
  }
  $("file").addEventListener("change", async (event) => {
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
      origin = { x: mid(hips.landmarks[23], hips.landmarks[24], "x"), y: mid(hips.landmarks[23], hips.landmarks[24], "y") };
      recording = data;
      position = 0;
      playing = false;
      previousTime = null;
      renderPose();
      updateControls();
      setStatus("ready");
    } catch (error) {
      console.error("Could not read pose recording.", error);
      if (request === generation) setStatus(error instanceof SyntaxError ? "invalid" : "readError");
    } finally {
      if (request === generation) { loading = false; updateControls(); }
    }
  });
  $("play").addEventListener("click", () => {
    const frames = recording.frames;
    if (position >= frames[frames.length - 1].timeSeconds - frames[0].timeSeconds) position = 0;
    playing = true; previousTime = null; updateControls(); renderPose();
  });
  $("pause").addEventListener("click", () => { playing = false; previousTime = null; updateControls(); renderPose(); });
  $("restart").addEventListener("click", () => { position = 0; previousTime = null; renderPose(); updateControls(); });
  $("seek").addEventListener("input", () => { position = Number($("seek").value); previousTime = null; renderPose(); updateControls(); });
  engine.runRenderLoop(() => {
    const now = performance.now();
    if (playing && recording) {
      if (previousTime !== null) position += (now - previousTime) / 1000 * Number($("speed").value);
      previousTime = now;
      const frames = recording.frames, duration = frames[frames.length - 1].timeSeconds - frames[0].timeSeconds;
      if (position >= duration) { position = duration; playing = false; previousTime = null; }
      renderPose(); updateControls();
      if (!playing && status !== "gap" && status !== "low") setStatus("ended");
    }
    scene.render();
  });
  window.addEventListener("resize", () => engine.resize());
})();
