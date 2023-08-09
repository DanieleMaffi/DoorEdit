const express = require('express');
const authController = require("../controllers/auth.js");
const anagraphicController = require("../controllers/anagraphic.js");
const router = express.Router();
const jwt = require('jsonwebtoken');
const { promisify } = require("util");

router.get('/add', authController.isLoggedIn, async (req, res) => {
    let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);
    let id = req.params.id

    res.status(200).render("newAnagraphic", {
        user: decodedToken['user'],
        terminals: decodedToken['terminals'],
        id: id
    })
});
router.get('/:id/update', authController.isLoggedIn, anagraphicController.loadUpdateAnagraphic)

router.get('/:id/delete', authController.isLoggedIn, anagraphicController.deleteAnagraphic);
router.post('/:id/update/submit', authController.isLoggedIn, anagraphicController.updateAnagraphic);
router.post('/add/submit', authController.isLoggedIn, anagraphicController.addAnagraphic);

module.exports = router