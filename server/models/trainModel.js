const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  stationName: String, 
  arrivalTime: {
    type: String, 
    default: null,
  },
  departureTime: {
    type: String, 
    default: null,
  },
  distanceFromPrevious: {
    type: Number, 
    required: true,
    default: 0,
  },
  sequence: {
    type: Number,
    required: true,
  },
}, { _id: false });

const trainSchema = new mongoose.Schema({
  trainName: {
    type: String,
    required: true,
  },
  trainNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  route: [stopSchema],
});

trainSchema.index({ 'route.stationName': 1 });

module.exports = mongoose.model('Train', trainSchema);