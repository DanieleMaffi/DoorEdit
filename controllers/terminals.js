const { promisify } = require("util");
const jwt = require('jsonwebtoken');
const sql = require("mssql");

const config = require('./config.js');

let storedAnagraphic = {}
let storedAuthorizations = {}

//When the corresponding url is called, loads the page associated with the terminal given as a parameter in the uri ex: /terminals/12
exports.loadTerminal = async (req, res) => {
    // Getting the id from the parameters
    let terminalSqlId = req.params.id

    let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);
    let terminals = decodedToken['terminals']
    let terminalIp = ""
    //This is not to be confused with the other id, which corresponds to the actaul dtabase id
    let terminalId = 0
    let terminalState = 0
    let terminalName = ""

    try {
        //Looking among the terminals array which has the id corresponding to the uri
        for (let i = 0; i < terminals.length; i++)
            if (terminals[i].rowID == terminalSqlId) {
                terminalIp = terminals[i].Indirizzo_Terminale
                terminalId = terminals[i].ID_Terminale
                terminalName = terminals[i].Nome_Terminale
                terminalState = terminals[i].Stato
            }
        // Creating the object that contains the spicified terminal to edit
        let terminal = {
            id: terminalId,
            ip: terminalIp,
            name: terminalName,
            sqlId: terminalSqlId,
            state: terminalState
        }

        // If the id of the specified terminal is not found, gives an error messages
        if (!terminalId && !terminalIp && !terminalState && !terminalName)
            return res.status(404).render("notfound")

        return res.status(200).render('terminal', {
            user: decodedToken['user'],
            terminals: decodedToken['terminals'],
            terminal: terminal
        })
    }
    catch (err) { console.log(err) }
}

// Loads the terminal's managing page, where authorizations asssociated to it will be displayed
exports.manageTerminal = async (req, res) => {
    let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);
    let id = req.params.id

    const pool = await sql.connect(config)

    // Getting the entire anagraphics
    const anagraphicResult = await pool.query("SELECT * FROM tb_cfg_anagrafica ORDER BY Cognome");
    const anagraphic = anagraphicResult.recordset;

    storedAnagraphic = anagraphic

    try {
        // Getting the authorizations associated to that specific terminal
        query = "SELECT * FROM vw_autorizzazioni WHERE id_terminale = @id"
        request = pool.request().input('id', sql.NVarChar, id).query(query, (err, result) => {
            if (err) console.log(err)

            storedAuthorizations = result.recordset

            pool.close()
                .catch(err => { console.log(err) })

            return res.status(200).render("manageTerminal", {
                user: decodedToken["user"],
                terminals: decodedToken["terminals"],
                authorizations: result.recordset,
                anagraphic: anagraphic,
                id: id,
                message: false
            })
        })
    }
    catch (err) { console.log(err); return res.status(404).render("notfound") }
}

// Updates the information about the terminal
exports.updateTerminal = async (req, res) => {
    let sqlId = req.params.id
    let name = req.body.name
    let ip = req.body.ip
    let id = req.body.id

    const pool = await sql.connect(config)
    let query = "UPDATE tb_cfg_terminali SET nome_terminale = @name, id_terminale =  @id, indirizzo_terminale = @ip WHERE rowid = @sqlId"
    let request = await pool.request()
    request.input('sqlId', sql.BigInt, sqlId)
    request.input('name', sql.NVarChar, name)
    request.input('ip', sql.NVarChar, ip)
    request.input('id', sql.NVarChar, id)

    request.query(query, (err, result) => {
        if (err) console.log(err)

        pool.close()
            .catch((err) => { console.log(err) })

        return res.status(200).redirect('/home')
    })
}

// Gives access to a person to a specific terminal
exports.addTerminalAccess = async (req, res) => {
    let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);
    let id = req.params.id
    let person = req.body.person

    const pool = await sql.connect(config)
    let request = pool.request()
    request.input('id', sql.NVarChar, id)
    request.input('person', sql.BigInt, person)

    // This'll add the authorization only if it doesn't already exist, and if it does returns 1
    query = `IF (SELECT COUNT(*) FROM tb_cfg_autorizzazioni WHERE id_terminale = @id AND id_anagrafica = @person) = 0
            BEGIN
            INSERT INTO tb_cfg_autorizzazioni (id_terminale, id_anagrafica) VALUES (@id, @person)
            END
            ELSE
            BEGIN
            SELECT 1
            END`

    request.query(query, (err, result) => {
        if (err) {
            console.log(err)
            return res.status(500).render("serverError")    // Render the error 500 page if the server gives an error
        }

        if (result.recordset)
            return res.render("manageTerminal", {
                user: decodedToken['user'],
                userId: decodedToken['user_id'],
                terminals: decodedToken['terminals'],
                id: id,
                authorizations: storedAuthorizations,
                anagraphic: storedAnagraphic,
                message: true 
            })

        return res.status(200).redirect('/terminals/' + id + '/manage')
    })
}

// Removes the access to a specific terminal
exports.deleteTerminalAccess = async (req, res) => {
    let terminalId = req.params.terminalId
    let anagraphicId = req.params.personId

    const pool = await sql.connect(config)
    let request = await pool.request()
    request.input('terminal', sql.NVarChar, terminalId)
    request.input('anagraphic', sql.NVarChar, anagraphicId)

    let query = "DELETE FROM tb_cfg_autorizzazioni WHERE id_terminale = @terminal AND id_anagrafica = @anagraphic"

    // Deleting the access to a terminal, to a specific person
    request.query(query, (err, result) => {
        if (err) console.log(err)

        pool.close()
            .catch((err) => { console.log(err) })

        return res.status(200).redirect('/terminals/' + terminalId + '/manage')
    })
}

// This is just the update but callback version
// This function adds an authorization given the terminal and the person IDs
exports.updateTerminalAccess = async (terminalId, anagraphicId) => {
    const pool = await sql.connect(config)

    // Adds an authorization only if it's not already present
    let query = "INSERT INTO tb_cfg_autorizzazioni (id_terminale, id_anagrafica) VALUES (@terminal, @anagraphic)"

    let request = await pool.request()
    request.input('terminal', sql.NVarChar, terminalId)
    request.input('anagraphic', sql.NVarChar, anagraphicId)

    request.query(query, (err, result) => {
        if (err) console.log(err)

        pool.close()
            .catch((err) => { console.log(err) })
    })

    return
}

// Removes all the access to a specified person, deleting all the authoriaztion associated to them
exports.removeAccess = async (id) => {
    const pool = await sql.connect(config)

    let request = await pool.request()
    request.input('anagraphic', sql.NVarChar, id)

    query = "DELETE FROM tb_cfg_autorizzazioni WHERE id_anagrafica = @anagraphic"
    request.query(query, (err, result) => {
        if (err) console.log(err)

        pool.close()
            .catch((err) => { console.log(err) })
    })

    return
}

// Loads the page to add a terminal
exports.loadNewTerminal = async (req, res) => {
    let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET)

    res.status(200).render('newTerminal', {
        user: decodedToken['user'],
        id: decodedToken['id'],
        terminals: decodedToken['terminals'],
        message: ""
    })
}

// Does the actual uploading of the terminal to the databases
exports.addTerminal = async (req, res) => {
    let name = req.body.name
    let id = req.body.id
    let ip = req.body.ip

    let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET)

    const pool = await sql.connect(config)
    let query = "INSERT INTO tb_cfg_terminali (nome_terminale, id_terminale, indirizzo_terminale) VALUES (@name, @id, @ip)"
    let request = pool.request()

    request.input('name', sql.NVarChar, name)
    request.input('id', sql.NVarChar, id)
    request.input('ip', sql.NVarChar, ip)

    request.query(query, (err, result) => {
        pool.close()
            .catch((err => { console.log(err) }))


        if (err) {
            console.log(err)
            return res.status(400).render('newTerminal', {
                user: decodedToken['user'],
                id: decodedToken['id'],
                terminals: decodedToken['terminals'],
                message: "Non puoi inserire un terminale con lo stesso indirizzo o codice!"
            })
        }

        return res.status(200).redirect('/home')
    })
}

// Deletes a terminal
exports.deleteTerminal = async (req, res) => {
    let id = req.params.id

    const pool = await sql.connect(config)
    let query = "DELETE tb_cfg_terminali WHERE rowid = @id"
    let request = pool.request()
    request.input('id', sql.BigInt, id)

    request.query(query, (err, result) => {
        if (result.rowsAffected == 0)
            res.status(404).render("notfound")

        pool.close()
            .then(() => { console.log("Closed pool") })
            .catch((err => { console.log(err) }))

        return res.status(200).redirect('/home')
    })
}
