function calculateElo(ratingA, ratingB, scoreA) {
  const K = 32;
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));  
  
  const changeA = Math.round(K * (scoreA - expectedA));
  const changeB = Math.round(K * ((1 - scoreA) - expectedB));

  return { changeA, changeB };
}

module.exports = { calculateElo };