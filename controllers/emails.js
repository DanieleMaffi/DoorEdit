const { promisify } = require("util");
const jwt = require('jsonwebtoken');
const config = require('./config');
const sql = require('mssql');

// Loads the emails page, displaying them in a table
exports.loadAddEmail = async (req, res) => {
    let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);

    return res.status(200).render('newEmail', {
        user: decodedToken['user'],
        terminals: decodedToken['terminals'],
    })
}

// Deletes the email corresponding to the id
exports.deleteEmail = async (req, res) => {
    let id = req.params.id

    try {
        const pool = await sql.connect(config)
        let request = pool.request()
        request.input('id', sql.BigInt, id)

        try { await request.query("DELETE FROM tb_cfg_mail WHERE id = @id") }
        catch (err) { console.log(err); return res.status(500).render('serverError') }
        finally { pool.close().catch(err => console.log(err)) }

        return res.status(200).redirect('/emails')
    }
    catch (err) { console.log(err); return res.status(500).render('serverError') }
}

// Handles the form parameter and adds the given email to the database
exports.addEmail = async (req, res) => {
    let email = req.body.email

    try {
        const pool = await sql.connect(config)
        let request = pool.request()
        request.input('email', sql.NVarChar, email)

        try {
            // Checking wether the email is already in the database
            await request.query(`IF (SELECT COUNT(*) FROM tb_cfg_mail WHERE email = @email) = 0
                                BEGIN 
                                INSERT INTO tb_cfg_mail (email) VALUES (@email)
                                END`)

            return res.status(200).redirect('/emails')
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