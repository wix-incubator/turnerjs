var express = require('express');
var app = express();
app.use(express.static('runners'));

app.listen(4578, function () {
    console.log('Example app listening on port 4578!');
});