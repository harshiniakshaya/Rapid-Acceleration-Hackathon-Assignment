const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  stationName: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  stationCode: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('Station', stationSchema);