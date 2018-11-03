(function () {

  var stateKey = 'spotify_auth_state';

  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  let searchItem;
  let artistList;
  let userProfilePlaceholder = document.getElementById('user-profile');
  var params = getHashParams();
  var access_token = params.access_token,
    state = params.state,
    storedState = localStorage.getItem(stateKey);

  if (access_token && (state == null || state !== storedState)) {
    alert('There was an error during the authentication');
  } else {
    localStorage.removeItem(stateKey);
    let temp = localStorage.getItem(searchItem);
    let localScope = "";
    if (access_token) {
        if (temp == "1") {
          localScope = "top/artists?time_range=short_term&limit=10";
        } else if (temp === "2") {
          localScope = "top/tracks?time_range=short_term&limit=10";
        } else if (temp === "3") {
          localScope = "player/recently-played?limit=10";
        }

        let meUrl = `https://api.spotify.com/v1/me/`;
        let localUrl = meUrl + localScope;


      $.ajax({
        url: localUrl,
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function (response) {
          console.table(response);
          let stringHolder = "";
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
              stringHolder += `<div class="indivArtist"><h1 class="artistName">${artist.name}</h1><h3 class="genreCat">GENRES</h3><button class="selectArtist" id="${artist.name} value="${artist.name}">Search for Concerts</button>`;
              artist.genres.forEach(genre => {
                stringHolder += `<p class="genreName">${genre}</p>`;
              })
              stringHolder += `<img class="artistPic" src="${artist.images[0].url}"><div class="${artist.name}"></div></div>`;
            })
          } else if (localScope === "top/tracks?time_range=short_term&limit=10") {
            response.items.forEach(track => {
              artistArray.push(track.artists[0].name)
              let rank = popRating(track.popularity);
              stringHolder += `<div class="indivTracks"><h1 class="songName">${track.name}</h1><h3 class="trackArtist">By ${track.artists[0].name}</h3><h3 class="releaseDate">Released on ${track.album.release_date}</h3><h3 class="trackPopularity">Spotify Rank</h3>${rank}<img class="artistPic" src="${track.album.images[0].url}"></div>`;
            })
          } else if (localScope === "player/recently-played?limit=10") {
            response.items.forEach(eachTrack => {
              artistArray.push(eachTrack.track.artists[0].name)
              let rank = popRating(eachTrack.track.popularity);
              let tempDate = convertDate(eachTrack.played_at);
              let tempTime = convertTime(eachTrack.played_at);
              // TODO:Need to fix href for the songs to be able to hear the songs.
              stringHolder += `<div class="indivTracks"><h1 class="songName">${eachTrack.track.name}</h1><h3 class="trackArtist">${eachTrack.track.artists[0].name}</h3><h3 class="lastPlayed">Listened to on ${tempDate} at ${tempTime}</h3><h3 class="releaseDate">${eachTrack.track.album.name}</h3><h3 class="trackPopularity">Spotify Rank</h3>${rank}<img class="artistPic" src="${eachTrack.track.album.images[0].url}"><a href=${eachTrack.track.external_urls} target="blank" id="playLink">Hear Song On Spotify</a></div>`;
            })
          }
          userProfilePlaceholder.innerHTML = stringHolder;
          localStorage.setItem(artistList, artistArray);
          showArtists();
          $('#login').hide();
          $('#loggedin').show();
        }
      });
    } else {
      $('#login').show();
      $('#loggedin').hide();
    }

    const showArtists = () => {
      let temp = localStorage.getItem(artistList);
      let artists = temp.split(",")
      console.log(artists);
      ticketmasterFetch();
    }

    document.getElementById('login-button').addEventListener('click', function () {
      let searchCat = document.getElementById("searchCategory").value;
      var client_id = '6cb514e280c24f05a25ef6bf097fde84';
      // TODO: Need to figure out how to keep my client id secret
      var redirect_uri = 'http://localhost:8888';
      // TODO:Will need to change this to actual url and also on Spotify Developer page
      var state = generateRandomString(16);

      localStorage.setItem(stateKey, state);
      var scopes = "user-read-private user-read-email user-top-read user-read-birthdate user-read-recently-played playlist-read-private";

      var url = 'https://accounts.spotify.com/authorize';
      url += '?response_type=token';
      url += '&client_id=' + encodeURIComponent(client_id);
      url += '&scope=' + encodeURIComponent(scopes);
      url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
      url += '&state=' + encodeURIComponent(state);

      localStorage.setItem(searchItem, searchCat);
      window.location = url;
    }, false);
  }
 }) ();
