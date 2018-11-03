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
          printArtists(response, localScope);

          $('#login').hide();
          $('#loggedin').show();

        }
      });
    } else {
      $('#login').show();
      $('#loggedin').hide();
    }


    // const showArtists = () => {
    //   let temp = localStorage.getItem(artistList);
    //   let artists = temp.split(",")
    //   console.log(artists);
    //   ticketmasterFetch();
    // }

    document.getElementById('login-button').addEventListener('click', function () {
      let searchCat = document.getElementById("searchCategory").value;
      if (searchCat === "0") {
        alert("Please choose a category to search by.")
        return;
      }
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
