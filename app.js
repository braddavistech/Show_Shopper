var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
console.log('Brad Davis is up and running Show Shopper on localhost:8888 !');
app.listen(8888);
