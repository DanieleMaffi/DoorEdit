const express = require("express");
const authController = require("../controllers/auth.js");
const pagesController = require("../controllers/pages.js");
const router = express.Router();

router.get('/', (req, res) => {     //when the home page is requested the login .ejs file will be loaded, sending an object as payload
    res.status(200).render("login", { root: './views/', message: "" })
});

router.get('/home', authController.isLoggedIn, pagesController.loadHome)

router.get('/anagraphic', authController.isLoggedIn, pagesController.loadAnagraphic)

router.get('/transits', authController.isLoggedIn, pagesController.loadTransits)

router.get('/emails', authController.isLoggedIn, pagesController.loadEmails)

router.get('*', (req, res) => {res.status(404).render('notfound')})

module.exports = router;