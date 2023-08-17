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

    const pool = await sql.connect(config)
    let request = pool.request()
    request.input('id', sql.BigInt, id)

    try { await request.query("DELETE FROM tb_cfg_mail WHERE id = @id") }
    catch (err) { console.log(err); return res.status(404).render('notfound') }

    return res.status(200).redirect('/emails')
}

// Handles the form parameter and adds the given email to the database
exports.addEmail = async (req, res) => {
    let email = req.body.email

    const pool = await sql.connect(config)
    let request = pool.request()
    request.input('email', sql.NVarChar, email)

    // Checking wether the email is already in the database
    try { await request.query(`IF (SELECT COUNT(*) FROM tb_cfg_mail WHERE email = @email) = 0
                            BEGIN 
                            INSERT INTO tb_cfg_mail (email) VALUES (@email)
                            END`) }
    catch (err) { console.log(err); return res.status(404).render('notfound') }

    return res.status(200).redirect('/emails')
}