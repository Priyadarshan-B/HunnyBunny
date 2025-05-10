const express = require('express');
const router = express.Router();
const resources = require("../../controllers/auth/resources");
const user = require("../../controllers/auth/auth");
const roles = require("../../controllers/auth/role");

router.post('/resources', resources.get_resources);
router.post('/login', user.post_login);
router.post('/register', user.register);
router.get('/roles', roles.get_roles);

module.exports = router;