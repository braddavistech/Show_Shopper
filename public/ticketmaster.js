const ticketmasterFetch = () => {
    return fetch("https://app.ticketmaster.com/discovery/v2/events.json?city=Nashville&classificationName=music&apikey=8yBBUtO0mdKWcqcUURleJS3PenKFToVC")
      .then(ticketmaster => ticketmaster.json())
      .then(temp => {
        console.log(temp);
      })
  };

