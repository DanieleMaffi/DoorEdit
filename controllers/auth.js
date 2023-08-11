const sql = require("mssql");
const crypto = require('crypto')
const { promisify } = require("util");
const jwt = require('jsonwebtoken');

let password = "";

//Database configuration file
const config = require('./config.js');

//This function is called from the /auth/login post request and handles the login process
exports.login = async (req, res) => {
    try {
        //Getting the parameters from the form names
        username = req.body.username;
        password = req.body.password;

        if (!username || !password) { //Check if email and password are empty
            return res.status(400).render("login", {    //Renders the login page with the error message sento as an ejs variable
                message: 'Inserire username e password'
            })
        }

        //Encoding the password to compare it to the one in the database
        password = await crypto.createHash('md5').update(password).digest('hex').toUpperCase()

        console.log(password)

        // Create a SQL Server connection pool
        const pool = await sql.connect(config);

        let query = `SELECT * FROM tb_utenti WHERE Username = @username AND Password = @password`

        //Creating reqquest object and adding parsed parameters
        let request = await pool.request()
        // Associating the parameters in the query to actual variables
        request.input('username', sql.NVarChar, username)
        request.input('password', sql.NVarChar, password)

        // query to the database and get the records
        await request.query(query, function (err, results) {
            if (err) console.log(err)

            let dbPassword = results.recordset[0]?.Password;    //? is an optional chaining operator that checks if th value exists in the recordset before acceesing it

            if (results.recordset.length == 0 || !(password === dbPassword)) {   //Checking if the password is correct by looking for empty results or mismatching passowords

                //Closes the connection
                pool.close().then(() => { console.log('Closed pool') })
                return res.status(401).render('login', {
                    message: 'Username o password non corretti'
                })

            } else {
                //If email and password match
                console.log("Logged in");

                console.log('Genereating token...');

                //Creating the paylod to place in the token
                let payload = {
                    user: results.recordset[0]?.Username,
                }

                //Creating the token
                let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
                console.log('Token:' + token);

                //PLacing the token in the cookies
                res.cookie('token', token, { path: '/' })

                pool.close()
                    .catch((err) => { console.log(err) })

                //Redirecting to home
                return res.status(201).redirect('/home');
            }
        })
    } catch (err) { }
}

//Check id the token is still valid
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies['token']) {
        try {
            //Verifying the token
            let decoded = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);

        } catch (err) {
            console.log(err)
            return res.status(401).redirect('/')
        }
    } else {
        return res.status(401).redirect('/')
    }
    return next();
}

exports.logout = (req, res) => {
    //Clearing the cookies to remove the stored token
    res.clearCookie('token');

    res.redirect('/');
}

//If both given passwords are equal then it updates the password in the database
exports.changePassword = async (req, res) => {
    // Decoding the token in order to access its contents
    let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET)
    let firstPassword = req.body.firstPassword;
    let secondPassword = req.body.secondPassword;

    //If passwords don't match gives error message
    if (firstPassword !== secondPassword) {
        return res.status(400).render('passwordForm', {
            message: 'Le password devono coincidere',
            user: decodedToken['user'],
            terminals: decodedToken['terminals']
        })
    }

    //Gives error message if one of the fileds is empty
    if (!firstPassword && !secondPassword) {
        return res.status(400).render('passwordForm', {
            message: 'Inserisci una password valida',
            user: decodedToken['user']
        })
    }

    let encodedPsw = await crypto.createHash('md5').update(firstPassword).digest('hex').toUpperCase()

    // connect to your database
    const pool = await sql.connect(config)

    let query = "UPDATE tb_utenti SET Password = @password WHERE ID = " + decodedToken['id']

    let request = pool.request()
    request.input('password', sql.NVarChar, encodedPsw)

    try {
        await request.query(query, function (err, results) {
            if (err) console.log(err)

            pool.close()
                .catch((err) => { console.log(err) })

            return res.status(201).redirect('/home');
        })
    }
    catch (err) { }
}