const MAX_ITEM_COUNT_FOR_EFFECT = 10;

function getItemCount(gachaItems, itemId) {
  const count = gachaItems?.[itemId];
  return Number.isSafeInteger(count) && count > 0 ? count : 0;
}

export function getChanceRateMultiplier(gachaItems) {
  const count = Math.min(
    getItemCount(gachaItems, "energyDrink"),
    5
  );
  return 1 + count * 0.1;
}

export function getChanceSuccessRate(
  gachaItems,
  dopaChanceActive,
  guaranteedLetterCount
) {
  const count = Math.min(
    getItemCount(gachaItems, "tennisGrip"),
    6
  );
  const baseRate = dopaChanceActive
    ? 1 / 3
    : 1 / factorial(7 - guaranteedLetterCount);
  return Math.min(baseRate + count * 0.05, 1);
}

export function getDopaDurationBonus(gachaItems) {
  const count = Math.min(
    getItemCount(gachaItems, "poultice"),
    12
  );
  return count * 5000;
}

export function rollParkingTicketBonus(
  gachaItems,
  randomValue = Math.random()
) {
  const count = Math.min(
    getItemCount(gachaItems, "parkingTicket"),
    4
  );
  if (count === 0) {
    return 0;
  }

  const distributions = {
    1: [[1, 90], [2, 10]],
    2: [[1, 67], [2, 33]],
    3: [[1, 33], [2, 56], [3, 11]],
    4: [[1, 25], [2, 48], [3, 25], [4, 2]],
    5: [[1, 14], [2, 32], [3, 48], [4, 6]],
    6: [[2, 33], [3, 56], [4, 11]],
    7: [[2, 25], [3, 48], [4, 25], [5, 2]],
    8: [[2, 14], [3, 32], [4, 48], [5, 6]],
    9: [[3, 33], [4, 56], [5, 11]],
    10: [[4, 14], [4, 32], [5, 48], [6, 6]]
  };
  const outcomes = distributions[count];
  let cumulativeChance = 0;

  for (const [bonus, chance] of outcomes) {
    cumulativeChance += chance;
    if (randomValue < cumulativeChance / 100) {
      return bonus;
    }
  }

  return outcomes[outcomes.length - 1][0];
}

export function getFamichikiMultiplier(gachaItems) {
  const count = getItemCount(gachaItems, "famichiki");
  return Math.min(2 ** count, 10);
}

export function getTwoYenChance(gachaItems) {
  const count = Math.min(
    getItemCount(gachaItems, "twoyen"),
    MAX_ITEM_COUNT_FOR_EFFECT
  );
  return count * 0.05;
}

export function getWaterBottleDuration(gachaItems) {
  const count = Math.min(getItemCount(gachaItems, "waterBottle"), 10);
  return count * 20 * 1000;
}

export function getIpadDuration(gachaItems) {
  return getItemCount(gachaItems, "ipad") > 0 ? 30 * 1000 : 0;
}

export function getIpadShufflesPerSecond(gachaItems) {
  const count = Math.min(getItemCount(gachaItems, "ipad"), 6);
  return count > 0 ? 10 + (count - 1) * 5 : 0;
}

function factorial(value) {
  let result = 1;
  for (let factor = 2; factor <= value; factor++) {
    result *= factor;
  }
  return result;
}
