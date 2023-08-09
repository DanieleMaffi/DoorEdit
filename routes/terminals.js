const express = require('express');
const authController = require("../controllers/auth.js");
const terminals = require("../controllers/terminals.js");
const router = express.Router();

router.get('/add', authController.isLoggedIn, terminals.loadNewTerminal) 
router.get('/:id', authController.isLoggedIn, terminals.loadTerminal)
router.get('/:id/delete', authController.isLoggedIn, terminals.deleteTerminal)
router.post('/:id/update', authController.isLoggedIn, terminals.updateTerminal)
router.post('/add/submit', authController.isLoggedIn, terminals.addTerminal)

module.exports = router;