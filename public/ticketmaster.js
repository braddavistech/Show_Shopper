const clickPrint = () => {
  if (event.target.name === "button") {
  let artistName = event.target.value;
  console.log(event.target);
  event.target.innerHTML = "Hide Events";
  event.target.parentNode.removeEventListener("click", clickPrint);
  event.target.parentNode.addEventListener("click", hideShows);
  ticketmasterFetch(artistName);
  }
};

const hideShows = () => {
  if (event.target.name === "button") {
  let parentNode = document.getElementById(`${event.target.value}`).parentElement;
  let hideInfo = event.target.parentNode.nextSibling;
  hideInfo.innerHTML = "";
  event.target.innerHTML = "Search for Events";
  event.target.parentNode.removeEventListener("click", hideShows);
  event.target.parentNode.addEventListener("click", clickPrint);
  } else {alert("not a button")}
}

const fixGenreName = (genre) => {
  genre = genre.split(" ")
  for (let i = 0; i < genre.length; i++) {
  genre[i] = genre[i].charAt(0).toUpperCase() + genre[i].substring(1);
  }
  genre = genre.join(" ");
  genre = "&sung; " + genre;
  return genre;
}

const printArtists = (response, localScope) => {
  let stringHolder = "";
  let artistList;
  let userProfilePlaceholder = document.getElementById('user-profile');
  const convertDate = (dateNow) => {
    let tempDate = dateNow.substring(0, dateNow.indexOf("T"));
    tempDate = tempDate.split("-");
    let year = tempDate.shift();
    tempDate.push(year);
    tempDate = tempDate.join("/");
    return tempDate;
  }
  const convertTime = (timeNow) => {
    let tempTime = timeNow.substring(11);
    let newTime = tempTime.split(":");
    let amPM = "AM";
    newTime[0] = newTime[0] - 5;
    if (newTime[0] == 0) {
      newTime[0] = 12;
    } else if (newTime[0] == 12) {
      amPM = "PM";
      console.log("12")
    } else if (newTime[0] > 12) {
      newTime[0] = newTime[0] - 12;
      amPM = "PM"
    }
    let printTime = `${newTime[0]}:${newTime[1]} ${amPM}`;
    return printTime;
  }
  const popRating = (ranking) => {
    let rankPic = "";
    while (ranking >= 10) {
      rankPic += `<img class="recordPic" src="/images/record.png">`
      ranking = ranking - 10;
    }
    if (ranking >= 5) {
      rankPic += `<img class="halfRec" src="/images/halfRec.png">`
    }
    return rankPic;
  }
  let artistArray = [];
  if (localScope === "top/artists?time_range=short_term&limit=10") {
    response.items.forEach(artist => {
      artistArray.push(artist.name)
      stringHolder += `<div class="indivArtist" id="${artist.name}"><h1 class="artistName">${artist.name}</h1><h3 class="genreCat">GENRES</h3>`;
      artist.genres.forEach(genre => {
        stringHolder += `<p class="genreName">${fixGenreName(genre)}</p>`;
      })
      stringHolder += `<button class="selectArtist" name="button" id="${artist.name}" value="${artist.name}">Search for Events</button><img class="artistPic" src="${artist.images[0].url}"></div><div class="concerts" name="${artist.name}" id="${artist.name}1"></div>`;
    })
  } else if (localScope === "top/tracks?time_range=short_term&limit=10") {
    response.items.forEach(track => {
      artistArray.push(track.artists[0].name)
      let rank = popRating(track.popularity);
      stringHolder += `<div class="indivTracks" id="${track.artists[0].name}"><h1 class="songName">${track.name} by ${track.artists[0].name}</h1><h3 class="releaseDate">${track.album.release_date}</h3><h3 class="trackPopularity">Rank${rank}</h3><button class="selectArtist" name="button" id="${track.artists[0].name}" value="${track.artists[0].name}">Search for Concerts</button><img class="artistPic" src="${track.album.images[0].url}"></div><div class="concerts" name="${track.artists[0].name}" id="${track.artists[0].name}1"></div>`;
    })
  } else if (localScope === "player/recently-played?limit=10") {
    response.items.forEach(eachTrack => {
      artistArray.push(eachTrack.track.artists[0].name)
      let rank = popRating(eachTrack.track.popularity);
      let tempDate = convertDate(eachTrack.played_at);
      let tempTime = convertTime(eachTrack.played_at);
      // TODO:Need to fix href for the songs to be able to hear the songs.
      stringHolder += `<div class="indivTracks" id="${eachTrack.track.artists[0].name}"><h1 class="songName">${eachTrack.track.name} by ${eachTrack.track.artists[0].name}</h1><h3 class="lastPlayed">Listened to on ${tempDate} at ${tempTime}</h3><h3 class="releaseDate">${eachTrack.track.album.name}</h3><h3 class="trackPopularity">Spotify Rank${rank}</h3><button class="selectArtist" name="button" id="${eachTrack.track.artists[0].name}" value="${eachTrack.track.artists[0].name}">Search for Concerts</button><img class="artistPic" src="${eachTrack.track.album.images[0].url}"><a href=${eachTrack.track.external_urls} target="blank" id="playLink">NOT YET Hear Song On Spotify</a></div><div class="concerts" name="${eachTrack.track.artists[0].name}" id="${eachTrack.track.artists[0].name}1"></div>`;
    })
  }
  userProfilePlaceholder.innerHTML = stringHolder;
  localStorage.setItem(artistList, artistArray);
  artistArray.forEach(artist => {
  document.getElementById(artist).addEventListener("click", clickPrint);
  })
}

const ticketmasterFetch = (artist) => {
  // fetch(`https://app.ticketmaster.com/discovery/v2/events.json?city=Nashville&classificationName=music&keyword=${artist}&apikey=8yBBUtO0mdKWcqcUURleJS3PenKFToVC`)
  //   .then(nationwideShows => nationwideShows.json())
  //   .then(shows => {
  //     console.log(shows.page.totalElements);
  //     let showExists = shows.page.totalElements;
  //     console.log(showExists);
  //     if (showExists != 0) {
  //       console.log(shows);
  //       return shows;
  //     } else {
  return fetch(`https://app.ticketmaster.com/discovery/v2/events.json?sort=date,asc&classificationName=music&size=5&keyword=${artist}&apikey=8yBBUtO0mdKWcqcUURleJS3PenKFToVC`)
    .then(ticketmaster => ticketmaster.json())
    .then(temp => {
      // let placeHolder = document.getElementById(artist);
      // let tempString = "";
      // let localShow = false;
      // console.log(temp);
      // Promises.all = [];
      let showNationwide = temp._embedded.events;
      printConcerts(artist, showNationwide);
      // if (temp != undefined) {
      //   Promises.all.push(printConcerts(temp, showNationwide));
      // } else {
      //   return showNationwide;
      // };
      // return Promises.all;
    })
    // .then(() => {

    // })
}
//     })
const printConcerts = (temp, showNationwide) => {
  tempString = "";
  let i = 1;
  console.log(temp, showNationwide, showNationwide.length);
  let numberOfConcerts = showNationwide.length;
  if (numberOfConcerts > 5) {
    numberOfConcerts = 5;
  }
  for (let i = 0; i < numberOfConcerts; i++) {
    console.log(showNationwide[i]);
      tempString += `<div class="concertShow">${showNationwide[i].name}<p class="showCity">${showNationwide[i]._embedded.venues[0].name} in ${showNationwide[i]._embedded.venues[0].city.name}, ${showNationwide[i]._embedded.venues[0].state.name}</p><p class="showDate">${showNationwide[i].dates.start.localDate}</p></div>`
  }

  let artistGrab = document.getElementById(`${temp}1`);
  artistGrab.innerHTML += tempString;

}
  //   }
  // })
  // if (localShow === false) {

  //   showNationwide.forEach(show => {
  //     tempString += `<div class="concertShow">${show.name}<p class="showCity">${show.dates.timezone}</p><p class="showDate">${show.dates.start}</p></div>`
  //   })
    // document.getElementById(temp.name).innerHTML += tempString;


// }


