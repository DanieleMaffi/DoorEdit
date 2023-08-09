const express = require("express");
const sql = require("mssql");
const app = express();
const dotenv = require("dotenv").config();
var cookies = require("cookie-parser");

app.use(express.static("views"));
app.use(express.static("views/js"));
app.use(express.static("views/src"));
app.use(express.static("views/css"));
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.set('view engine', 'ejs');
app.use(cookies());

//Configuration file for the server
var config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB,
    options: {
        encrypt: false,
        trustServerCertificate: false
    }
};

console.log(`\r\n      ___           ___                    ___           ___           ___           ___           ___     \r\n     \/\\  \\         \/\\  \\                  \/\\  \\         \/\\  \\         \/\\  \\         \/\\__\\         \/\\  \\    \r\n    \/::\\  \\       \/::\\  \\                \/::\\  \\       \/::\\  \\       \/::\\  \\       \/:\/  \/        \/::\\  \\   \r\n   \/:\/\\:\\  \\     \/:\/\\:\\  \\              \/:\/\\:\\  \\     \/:\/\\:\\  \\     \/:\/\\:\\  \\     \/:\/  \/        \/:\/\\:\\  \\  \r\n  \/::\\~\\:\\  \\   \/::\\~\\:\\  \\            \/:\/  \\:\\  \\   \/::\\~\\:\\  \\   \/:\/  \\:\\  \\   \/:\/  \/  ___   \/::\\~\\:\\  \\ \r\n \/:\/\\:\\ \\:\\__\\ \/:\/\\:\\ \\:\\__\\          \/:\/__\/_\\:\\__\\ \/:\/\\:\\ \\:\\__\\ \/:\/__\/ \\:\\__\\ \/:\/__\/  \/\\__\\ \/:\/\\:\\ \\:\\__\\\r\n \\:\\~\\:\\ \\\/__\/ \\\/__\\:\\ \\\/__\/          \\:\\  \/\\ \\\/__\/ \\\/_|::\\\/:\/  \/ \\:\\  \\ \/:\/  \/ \\:\\  \\ \/:\/  \/ \\\/__\\:\\\/:\/  \/\r\n  \\:\\ \\:\\__\\        \\:\\__\\             \\:\\ \\:\\__\\      |:|::\/  \/   \\:\\  \/:\/  \/   \\:\\  \/:\/  \/       \\::\/  \/ \r\n   \\:\\ \\\/__\/         \\\/__\/              \\:\\\/:\/  \/      |:|\\\/__\/     \\:\\\/:\/  \/     \\:\\\/:\/  \/         \\\/__\/  \r\n    \\:\\__\\                               \\::\/  \/       |:|  |        \\::\/  \/       \\::\/  \/                 \r\n     \\\/__\/                                \\\/__\/         \\|__|         \\\/__\/         \\\/__\/                  \r\n`)                                                                                                                                                                                  

// Define Routes
app.use('/auth', require('./routes/auth'));
app.use('/terminals', require('./routes/terminals'));
app.use('/', require('./routes/pages'));

app.listen(80)