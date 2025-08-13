const express = require('express');
const router = express.Router();

const {
    getAllStations,
    searchTrains,
} = require('../controllers/trainController');

router.get('/stations', getAllStations);
router.get('/trains/search', searchTrains);

module.exports = router;
