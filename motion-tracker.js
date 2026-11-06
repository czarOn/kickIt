(function (root) {
  "use strict";

  const MAX_FRAMES = 3600;
  const MAX_SECONDS = 120;
  const MAX_FILE_BYTES = 50 * 1024 * 1024;
  const MAX_INTERPOLATION_GAP = 0.25;

  function validPoints(points) {
    return Array.isArray(points) && points.length === 33 && points.every((point) =>
      point && Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z) &&
      (point.visibility === undefined || (Number.isFinite(point.visibility) && point.visibility >= 0 && point.visibility <= 1)));
  }

  function validate(data, options = {}) {
    if (!data || data.format !== "kickit-pose-landmarks" || data.version !== 1 ||
        !Array.isArray(data.frames) || data.frames.length < 2 || data.frames.length > MAX_FRAMES) return false;
    return data.frames.every((frame, i) => frame &&
      Number.isFinite(frame.timeSeconds) && frame.timeSeconds >= 0 && frame.timeSeconds <= MAX_SECONDS &&
      (i === 0 || frame.timeSeconds > data.frames[i - 1].timeSeconds) &&
      validPoints(frame.landmarks) && (!options.requireWorld || validPoints(frame.worldLandmarks)));
  }

  function frameIndex(frames, time) {
    let low = 0, high = frames.length - 1;
    while (low < high) {
      const middle = Math.floor((low + high + 1) / 2);
      if (frames[middle].timeSeconds <= time) low = middle;
      else high = middle - 1;
    }
    return low;
  }

  function interpolatePoints(a, b, amount) {
    return a.map((point, index) => {
      const next = b[index];
      return {
        x: point.x + (next.x - point.x) * amount,
        y: point.y + (next.y - point.y) * amount,
        z: point.z + (next.z - point.z) * amount,
        visibility: Math.min(point.visibility === undefined ? 1 : point.visibility, next.visibility === undefined ? 1 : next.visibility)
      };
    });
  }

  function sample(frames, time) {
    const index = frameIndex(frames, time);
    const a = frames[index], b = frames[Math.min(index + 1, frames.length - 1)];
    const gap = b.timeSeconds - a.timeSeconds;
    if (time <= a.timeSeconds || gap === 0) return { frame: a, gap: false };
    if (gap > MAX_INTERPOLATION_GAP) return { frame: null, gap: true };
    const amount = Math.max(0, Math.min(1, (time - a.timeSeconds) / gap));
    return { frame: {
      timeSeconds: time,
      landmarks: interpolatePoints(a.landmarks, b.landmarks, amount),
      worldLandmarks: a.worldLandmarks && b.worldLandmarks ? interpolatePoints(a.worldLandmarks, b.worldLandmarks, amount) : undefined
    }, gap: false };
  }

  root.KickitMotion = Object.freeze({ MAX_FILE_BYTES, validate, frameIndex, sample });
})(globalThis);
