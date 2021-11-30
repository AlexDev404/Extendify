let nowPlayingIcon;
let nowPlayingSong;
let nowPlayingArtist;
let volume__sig;
let volume;
let slideProgress;
let seeker;
let seekKnob;
let THISCONTEXT;
let XRAY = false;

if (XRAY)
  document.querySelector('[data="secret"]').innerHTML = `*{
  outline: 1px solid rgb(0, 255, 21)
}`;

setTimeout(() => {
  nowPlayingIcon = document.getElementById("nowPlaying__icon");
  nowPlayingSong = document.getElementById("nowPlaying__song");
  nowPlayingArtist = document.getElementById("nowPlaying__artist");

  volume__sig = document.getElementById("volume_signaller");
  volume = document.getElementById("slideInput");
  slideProgress = document.getElementById("slideProgress");
  seeker = document.getElementById("seek");
  seekKnob = document.getElementById("seekKnob");
  let style = document.querySelector('[data="thumbstyle"]');

  volume.addEventListener("change", (e) => switchVol(e));
  volume.addEventListener("input", (e) => {
    slideProgress.value = e.currentTarget.value;
    switchVol(e);
  });

  seekKnob.addEventListener("mouseover", () => {
    style.innerHTML = `
    .seekKnob::-webkit-slider-thumb {
    width: 14px; /* Set a specific slider handle width */
    height: 14px; /* Slider handle height */
    /* border: 1px solid black; */
    border-radius: 999px;
    background: white; /* Green background */
    cursor: pointer; /* Cursor on hover */
    }
    `;
  });
  seekKnob.addEventListener("mouseout", () => {
    style.innerHTML = "";
  });

  seekKnob.addEventListener("input", () => {
    THISCONTEXT.currentTime = seekKnob.value;
  });
}, 930);
function switchVol(e) {
  try {
    audio.volume = e.currentTarget.value / 100;
  } catch (error) {
    try {
      audio2.volume = e.currentTarget.value / 100;
    } catch (error) {
      console.log(
        `Unable to Set volume of currentTrack to ${e.currentTarget.value}!`
      );
    }
  }

  if (e.currentTarget.value <= 25) {
    volume__sig.classList = "fas fa-volume-down pr-5";
  }

  if (e.currentTarget.value == 0) {
    volume__sig.classList = "fas fa-volume-mute pr-5";
  }

  if (e.currentTarget.value >= 25) {
    volume__sig.classList = "fas fa-volume pr-5";
  }

  if (e.currentTarget.value >= 51) {
    volume__sig.classList = "fas fa-volume-up pr-5";
  }
}
let audio;
let audio2;
let context2 = false;

function uniqueID() {
  return crypto.randomBytes(8).toString("hex");
}

function changeID(oldid, newID) {
  e = document.getElementById(oldid.toString());
  e.id = newID;
}

/** @module buffer-to-data-url
 * (c) Jaid
 */

/**
 * @param {string} mimeType
 * @param {Buffer} buffer
 * @return {Promise<string>}
 */
function bufferToDataUrl(mimeType, buffer) {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

// Set Playlists To Zero (null)
let playlist = [];
let playlist_filtered = [];
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

function readDir(string) {
  // Read from source and push to array

  fs.readdir(string, (error, files) => {
    files.forEach((file) => {
      playlist.push(file);
    });
    if (error) {
      console.log(error);
    }

    populateplaylists();
  });
}

function playHandler(id) {
  const track = document.getElementById(id);
  let number = track.getAttribute("number");
  let uuid = track.getAttribute("UUID");
  let source = document.getElementById(`src__${number}`);
  let play = document.getElementById("playButton");
  play.classList = "fas fa-pause footer-icon";

  // Switch the status of the navigator to the bottom
  nowPlayingIcon.src = document.getElementById(
    `track__${number}_icon__${uuid}`
  ).src;
  nowPlayingSong.innerText = document.getElementById(
    `track__${number}_name__${uuid}`
  ).innerText;
  nowPlayingArtist.innerText = document.getElementById(
    `track__${number}_artist__${uuid}`
  ).innerText;

  // Before we go any further, let's stop the old song
  if (context2) {
    audio2 = new Audio(source.innerText);
    audio.pause();
    audio = null;
    audio2.play();
    audio2.volume = volume.value / 100;
    context2 = false;
    audio2.setAttribute("ontimeupdate", "printDuration()");
    THISCONTEXT = audio2;

    // BOOST
    // create an audio context and hook up the video element as the source
    let audioCtx = new AudioContext();
    let ctx = audioCtx.createMediaElementSource(THISCONTEXT);

    // create a gain node
    let gainNode = audioCtx.createGain();
    gainNode.gain.value = 3.25; // about triple the volume
    ctx.connect(gainNode);

    // connect the gain node to an output destination
    gainNode.connect(audioCtx.destination);

    return;
  }
  if (audio2) {
    audio2.pause();
    audio2 = null;
  }
  audio = new Audio(source.innerText);
  audio.play();
  audio.volume = volume.value / 100;
  context2 = true;
  audio.setAttribute("ontimeupdate", "printDuration()");
  THISCONTEXT = audio;

  // BOOST
  // create an audio context and hook up the video element as the source
  let audioCtx = new AudioContext();
  let ctx = audioCtx.createMediaElementSource(THISCONTEXT);

  // create a gain node
  let gainNode = audioCtx.createGain();
  gainNode.gain.value = 3.25; // about triple the volume
  ctx.connect(gainNode);

  // connect the gain node to an output destination
  gainNode.connect(audioCtx.destination);


}

let isPlaying = true;

function changeState(id) {
  let play = document.getElementById(id);
  let play0 = document.getElementById("playButton");
  if (isPlaying) {
    try {
      audio.pause();
      play.classList.remove("fa-pause");
      play.classList.add("fa-play");
      // Sync with main play button
      play0.classList.remove("fa-pause");
      play0.classList.add("fa-play");
    } catch (error) {
      //  console.log(error);
      try {
        audio2.pause();
        play.classList.remove("fa-pause");
        play.classList.add("fa-play");
        // Sync with main play button
        play0.classList.remove("fa-pause");
        play0.classList.add("fa-play");
      } catch (error) {
        // console.log(error);
      }
    }
    isPlaying = false;
    return;
  }
  if (!isPlaying) {
    try {
      if (audio2) audio2.pause();
      audio.play();
      play.classList.remove("fa-play");
      play.classList.add("fa-pause");
      // Sync with main play button
      play0.classList.remove("fa-play");
      play0.classList.add("fa-pause");
    } catch (error) {
      //   console.log(error);
      try {
        if (audio) audio.pause();
        audio2.play();
        play.classList.remove("fa-play");
        play.classList.add("fa-pause");
        // Sync with main play button
        play0.classList.remove("fa-play");
        play0.classList.add("fa-pause");
      } catch (error) {
        //   console.log(error);
      }
    }
    isPlaying = true;
    return;
  }
}

// Synchronous Sleep
// https://stackoverflow.com/a/17532524/10976415

function sleep(ms) {
  var start = new Date().getTime(),
    expire = start + ms;
  while (new Date().getTime() < expire) {}
  return;
}

async function printDuration() {
  let duration2;
  let currentTime2;
  let duration = THISCONTEXT.duration;
  duration = Number.parseFloat(duration).toFixed(3); // Rounding is good

  let currentTime = THISCONTEXT.currentTime;
  currentTime = Number.parseFloat(currentTime).toFixed(3); // Rounding is good

  duration2 = duration;
  currentTime2 = currentTime;

  if (currentTime >= 60) {
    currentTime = currentTime / 60;
    currentTime2 = currentTime + " minutes";
  }
  if (duration >= 60) {
    duration = duration / 60;
    duration2 = duration + " minutes";
  }
  console.log(currentTime2 + "/" + duration2);
  seeker.setAttribute("max", THISCONTEXT.duration);
  seekKnob.setAttribute("max", THISCONTEXT.duration - 0.5);
  seekKnob.value = THISCONTEXT.currentTime - 0.5;
  seeker.value = THISCONTEXT.currentTime;
}

document.getElementById("fxBTN").addEventListener("click", ()=>{
nowFinished = true; 
checkNOW()
});

function checkNOW(){

   if(nowFinished){

   nowFinished = false;
   document.getElementById("codeDump").innerHTML = `.footer__icon,
   .footer__green {
     transition: transform 0.2s ease-in-out;
     transform: scale(1.2) !important;
   }`;

   setTimeout(()=>{
   document.getElementById("codeDump").innerHTML = "";
   nowFinished = true;
   },
500);
   }
}