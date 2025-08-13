import React, { useState, useEffect, useMemo } from 'react';

const TrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 mr-3 text-white">
    <rect x="3" y="6" width="18" height="11" rx="2" ry="2"/>
    <circle cx="8" cy="23" r="2"/>
    <circle cx="16" cy="23" r="2"/>
    <path d="m3 6 1.5 18"/>
    <path d="m21 6-1.5 18"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mx-3 text-slate-400">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2 text-slate-600">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const RupeeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1 text-emerald-600">
    <path d="M6 3h12"/>
    <path d="M6 8h12"/>
    <path d="m6 13 8.5 8"/>
    <path d="M6 13h3"/>
    <path d="m9 13 10.5 8"/>
  </svg>
);

const SwapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M8 3L4 7l4 4"/>
    <path d="M4 7h16"/>
    <path d="M16 21l4-4-4-4"/>
    <path d="M20 17H4"/>
  </svg>
);

const ChevronDownIcon = ({ expanded }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const Spinner = () => (
  <div className="flex justify-center items-center p-12">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <TrainIcon />
      </div>
    </div>
  </div>
);

export default function App() {
  const [stations, setStations] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState('price');
  const [expandedRoute, setExpandedRoute] = useState(null);

  const API_BASE_URL = 'https://railroute-backend.onrender.com/api';

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/stations`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setStations(data);
      } catch (err) {
        setError('Failed to load station data. Please check your connection and try again.');
      }
    };
    fetchStations();
  }, []);

  const handleSearch = async () => {
    if (!source || !destination) {
      setError('Please select both source and destination stations.');
      return;
    }
    if (source === destination) {
      setError('Source and destination cannot be the same.');
      return;
    }

    setIsLoading(true);
    setError('');
    setRoutes(null);
    setExpandedRoute(null);

    try {
      const response = await fetch(`${API_BASE_URL}/trains/search?source=${source}&destination=${destination}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setRoutes(data);
    } catch (err) {
      setError('Failed to fetch train routes. The server might be busy or down.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSwap = () => {
    setSource(destination);
    setDestination(source);
  };

  const toggleRouteDetails = (index) => {
    setExpandedRoute(expandedRoute === index ? null : index);
  };

  const sortedRoutes = useMemo(() => {
    if (!routes || (!routes.direct?.length && !routes.connections?.length)) return null;
    
    const timeToMinutes = (timeStr) => {
      if (!timeStr) return Infinity;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const sortedDirect = [...(routes.direct || [])].sort((a, b) => 
      sortKey === 'price' ? a.price - b.price : timeToMinutes(a.source.time) - timeToMinutes(b.source.time)
    );

    const sortedConnections = [...(routes.connections || [])].sort((a, b) => 
      sortKey === 'price' ? a.totalPrice - b.totalPrice : timeToMinutes(a.leg1.source.time) - timeToMinutes(b.leg1.source.time)
    );

    return { direct: sortedDirect, connections: sortedConnections, message: routes.message };
  }, [routes, sortKey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-center">
            <TrainIcon />
            <h1 className="text-3xl font-bold text-white tracking-tight">RailRoute Finder</h1>
          </div>
          <p className="text-center text-blue-100 mt-2 font-medium">Find the best train routes across India</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl mb-10 border border-white/20">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-end">
              <div className="lg:col-span-5 space-y-2">
                <label htmlFor="source" className="block text-sm font-semibold text-slate-700 mb-3">
                  Departure Station
                </label>
                <select 
                  id="source" 
                  value={source} 
                  onChange={(e) => setSource(e.target.value)} 
                  className="w-full p-4 border-2 border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/90 backdrop-blur-sm text-slate-800 font-medium"
                >
                  <option value="" className="text-slate-400">Choose departure station</option>
                  {stations.map(station => (
                    <option key={station._id} value={station.stationName} className="text-slate-800">
                      {station.stationName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="lg:col-span-1 flex justify-center">
                <button 
                  type="button" 
                  onClick={handleSwap} 
                  className="p-4 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-600 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-white/50"
                >
                  <SwapIcon />
                </button>
              </div>
              
              <div className="lg:col-span-5 space-y-2">
                <label htmlFor="destination" className="block text-sm font-semibold text-slate-700 mb-3">
                  Arrival Station
                </label>
                <select 
                  id="destination" 
                  value={destination} 
                  onChange={(e) => setDestination(e.target.value)} 
                  className="w-full p-4 border-2 border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/90 backdrop-blur-sm text-slate-800 font-medium"
                >
                  <option value="" className="text-slate-400">Choose arrival station</option>
                  {stations.map(station => (
                    <option key={station._id} value={station.stationName} className="text-slate-800">
                      {station.stationName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <button 
                onClick={handleSearch} 
                className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-bold py-4 px-12 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center text-lg" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Searching Routes...
                  </>
                ) : (
                  <>
                    <SearchIcon />
                    Find Train Routes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl mb-8 shadow-lg" role="alert">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {isLoading && <Spinner />}

        {sortedRoutes && (
          <div className="space-y-8">
            <div className="flex flex-wrap justify-center items-center gap-4 p-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
              <span className="font-bold text-slate-700 text-lg">Sort by:</span>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSortKey('price')} 
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
                    sortKey === 'price' 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-200' 
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200'
                  }`}
                >
                  💰 Best Price
                </button>
                <button 
                  onClick={() => setSortKey('time')} 
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
                    sortKey === 'time' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200' 
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200'
                  }`}
                >
                  ⏰ Early Departure
                </button>
              </div>
            </div>

            {sortedRoutes.direct.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg">
                    🚄 Direct Trains
                  </div>
                </div>
                <div className="grid gap-6">
                  {sortedRoutes.direct.map((route, index) => (
                    <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-l-8 border-emerald-500 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                          <div className="flex-1 space-y-3">
                            <h3 className="font-bold text-2xl text-slate-800">
                              {route.trainName} 
                              <span className="text-slate-500 font-normal text-lg ml-2">({route.trainNumber})</span>
                            </h3>
                            <div className="flex items-center text-slate-600 bg-slate-50 rounded-lg px-4 py-2 w-fit">
                              <span className="font-bold text-lg">{route.source.name}</span>
                              <ArrowRightIcon />
                              <span className="font-bold text-lg">{route.destination.name}</span>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 lg:gap-8">
                            <div className="flex items-center bg-blue-50 rounded-lg px-4 py-2 font-semibold text-slate-700">
                              <ClockIcon />
                              <span className="text-lg">{route.source.time} - {route.destination.time}</span>
                            </div>
                            <div className="flex items-center bg-emerald-50 rounded-lg px-4 py-2 font-bold text-2xl text-emerald-700">
                              <RupeeIcon />
                              {route.price.toFixed(2)}
                            </div>
                            <button 
                              onClick={() => toggleRouteDetails(index)} 
                              className="p-3 rounded-full hover:bg-slate-100 transition-all duration-200 transform hover:scale-110"
                            >
                              <ChevronDownIcon expanded={expandedRoute === index} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {expandedRoute === index && (
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-t border-slate-200">
                          <h4 className="font-bold text-slate-800 mb-4 text-lg">🚉 Route Details</h4>
                          <div className="bg-white rounded-xl p-4 mb-6 shadow-inner">
                            <ul className="space-y-3">
                              {route.stops.map((stop, idx) => (
                                <li key={stop.sequence} className={`flex justify-between items-center py-3 ${idx < route.stops.length - 1 ? 'border-b border-dashed border-slate-200' : ''}`}>
                                  <span className="font-semibold text-slate-700 text-lg">{stop.stationName}</span>
                                  <span className="text-slate-600 bg-slate-50 rounded-lg px-3 py-1 font-medium">
                                    {stop.arrivalTime && `Arr: ${stop.arrivalTime}`}
                                    {stop.arrivalTime && stop.departureTime && ' | '}
                                    {stop.departureTime && `Dep: ${stop.departureTime}`}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-gradient-to-r from-white to-emerald-50 p-6 rounded-xl border-2 border-emerald-100">
                            <h4 className="font-bold text-slate-800 mb-4 text-lg">💰 Price Breakdown</h4>
                            <div className="space-y-3 text-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-600">Total Distance:</span> 
                                <span className="font-semibold text-slate-800">{route.distance} km</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-600">Rate per km:</span> 
                                <span className="font-semibold text-slate-800">₹1.25</span>
                              </div>
                              <div className="flex justify-between items-center border-t-2 border-emerald-200 pt-3 mt-3">
                                <span className="font-bold text-xl text-slate-800">Total Fare:</span> 
                                <span className="font-bold text-2xl text-emerald-700">₹{route.price.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sortedRoutes.connections.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg">
                    🔄 Connecting Trains
                  </div>
                </div>
                <div className="grid gap-6">
                  {sortedRoutes.connections.map((route, index) => (
                    <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-l-8 border-orange-500 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg px-4 py-2 border border-orange-200">
                            <span className="text-slate-600 font-medium">Change at: </span>
                            <span className="font-bold text-orange-700 text-lg">{route.interchangeStation}</span>
                          </div>
                          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg px-4 py-2 font-bold text-2xl text-emerald-700 border border-emerald-200">
                            ₹{route.totalPrice.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="grid gap-4">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="flex items-center">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">1</span>
                                <p className="font-bold text-slate-800 text-lg">
                                  {route.leg1.trainName}: {route.leg1.source.name}
                                  <ArrowRightIcon />
                                  {route.leg1.destination.name}
                                </p>
                              </div>
                              <div className="bg-white rounded-lg px-3 py-1 font-semibold text-slate-700 shadow-sm">
                                {route.leg1.source.time} - {route.leg1.destination.time}
                              </div> 
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="flex items-center">
                                <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">2</span>
                                <p className="font-bold text-slate-800 text-lg">
                                  {route.leg2.trainName}: {route.leg2.source.name}
                                  <ArrowRightIcon />
                                  {route.leg2.destination.name}
                                </p>
                              </div>
                              <div className="bg-white rounded-lg px-3 py-1 font-semibold text-slate-700 shadow-sm">
                                {route.leg2.source.time} - {route.leg2.destination.time}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {sortedRoutes.direct.length === 0 && sortedRoutes.connections.length === 0 && (
              <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
                <div className="text-6xl mb-6">🚫</div>
                <h3 className="text-2xl font-bold text-slate-700 mb-2">{routes.message}</h3>
                <p className="text-slate-500 text-lg">Try searching for a different route or check back later.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 
