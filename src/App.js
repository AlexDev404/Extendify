import React from "react";
import Player from "./Player";
import "./App.css";
import populateplaylists from "./populateplaylists";

populateplaylists();

function App() {
  return (
    <div className="app">
      <Player />
    </div>
  );
}

export default App;
