const express = require("express");
const authController = require("../controllers/auth.js");
const emailsController = require("../controllers/emails.js");

const router = express.Router();

router.get('/add', authController.isLoggedIn, emailsController.loadAddEmail)
router.get('/:id/delete', authController.isLoggedIn, emailsController.deleteEmail)

router.post('/add/submit', authController.isLoggedIn, emailsController.addEmail)

module.exports = router