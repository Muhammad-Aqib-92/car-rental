import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { Car, Booking } from '../types';
import { Search, MapPin, Calendar, SlidersHorizontal, X, ArrowRight, Heart, Car as CarIcon, Check, ChevronLeft, ChevronRight, User, Mail, Phone, Settings2, Star, Send, Bot, MessageSquare } from 'lucide-react';
import { chatWithBot } from '../services/geminiService';

export const ClientDashboard = () => {
  const { cars, user, addBooking, bookings, getOwnerById, favorites, toggleFavorite, reviews, addReview } = useApp();
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [viewMode, setViewMode] = useState<'browse' | 'my_bookings' | 'favorites'>('browse');
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  
  // New Filters
  const [showFilters, setShowFilters] = useState(false);
  const [transmissionFilter, setTransmissionFilter] = useState<'All' | 'Automatic' | 'Manual'>('All');
  const [yearRange, setYearRange] = useState({ min: 2015, max: new Date().getFullYear() + 1 });

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([
      {role: 'model', text: 'Hi! I am DriveBot. How can I help you find your perfect car today?'}
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChatSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;
      
      const userMsg = chatInput;
      setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setChatInput('');
      setIsChatLoading(true);

      const response = await chatWithBot(userMsg, chatMessages);
      setChatMessages(prev => [...prev, { role: 'model', text: response }]);
      setIsChatLoading(false);
  };

  const filteredCars = cars.filter(c => 
    (viewMode === 'favorites' ? favorites.includes(c.id) : true) &&
    (categoryFilter === '' || c.category === categoryFilter) && 
    (viewMode === 'browse' ? c.status === 'AVAILABLE' : true) && // Show unavailable in favorites if desired, or keep only available
    c.pricePerDay <= maxPrice &&
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (transmissionFilter === 'All' || (c.transmission || 'Automatic') === transmissionFilter) &&
    (c.modelYear >= yearRange.min && c.modelYear <= yearRange.max)
  );

  const categories = ['All', 'SUV', 'Sedan', 'Luxury', 'Sports'];

  const myBookings = bookings
    .filter(b => b.clientId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const selectedBooking = selectedBookingId ? bookings.find(b => b.id === selectedBookingId) : null;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 px-4 md:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-end mb-6">
            <div>
                <p className="text-slate-500 font-medium text-sm mb-1">Welcome back,</p>
                <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
            </div>
            <div className="flex bg-white p-1 rounded-full border border-slate-200 shadow-sm">
                <button 
                    onClick={() => setViewMode('browse')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${viewMode === 'browse' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Explore
                </button>
                <button 
                    onClick={() => setViewMode('favorites')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${viewMode === 'favorites' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Saved
                </button>
                <button 
                    onClick={() => setViewMode('my_bookings')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${viewMode === 'my_bookings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Trips
                </button>
            </div>
        </div>

        {viewMode !== 'my_bookings' ? (
        <>
            {/* Search Bar */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
                        placeholder="Search for your dream car..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="h-8 w-px bg-slate-200 mx-2"></div>
                        <div className="flex items-center gap-2 pr-2">
                            <span className="text-xs font-semibold text-slate-500 w-16 text-right">${maxPrice}/day</span>
                            <input 
                                type="range" 
                                min="50" 
                                max="1000" 
                                step="50"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-5 py-4 rounded-2xl border transition-all flex items-center justify-center ${showFilters ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                    <SlidersHorizontal className="h-6 w-6" />
                </button>
            </div>
            
            {showFilters && (
                <div className="bg-white p-6 rounded-2xl mb-6 shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Transmission</label>
                        <div className="flex bg-slate-50 p-1 rounded-xl">
                            {['All', 'Automatic', 'Manual'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTransmissionFilter(type as any)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                        transmissionFilter === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Model Year Range</label>
                         <div className="flex items-center gap-3">
                            <div className="bg-slate-50 px-4 py-2 rounded-xl flex-1 flex flex-col">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Min Year</span>
                                <input 
                                    type="number" 
                                    value={yearRange.min}
                                    onChange={(e) => setYearRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                                    className="bg-transparent font-bold text-slate-700 outline-none"
                                />
                            </div>
                            <span className="text-slate-300 font-bold">-</span>
                             <div className="bg-slate-50 px-4 py-2 rounded-xl flex-1 flex flex-col">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Max Year</span>
                                <input 
                                    type="number" 
                                    value={yearRange.max}
                                    onChange={(e) => setYearRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                    className="bg-transparent font-bold text-slate-700 outline-none"
                                />
                            </div>
                         </div>
                    </div>
                </div>
            )}

            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)}
                    className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                    (cat === 'All' && categoryFilter === '') || cat === categoryFilter
                        ? 'bg-indigo-600 text-white shadow-indigo-200'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                    }`}
                >
                    {cat}
                </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCars.map(car => (
                <div key={car.id} 
                    className="group bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 border border-slate-100 transition-all duration-300 relative"
                >
                    {/* Favorite Button Overlay */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(car.id);
                        }}
                        className={`absolute top-6 right-6 z-10 p-2 rounded-full backdrop-blur-md transition-all hover:scale-110 ${favorites.includes(car.id) ? 'bg-white text-red-500 shadow-sm' : 'bg-white/30 text-white hover:bg-white hover:text-red-500'}`}
                    >
                        <Heart className={`h-5 w-5 ${favorites.includes(car.id) ? 'fill-current' : ''}`} />
                    </button>

                    <div onClick={() => setSelectedCar(car)} className="cursor-pointer">
                        <div className="relative h-56 rounded-[1.5rem] overflow-hidden mb-4">
                            <img src={car.imageUrl} alt={car.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute bottom-3 left-3 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                <span className="text-xs font-medium text-white tracking-wide">{car.category}</span>
                            </div>
                        </div>
                        <div className="px-2 pb-2">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-900 text-lg leading-tight">{car.name}</h3>
                                <div className="text-right">
                                    <span className="block font-bold text-indigo-600 text-lg">${car.pricePerDay}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">/ day</span>
                                </div>
                            </div>
                            <div className="flex gap-2 mb-3 items-center">
                                <span className="bg-slate-50 text-slate-500 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wide border border-slate-100">
                                    {car.modelYear}
                                </span>
                                <span className="bg-slate-50 text-slate-500 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wide border border-slate-100">
                                    {car.transmission || 'Automatic'}
                                </span>
                                {car.rating ? (
                                    <div className="flex items-center gap-1 ml-auto text-amber-500 text-xs font-bold">
                                        <Star className="h-3 w-3 fill-current" />
                                        {car.rating} <span className="text-slate-300 font-normal">({car.reviewCount})</span>
                                    </div>
                                ) : null}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-4">
                                <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                                    <Settings2 className="h-3.5 w-3.5" />
                                    <span>{car.transmission || 'Auto'}</span>
                                </div>
                                <span className="text-sm font-bold text-indigo-600 group-hover:underline decoration-2 underline-offset-4 flex items-center gap-1">
                                    Book Now <ArrowRight className="h-4 w-4" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                ))}
            </div>
            
            {filteredCars.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-slate-100 p-6 rounded-full mb-4">
                        <Search className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg">No cars found</h3>
                    <p className="text-slate-500 mt-1 max-w-xs mx-auto">Try adjusting your filters or search for a different model.</p>
                </div>
            )}
        </>
        ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
            {myBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="bg-indigo-50 p-6 rounded-full mb-4">
                        <Calendar className="h-10 w-10 text-indigo-300" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg">No trips yet</h3>
                    <p className="text-slate-500 mt-1 mb-6 max-w-xs mx-auto">You haven't booked any cars yet. Your next adventure is waiting!</p>
                    <button onClick={() => setViewMode('browse')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200">
                        Start Exploring
                    </button>
                </div>
            ) : (
                myBookings.map(booking => {
                const car = cars.find(c => c.id === booking.carId);
                const hasReview = reviews.some(r => r.bookingId === booking.id);

                return (
                    <div 
                        key={booking.id} 
                        onClick={() => setSelectedBookingId(booking.id)}
                        className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-5 cursor-pointer hover:shadow-md transition-all hover:border-indigo-100 group"
                    >
                    <div className="w-full sm:w-40 h-40 sm:h-auto rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                        <img src={car?.imageUrl} className="w-full h-full object-cover" alt="" />
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            booking.status === 'APPROVED' ? 'bg-green-500 text-white' : 
                            booking.status === 'REJECTED' ? 'bg-red-500 text-white' : 'bg-amber-400 text-white'
                        }`}>
                            {booking.status}
                        </div>
                    </div>
                    <div className="flex-1 py-1 pr-2">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{car?.name}</h3>
                            <span className="font-bold text-lg text-indigo-600">${booking.totalPrice}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mb-4 uppercase tracking-wide">Ref: #{booking.id.slice(0,8)}</p>
                        
                        <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-3 mb-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-indigo-500" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Dates</span>
                                    <span className="text-xs font-semibold text-slate-700">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-indigo-500" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Pickup</span>
                                    <span className="text-xs font-semibold text-slate-700">{booking.pickupLocation}</span>
                                </div>
                            </div>
                        </div>

                        {booking.status === 'APPROVED' && (
                            <div className="flex justify-end">
                                {hasReview ? (
                                    <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                        <Check className="h-3 w-3" /> Review Submitted
                                    </span>
                                ) : (
                                    <span className="text-xs text-indigo-600 font-bold hover:underline">Tap to write a review</span>
                                )}
                            </div>
                        )}
                    </div>
                    </div>
                );
                })
            )}
            </div>
        )}
      </div>

      {selectedCar && user && (
        <BookingModal 
          car={selectedCar} 
          userId={user.id}
          onClose={() => setSelectedCar(null)}
          onConfirm={(booking) => {
            addBooking(booking);
            setSelectedCar(null);
            setShowSuccess(true);
          }}
        />
      )}

      {selectedBookingId && selectedBooking && (
          <BookingDetailModal 
            booking={selectedBooking} 
            car={cars.find(c => c.id === selectedBooking.carId)!}
            owner={getOwnerById(selectedBooking.ownerId)}
            onClose={() => setSelectedBookingId(null)}
          />
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
            <div className="relative bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl transform scale-100 transition-all">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Check className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
                <p className="text-slate-500 mb-8 font-medium">Your trip request has been sent. You can track the status in your trips tab.</p>
                <button 
                    onClick={() => {
                        setShowSuccess(false);
                        setViewMode('my_bookings');
                    }}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 active:scale-[0.98]"
                >
                    View My Trips
                </button>
                <button 
                    onClick={() => {
                        setShowSuccess(false);
                        setViewMode('browse');
                    }}
                    className="mt-4 text-slate-400 text-sm font-semibold hover:text-slate-600"
                >
                    Continue Browsing
                </button>
            </div>
        </div>
      )}

      {/* Floating Chatbot */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {isChatOpen && (
            <div className="bg-white rounded-[2rem] shadow-2xl w-80 sm:w-96 overflow-hidden border border-slate-100 animate-fade-in-up origin-bottom-right">
                <div className="bg-indigo-600 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">DriveBot</h3>
                            <p className="text-indigo-200 text-xs">AI Assistant</p>
                        </div>
                    </div>
                    <button onClick={() => setIsChatOpen(false)} className="text-white/60 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="h-80 overflow-y-auto p-4 bg-slate-50 space-y-3">
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white text-slate-400 p-3 rounded-2xl rounded-bl-none text-xs shadow-sm border border-slate-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleChatSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                    <input 
                        className="flex-1 bg-slate-50 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                        placeholder="Type a message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button type="submit" disabled={!chatInput.trim() || isChatLoading} className="bg-indigo-600 text-white p-2 rounded-xl disabled:opacity-50">
                        <Send className="h-4 w-4" />
                    </button>
                </form>
            </div>
        )}
        <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="h-14 w-14 bg-indigo-600 rounded-full shadow-xl shadow-indigo-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform active:scale-95"
        >
            {isChatOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
};

interface BookingModalProps {
  car: Car;
  userId: string;
  onClose: () => void;
  onConfirm: (booking: any) => void;
}

const BookingModal = ({ car, userId, onClose, onConfirm }: BookingModalProps) => {
  const { bookings } = useApp();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calendar Helpers
  const carBookings = bookings.filter(b => 
    b.carId === car.id && 
    (b.status === 'APPROVED' || b.status === 'PENDING')
  );

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Safe parsing for local date comparison (prevents timezone issues)
  const parseLocalYMD = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const isPastDate = (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date.getTime() < today.getTime();
  };

  const isBookedDate = (date: Date) => {
      // Compare purely on day basis to avoid timezone/time-of-day issues
      const checkTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      
      return carBookings.some(b => {
        const start = parseLocalYMD(b.startDate);
        const end = parseLocalYMD(b.endDate);
        const startTime = start.getTime();
        const endTime = end.getTime();
        
        return checkTime >= startTime && checkTime <= endTime;
      });
  };

  const isDateDisabled = (date: Date) => isPastDate(date) || isBookedDate(date);

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    // Normalize time to 00:00:00 for comparison
    date.setHours(0,0,0,0);

    if (!startDate || (startDate && endDate) || date < startDate) {
      setStartDate(date);
      setEndDate(null);
    } else {
        // Check if range includes blocked dates
        let isValidRange = true;
        let d = new Date(startDate);
        while (d <= date) {
            if (isDateDisabled(d)) {
                isValidRange = false;
                break;
            }
            d.setDate(d.getDate() + 1);
        }

        if (isValidRange) {
            setEndDate(date);
        } else {
            alert("Selected range includes booked dates. Please select available consecutive dates.");
            setStartDate(date);
            setEndDate(null);
        }
    }
  };

  const calculateTotal = () => {
    if(!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start date
    return diffDays * car.pricePerDay;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
        alert("Please select dates");
        return;
    }
    
    // Format YYYY-MM-DD using local time
    const formatLocalYMD = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };
    
    onConfirm({
      carId: car.id,
      clientId: userId,
      ownerId: car.ownerId,
      startDate: formatLocalYMD(startDate),
      endDate: formatLocalYMD(endDate),
      pickupLocation: location,
      totalPrice: calculateTotal()
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-8 md:h-10"></div>);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        date.setHours(0,0,0,0);
        
        const _isBooked = isBookedDate(date);
        const _isPast = isPastDate(date);
        const _isDisabled = _isBooked || _isPast;

        const isSelected = (startDate && date.getTime() === startDate.getTime()) || (endDate && date.getTime() === endDate.getTime());
        const isInRange = startDate && endDate && date > startDate && date < endDate;
        const isToday = date.toDateString() === new Date().toDateString();

        days.push(
            <button
                key={day}
                type="button"
                disabled={_isDisabled}
                onClick={() => handleDateClick(date)}
                className={`
                    h-8 md:h-10 w-full rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-all relative
                    ${_isDisabled ? 'cursor-not-allowed' : 'hover:bg-indigo-50 hover:text-indigo-600 text-slate-700'}
                    ${_isPast ? 'text-slate-300' : ''}
                    ${_isBooked ? 'bg-red-50 text-red-300 decoration-red-200 line-through' : ''}
                    ${isSelected ? '!bg-indigo-600 !text-white shadow-lg shadow-indigo-200 z-10' : ''}
                    ${isInRange ? 'bg-indigo-50 !text-indigo-700 rounded-none' : ''}
                    ${isInRange && day === 1 ? 'rounded-l-full' : ''}
                    ${isInRange && day === daysInMonth ? 'rounded-r-full' : ''}
                    ${isToday && !isSelected && !isInRange ? 'border border-indigo-200 text-indigo-600 font-bold' : ''}
                `}
            >
                {day}
            </button>
        );
    }
    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const today = new Date();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Bottom Sheet / Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl transform transition-transform duration-300 ease-out overflow-hidden max-h-[95vh] overflow-y-auto">
        
        {/* Drag Handle for Mobile feel */}
        <div className="absolute top-0 left-0 right-0 h-6 flex justify-center pt-2 sm:hidden z-10">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        <div className="relative h-48 md:h-56">
            <img src={car.imageUrl} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all border border-white/20 z-20"
            >
                <X className="h-5 w-5" />
            </button>
            <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                <span className="inline-block px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-bold text-white tracking-wider mb-2">{car.category}</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-none mb-1">{car.name}</h2>
                <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                     <span>{car.modelYear}</span>
                     <span>•</span>
                     <span>{car.transmission || 'Automatic'}</span>
                     {car.rating ? <span className="flex items-center gap-1 text-amber-400"><Star className="h-3 w-3 fill-current" /> {car.rating}</span> : null}
                </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          {/* Calendar Section */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-base font-bold text-slate-900">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button type="button" onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
            
            <div className="grid grid-cols-7 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <span key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{day}</span>
                ))}
            </div>
            
            <div className="grid grid-cols-7 gap-y-1 gap-x-1">
                {renderCalendar()}
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-medium text-slate-400">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-100 border border-red-200"></div>Booked</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-600"></div>Selected</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Pickup Location</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700 placeholder-slate-400 outline-none transition-all"
                placeholder="City, Airport, or Address"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white flex justify-between items-center shadow-lg shadow-slate-900/20">
            <div>
                <p className="text-slate-400 text-xs font-medium mb-1">
                    {startDate && endDate ? `${Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} Days` : 'Select Dates'}
                </p>
                <p className="text-3xl font-bold tracking-tight">${calculateTotal()}</p>
            </div>
            <button 
                type="submit" 
                disabled={!startDate || !endDate || !location}
                className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Checkout <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// New Component: Detailed View & Reviews
const BookingDetailModal = ({ booking, car, owner, onClose }: { booking: Booking, car: Car, owner: any, onClose: () => void }) => {
    const { addReview, reviews, user } = useApp();
    const [reviewMode, setReviewMode] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const hasReview = reviews.some(r => r.bookingId === booking.id);
    const existingReview = reviews.find(r => r.bookingId === booking.id);

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;
        addReview({
            bookingId: booking.id,
            carId: car.id,
            clientId: user!.id,
            rating,
            comment
        });
        setReviewMode(false);
    };

    if (!booking || !car) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 bg-white/40 hover:bg-white backdrop-blur-md p-2 rounded-full text-slate-900 transition-all z-20 shadow-sm"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Left Side: Car Image & Basic Info */}
                <div className="w-full md:w-2/5 relative h-64 md:h-auto">
                    <img src={car.imageUrl} alt={car.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex flex-col justify-end p-6">
                         <span className="inline-block self-start px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold text-white tracking-wider mb-2 border border-white/20">{car.category}</span>
                        <h2 className="text-2xl font-bold text-white leading-tight">{car.name}</h2>
                        <div className="flex items-center gap-2 text-slate-300 text-sm font-medium mt-1">
                             <span>{car.modelYear}</span>
                             <span>•</span>
                             <span>{car.transmission || 'Automatic'}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Details */}
                <div className="w-full md:w-3/5 p-8 overflow-y-auto">
                    {!reviewMode ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Booking Status</p>
                                    <div className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                        booking.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                                        booking.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${
                                            booking.status === 'APPROVED' ? 'bg-green-500' : 
                                            booking.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'
                                        }`}></span>
                                        {booking.status}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                                    <p className="text-2xl font-bold text-indigo-600">${booking.totalPrice}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-50 p-5 rounded-2xl space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-indigo-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Trip Dates</p>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-indigo-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Pickup Location</p>
                                            <p className="text-sm font-semibold text-slate-900">{booking.pickupLocation}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Vehicle Owner</p>
                                    <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                            <User className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900">{owner?.name || 'Car Owner'}</p>
                                            <p className="text-xs text-slate-500">{owner?.email || 'Contact support for details'}</p>
                                        </div>
                                        <a href={`mailto:${owner?.email}`} className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors">
                                            <Mail className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>

                                {hasReview && existingReview && (
                                     <div className="bg-green-50 border border-green-100 p-4 rounded-2xl">
                                        <div className="flex items-center gap-1 mb-2">
                                            <p className="text-xs font-bold text-green-700 uppercase flex-1">Your Review</p>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-3 w-3 ${i < existingReview.rating ? 'fill-green-500 text-green-500' : 'text-green-200'}`} />
                                            ))}
                                        </div>
                                        <p className="text-sm text-green-800 italic">"{existingReview.comment}"</p>
                                     </div>
                                )}

                                {booking.status === 'APPROVED' && !hasReview && (
                                    <button 
                                        onClick={() => setReviewMode(true)}
                                        className="w-full py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        Write a Review
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Rate your experience</h3>
                            <form onSubmit={handleSubmitReview} className="flex-1 flex flex-col">
                                <div className="flex justify-center gap-2 mb-8">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transform transition-transform hover:scale-110"
                                        >
                                            <Star className={`h-10 w-10 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                        </button>
                                    ))}
                                </div>
                                <div className="space-y-2 mb-6">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Comments</label>
                                    <textarea 
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600 outline-none resize-none"
                                        rows={4}
                                        placeholder="How was the car? How was the host?"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mt-auto flex gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setReviewMode(false)}
                                        className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={rating === 0}
                                        className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Submit Review
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};