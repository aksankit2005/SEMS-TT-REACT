import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    "https://images.unsplash.com/photo-1646978567314-32cfd5a8854e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8dGFibGUlMjB0ZW5uaXN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1708268418738-4863baa9cf72?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8dGFibGUlMjB0ZW5uaXN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=1600&auto=format&fit=crop",
    "https://media.istockphoto.com/id/1343562812/photo/girl-playing-table-tennis-in-school-uniform-in-school.webp?a=1&b=1&s=612x612&w=0&k=20&c=6gVHVVsioDpk8ecyKgmhVtiWSiplalaqGMqftQC161M=",
    "https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=1600&auto=format&fit=crop"
  ];

  // Auto slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-8">
      {/* Combined Unified Hero Slider Section */}
      <section className="relative w-full h-[650px] md:h-[550px] rounded-3xl overflow-hidden shadow-2xl bg-slate-950 mt-5 mb-5 transition-colors duration-300">
        
        {/* Background Image Carousel */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Dark Overlay for Text Contrast */}
            <div className="absolute inset-0 bg-black/65 md:bg-black/55"></div>
          </div>
        ))}

        {/* Combined Overlay Content (Unified Layer) */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 text-left">
          
          {/* Top/Middle Text Content Area */}
          <div className="space-y-4 max-w-2xl mt-4 md:mt-2">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-300 tracking-wide uppercase">
              College Sports Event 2026
            </span>
            <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              MPGI Table Tennis{' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Championship
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Unleash your spin, dominate the table, and bring glory to your department. Register now for the ultimate college table tennis tournament. Singles and doubles events are open!
            </p>

            {/* Combined Stats Grid overlay */}
            <div className="grid grid-cols-3 gap-3 max-w-md pt-2">
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-3 rounded-xl hover:border-blue-400/30 transition-all duration-300">
                <span className="block font-outfit text-lg sm:text-xl font-bold text-blue-400">₹100</span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Singles Entry</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-3 rounded-xl hover:border-blue-400/30 transition-all duration-300">
                <span className="block font-outfit text-lg sm:text-xl font-bold text-blue-400">₹200</span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Doubles Entry</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-3 rounded-xl hover:border-blue-400/30 transition-all duration-300">
                <span className="block font-outfit text-lg sm:text-xl font-bold text-blue-400">19 July</span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Reg. Deadline</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions Area (Glassmorphism Buttons Side-by-Side) */}
          <div className="flex gap-4 mb-2 md:mb-0">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 rounded-full text-white font-bold text-sm bg-white/15 dark:bg-black/30 backdrop-blur-md border border-white/20 hover:bg-white/25 dark:hover:bg-black/50 shadow-lg hover:shadow-black/20 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              Register Now
            </button>
            <button
              onClick={() => navigate('/live')}
              className="px-6 py-3 rounded-full text-white font-bold text-sm bg-white/15 dark:bg-black/30 backdrop-blur-md border border-white/20 hover:bg-white/25 dark:hover:bg-black/50 shadow-lg hover:shadow-black/20 active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Watch Live
            </button>
          </div>

        </div>

        {/* Previous Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Previous Slide"
        >
          <i className="fa-solid fa-chevron-left text-sm"></i>
        </button>

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Next Slide"
        >
          <i className="fa-solid fa-chevron-right text-sm"></i>
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-6 right-6 z-30 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentSlide
                  ? 'bg-blue-400 w-6'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>

      </section>

      {/* 50/50 Live Score & Schedule Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Left Column: Live Scoreboard */}
        <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg flex flex-col justify-between transition-colors duration-300 min-h-[320px]">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
            <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600"></span>
              Live Match Scoreboard
            </h3>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              0 Active Matches
            </span>
          </div>

          {/* Empty State: No Live Matches */}
          <div className="flex-grow flex flex-col items-center justify-center py-6">
            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center text-xl mb-3">
              <i className="fa-solid fa-table-tennis-paddle-ball text-blue-500/40"></i>
            </div>
            <h4 className="font-outfit text-sm font-bold text-slate-900 dark:text-white mb-1">
              No Live Matches
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              There are currently no live matches.
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-4 text-left text-[10px] text-slate-400">
            <span>Standby Mode</span>
          </div>
        </div>

        {/* Right Column: Match Schedule */}
        <div className="bg-white dark:bg-[#121d33] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg flex flex-col justify-between transition-colors duration-300 min-h-[320px]">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
            <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-calendar-days text-slate-400 dark:text-slate-500"></i>
              Active Match Schedule
            </h3>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Schedules</span>
          </div>

          {/* Empty State: No Scheduled Matches */}
          <div className="flex-grow flex flex-col items-center justify-center py-6">
            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center text-lg mb-3">
              <i className="fa-regular fa-calendar-xmark text-blue-500/40"></i>
            </div>
            <h4 className="font-outfit text-sm font-bold text-slate-900 dark:text-white mb-1">
              No Matches Scheduled Yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upcoming matches will appear here.
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-4 text-right">
            <button
              onClick={() => navigate('/live')}
              className="text-xs font-bold text-blue-500 hover:text-blue-600 inline-flex items-center gap-1.5"
            >
              Go to Live Center <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

      </section>
    </div>
  );
};
