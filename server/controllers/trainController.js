const Train = require('../models/trainModel');
const Station = require('../models/stationModel');

const PRICE_PER_KM = 1.25;

const timeToMinutes = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const getAllStations = async (req, res) => {
    try {
        const stations = await Station.find().sort({ stationName: 1 }).lean();
        res.json(stations);
    } catch (error) {
        console.error("Failed to fetch stations:", error);
        res.status(500).json({ message: 'Error on the server.' });
    }
};

const searchTrains = async (req, res) => {
    const { source, destination } = req.query;

    if (!source || !destination || source === destination) {
        return res.status(400).json({ message: 'Please provide a valid source and destination.' });
    }

    try {
        const direct = await findDirectTrains(source, destination);
        const connections = await findConnectingTrains(source, destination);

        const response = {
            direct,
            connections,
            message: (direct.length === 0 && connections.length === 0) ? `No routes found from ${source} to ${destination}.` : 'Routes found.'
        };
        
        res.json(response);

    } catch (error) {
        console.error(`Error searching routes from ${source} to ${destination}:`, error);
        res.status(500).json({ message: 'A server error occurred during the search.' });
    }
};

async function findDirectTrains(source, destination) {
    const trains = await Train.find({
        'route.stationName': { $all: [source, destination] }
    }).lean();

    const results = [];

    for (const train of trains) {
        const sourceIndex = train.route.findIndex(s => s.stationName === source);
        const destIndex = train.route.findIndex(s => s.stationName === destination);

        if (sourceIndex !== -1 && destIndex !== -1 && sourceIndex < destIndex) {
            const relevantStops = train.route.slice(sourceIndex, destIndex + 1);
            
            let distance = 0;
            for(let i = 1; i < relevantStops.length; i++) {
                distance += relevantStops[i].distanceFromPrevious;
            }

            results.push({
                trainName: train.trainName,
                trainNumber: train.trainNumber,
                source: { name: source, time: relevantStops[0].departureTime },
                destination: { name: destination, time: relevantStops[relevantStops.length - 1].arrivalTime },
                distance: distance,
                price: distance * PRICE_PER_KM,
            });
        }
    }
    return results;
}

async function findConnectingTrains(source, destination) {
    const connections = [];
    const MIN_LAYOVER = 45;
    const MAX_LAYOVER = 360;

    const trainsFromSource = await Train.find({ 'route.stationName': source }).lean();

    for (const train1 of trainsFromSource) {
        const sourceStopIndex = train1.route.findIndex(s => s.stationName === source);

        for (let i = sourceStopIndex + 1; i < train1.route.length; i++) {
            const interchangeStop = train1.route[i];
            const interchangeStationName = interchangeStop.stationName;

            if (interchangeStationName === destination) continue;
            
            const trainsFromInterchange = await Train.find({
                'route.stationName': { $all: [interchangeStationName, destination] }
            }).lean();

            for (const train2 of trainsFromInterchange) {
                const interchangeStartOnTrain2 = train2.route.find(s => s.stationName === interchangeStationName);
                const finalDestOnTrain2 = train2.route.find(s => s.stationName === destination);
                
                if (!interchangeStartOnTrain2 || !finalDestOnTrain2 || interchangeStartOnTrain2.sequence >= finalDestOnTrain2.sequence) {
                    continue;
                }

                const arrivalTime = timeToMinutes(interchangeStop.arrivalTime);
                const departureTime = timeToMinutes(interchangeStartOnTrain2.departureTime);
                const layover = departureTime - arrivalTime;

                if (layover >= MIN_LAYOVER && layover <= MAX_LAYOVER) {
                    const firstLegStops = train1.route.slice(sourceStopIndex, i + 1);
                    let distance1 = 0;
                    for(let k = 1; k < firstLegStops.length; k++) distance1 += firstLegStops[k].distanceFromPrevious;
                    
                    const secondLegStops = train2.route.slice(interchangeStartOnTrain2.sequence - 1, finalDestOnTrain2.sequence);
                    let distance2 = 0;
                    for(let k = 1; k < secondLegStops.length; k++) distance2 += secondLegStops[k].distanceFromPrevious;
                    
                    connections.push({
                        totalPrice: (distance1 + distance2) * PRICE_PER_KM,
                        layoverDuration: layover,
                        interchangeStation: interchangeStationName,
                        leg1: {
                            trainName: train1.trainName,
                            source: { name: source, time: firstLegStops[0].departureTime },
                            destination: { name: interchangeStationName, time: firstLegStops[firstLegStops.length - 1].arrivalTime },
                            price: distance1 * PRICE_PER_KM,
                        },
                        leg2: {
                            trainName: train2.trainName,
                            source: { name: interchangeStationName, time: secondLegStops[0].departureTime },
                            destination: { name: destination, time: secondLegStops[secondLegStops.length - 1].arrivalTime },
                            price: distance2 * PRICE_PER_KM
                        }
                    });

                    if (connections.length >= 10) {
                        return connections;
                    }
                }
            }
        }
    }
    return connections;
}

module.exports = {
    getAllStations,
    searchTrains,
};
