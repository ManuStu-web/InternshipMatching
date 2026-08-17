const express = require('express');
const {
    registerGovernment,
    loginGovernment
} = require("../controllers/authController");

const router = express.Router();

router.post("/register" , registerGovernment);
router.post("/login", loginGovernment);

module.exports = router;