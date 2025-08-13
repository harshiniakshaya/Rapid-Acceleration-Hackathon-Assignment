const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Station = require('../models/stationModel');
const Train = require('../models/trainModel');

const STATIONS_LIST = [
  { stationName: 'Chennai', stationCode: 'MAS' }, { stationName: 'Vellore', stationCode: 'VLR' },
  { stationName: 'Bangalore', stationCode: 'SBC' }, { stationName: 'Mysuru', stationCode: 'MYS' },
  { stationName: 'Mangalore', stationCode: 'MAQ' }, { stationName: 'Shimoga', stationCode: 'SME' },
  { stationName: 'Mumbai', stationCode: 'CST' }, { stationName: 'Pune', stationCode: 'PUNE' },
  { stationName: 'Delhi', stationCode: 'NDLS' }, { stationName: 'Agra', stationCode: 'AGC' },
  { stationName: 'Jaipur', stationCode: 'JP' }, { stationName: 'Kolkata', stationCode: 'HWH' },
  { stationName: 'Hyderabad', stationCode: 'HYB' }, { stationName: 'Nagpur', stationCode: 'NGP' },
  { stationName: 'Bhopal', stationCode: 'BPL' }, { stationName: 'Lucknow', stationCode: 'LKO' },
  { stationName: 'Ahmedabad', stationCode: 'ADI' }, { stationName: 'Surat', stationCode: 'ST' },
  { stationName: 'Goa', stationCode: 'MAO' }, { stationName: 'Kochi', stationCode: 'ERS' },
];

const addMinutes = (time, mins) => {
  const [h, m] = time.split(':').map(Number);
  const totalMins = h * 60 + m + mins;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

const generateData = async () => {
  try {
    await connectDB();
    console.log('Wiping existing train and station data...');
    await Train.deleteMany({});
    await Station.deleteMany({});
    console.log('Data wiped.');

    console.log('Seeding stations...');
    const createdStations = await Station.insertMany(STATIONS_LIST);
    console.log(`${createdStations.length} stations seeded.`);

    const trains = [];
    for (let i = 1; i <= 100; i++) {
      const trainName = `Train ${i}`;
      const trainNumber = String(i);

      const routeStops = [...createdStations].sort(() => 0.5 - Math.random());
      const routeLength = Math.floor(Math.random() * 8) + 5;
      const selectedStops = routeStops.slice(0, routeLength);

      const route = [];
      let currentTime = `${String(Math.floor(Math.random() * 18)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
      
      for (let j = 0; j < selectedStops.length; j++) {
        const station = selectedStops[j];
        const stopData = {
          station: station._id,
          stationName: station.stationName,
          sequence: j + 1,
        };

        if (j === 0) {
          stopData.arrivalTime = null;
          stopData.departureTime = currentTime;
          stopData.distanceFromPrevious = 0;
        } else {
          const distance = Math.floor(Math.random() * 200) + 50;
          const travelMinutes = Math.floor((distance / 80) * 60);
          const haltMinutes = Math.floor(Math.random() * 15) + 5;

          stopData.distanceFromPrevious = distance;
          stopData.arrivalTime = addMinutes(currentTime, travelMinutes);
          stopData.departureTime = addMinutes(stopData.arrivalTime, haltMinutes);
          currentTime = stopData.departureTime;
        }

        if (j === selectedStops.length - 1) {
          stopData.departureTime = null;
        }
        
        route.push(stopData);
      }
      trains.push({ trainName, trainNumber, route });
    }
    
    console.log(`Generating ${trains.length} trains...`);
    await Train.insertMany(trains);
    console.log('est data generated successfully!');

  } catch (error) {
    console.error('Error generating data:', error);
  } finally {
    console.log('Closing DB connection.');
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  generateData();
}

module.exports = generateData;
