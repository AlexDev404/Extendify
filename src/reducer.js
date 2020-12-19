export const initialState = {
  user: null,
  playlist: [],
  playing: false,
  item: null,
};

const reducer = (state, action) => {
  console.log(action);
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.user,
      };

    case "SET_PLAYING":
      return {
        ...state,
        playing: action.playing,
      };

    case "SET_ITEM":
      return {
        ...state,
        item: action.item,
      };

    case "SET_playlist":
      return {
        ...state,
        playlist: action.playlist,
      };

    default:
      console.warn("[reducer]: Action Not Specified!");
      return state;
  }
};

export default reducer;
