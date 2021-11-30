const { ipcRenderer } = require("electron");
const ipc = ipcRenderer;
const fs = require("fs");
const crypto = require("crypto");
const os = require("os");
const NodeID3 = require("node-id3");
const path = require("path");
let __drivename =
  os.platform == "win32" ? process.cwd().split(path.sep)[0] : "/";
let baseDir = "E:\\Music\\";

let entryTemplate;
let albumtitle;
let albumartist;
let albumart;
let container;

let trackart;
let tracktitle;
let trackartist;
let trackalbum;
let albumFilter = {};

setTimeout(() => {
  entryTemplate = document.getElementById("entryTemplate");
  albumtitle = document.getElementById("albumTitle");
  albumartist = document.getElementById("albumArtist");
  albumart = document.getElementById("albumArt");
  container = document.getElementById("songRow__container");

  trackart = document.getElementById("trackArt");
  tracktitle = document.getElementById("trackTitle");
  trackartist = document.getElementById("trackArtist");
  trackalbum = document.getElementById("trackAlbum");

  ipc.send("reqState");
  ipc.on("sendState", (event, data) => {
    albumFilter = data;
    setContent();
  });
}, 430);

function setContent() {
  console.log(albumFilter);
  albumtitle.innerText = albumFilter.artist;
  albumartist.innerText = albumFilter.album;
  albumart.src = albumFilter.buffer;
  readDir(baseDir);
}

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
      const trackTags = NodeID3.read(path.join(baseDir, track_name));
      if (
        trackTags.artist.includes(albumFilter.artist) &&
        trackTags.album == albumFilter.album
      )
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
  setContent1(container, uniqueID());
}

function setContent1(entry, uniqueID) {
  let counter = 0;
  const UID = uniqueID;
  const entryList = entry;
  let pastAlbum;
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

      let trackEntry = document.createElement("div");
      trackEntry.setAttribute("id", `track__${counter}__${UID}`);
      trackEntry.setAttribute("onclick", "playHandler(this.id)");
      trackEntry.setAttribute("number", `${counter}`);
      trackEntry.setAttribute("UUID", `${UID}`);
      // trackEntry.className = "mt-4 mx-4";
      entryList.appendChild(trackEntry);

      const newEntry = document.getElementById(`track__${counter}__${UID}`);
      newEntry.innerHTML = entryTemplate.innerHTML;

      // Set Audio Source
      changeID("src", `src__${counter}`);
      src = document.getElementById(`src__${counter}`);
      src.innerHTML = path.join(baseDir, track);

      // Set Track CoverArt

      changeID("trackArt", `track__${counter}_icon__${UID}`);
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
      changeID("trackTitle", `track__${counter}_name__${UID}`);
      trackName = document.getElementById(`track__${counter}_name__${UID}`);
      trackName.innerText = trackTags.title;

      // Set Track Artist
      changeID("trackArtist", `track__${counter}_artist__${UID}`);
      trackArtist = document.getElementById(`track__${counter}_artist__${UID}`);
      trackArtist.innerText = trackTags.artist;

      // Set Track Album
      changeID("trackAlbum", `track__${counter}_album__${UID}`);
      trackAlbum = document.getElementById(`track__${counter}_album__${UID}`);
      trackAlbum.innerText = trackTags.album;
    }
    // Set PastX Variables
    pastAlbum = trackTags.album;
    pastUID = UID;
    pastCounter = counter;
    counter++;
  });
}
