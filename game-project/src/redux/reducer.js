 
import { UPDATE_SCORE, RESET_GAME } from './actions';

const initialState = {
  score: 0,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SCORE:
      return {
        ...state,
        score: action.payload,
      };
    case RESET_GAME:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
