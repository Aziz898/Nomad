
import React, { useState } from 'react';
import { TripSelection, ChatMessage, Flight, Hotel, Activity, UserPreferences } from '../types';
import { ChatAssistant } from './ChatAssistant';
import { modifyTripComponent } from '../services/geminiService';
import { Plane, BedDouble, Ticket, Calendar, MapPin, Wallet, CheckCircle } from 'lucide-react';
import { ImageWithSkeleton } from './ui/ImageWithSkeleton';

interface Props {
  selection: TripSelection;
  prefs: UserPreferences;
  onRestart: () => void;
  onBook: () => void; // Action trigger
}

export const TripSummary: React.FC<Props> = ({ selection: initialSelection, prefs, onRestart, onBook }) => {
  const [selection, setSelection] = useState<TripSelection>(initialSelection);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: "I've assembled your trip! You can ask me to find alternative flights, cheaper hotels, or different activities." }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const totalCost = (selection.selectedFlight?.price || 0) + 
                    (selection.selectedHotel?.totalPrice || 0) + 
                    selection.selectedActivities.reduce((sum, a) => sum + a.price, 0);

  const handleSendMessage = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsTyping(true);

    // Construct context string
    const context = `
      Current Flight: ${selection.selectedFlight?.airline} ($${selection.selectedFlight?.price}).
      Current Hotel: ${selection.selectedHotel?.name} ($${selection.selectedHotel?.totalPrice}).
      Activities: ${selection.selectedActivities.map(a => a.name).join(', ')}.
    `;

    const response = await modifyTripComponent(text, context, prefs);
    
    setIsTyping(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aiMsg: ChatMessage = {
      role: 'ai',
      text: response.text,
      suggestedItem: response.suggestedItem ? {
        type: response.itemType as 'flight'|'hotel'|'activity',
        data: response.suggestedItem
      } : undefined
    };

    setMessages(prev => [...prev, aiMsg]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAcceptSuggestion = (type: 'flight' | 'hotel' | 'activity', item: any) => {
    if (type === 'flight') setSelection(prev => ({ ...prev, selectedFlight: item }));
    if (type === 'hotel') setSelection(prev => ({ ...prev, selectedHotel: item }));
    if (type === 'activity') setSelection(prev => ({ ...prev, selectedActivities: [...prev.selectedActivities, item] }));
    
    setMessages(prev => [...prev, { role: 'ai', text: `Updated your ${type} to ${item.name || item.airline}!` }]);
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full max-w-7xl mx-auto gap-6 p-4 lg:p-8">
      
      {/* LEFT: Summary Cards */}
      <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-900">Trip Summary</h2>
          <button onClick={onRestart} className="text-sm text-gray-500 underline">Start Over</button>
        </div>

        {/* Flight Card */}
        {selection.selectedFlight && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Plane size={20} /></div>
                <div>
                   <h3 className="font-bold text-gray-900">{selection.selectedFlight.airline}</h3>
                   <p className="text-xs text-gray-500">{selection.selectedFlight.flightNumber}</p>
                </div>
              </div>
              <span className="font-bold text-xl">${selection.selectedFlight.price}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
               <div>{selection.selectedFlight.departureTime} <br/><span className="text-gray-400 text-xs">{prefs.originCity}</span></div>
               <div className="text-center text-xs text-gray-400 px-4 border-b border-gray-200 relative top-[-10px]">
                 {selection.selectedFlight.duration}
               </div>
               <div className="text-right">{selection.selectedFlight.arrivalTime} <br/><span className="text-gray-400 text-xs">{prefs.destination}</span></div>
            </div>
          </div>
        )}

        {/* Hotel Card */}
        {selection.selectedHotel && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-40 relative">
              <ImageWithSkeleton 
                src={selection.selectedHotel.imageUrl} 
                className="w-full h-full object-cover" 
                alt="Hotel" 
                containerClassName="w-full h-full"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-white font-bold text-lg">{selection.selectedHotel.name}</h3>
              </div>
            </div>
            <div className="p-5 flex justify-between items-center">
               <div className="text-sm text-gray-600">
                 <div className="flex items-center gap-1 mb-1"><BedDouble size={16} /> {selection.selectedHotel.stars} Stars</div>
                 <div className="text-xs text-gray-400">{selection.selectedHotel.address}</div>
               </div>
               <span className="font-bold text-xl">${selection.selectedHotel.totalPrice}</span>
            </div>
          </div>
        )}

        {/* Activities */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Ticket size={20} className="text-brand-500" />
            <h3 className="font-bold text-gray-900">Activities ({selection.selectedActivities.length})</h3>
          </div>
          <div className="space-y-4">
            {selection.selectedActivities.map(act => (
              <div key={act.id} className="flex items-center gap-4 border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                 {/* Activity Thumbnail */}
                 <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                   {act.imageUrl ? (
                     <ImageWithSkeleton src={act.imageUrl} className="w-full h-full object-cover" alt={act.name} containerClassName="w-full h-full" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400"><Ticket size={12} /></div>
                   )}
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">{act.name}</span>
                      <span className="font-medium text-brand-600">${act.price}</span>
                    </div>
                    <div className="text-xs text-gray-400 line-clamp-1">{act.description}</div>
                 </div>
              </div>
            ))}
            {selection.selectedActivities.length === 0 && <p className="text-sm text-gray-400 italic">No activities selected.</p>}
          </div>
        </div>

        {/* Total */}
        <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm uppercase tracking-wider">Total Trip Cost</p>
            <p className="text-xs text-gray-500">per person estimate</p>
          </div>
          <div className="text-4xl font-bold">${totalCost}</div>
        </div>
        
        <button 
          onClick={onBook}
          className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          Proceed to Booking
        </button>

      </div>

      {/* RIGHT: Chat Assistant */}
      <div className="w-full md:w-[400px] h-[500px] md:h-auto flex-shrink-0">
        <ChatAssistant 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isTyping={isTyping}
          onAcceptSuggestion={handleAcceptSuggestion}
        />
      </div>

    </div>
  );
};
