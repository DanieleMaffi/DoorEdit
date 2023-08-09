const express = require("express");
const authController = require("../controllers/auth.js");
const pages = require("../controllers/pages.js");
const router = express.Router();

router.get('/', (req, res) => {     //when the home page is requested the login .ejs file will be loaded
    res.status(200).render("login", { root: './views/', message: "" })
});

router.get('/home', authController.isLoggedIn, pages.loadHome)

router.get('/anagraphic', authController.isLoggedIn, pages.loadAnagraphic)

router.get('*', (req, res) => {res.status(404).render('notfound')})

module.exports = router;