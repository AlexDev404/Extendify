const remote = require("@electron/remote");
const { ipcRenderer } = require("electron");
const ipc = ipcRenderer;
const { dialog } = remote;
let win = remote.getCurrentWindow();
const os = require("os");
const NodeID3 = require("node-id3");
const fs = require("fs");
const path = require("path");
let __drivename =
  os.platform == "win32" ? process.cwd().split(path.sep)[0] : "/";
const crypto = require("crypto");

let container;
let entryTemplate;
let pathFinder;
let baseDir;
let onDisk;

setTimeout(() => {
  container = document.getElementById("container");
  entryTemplate = document.getElementById("entryTemplate");
  onDisk = document.getElementById("on-disk");
  pathFinder = document.getElementById("pathfinder");

try{
  pathFinder.addEventListener("click", async () => {
    const file = await dialog.showOpenDialog(win, {
      properties: ["openDirectory"],
    });
    if (!file) return;
    if (file) dirName = file.filePaths[0];
    console.log(dirName);
    baseDir = path.join(dirName);
    playlist = [];
    playlist_filtered = [];
    readDir(baseDir);
  });
}
catch(error){
   console.error("There was an error. Reloading...");
   window.location.reload();
}
}, 800);
// Set Playlists To Zero (null)
// let playlist = [];
// let playlist_filtered = [];
/*
pathfinder.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    baseDir = path.join(pathfinder.value);
    playlist = [];
    playlist_filtered = [];
    readDir(baseDir);
  }
});
*/

function populateplaylists() {
  // Log Playlists To Console [ DEBUG ]

  /*
  console.log("Start");
  console.log(playlist);
  console.log("End of Unfiltered");
*/
  // Filter Tracks

  playlist.forEach(function (track_name) {
    if (track_name.endsWith(".mp3")) {
      playlist_filtered.push(track_name);
    }
  });

  //DEBUG USE ONLY!
  /*
  console.log("Start Of Filtered");
  console.log(playlist_filtered);
  console.log("End of filtered");
*/
  console.log(`${playlist_filtered.length} songs found.`);
  onDisk.innerText = "On Deck" + " (" + playlist_filtered.length + " songs found)";
  setContent(container, uniqueID());
}

function setContent(entry, uniqueID) {
  let counter = 0;
  const UID = uniqueID;
  const entryList = entry;
  let pastAlbum = [];
  let pastUID;
  let pastCounter;
  let parsebuff;
  let clearedAlready = false;

  playlist_filtered.forEach((track) => {
    if (!clearedAlready) {
      container.innerHTML = null;
      clearedAlready = true;
    }
    const trackTags = NodeID3.read(path.join(baseDir, track));
    // console.log(trackTags);
    if (!trackTags.title) trackTags.title = track;
    if (!trackTags.artist) trackTags.artist = "Unknown" + counter;
    if (!trackTags.album) trackTags.album = "Unknown" + counter;
    if (Object.keys(trackTags.raw).length === 0) {
      setRaw(entryList, entryTemplate, counter, baseDir, track, UID);
      return;
    } else {
      /*
 * TrackTags Example
{
    "album": "DAILY ILLEGAL ANIME CONSUMPTION PT.1",
    "artist": "AnTgry",
    "genre": "Electro",
    "title": "DAILY ILLEGAL ANIME CONSUMPTION PT.1",
    "trackNumber": "1",
    "year": "20202020",
    "image": {
        "mime": "image/jpeg",
        "type": {
            "id": 3,
            "name": "front cover"
        },
        "imageBuffer": {
            "type": "Buffer",
            "data": [BASE64]
            }
        }
    }
}s
*/

      // console.log(trackTags);
      for(let i=0; i<=pastAlbum.length; i++) {
         if (pastAlbum[i] == trackTags.album) {
            setAlbum(pastCounter, pastUID, pastAlbum[i]);
            return;
         }
      }
      let trackEntry = document.createElement("div");
      trackEntry.setAttribute("id", `track__${counter}__${UID}`);
      trackEntry.setAttribute("onclick", "playHandler(this.id)");
      trackEntry.setAttribute("number", `${counter}`);
      trackEntry.setAttribute("UUID", `${UID}`);
      trackEntry.className = "mt-4 mx-4";
      entryList.appendChild(trackEntry);

      const newEntry = document.getElementById(`track__${counter}__${UID}`);
      newEntry.innerHTML = entryTemplate.innerHTML;

      // Set Audio Source
      changeID("src", `src__${counter}`);
      src = document.getElementById(`src__${counter}`);
      src.innerHTML = path.join(baseDir, track);

      // Set Track CoverArt

      changeID("trackIcon", `track__${counter}_icon__${UID}`);
      trackIcon = document.getElementById(`track__${counter}_icon__${UID}`);
      try {
        parsebuff = bufferToDataUrl(
          trackTags.image.mime,
          trackTags.image.imageBuffer
        );
        trackIcon.src = parsebuff;
      } catch (error) {
        console.log(`Track ${counter} has no image!`);
      }

      // Set Track Title
      changeID("trackName", `track__${counter}_name__${UID}`);
      trackName = document.getElementById(`track__${counter}_name__${UID}`);
      trackName.innerText = trackTags.title;

      // Set Track Artist
      changeID("trackArtist", `track__${counter}_artist__${UID}`);
      trackArtist = document.getElementById(`track__${counter}_artist__${UID}`);
      trackArtist.innerText = trackTags.artist;

      // Set Track Album
      changeID("trackAlbum", `track__${counter}_album__${UID}`);
      changeID("trackAlbumHolder", `trackAlbumHolder__${counter}`);
      trackAlbum = document.getElementById(`track__${counter}_album__${UID}`);
      trackAlbum.innerText = trackTags.album;
    }
    // Set PastX Variables
    pastAlbum[counter] = trackTags.album;
    pastUID = UID;
    pastCounter = counter;
    counter++;
  });
}

function setAlbum(pcounter, pUID, pAlbum) {
  // Set Album Title
  trackName = document.getElementById(`track__${pcounter}_name__${pUID}`);
  const trackEntry = document.getElementById(`track__${pcounter}__${pUID}`);
  trackName.innerText = pAlbum.toString();
  trackEntry.setAttribute(
    "onclick",
    "sendID(this.getAttribute('UUID'), this.getAttribute('number'))"
  );

  // Clear Track Album
  // trackAlbum = document.getElementById(`track__${pcounter}_album__${pUID}`);
  // trackAlbum.innerText = "";
  let element = document.getElementById(`trackAlbumHolder__${pcounter}`);
  // element.remove();
  element.setAttribute("style", "display: none;");
}

function setRaw(entryList, entryTemplate, counter, baseDir, track, UID) {
  let trackEntry = document.createElement("div");
  trackEntry.setAttribute("id", `track__${counter}__${UID}`);
  trackEntry.setAttribute("onclick", "playHandler(this.id)");
  trackEntry.setAttribute("number", `${counter}`);
  trackEntry.setAttribute("UUID", `${UID}`);
  trackEntry.className = "container";
  entryList.appendChild(trackEntry);

  const newEntry = document.getElementById(`track__${counter}__${UID}`);
  newEntry.innerHTML = entryTemplate.innerHTML;

  // Set Track Icon
  changeID("trackIcon", `track__${counter}_icon__${UID}`);
  trackIcon = document.getElementById(`track__${counter}_icon__${UID}`);

  // Set Audio Source
  changeID("src", `src__${counter}`);
  src = document.getElementById(`src__${counter}`);
  src.innerHTML = path.join(baseDir, track);

  // Set Track Title
  changeID("trackName", `track__${counter}_name__${UID}`);
  trackName = document.getElementById(`track__${counter}_name__${UID}`);
  trackName.innerText = track;

  // Set Track Artist
  changeID("trackArtist", `track__${counter}_artist__${UID}`);
  trackArtist = document.getElementById(`track__${counter}_artist__${UID}`);
  trackArtist.innerText = "Unknown";

  // Set Track Album
  changeID("trackAlbum", `track__${counter}_album__${UID}`);
  changeID("trackAlbumHolder", `trackAlbumHolder__${counter}`);
  trackAlbum = document.getElementById(`track__${counter}_album__${UID}`);
  trackAlbum.innerText = "Unknown";
}

function sendID(uuid, counter) {
  trackAlbum = document.getElementById(`track__${counter}_album__${uuid}`);
  trackArtist = document.getElementById(`track__${counter}_artist__${uuid}`);
  trackArt = document.getElementById(`track__${counter}_icon__${uuid}`);
  let state = {
    artist: trackArtist.innerText,
    album: trackAlbum.innerText,
    buffer: trackArt.src,
  };
  ipc.send("sendState", state);
  // console.log(`Artist: ${state[0]}\nAlbum: ${state[1]}`);
  ipc.send("reqPageSwitch", "viewAlbum.html");
}
