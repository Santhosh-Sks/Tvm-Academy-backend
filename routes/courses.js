const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/', courseController.list);
router.get('/:id', courseController.get);
// protect create/update/delete for admin
router.post('/', auth, adminOnly, courseController.create);
router.put('/:id', auth, adminOnly, courseController.update);
router.delete('/:id', auth, adminOnly, courseController.remove);

module.exports = router;
