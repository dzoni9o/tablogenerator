export function moveBreaker(rows, breakerId, targetRowId, targetBreakerId = null) {
  let movedBreaker = null;

  const rowsWithoutBreaker = rows.map((row) => {
    const breakers = row.breakers.filter((breaker) => {
      if (breaker.id !== breakerId) return true;
      movedBreaker = breaker;
      return false;
    });

    return { ...row, breakers };
  });

  if (!movedBreaker) return rows;

  return rowsWithoutBreaker.map((row) => {
    if (row.id !== targetRowId) return row;

    const insertIndex = targetBreakerId
      ? row.breakers.findIndex((breaker) => breaker.id === targetBreakerId)
      : row.breakers.length;
    const safeIndex = insertIndex < 0 ? row.breakers.length : insertIndex;
    const nextBreakers = [...row.breakers];

    nextBreakers.splice(safeIndex, 0, movedBreaker);
    return { ...row, breakers: nextBreakers };
  });
}

export function getBreakerCount(rows) {
  return rows.reduce((total, row) => total + row.breakers.length, 0);
}

export function getRowUsedModules(row) {
  return row.breakers.reduce((total, breaker) => total + (Number(breaker.poles) || 1), 0);
}

export function getTotalUsedModules(rows) {
  return rows.reduce((total, row) => total + getRowUsedModules(row), 0);
}

export function getTotalCapacity(rows) {
  return rows.reduce((total, row) => total + (Number(row.capacity) || 0), 0);
}

export function findBreaker(rows, breakerId) {
  return rows.flatMap((row) => row.breakers).find((breaker) => breaker.id === breakerId) ?? null;
}

export function findBreakerRow(rows, breakerId) {
  return rows.find((row) => row.breakers.some((breaker) => breaker.id === breakerId)) ?? null;
}
