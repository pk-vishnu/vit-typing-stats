"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Where do you rank among VIT typists?';
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Main Title */}
        <div className="relative mb-16">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            VIT
          </h1>
          <div className="text-2xl md:text-3xl font-mono tracking-widest text-gray-400 uppercase">
            Typing Stats
          </div>
        </div>
        
        {/* Typewriter Tagline */}
        <div className="relative mb-16">
          <div className="inline-block bg-gray-900/30 border border-gray-700/50 rounded-full px-8 py-4 backdrop-blur-sm min-h-[60px] flex items-center">
            <div className="text-gray-400 text-lg font-mono tracking-wide">
              {displayText}
              <span className="inline-block w-0.5 h-5 bg-gray-400 ml-1 animate-pulse"></span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
         <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">

      {/* Start Test Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="bg-[#5865F2] text-white px-10 py-4 rounded-full font-semibold text-lg shadow-2xl transition-all duration-300
          hover:shadow-[0_0_20px_rgba(0,0,0,0.4)] border-2 border-white active:border-4"
      >
        Join with Discord
      </motion.button>

      {/* View Leaderboard Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="bg-transparent text-gray-300 px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300
          border-2 border-gray-600 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:border-4 hover:text-white hover:border-white"
      >
        View Leaderboard
      </motion.button>

    </div>
      </div>
    </div>
  );
};

export default Hero;