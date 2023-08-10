const express = require('express');
const authController = require("../controllers/auth.js");
const terminalsController = require("../controllers/terminals.js");
const router = express.Router();

router.get('/add', authController.isLoggedIn, terminalsController.loadNewTerminal) 
router.get('/:id', authController.isLoggedIn, terminalsController.loadTerminal)
router.get('/:id/delete', authController.isLoggedIn, terminalsController.deleteTerminal)
router.get('/:id/manage', authController.isLoggedIn, terminalsController.manageTerminal)
router.get('/:terminalId/manage/delete/:personId', authController.isLoggedIn, terminalsController.deleteTerminalAccess)
router.post('/:id/manage/add', authController.isLoggedIn, terminalsController.addTerminalAccess)
router.post('/:id/update', authController.isLoggedIn, terminalsController.updateTerminal)
router.post('/add/submit', authController.isLoggedIn, terminalsController.addTerminal)

module.exports = router;