const express = require("express");
const authController = require("../controllers/auth.js");
const jwt = require('jsonwebtoken');
const { promisify } = require("util");

const router = express.Router();

router.post('/login', authController.login);    //When the user makes a post request to /auth/login the function will be called
router.get('/logout', authController.logout)  

// Rendering the change password page and retroeving the necessary variables from the token stored in the cookies
router.get('/changePassword', authController.isLoggedIn, async (req, res) => {
    let decodedToken = await promisify(jwt.verify)(req.cookies['token'], process.env.JWT_SECRET);
    res.render('passwordForm', {
        message: "",
        user: decodedToken['user'],
        terminals: decodedToken['terminals']
    });
});
router.post('/changePassword/upload', authController.isLoggedIn, authController.changePassword);   

module.exports = router;