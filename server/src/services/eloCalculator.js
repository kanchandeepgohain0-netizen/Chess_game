const calculateElo = (ratingA, ratingB, scoreA) => {
    const k = 32;
    const expectA = 1/ (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const expectB = 1/ (1 + Math.pow(10, (ratingB - ratingA) / 400));

    const scoreB = 1 - scoreA;

    const newRatingA = ratingA + k * (scoreA - expectA);
    const newRatingB = ratingB + k * (scoreB - expectB);

    return{
        newRatingA: Math.round(newRatingA),
        newRatingB: Math.round(newRatingB)
    };
};

module.exports = { calculateElo};