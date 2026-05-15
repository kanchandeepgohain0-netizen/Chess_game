const User = require('../models/User');
const Game = require('../models/Game');

const { calculateElo } = require('./eloCalculator');

const { getGame, deleteGame } = require('./gameState');

const processMatchEnd = async (gameId, winnerId, loserId, isDraw = false, endStatus = 'checkmate') => {
    try{
        const finalState = await getGame(gameId);
        if(!finalState) throw new error('Game state not found in Redis');

        const winner = await User.findById(winnerId);
        const loser = await User.findById(loserId);

        const score = isDraw ? 0.5 : 1;
        const {newRatingA: newWinnerElo, newRatingB: newLoserElo} = calculateElo(winner.elo, loser.elo, score);

        const winnerEloChange = newWinnerElo - winner.elo;
        const loserEloChange = newLoserElo - loser.elo;
        winner.elo = newWinnerElo;
        loser.elo = newLoserElo;

        if(isDraw){
            winner.draws += 1;
            loser.draws += 1;
        }else{
            winner.wins += 1;
            loser.losses += 1;
        }

        const whitePlayerId = finalState.playerWhite;
        const blackPlayerId = finalState.playerBlack;

        const whiteEloChange = winnerId.toString() === whitePlayerId ? winnerEloChange : loserEloChange;
        const blackEloChange = winnerId.toString() === blackPlayerId ? winnerEloChange : loserEloChange;

        const gameRecord = await Game.create({
            whitePlayer: whitePlayerId,
            blackPlayer: blackPlayerId,
            winner: isDraw ? null : winnerId,
            format: finalState.format || 'blitz',
            status: isDraw ? 'draw-agreement' : endStatus,
            moves: JSON.parse(finalState.moves || '[]'),
            currentFen: finalState.fen,
            whiteTimeRemaining: parseInt(finalState.whiteTimeRemaining) || 0,
            blackTimeRemaining: parseInt(finalState.blackTimeRemaining) || 0,
            whiteEloChange: whiteEloChange,
            blackEloChange: blackEloChange,
            room: finalState.roomId || null
        });

        winner.matchHistory.push(gameRecord._id);
        loser.matchHistory.push(gameRecord._id);

        await winner.save();
        await loser.save();

        await deleteGame(gameId);

        return{
            winner: {id: winner._id, newElo: newWinnerElo, eloChange: winnerEloChange},
            loser: {id: loser._id, newElo: newLoserElo, eloChange: loserEloChange}
        };

    }catch(err){
        console.error('Error processing game end:', err);
        throw err;
    }
};

module.exports = { processMatchEnd };