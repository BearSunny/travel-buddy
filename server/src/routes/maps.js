import express from 'express';
import * as mapsController from '../controllers/mapsController.js';
import { checkJwt } from '../middleware/auth.js';

const router = express.Router();

router.get('/place/:placeId', checkJwt, mapsController.getPlaceDetails);
router.get('/search', checkJwt, mapsController.searchPlaces);
router.get('/nearby', checkJwt, mapsController.getNearbyPlaces);
router.get('/geocode', checkJwt, mapsController.reverseGeocode);

export default router;