import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwQBRLpFgY0Q9QyDjntvbVdRmcxtmuG_lZI86WhtMFT6QhpPhfRequlQ_I4uZm3vEnhaA/exec";

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const str = String(timeStr).trim();
  if (str.includes("T")) {
    try {
      const date = new Date(str);
      if (isNaN(date.getTime())) return str;
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return str;
    }
  }
  return str;
};

export const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [schedules, setSchedules] = useState([]);
  const [liveMatch, setLiveMatch] = useState(null);

  const fetchLiveHub = async () => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getSchedules`);
      const json = await response.json();
      if (json.status === "success") {
        const list = json.data || [];
        setSchedules(list);
        const live = list.find(m => String(m.status).toLowerCase() === 'live');
        setLiveMatch(live || null);
      }
    } catch (err) {
      console.error("Failed to poll live scores: ", err);
    }
  };

  useEffect(() => {
    fetchLiveHub();
    const timer = setInterval(fetchLiveHub, 5000);
    return () => clearInterval(timer);
  }, []);

  // Slide definitions with images AND per-slide content
  const slides = [
    {
      img: "https://images.unsplash.com/photo-1646978567314-32cfd5a8854e?w=1600&auto=format&fit=crop&q=80",
      type: "tt"
    },

    {
      img: "https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hlc3N8ZW58MHx8MHx8fDA%3D",
      type: "chess"
    }
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
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
          >
            <img
              src={slide.img}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-contain md:object-cover"
            />
            {/* Dark Overlay for Text Contrast */}
            <div className={`absolute inset-0 ${slide.type === 'chess' ? 'bg-black/70 md:bg-black/60' : 'bg-black/65 md:bg-black/55'}`}></div>
          </div>
        ))}

        {/* === TABLE TENNIS CONTENT (slides 0–3) === */}
        <div className={`absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 text-left transition-opacity duration-700 ${slides[currentSlide]?.type === 'tt' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="space-y-4 max-w-2xl mt-4 md:mt-2">
            <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-xs font-semibold text-red-300 tracking-wide uppercase">
              🏓 Registration Closed
            </span>
            <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Table Tennis  {' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Tournament
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Register now for the Table Tennis Tournament and be part of an exciting event filled with competition, teamwork, and sportsmanship. Challenge yourself, showcase your skills, and enjoy the spirit of the game.
            </p>
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
                <span className="block font-outfit text-lg sm:text-xl font-bold text-blue-400">30 July</span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Reg. Deadline</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mb-2 md:mb-0">
            <button
              disabled
              className="px-6 py-3 rounded-full text-slate-400 dark:text-slate-500 font-bold text-sm bg-white/5 dark:bg-black/10 backdrop-blur-md border border-white/10 shadow-lg cursor-not-allowed opacity-60"
            >
              🔒 Closed
            </button>
            <button
              onClick={() => navigate('/live')}
              className="px-6 py-3 rounded-full text-white font-bold text-sm bg-white/15 dark:bg-black/30 backdrop-blur-md border border-white/20 hover:bg-white/25 dark:hover:bg-black/50 shadow-lg hover:shadow-black/20 active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> 🎥 Watch Live
            </button>
          </div>
        </div>

        {/* === CHESS CONTENT (slide 4) === */}
        <div className={`absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 text-left transition-opacity duration-700 ${slides[currentSlide]?.type === 'chess' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="space-y-4 max-w-2xl mt-4 md:mt-2">
            <span className="inline-block px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-xs font-semibold text-green-300 tracking-wide uppercase">
              ♟️ Registration Open · 2026
            </span>
            <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Chess Tournament{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                Victory.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Register now for the Chess Tournament and prepare to showcase your tactical brilliance. Challenge yourself and enjoy the spirit of the game.
            </p>
            <div className="grid grid-cols-3 gap-3 max-w-md pt-2">
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-3 rounded-xl hover:border-yellow-400/30 transition-all duration-300">
                <span className="block text-lg sm:text-xl">🎯</span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Individual Event</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-3 rounded-xl hover:border-yellow-400/30 transition-all duration-300">
                <span className="block text-lg sm:text-xl">🧠</span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Sharpen Your Mind</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-3 rounded-xl hover:border-yellow-400/30 transition-all duration-300">
                <span className="block text-lg sm:text-xl">🏆</span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Open to All Students</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mb-2 md:mb-0">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 rounded-full text-white font-bold text-sm bg-white/15 dark:bg-black/30 backdrop-blur-md border border-white/20 hover:bg-white/25 dark:hover:bg-black/50 shadow-lg hover:shadow-black/20 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              👉 Register Now
            </button>
            <button
              onClick={() => navigate('/live')}
              className="px-6 py-3 rounded-full text-white font-bold text-sm bg-white/15 dark:bg-black/30 backdrop-blur-md border border-white/20 hover:bg-white/25 dark:hover:bg-black/50 shadow-lg hover:shadow-black/20 active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> 🎥 Watch Live
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
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide
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
              <span className={`w-2 h-2 rounded-full ${liveMatch ? 'bg-red-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'}`}></span>
              Live Match Scoreboard
            </h3>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {liveMatch ? '1 Active Match' : '0 Active Matches'}
            </span>
          </div>

          {liveMatch ? (
            <div className="flex-grow flex flex-col justify-center py-4 text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-2">
                {liveMatch.category} · {liveMatch.tableNumber}
              </span>
              <div className="flex items-center justify-around gap-2 my-2 select-none">
                <div className="w-5/12 text-right">
                  <h4 className="font-outfit font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 truncate">{liveMatch.player1Name}</h4>
                  <div className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">{liveMatch.player1Score}</div>
                </div>
                <div className="text-xs font-bold text-slate-400 px-2">VS</div>
                <div className="w-5/12 text-left">
                  <h4 className="font-outfit font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 truncate">{liveMatch.player2Name}</h4>
                  <div className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">{liveMatch.player2Score}</div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold block mt-4"><i className="fa-solid fa-clock"></i> Match Slot: {formatTime(liveMatch.matchTime)}</span>
            </div>
          ) : (
            /* Empty State: No Live Matches */
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
          )}

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-4 text-left text-[10px] text-slate-400 flex justify-between">
            <span>Standby Mode</span>
            <button onClick={() => navigate('/live')} className="text-blue-500 hover:underline font-bold text-[10px]">Open Full Hub</button>
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

          {schedules.filter(m => String(m.status).toLowerCase() === 'upcoming').length > 0 ? (
            <div className="flex-grow space-y-3 py-2 text-left">
              {schedules.filter(m => String(m.status).toLowerCase() === 'upcoming').slice(0, 2).map((m) => (
                <div key={m.matchId} className="p-3 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded">
                      {m.category}
                    </span>
                    <h5 className="font-bold text-slate-850 dark:text-slate-100 mt-1">{m.player1Name} vs {m.player2Name}</h5>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 font-semibold">
                    <div>{m.tableNumber}</div>
                    <div>{formatTime(m.matchTime)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State: No Scheduled Matches */
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
          )}

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
