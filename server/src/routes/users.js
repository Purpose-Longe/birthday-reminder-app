const express = require('express');
const router = express.Router();
const { listUsers, createUser, deleteUser } = require('../controllers/userController');

router.get('/', listUsers);
router.post('/', createUser);
router.delete('/:id', deleteUser);

module.exports = router;
