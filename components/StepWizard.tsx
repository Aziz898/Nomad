import React, { useState, useRef, useEffect } from 'react';
import { UserPreferences } from '../types';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Wallet, 
  Users, 
  Plane, 
  Sparkles, 
  ArrowRight, 
  Clock,
  Briefcase,
  Sun,
  Minus,
  Plus
} from 'lucide-react';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { CityAutocomplete } from './CityAutocomplete';

interface Props {
  onComplete: (prefs: UserPreferences) => void;
  isLoading: boolean;
}

// Utility for conditional classes
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

const StepWizard: React.FC<Props> = ({ onComplete, isLoading }) => {
  const [formData, setFormData] = useState<UserPreferences>({
    originCountry: 'USA',
    originCity: '',
    destination: '',
    dates: new Date().toISOString().split('T')[0],
    duration: 7,
    flexibility: 2,
    budget: 2000,
    travelers: { adults: 2, children: 0, infants: 0, pets: 0 },
    accommodationLevel: 'standard',
    tripType: 'beach',
    contact: { name: '', contactMethod: '' }
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTravelersOpen, setIsTravelersOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const travelersRef = useRef<HTMLDivElement>(null);

  // Close popovers when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (calendarRef.current && !calendarRef.current.contains(target)) {
        setIsCalendarOpen(false);
      }
      if (travelersRef.current && !travelersRef.current.contains(target)) {
        setIsTravelersOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (field: keyof UserPreferences, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, dates: format(date, 'yyyy-MM-dd') }));
      setIsCalendarOpen(false);
    }
  };

  const handleTravelerChange = (type: keyof UserPreferences['travelers'], delta: number) => {
    setFormData(prev => {
      const currentVal = prev.travelers[type];
      const newVal = Math.max(0, currentVal + delta);
      
      // Require at least 1 adult
      if (type === 'adults' && newVal < 1) return prev;
      
      return {
        ...prev,
        travelers: { ...prev.travelers, [type]: newVal }
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 120 },
    },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="relative mb-6">
           <div className="absolute inset-0 bg-brand-200 rounded-full animate-ping opacity-75"></div>
           <div className="relative bg-white p-4 rounded-full shadow-lg border border-brand-100">
             <Sparkles className="w-8 h-8 text-brand-500 animate-pulse" />
           </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">AI is curating your journey...</h2>
        <p className="text-gray-500 max-w-md mx-auto text-sm">
          Scanning flights, comparing hotels, and checking visa rules for {formData.destination || 'your destination'}.
        </p>
      </div>
    );
  }

  // Helper to safely parse the date string
  const currentDate = formData.dates ? new Date(formData.dates) : new Date();
  
  // Count total travelers for display
  const totalTravelers = formData.travelers.adults + formData.travelers.children + formData.travelers.infants;
  const totalPets = formData.travelers.pets;

  return (
    <div className="w-full max-w-5xl mx-auto h-auto shadow-2xl rounded-2xl overflow-hidden border border-gray-100 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
        
        {/* Left Side: Form */}
        <motion.div 
          className="col-span-12 lg:col-span-7 p-5 lg:p-8 flex flex-col justify-center relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex justify-between items-center mb-3">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Plan your <span className="text-brand-500">dream trip.</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-wide">
              <Sparkles size={10} />
              AI Powered
            </span>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Route Section - Compact */}
            <motion.div variants={itemVariants} className="relative bg-gray-50 p-3 rounded-xl border border-gray-100">
              {/* Connecting Line */}
              <div className="absolute left-7 top-9 bottom-9 w-[1px] bg-gray-300 border-l border-dashed"></div>

              {/* From */}
              <div className="relative flex items-center mb-2 group">
                <div className="z-10 bg-white p-1.5 rounded-full shadow-sm border border-gray-200">
                   <Plane className="h-3.5 w-3.5 text-gray-600" />
                </div>
                <div className="flex-1 ml-3 z-20">
                  <CityAutocomplete 
                    value={formData.originCity}
                    onChange={(val) => handleChange('originCity', val)}
                    placeholder="Origin City (e.g. New York)"
                    className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
              
              <hr className="border-gray-200 ml-9 mb-2" />

              {/* To */}
              <div className="relative flex items-center group">
                 <div className="z-10 bg-white p-1.5 rounded-full shadow-sm border border-gray-200">
                   <MapPin className="h-3.5 w-3.5 text-brand-500" />
                 </div>
                 <div className="flex-1 ml-3 z-10">
                  <CityAutocomplete
                    value={formData.destination}
                    onChange={(val) => handleChange('destination', val)}
                    placeholder="Where to? (e.g. Tokyo)"
                    className="w-full bg-transparent text-sm font-bold text-gray-900 focus:outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            </motion.div>

            {/* Compact Grid for Details */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
              {/* Date - Replaced with Custom Calendar */}
              <div className="relative" ref={calendarRef}>
                <button 
                  type="button"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="w-full bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left h-full"
                >
                    <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">Start</span>
                      <span className="block text-sm font-semibold text-gray-900 truncate">
                        {format(currentDate, "PPP")}
                      </span>
                    </div>
                </button>
                
                {/* Popover Calendar */}
                {isCalendarOpen && (
                  <div className="absolute top-full left-0 mt-2 z-50 p-2 bg-white rounded-xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                    <Calendar
                      mode="single"
                      selected={currentDate}
                      onSelect={handleDateSelect}
                      className="rounded-md border shadow-sm bg-white"
                    />
                  </div>
                )}
              </div>
              
              {/* Duration */}
              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                   <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Days</span>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        min="1"
                        max="30"
                        value={formData.duration}
                        onChange={(e) => handleChange('duration', parseInt(e.target.value) || 1)}
                        className="w-8 bg-transparent text-sm font-semibold text-gray-900 focus:outline-none" 
                      />
                    </div>
                  </div>
              </div>

              {/* Budget */}
              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Budget ($)</span>
                    <input 
                      type="number" 
                      value={formData.budget}
                      onChange={(e) => handleChange('budget', parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent text-sm font-semibold text-gray-900 focus:outline-none" 
                    />
                  </div>
              </div>

              {/* Travelers - Custom Counter Popover */}
              <div className="relative" ref={travelersRef}>
                <button
                   type="button"
                   onClick={() => setIsTravelersOpen(!isTravelersOpen)}
                   className="w-full bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left h-full"
                >
                   <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                   <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">Travelers</span>
                      <div className="text-sm font-semibold text-gray-900">
                        {totalTravelers} Traveler{totalTravelers !== 1 ? 's' : ''}
                        {totalPets > 0 && `, ${totalPets} Pet${totalPets !== 1 ? 's' : ''}`}
                      </div>
                   </div>
                </button>

                {isTravelersOpen && (
                  <div className="absolute top-full right-0 mt-2 z-50 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="p-4 space-y-4">
                      
                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-gray-900">Adults</div>
                          <div className="text-xs text-gray-500">Ages 13+</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button"
                            onClick={() => handleTravelerChange('adults', -1)}
                            className={cn("w-8 h-8 rounded-full border flex items-center justify-center transition-colors", formData.travelers.adults <= 1 ? "border-gray-100 text-gray-300" : "border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900")}
                            disabled={formData.travelers.adults <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-semibold w-4 text-center">{formData.travelers.adults}</span>
                          <button 
                            type="button"
                            onClick={() => handleTravelerChange('adults', 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center hover:border-gray-900 hover:text-gray-900 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                        <div>
                          <div className="text-sm font-bold text-gray-900">Children</div>
                          <div className="text-xs text-gray-500">Ages 2-12</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button"
                            onClick={() => handleTravelerChange('children', -1)}
                            className={cn("w-8 h-8 rounded-full border flex items-center justify-center transition-colors", formData.travelers.children <= 0 ? "border-gray-100 text-gray-300" : "border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900")}
                            disabled={formData.travelers.children <= 0}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-semibold w-4 text-center">{formData.travelers.children}</span>
                          <button 
                            type="button"
                            onClick={() => handleTravelerChange('children', 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center hover:border-gray-900 hover:text-gray-900 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                        <div>
                          <div className="text-sm font-bold text-gray-900">Infants</div>
                          <div className="text-xs text-gray-500">Under 2</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button"
                            onClick={() => handleTravelerChange('infants', -1)}
                            className={cn("w-8 h-8 rounded-full border flex items-center justify-center transition-colors", formData.travelers.infants <= 0 ? "border-gray-100 text-gray-300" : "border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900")}
                            disabled={formData.travelers.infants <= 0}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-semibold w-4 text-center">{formData.travelers.infants}</span>
                          <button 
                            type="button"
                            onClick={() => handleTravelerChange('infants', 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center hover:border-gray-900 hover:text-gray-900 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Pets */}
                      <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                        <div>
                          <div className="text-sm font-bold text-gray-900">Pets</div>
                          <div className="text-xs text-gray-500">Service animals allowed</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button"
                            onClick={() => handleTravelerChange('pets', -1)}
                            className={cn("w-8 h-8 rounded-full border flex items-center justify-center transition-colors", formData.travelers.pets <= 0 ? "border-gray-100 text-gray-300" : "border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900")}
                            disabled={formData.travelers.pets <= 0}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-semibold w-4 text-center">{formData.travelers.pets}</span>
                          <button 
                            type="button"
                            onClick={() => handleTravelerChange('pets', 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center hover:border-gray-900 hover:text-gray-900 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
                       <button 
                         onClick={() => setIsTravelersOpen(false)}
                         className="text-sm font-bold text-brand-600 hover:text-brand-700"
                       >
                         Done
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Vibe & Email */}
            <motion.div variants={itemVariants} className="space-y-3">
               <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Trip Vibe</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'beach', icon: Sun, label: 'Beach' },
                      { id: 'active', icon: MapPin, label: 'Active' },
                      { id: 'shopping', icon: Briefcase, label: 'Shop' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleChange('tripType', type.id)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium border transition-all",
                          formData.tripType === type.id
                            ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <type.icon size={12} />
                        {type.label}
                      </button>
                    ))}
                  </div>
               </div>
               
               <div>
                  <input
                    type="text"
                    placeholder="Email for itinerary (Optional)"
                    value={formData.contact.contactMethod}
                    onChange={(e) => handleChange('contact', {...formData.contact, contactMethod: e.target.value})}
                    className="w-full border-b border-gray-200 py-1.5 text-xs focus:outline-none focus:border-brand-500 transition-colors bg-transparent"
                  />
               </div>
            </motion.div>

            {/* Action Button */}
            <motion.div variants={itemVariants} className="pt-2">
              <button
                type="submit"
                disabled={!formData.destination || !formData.originCity}
                className="w-full flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-black shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                Generate Trip
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </form>
        </motion.div>

        {/* Right Side: Image */}
        <motion.div 
          className="hidden lg:block lg:col-span-5 relative h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Travel inspiration"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-6 left-6 z-20 text-white max-w-xs">
            <div className="flex items-center gap-2 mb-1">
               <div className="bg-white/20 backdrop-blur-md p-1 rounded text-white">
                 <MapPin size={12} />
               </div>
               <span className="font-bold text-xs tracking-wide uppercase text-white/90">Trending</span>
            </div>
            <h3 className="text-lg font-bold">Swiss Alps, Switzerland</h3>
            <p className="text-xs text-white/80 mt-1 line-clamp-2">Breath-taking views and cozy chalets await you this season.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StepWizard;