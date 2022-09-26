const express = require('express');
const routes = express.Router();
const controller = require('../controllers/mainControllers');

routes.get('/',controller.mainController.index);
routes.post('/login',controller.mainController.login);
routes.post('/quiz',controller.mainController.quiz);
routes.get('/assets/:key/:assetName',controller.mainController.assets);
routes.post('/profile',controller.mainController.profile);
routes.get('/profile_picture/:key/:assetName',controller.mainController.profilePicture);

module.exports = routes;