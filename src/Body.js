import React from "react";
import "./Body.css";
import Header from "./Header";
import { useStateValue } from "./StateProvider";
import SongGrid from "./SongGrid";

function Body() {
  const [{ discover_weekly }, dispatch] = useStateValue();

  const playPlaylist = (id) => {};

  const playSong = (id) => {};

  return (
    <div className="body">
      <h1 className="on-disk">On Deck</h1>
      <div className="grid">
        {discover_weekly?.tracks.items.map((item) => (
          <SongGrid playSong={playSong} track={item.track} />
        ))}
      </div>
    </div>
  );
}

export default Body;
