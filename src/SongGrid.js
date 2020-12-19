import React from "react";
import "./SongGrid.css";

function SongGrid({ track, playSong }) {
  console.log(track);
  return (
    <div className="container">
      <div className="songGrid" onClick={() => playSong(track.id)}>
        <img
          className="songGrid__album"
          src={track.album.images[0].url}
          alt=""
        />
        <div className="songGrid__info">
          <h1>{track.name}</h1>
          <p>
            {track.artists.map((artist) => artist.name).join(", ")} -{" "}
            {track.album.name}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SongGrid;
