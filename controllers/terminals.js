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
    catch (err) { console.log(err); return res.status(500).render('serverError') }
}

// Loads the terminal's managing page, where authorizations asssociated to it will be displayed
exports.manageTerminal = async (req, res) => {
    try {
        let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);
        let id = req.params.id

        const pool = await sql.connect(config)

        // Getting the authorizations associated to that specific terminal
        query = "SELECT * FROM vw_autorizzazioni WHERE id_terminale = @id"

        try {
            // Getting the entire anagraphics
            const anagraphicResult = await pool.query("SELECT * FROM tb_cfg_anagrafica ORDER BY Cognome");
            const anagraphic = anagraphicResult.recordset;

            storedAnagraphic = anagraphic

            const result = await pool.request().input('id', sql.NVarChar, id).query(query)
            storedAuthorizations = result.recordset

            return res.status(200).render("manageTerminal", {
                user: decodedToken["user"],
                terminals: decodedToken["terminals"],
                authorizations: result.recordset,
                anagraphic: anagraphic,
                id: id,
                message: false
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

// Updates the information about the terminal
exports.updateTerminal = async (req, res) => {
    let sqlId = req.params.id
    let name = req.body.name
    let ip = req.body.ip
    let id = req.body.id

    try {
        const pool = await sql.connect(config)
        let query = "UPDATE tb_cfg_terminali SET nome_terminale = @name, id_terminale =  @id, indirizzo_terminale = @ip WHERE rowid = @sqlId"
        let request = await pool.request()
        request.input('sqlId', sql.BigInt, sqlId)
        request.input('name', sql.NVarChar, name)
        request.input('ip', sql.NVarChar, ip)
        request.input('id', sql.NVarChar, id)

        try {
            await request.query(query)
            return res.status(200).redirect('/home')
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

// Gives access to a person to a specific terminal
exports.addTerminalAccess = async (req, res) => {
    try {
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

        try {
            const result = await request.query(query)
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

// Removes the access to a specific terminal
exports.deleteTerminalAccess = async (req, res) => {
    try {
        let terminalId = req.params.terminalId
        let anagraphicId = req.params.personId

        const pool = await sql.connect(config)
        let request = await pool.request()
        request.input('terminal', sql.NVarChar, terminalId)
        request.input('anagraphic', sql.NVarChar, anagraphicId)

        let query = "DELETE FROM tb_cfg_autorizzazioni WHERE id_terminale = @terminal AND id_anagrafica = @anagraphic"

        try {
            // Deleting the access to a terminal, to a specific person
            await request.query(query)
            return res.status(200).redirect('/terminals/' + terminalId + '/manage')
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

// This is just the update but callback version
// This function adds an authorization given the terminal and the person IDs
exports.updateTerminalAccess = async (terminalId, anagraphicId) => {
    try {
        const pool = await sql.connect(config)

        // Adds an authorization only if it's not already present
        let query = "INSERT INTO tb_cfg_autorizzazioni (id_terminale, id_anagrafica) VALUES (@terminal, @anagraphic)"

        let request = await pool.request()
        request.input('terminal', sql.NVarChar, terminalId)
        request.input('anagraphic', sql.NVarChar, anagraphicId)

        try {
            await request.query(query)
        }
        catch (err) {
            console.log(err)
        }
        finally {
            pool.close()
                .catch((err) => { console.log(err) })
        }
    }
    catch (err) {
        console.log(err)
    }

    return
}

// Removes all the access to a specified person, deleting all the authoriaztion associated to them
exports.removeAccess = async (id) => {
    try {
        const pool = await sql.connect(config)

        let request = await pool.request()
        request.input('anagraphic', sql.NVarChar, id)

        try {
            query = "DELETE FROM tb_cfg_autorizzazioni WHERE id_anagrafica = @anagraphic"
            await request.query(query)
        }
        catch (err) {
            console.log(err)
        }
        finally {
            pool.close()
                .catch((err) => { console.log(err) })
        }
    }
    catch (err) {
        console.log(err)
    }

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
    try {
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

        try {
            await request.query(query)
            return res.status(200).redirect('/home')
        }
        catch (err) {
            console.log(err)
            return res.status(400).render('newTerminal', {
                user: decodedToken['user'],
                id: decodedToken['id'],
                terminals: decodedToken['terminals'],
                message: "Non puoi inserire un terminale con lo stesso indirizzo o codice!"
            })
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

// Deletes a terminal
exports.deleteTerminal = async (req, res) => {
    try {
        let id = req.params.id

        const pool = await sql.connect(config)
        let query = "DELETE tb_cfg_terminali WHERE rowid = @id"
        let request = pool.request()
        request.input('id', sql.BigInt, id)

        try {
            const result = await request.query(query)
            if (result.rowsAffected == 0)
                res.status(404).render("notfound")
            return res.status(200).redirect('/home')
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
