const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
var cookies = require("cookie-parser");

// Setting up the middlewares
app.use(express.static("views"));
app.use(express.static("views/js"));
app.use(express.static("views/src"));
app.use(express.static("views/css"));
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.set('view engine', 'ejs');
app.use(cookies());

console.log(`\r\n__\/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\________\/\\\\\\\\\\_______________\/\\\\\\\\\\\\\\\\\\\\\\\\_________________________________________________________        \r\n _\\\/\\\\\\\/\/\/\/\/\/\/\/\/\/\/_______\/\\\\\\\/\/\/______________\/\\\\\\\/\/\/\/\/\/\/\/\/\/__________________________________________________________       \r\n  _\\\/\\\\\\_________________\/\\\\\\_________________\/\\\\\\_________________________________________________________\/\\\\\\\\\\\\\\\\\\__      \r\n   _\\\/\\\\\\\\\\\\\\\\\\\\\\______\/\\\\\\\\\\\\\\\\\\_____________\\\/\\\\\\____\/\\\\\\\\\\\\\\__\/\\\\\/\\\\\\\\\\\\\\______\/\\\\\\\\\\_____\/\\\\\\____\/\\\\\\__\/\\\\\\\/\/\/\/\/\\\\\\_     \r\n    _\\\/\\\\\\\/\/\/\/\/\/\/______\\\/\/\/\/\\\\\\\/\/______________\\\/\\\\\\___\\\/\/\/\/\/\\\\\\_\\\/\\\\\\\/\/\/\/\/\\\\\\___\/\\\\\\\/\/\/\\\\\\__\\\/\\\\\\___\\\/\\\\\\_\\\/\\\\\\\\\\\\\\\\\\\\__    \r\n     _\\\/\\\\\\________________\\\/\\\\\\________________\\\/\\\\\\_______\\\/\\\\\\_\\\/\\\\\\___\\\/\/\/___\/\\\\\\__\\\/\/\\\\\\_\\\/\\\\\\___\\\/\\\\\\_\\\/\\\\\\\/\/\/\/\/\/___   \r\n      _\\\/\\\\\\________________\\\/\\\\\\________________\\\/\\\\\\_______\\\/\\\\\\_\\\/\\\\\\_________\\\/\/\\\\\\__\/\\\\\\__\\\/\\\\\\___\\\/\\\\\\_\\\/\\\\\\_________  \r\n       _\\\/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\____\\\/\\\\\\________________\\\/\/\\\\\\\\\\\\\\\\\\\\\\\\\/__\\\/\\\\\\__________\\\/\/\/\\\\\\\\\\\/___\\\/\/\\\\\\\\\\\\\\\\\\__\\\/\\\\\\_________ \r\n        _\\\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/_____\\\/\/\/__________________\\\/\/\/\/\/\/\/\/\/\/\/\/____\\\/\/\/_____________\\\/\/\/\/\/______\\\/\/\/\/\/\/\/\/\/___\\\/\/\/__________\r\n`)

// Define Routes
app.use('/auth', require('./routes/auth'));
app.use('/terminals', require('./routes/terminals'));
app.use('/anagraphic', require('./routes/anagraphic'));
app.use('/', require('./routes/pages'));

app.listen(80)