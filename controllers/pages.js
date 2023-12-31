const { promisify } = require("util");
const jwt = require('jsonwebtoken');
const sql = require("mssql");

const config = require('./config.js');

// Loads the home page
exports.loadHome = async (req, res) => {
    try {
        //Decoding the token drom the cookies in the browser, this is done in order to get the ID nad username of the user
        let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);

        const pool = await sql.connect(config);

        let query = `SELECT * FROM tb_cfg_terminali`

        try {
            // Retrieving all the terminals
            const result = await sql.query(query)

            let payload = {
                user: decodedToken['user'],
                userId: decodedToken['userId'],
                terminals: result.recordset,
            }

            let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.cookie('token', token, { path: '/' })

            return res.status(200).render("home", {
                user: decodedToken['user'],
                terminals: result.recordset
            })
        }
        catch (err) {
            console.log(err)
            return res.status(500).render('serverError')
        }
        finally {
            pool.close()
                .catch((err) => { console.log(err) })
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).render('serverError')
    }
}

// Loads the anagraphic page
exports.loadAnagraphic = async (req, res) => {
    try {
        await sql.connect(config)
        let query = "SELECT * FROM tb_cfg_anagrafica ORDER BY Cognome"

        let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);

        try {
            const result = await sql.query(query)

            return res.status(200).render("anagraphic", {
                user: decodedToken['user'],
                terminals: decodedToken['terminals'],
                anagraphic: result.recordset
            })
        }
        catch (err) {
            console.log(err)
            return res.status(500).render('serverError')
        }
        finally {
            sql.close()
                .catch((err) => { console.log(err) })
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).render('serverError')
    }
}

// Loads the transits page
exports.loadTransits = async (req, res) => {
    try {
        await sql.connect(config)

        //  The sql convert functions are used to chnage the date format and separate respectively date and time,
        // Also excracting separately day, month and year for ordering purposes
        let query = `SELECT CONVERT(VARCHAR, data, 105) as Data, CONVERT(VARCHAR, data, 108) as Time, Nome, Cognome, Badge, Terminale, Esito 
                FROM tb_transiti 
                ORDER BY rowid DESC`

        let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);

        try {
            const result = await sql.query(query)
            res.status(200).render("transits", {
                user: decodedToken['user'],
                terminals: decodedToken['terminals'],
                transits: result.recordset
            })
        }
        catch (err) {
            console.log(err)
            return res.status(500).render('serverError')
        }
        finally {
            sql.close()
                .catch((err) => { console.log(err) })
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).render('serverError')
    }
}

exports.loadEmails = async (req, res) => {
    try {
        let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);

        await sql.connect(config)

        try {
            const result = await sql.query("SELECT * FROM tb_cfg_mail");
            const emails = result.recordset;

            return res.status(200).render("emails", {
                user: decodedToken["user"],
                terminals: decodedToken["terminals"],
                emails: emails
            })
        }
        catch (err) {
            console.log(err)
            return res.status(500).render('serverError')
        }
        finally {
            sql.close()
                .catch((err) => { console.log(err) })
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).render('serverError')
    }
}