const { promisify } = require("util");
const jwt = require('jsonwebtoken');
const sql = require("mssql");
const terminalsController = require('./terminals')

const config = require('./config.js');

// Loads The anagraphic page
exports.loadUpdateAnagraphic = async (req, res) => {
    try {
        let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);
        let id = req.params.id;
        let authorizations = [];

        const pool = await sql.connect(config);

        try {
            const request = pool.request().input('id', sql.BigInt, id);

            // Querying all the authorizations associated with the id given in the parameters
            const authQueryResult = await request.query("SELECT ID_Terminale FROM tb_cfg_autorizzazioni WHERE id_anagrafica = @id");

            for (let i = 0; i < authQueryResult.recordset.length; i++) {
                authorizations.push(authQueryResult.recordset[i].ID_Terminale);
            }

            // Querying the entire anagraphic
            const anagraphicQueryResult = await request.query("SELECT * FROM tb_cfg_anagrafica WHERE rowid = @id ORDER BY cognome DESC");

            if (anagraphicQueryResult.rowsAffected == 0) {
                return res.status(404).render("notfound");
            }

            return res.status(200).render("editAnagraphic", {
                user: decodedToken['user'],
                terminals: decodedToken['terminals'],
                anagraphic: anagraphicQueryResult.recordset[0],
                authorizations: authorizations
            });
        } catch (err) {
            console.log(err);
            return res.status(500).render('serverError');
        } finally {
            await pool.close();
        }
    } catch (err) {
        console.log(err);
        return res.status(500).render('serverError');
    }
};


// Adds an element ot the anagraphic
exports.addAnagraphic = async (req, res) => {
    let name = req.body.name;
    let surname = req.body.surname;
    let enabled = true; // The person added will be enabled by default when created
    let stamps = req.body.stamps;
    let additional = req.body.additional;
    let entrances = req.body.entrances

    // Changing name and last name to uppercase
    name = name.toUpperCase()
    surname = surname.toUpperCase()

    try {
        const pool = await sql.connect(config)
        let query = `INSERT INTO tb_cfg_anagrafica 
        (nome, cognome, abilitato, badge_timbrature, badge_accessi, badge_aggiuntivo) 
        VALUES (@name, @surname, @enabled, @stamps, @entrances, @additional)`
        let request = pool.request()
        request.input('name', sql.NVarChar, name)
        request.input('surname', sql.NVarChar, surname)
        request.input('enabled', sql.Bit, enabled)
        request.input('stamps', sql.NVarChar, stamps)
        request.input('entrances', sql.NVarChar, entrances)
        request.input('additional', sql.NVarChar, additional)

        try {
            await request.query(query)
            return res.status(200).redirect('/anagraphic')
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


// Updates a person in the anagraphic and all their authorizations to each terminal
exports.updateAnagraphic = async (req, res) => {
    let id = req.params.id;
    let name = req.body.name;
    let surname = req.body.surname;
    let stamps = req.body.stamps;
    let additional = req.body.additional;
    let entrances = req.body.entrances

    let enabled = req.body.enabled ? true : false;  //When the checkbox is checked it returns 'on', otherwise an empty string, this short if ensures that enabled gets a boolean a value
    let singleEnabled = req.body.singleEnabled || [];   //Gets the array from the body request, otherwise assigns an empty array

    // If the singleEnabled variable ever become an integer due to just one value in the body, this snippet will ensure that it becomes an array
    if (typeof singleEnabled === 'string') {
        singleEnabled = []
        singleEnabled.push(req.body.singleEnabled)
    }

    // Erasing all the authorizations
    terminalsController.removeAccess(id)

    // Calling the function update for each terminal that was checked
    singleEnabled.forEach(terminalId => {
        terminalsController.updateTerminalAccess(terminalId, id)
    });

    // If none get checked, then it removes all the authorizations
    if (singleEnabled.length === 0)
        terminalsController.removeAccess(id)

    // Finally updating the actual person details
    try {
        const pool = await sql.connect(config)
        let query = "UPDATE tb_cfg_anagrafica SET nome = @name, cognome = @surname, abilitato = @enabled, badge_timbrature = @stamps, badge_accessi = @entrances, badge_Aggiuntivo = @additional WHERE rowid = @id"
        let request = pool.request()
        request.input('id', sql.BigInt, id)
        request.input('name', sql.NVarChar, name)
        request.input('surname', sql.NVarChar, surname)
        request.input('enabled', sql.Bit, enabled)
        request.input('stamps', sql.NVarChar, stamps)
        request.input('entrances', sql.NVarChar, entrances)
        request.input('additional', sql.NVarChar, additional)

        try {
            await request.query(query)
            return res.status(200).redirect('/anagraphic')
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

// Deletes a person from the anagraphic
exports.deleteAnagraphic = async (req, res) => {
    let id = req.params.id;

    try {
        const pool = await sql.connect(config)
        let query = "DELETE tb_cfg_anagrafica WHERE rowid = @id"
        let request = pool.request()
        request.input('id', sql.BigInt, id)

        try {
            await request.query(query)
            return res.status(200).redirect('/anagraphic')
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