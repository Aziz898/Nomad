
import React, { useState } from 'react';
import { TripOptions, TripSelection, Flight, Hotel, Activity } from '../types';
import { motion } from 'framer-motion';
import { Plane, BedDouble, Ticket, Check, ArrowRight, Star, Clock } from 'lucide-react';
import { ImageWithSkeleton } from './ui/ImageWithSkeleton';

interface Props {
  options: TripOptions;
  onComplete: (selection: TripSelection) => void;
}

export const TripBuilder: React.FC<Props> = ({ options, onComplete }) => {
  const [step, setStep] = useState<'flight' | 'hotel' | 'activity'>('flight');
  const [selection, setSelection] = useState<TripSelection>({
    selectedFlight: null,
    selectedHotel: null,
    selectedActivities: []
  });

  const handleFlightSelect = (flight: Flight) => {
    setSelection(prev => ({ ...prev, selectedFlight: flight }));
  };

  const handleHotelSelect = (hotel: Hotel) => {
    setSelection(prev => ({ ...prev, selectedHotel: hotel }));
  };

  const toggleActivity = (activity: Activity) => {
    setSelection(prev => {
      const exists = prev.selectedActivities.find(a => a.id === activity.id);
      let newActivities;
      if (exists) {
        newActivities = prev.selectedActivities.filter(a => a.id !== activity.id);
      } else {
        newActivities = [...prev.selectedActivities, activity];
      }
      return { ...prev, selectedActivities: newActivities };
    });
  };

  const nextStep = () => {
    if (step === 'flight' && selection.selectedFlight) setStep('hotel');
    else if (step === 'hotel' && selection.selectedHotel) setStep('activity');
    else if (step === 'activity') onComplete(selection);
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Progress Header */}
      <div className="flex items-center justify-center mb-8 space-x-4">
         {['flight', 'hotel', 'activity'].map((s, idx) => (
           <div key={s} className={`flex items-center gap-2 ${step === s ? 'text-brand-600 font-bold' : 'text-gray-400'}`}>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border 
               ${step === s ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
               {idx + 1}
             </div>
             <span className="uppercase text-xs tracking-wider hidden sm:block">{s}s</span>
           </div>
         ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 no-scrollbar">
        
        {/* STEP 1: FLIGHTS */}
        {step === 'flight' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose your flight</h2>
            <div className="grid grid-cols-1 gap-4">
              {options.flightOptions.map(flight => (
                <div 
                  key={flight.id}
                  onClick={() => handleFlightSelect(flight)}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row items-center gap-6
                    ${selection.selectedFlight?.id === flight.id 
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' 
                      : 'border-gray-100 bg-white hover:border-gray-300 shadow-sm'}`}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <Plane size={24} />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                       <h3 className="font-bold text-lg text-gray-900">{flight.airline}</h3>
                       <span className="text-xs px-2 py-0.5 bg-gray-200 rounded text-gray-600">{flight.class}</span>
                    </div>
                    <p className="text-sm text-gray-500">{flight.departureTime} - {flight.arrivalTime} • {flight.duration}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">${flight.price}</div>
                    <div className="text-xs text-gray-400">round trip</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: HOTELS */}
        {step === 'hotel' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Select your stay</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {options.hotelOptions.map(hotel => (
                <div 
                  key={hotel.id}
                  onClick={() => handleHotelSelect(hotel)}
                  className={`group rounded-2xl border cursor-pointer transition-all overflow-hidden flex flex-col h-full
                    ${selection.selectedHotel?.id === hotel.id 
                      ? 'border-brand-500 ring-2 ring-brand-500 transform scale-[1.02]' 
                      : 'border-gray-100 bg-white hover:shadow-xl'}`}
                >
                  <div className="h-48 relative">
                    <ImageWithSkeleton 
                      src={hotel.imageUrl} 
                      alt={hotel.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      containerClassName="w-full h-full"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold z-20">
                      {hotel.type}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-gray-900 mb-1">{hotel.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-400 text-xs mb-3">
                      <Star size={12} fill="currentColor" /> {hotel.rating}/10
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-3 mb-4 flex-grow">{hotel.description}</p>
                    <div className="mt-auto flex items-end justify-between">
                      <div>
                        <span className="block text-xs text-gray-400">Total</span>
                        <span className="text-lg font-bold text-gray-900">${hotel.totalPrice}</span>
                      </div>
                      {selection.selectedHotel?.id === hotel.id && <div className="bg-brand-500 text-white p-1 rounded-full"><Check size={16} /></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: ACTIVITIES */}
        {step === 'activity' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Add experiences</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {options.activities.map(activity => {
                const isSelected = selection.selectedActivities.some(a => a.id === activity.id);
                return (
                  <div 
                    key={activity.id}
                    onClick={() => toggleActivity(activity)}
                    className={`flex gap-4 p-4 rounded-2xl border cursor-pointer transition-all
                      ${isSelected ? 'border-brand-500 bg-brand-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
                      {activity.imageUrl ? (
                        <ImageWithSkeleton 
                          src={activity.imageUrl} 
                          className="w-full h-full object-cover" 
                          alt={activity.name} 
                          containerClassName="w-full h-full"
                        />
                      ) : (
                         <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400"><Ticket size={20} /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm mb-1">{activity.name}</h3>
                      <div className="text-xs text-gray-500 mb-2 line-clamp-2">{activity.description}</div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1 text-xs text-gray-400">
                           <Clock size={12} /> {activity.duration}
                         </div>
                         <span className="font-bold text-sm text-brand-600">${activity.price}</span>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-1
                      ${isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300'}`}>
                      {isSelected && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="p-6 border-t border-gray-100 mt-auto bg-white/80 backdrop-blur">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
           <div className="text-sm">
             <span className="text-gray-500">Estimated Total: </span>
             <span className="font-bold text-xl text-gray-900">
               ${(selection.selectedFlight?.price || 0) + (selection.selectedHotel?.totalPrice || 0) + selection.selectedActivities.reduce((sum, a) => sum + a.price, 0)}
             </span>
           </div>
           <button 
             onClick={nextStep}
             disabled={
               (step === 'flight' && !selection.selectedFlight) || 
               (step === 'hotel' && !selection.selectedHotel)
             }
             className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
           >
             {step === 'activity' ? 'Finish & Review' : 'Continue'}
             <ArrowRight size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};
