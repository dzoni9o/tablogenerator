export function createMobileSegments(breakers, segmentSize = 12) {
  if (breakers.length === 0) return [];

  const segments = [];
  let currentSegment = createSegment(1, segmentSize);

  breakers.forEach((breaker) => {
    const modules = Number(breaker.poles) || 1;
    const wouldOverflow = currentSegment.used > 0 && currentSegment.used + modules > segmentSize;

    if (wouldOverflow) {
      segments.push(currentSegment);
      currentSegment = createSegment(currentSegment.end + 1, segmentSize);
    }

    currentSegment.breakers.push(breaker);
    currentSegment.used += modules;

    while (currentSegment.used > currentSegment.end - currentSegment.start + 1) {
      currentSegment.end += segmentSize;
    }
  });

  segments.push(currentSegment);
  return segments;
}

function createSegment(start, segmentSize) {
  return {
    start,
    end: start + segmentSize - 1,
    used: 0,
    breakers: [],
  };
}
