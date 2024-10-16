 
export const UPDATE_SCORE = 'UPDATE_SCORE';
export const RESET_GAME = 'RESET_GAME';

export const updateScore = (score) => ({
  type: UPDATE_SCORE,
  payload: score,
});

export const resetGame = () => ({
  type: RESET_GAME,
});
