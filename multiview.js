(() => {
  // Fuses two single-camera MediaPipe world-landmark recordings of the same performance.
  // 1) time offset from cross-correlated limb motion energy, 2) sliding-window robust vertical-axis rotation (2D Procrustes, Huber),
  // 3) per-joint weighted least squares using visibility and per-camera bone-length reliability.
  const HIP = [23, 24], SHOULDER = [11, 12];
  const FEATURE_JOINTS = [0, 11, 12, 13, 14, 15, 16, 25, 26, 27, 28, 31, 32];
  const ok = (p) => p && (p.visibility === undefined || p.visibility >= .4);
  const mid = (w, pair, axis) => (w[pair[0]][axis] + w[pair[1]][axis]) / 2;

  function resample(frames, fps) {
    const t0 = frames[0].timeSeconds, n = Math.floor((frames[frames.length - 1].timeSeconds - t0) * fps) + 1;
    const out = new Array(n);
    let k = 0;
    for (let i = 0; i < n; i++) {
      const t = t0 + i / fps;
      while (k < frames.length - 1 && Math.abs(frames[k + 1].timeSeconds - t) <= Math.abs(frames[k].timeSeconds - t)) k++;
      out[i] = Math.abs(frames[k].timeSeconds - t) <= 1.5 / fps ? frames[k] : null;
    }
    return out;
  }

  // Closed-form 2D Procrustes about the vertical axis with Huber re-weighting.
  // Returns the angle that rotates horizontal vectors of A onto B (optionally after mirroring A's x axis).
  function estimateYaw(pairs, mirror) {
    let weights = pairs.map(() => 1), angle = 0, rms = 0;
    for (let iteration = 0; iteration < 8; iteration++) {
      let dot = 0, cross = 0;
      pairs.forEach(({ a, b }, k) => {
        const ax = mirror ? -a[0] : a[0], az = a[1];
        dot += weights[k] * (ax * b[0] + az * b[1]);
        cross += weights[k] * (ax * b[1] - az * b[0]);
      });
      angle = Math.atan2(cross, dot);
      const c = Math.cos(angle), s = Math.sin(angle);
      const residual = pairs.map(({ a, b }) => {
        const ax = mirror ? -a[0] : a[0], az = a[1];
        return Math.hypot(c * ax - s * az - b[0], s * ax + c * az - b[1]);
      });
      const sorted = residual.slice().sort((x, y) => x - y);
      const delta = Math.max(.02, 1.4826 * sorted[Math.floor(sorted.length / 2)]) * 1.5;
      weights = residual.map((r) => (r <= delta ? 1 : delta / r));
      rms = Math.sqrt(residual.reduce((sum, r, k) => sum + weights[k] * r * r, 0) / weights.reduce((p, q) => p + q, 0));
    }
    return { angle, rms };
  }

  // Cross-correlates yaw-invariant limb motion energy; returns the lag (seconds) such that B time t matches A time t + lag.
  function motionEnergy(frames, fps) {
    const grid = resample(frames, fps), raw = [NaN];
    for (let i = 1; i < grid.length; i++) {
      const p = grid[i - 1] && grid[i - 1].worldLandmarks, q = grid[i] && grid[i].worldLandmarks;
      let sum = 0, count = 0;
      if (p && q && HIP.every((k) => ok(p[k]) && ok(q[k]))) {
        const py = mid(p, HIP, "y"), qy = mid(q, HIP, "y");
        for (const j of [13, 14, 15, 16, 25, 26, 27, 28]) {
          if (!ok(p[j]) || !ok(q[j])) continue;
          sum += Math.hypot(q[j].x - p[j].x, (q[j].y - qy) - (p[j].y - py), q[j].z - p[j].z);
          count++;
        }
      }
      raw.push(count > 4 ? sum / count : NaN);
    }
    return raw.map((_, i) => {
      let sum = 0, count = 0;
      for (let k = -2; k <= 2; k++) { const v = raw[i + k]; if (v === v) { sum += v; count++; } }
      return count ? sum / count : NaN;
    });
  }

  function syncOffset(recordingA, recordingB, fps = 20, minOverlapSeconds = 10) {
    const ea = motionEnergy(recordingA.frames, fps), eb = motionEnergy(recordingB.frames, fps);
    const scores = [];
    for (let lag = -eb.length + 1; lag < ea.length; lag++) {
      let n = 0, sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
      for (let i = 0; i < eb.length; i++) {
        const x = ea[i + lag], y = eb[i];
        if (!(i + lag >= 0 && i + lag < ea.length) || x !== x || y !== y) continue;
        n++; sa += x; sb += y; saa += x * x; sbb += y * y; sab += x * y;
      }
      if (n < minOverlapSeconds * fps) continue;
      const denominator = Math.sqrt((n * saa - sa * sa) * (n * sbb - sb * sb));
      if (denominator > 0) scores.push([lag, (n * sab - sa * sb) / denominator]);
    }
    if (!scores.length) return null;
    const mean = scores.reduce((s, [, c]) => s + c, 0) / scores.length;
    const deviation = Math.sqrt(scores.reduce((s, [, c]) => s + (c - mean) ** 2, 0) / scores.length) || 1;
    const [lag, correlation] = scores.reduce((best, item) => (item[1] > best[1] ? item : best));
    return { lagSeconds: lag / fps, correlation, zScore: (correlation - mean) / deviation };
  }

  const rotate = (x, z, angle) => [Math.cos(angle) * x - Math.sin(angle) * z, Math.sin(angle) * x + Math.cos(angle) * z];

  // Per-sample yaw of camera A -> camera B from joints in a sliding window; unwrapped and smoothed.
  function yawTrack(a, b, lag, fps, windowSeconds = 8, stepSeconds = .5) {
    const half = Math.round(windowSeconds * fps / 2), step = Math.round(stepSeconds * fps), track = [];
    for (let center = 0; center < b.length; center += step) {
      const pairs = [];
      for (let i = Math.max(0, center - half); i < Math.min(b.length, center + half); i += 2) {
        const wa = a[i + lag] && a[i + lag].worldLandmarks, wb = b[i] && b[i].worldLandmarks;
        if (!wa || !wb || !HIP.every((k) => ok(wa[k]) && ok(wb[k]))) continue;
        const ha = [mid(wa, HIP, "x"), mid(wa, HIP, "z")], hb = [mid(wb, HIP, "x"), mid(wb, HIP, "z")];
        for (const j of FEATURE_JOINTS) {
          if (!ok(wa[j]) || !ok(wb[j])) continue;
          const u = [wa[j].x - ha[0], wa[j].z - ha[1]], v = [wb[j].x - hb[0], wb[j].z - hb[1]];
          if (Math.hypot(...u) > .15 && Math.hypot(...v) > .15) pairs.push({ a: u, b: v });
        }
      }
      if (pairs.length >= 60) { const e = estimateYaw(pairs, false); track.push({ index: center, angle: e.angle, rms: e.rms }); }
    }
    if (!track.length) return null;
    for (let k = 1; k < track.length; k++) {
      while (track[k].angle - track[k - 1].angle > Math.PI) track[k].angle -= 2 * Math.PI;
      while (track[k].angle - track[k - 1].angle < -Math.PI) track[k].angle += 2 * Math.PI;
    }
    const smooth = track.map((t, k) => {
      let sum = 0, count = 0;
      for (let d = -2; d <= 2; d++) if (track[k + d]) { sum += track[k + d].angle; count++; }
      return { index: t.index, angle: sum / count, rms: t.rms };
    });
    return (index) => {
      if (index <= smooth[0].index) return smooth[0].angle;
      const last = smooth[smooth.length - 1];
      if (index >= last.index) return last.angle;
      let k = 0;
      while (smooth[k + 1].index < index) k++;
      const t = (index - smooth[k].index) / (smooth[k + 1].index - smooth[k].index);
      return smooth[k].angle + t * (smooth[k + 1].angle - smooth[k].angle);
    };
  }

  // Weighted least squares per joint. depthRatio < 1 lowers precision along each camera's viewing ray; on the recorded pair (cameras ~30 deg apart)
  // that made bone lengths less stable than 1 (plain weighted mean), which is the default.
  function fuseJoint(measurements, depthRatio) {
    const matrix = [0, 0, 0, 0, 0, 0, 0, 0, 0], rhs = [0, 0, 0];
    for (const { p, ray, weight } of measurements) {
      const m = [
        1 - (1 - depthRatio) * ray[0] * ray[0], -(1 - depthRatio) * ray[0] * ray[1], -(1 - depthRatio) * ray[0] * ray[2],
        0, 1 - (1 - depthRatio) * ray[1] * ray[1], -(1 - depthRatio) * ray[1] * ray[2],
        0, 0, 1 - (1 - depthRatio) * ray[2] * ray[2]
      ];
      m[3] = m[1]; m[6] = m[2]; m[7] = m[5];
      for (let i = 0; i < 9; i++) matrix[i] += weight * m[i];
      for (let r = 0; r < 3; r++) rhs[r] += weight * (m[r * 3] * p[0] + m[r * 3 + 1] * p[1] + m[r * 3 + 2] * p[2]);
    }
    const [a, b, c, d, e, f, g, h, i] = matrix;
    const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    if (Math.abs(det) < 1e-9) return measurements[0].p;
    const inverse = [(e * i - f * h), (c * h - b * i), (b * f - c * e), (f * g - d * i), (a * i - c * g), (c * d - a * f), (d * h - e * g), (b * g - a * h), (a * e - b * d)].map((v) => v / det);
    return [0, 1, 2].map((r) => inverse[r * 3] * rhs[0] + inverse[r * 3 + 1] * rhs[1] + inverse[r * 3 + 2] * rhs[2]);
  }

  // A camera whose bone lengths fluctuate more has noisier depth; its weight is the inverse squared coefficient of variation.
  const BONES = [[11, 13], [13, 15], [12, 14], [14, 16], [23, 25], [25, 27], [24, 26], [26, 28]];
  function reliability(grid) {
    const lengths = BONES.map(() => []);
    for (const frame of grid) {
      const w = frame && frame.worldLandmarks;
      if (!w) continue;
      BONES.forEach(([p, q], k) => {
        if (ok(w[p]) && ok(w[q])) lengths[k].push(Math.hypot(w[p].x - w[q].x, w[p].y - w[q].y, w[p].z - w[q].z));
      });
    }
    const variation = lengths.filter((v) => v.length > 50).map((v) => {
      const mean = v.reduce((s, x) => s + x, 0) / v.length;
      return Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / v.length) / mean;
    });
    if (!variation.length) return 1;
    const cv = variation.reduce((s, x) => s + x, 0) / variation.length;
    return 1 / Math.max(.02, cv) ** 2;
  }

  function fuse(recordingA, recordingB, options = {}) {
    const fps = options.fps || 20, depthRatio = options.depthRatio ?? 1;
    const sync = options.sync || syncOffset(recordingA, recordingB, fps);
    if (!sync || sync.zScore < 4) return { sync, frames: null, reason: "no-sync" };
    const lag = Math.round(sync.lagSeconds * fps);
    const a = resample(recordingA.frames, fps), b = resample(recordingB.frames, fps);
    const yawAt = yawTrack(a, b, lag, fps);
    if (!yawAt) return { sync, frames: null, reason: "no-yaw" };
    const trust = options.trust || [reliability(a), reliability(b)];
    const trustScale = Math.max(...trust);
    const start = Math.min(0, lag), end = Math.max(a.length, b.length + lag);
    // Camera B's 2D image positions are shifted onto A's so the on-screen path stays continuous.
    let shiftX = 0, shiftY = 0, shiftCount = 0;
    for (let i = 0; i < b.length; i++) {
      const fa = a[i + lag], fb = b[i];
      if (!fa || !fb || !HIP.every((k) => ok(fa.landmarks[k]) && ok(fb.landmarks[k]))) continue;
      shiftX += mid(fa.landmarks, HIP, "x") - mid(fb.landmarks, HIP, "x");
      shiftY += mid(fa.landmarks, HIP, "y") - mid(fb.landmarks, HIP, "y");
      shiftCount++;
    }
    if (shiftCount) { shiftX /= shiftCount; shiftY /= shiftCount; }
    const frames = [];
    let withBoth = 0;
    for (let g = start; g < end; g++) {
      const fa = a[g], fb = b[g - lag];
      const hasA = fa && HIP.every((k) => ok(fa.worldLandmarks[k])), hasB = fb && HIP.every((k) => ok(fb.worldLandmarks[k]));
      if (!hasA && !hasB) continue;
      const angle = hasB ? yawAt(g - lag) : 0;
      const frame = { timeSeconds: (g - start) / fps, landmarks: [], worldLandmarks: [] };
      const sources = [];
      if (hasA) sources.push({ f: fa, ray: [0, 0, 1], turn: 0, shift: [0, 0], trust: trust[0] / trustScale });
      // B -> A rotation is -angle; B's viewing ray expressed in A's frame is rotated the same way.
      if (hasB) sources.push({ f: fb, ray: [Math.sin(-angle), 0, Math.cos(-angle)], turn: -angle, shift: [shiftX, shiftY], trust: trust[1] / trustScale });
      if (hasA && hasB) withBoth++;
      const hips = sources.map(({ f }) => [mid(f.worldLandmarks, HIP, "x"), mid(f.worldLandmarks, HIP, "y"), mid(f.worldLandmarks, HIP, "z")]);
      for (let j = 0; j < 33; j++) {
        const measurements = [];
        sources.forEach(({ f, ray, turn, trust: cameraTrust }, s) => {
          const p = f.worldLandmarks[j];
          if (!ok(p)) return;
          const [x, z] = rotate(p.x - hips[s][0], p.z - hips[s][2], turn);
          measurements.push({ p: [x, p.y - hips[s][1], z], ray, weight: (p.visibility === undefined ? 1 : p.visibility) * cameraTrust });
        });
        const image = sources.find(({ f }) => ok(f.landmarks[j])), source = image || sources[0];
        const fusedVisibility = 1 - sources.reduce((product, { f }) => product * (1 - (ok(f.worldLandmarks[j]) ? (f.worldLandmarks[j].visibility ?? 1) : 0)), 1);
        const q = source.f.landmarks[j];
        frame.landmarks.push({ x: q.x + source.shift[0], y: q.y + source.shift[1], z: q.z, visibility: image ? fusedVisibility : 0 });
        if (!measurements.length) { frame.worldLandmarks.push({ x: 0, y: 0, z: 0, visibility: 0 }); continue; }
        const [x, y, z] = fuseJoint(measurements, depthRatio);
        frame.worldLandmarks.push({ x, y, z, visibility: fusedVisibility });
      }
      frames.push(frame);
    }
    return { sync, frames, bothFraction: withBoth / frames.length, shiftSeconds: -start / fps, lag, yawAt, fps, trust };
  }

  window.KickitFusion = { resample, estimateYaw, syncOffset, yawTrack, fuseJoint, fuse };
})();
