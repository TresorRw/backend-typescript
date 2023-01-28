const { Router } = require('express');
const controller = require('../controllers/mainController');
let router = Router();
router.post('/signup', controller.signup_post);
router.post('/login', controller.logUser);
router.get('/profile', controller.renderProfile);
router.get('/account', controller.renderAccount);
router.post('/address', controller.saveAddress);
module.exports = router;
