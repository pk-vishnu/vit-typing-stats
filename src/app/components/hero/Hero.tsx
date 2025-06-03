"use client"
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

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
                    <div className="inline-block bg-gray-900/30  px-8 py-4 backdrop-blur-sm min-h-[60px]  items-center font-mono">
                        <div className="text-gray-400 text-lg font-mono tracking-wide">
                            {displayText}
                            <span className="inline-block w-0.5 h-5 bg-gray-400 ml-1 animate-pulse"></span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">

                    {/* Start Test Button */}
                    <button className="bg-black inline-flex py-3 px-5 items-center hover:bg-gray-800 focus:outline-none hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:border-4 hover:text-white rounded-full">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 1024 1024"
                            className="w-9 h-9"
                            fill="none"
                        >
                            <circle cx="512" cy="512" r="512" fill="#5865F2" />
                            <path
                                fill="#fff"
                                d="M689.43 349a422.21 422.21 0 0 0-104.22-32.32 1.58 1.58 0 0 0-1.68.79 294.11 294.11 0 0 0-13 26.66 389.78 389.78 0 0 0-117.05 0 269.75 269.75 0 0 0-13.18-26.66 1.64 1.64 0 0 0-1.68-.79A421 421 0 0 0 334.44 349a1.49 1.49 0 0 0-.69.59c-66.37 99.17-84.55 195.9-75.63 291.41a1.76 1.76 0 0 0 .67 1.2 424.58 424.58 0 0 0 127.85 64.63 1.66 1.66 0 0 0 1.8-.59 303.45 303.45 0 0 0 26.15-42.54 1.62 1.62 0 0 0-.89-2.25 279.6 279.6 0 0 1-39.94-19 1.64 1.64 0 0 1-.16-2.72c2.68-2 5.37-4.1 7.93-6.22a1.58 1.58 0 0 1 1.65-.22c83.79 38.26 174.51 38.26 257.31 0a1.58 1.58 0 0 1 1.68.2c2.56 2.11 5.25 4.23 8 6.24a1.64 1.64 0 0 1-.14 2.72 262.37 262.37 0 0 1-40 19 1.63 1.63 0 0 0-.87 2.28 340.72 340.72 0 0 0 26.13 42.52 1.62 1.62 0 0 0 1.8.61 423.17 423.17 0 0 0 128-64.63 1.64 1.64 0 0 0 .67-1.18c10.68-110.44-17.88-206.38-75.7-291.42a1.3 1.3 0 0 0-.63-.63zM427.09 582.85c-25.23 0-46-23.16-46-51.6s20.38-51.6 46-51.6c25.83 0 46.42 23.36 46 51.6.02 28.44-20.37 51.6-46 51.6zm170.13 0c-25.23 0-46-23.16-46-51.6s20.38-51.6 46-51.6c25.83 0 46.42 23.36 46 51.6.01 28.44-20.17 51.6-46 51.6z"
                            />
                        </svg>

                        <Link href="https://discord.gg/Dt58hS65rz">
                            <span className="ml-4 flex items-start flex-col leading-none">
                                <span className="text-xs text-gray-400 mb-1">Join the Discord Server</span>
                                <span className="title-font font-medium text-gray-300">VIT Typing Club</span>
                            </span>
                        </Link>
                    </button>

                    {/* View Leaderboard Button */}
                    <button className="bg-black inline-flex py-3 px-5 items-center ml-4 hover:bg-gray-800 hover:text-white focus:outline-none rounded-full  hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 60 60"
                            className="w-9 h-9"
                            fill="currentColor"
                            stroke="currentColor"
                        >
                            <g>
                                <path d="M59,56H4V1c0-0.553-0.447-1-1-1S2,0.447,2,1v55H1c-0.553,0-1,0.447-1,1s0.447,1,1,1h1v1c0,0.553,0.447,1,1,1s1-0.447,1-1
      v-1h55c0.553,0,1-0.447,1-1S59.553,56,59,56z"/>
                                <path d="M7,29h2c0.553,0,1-0.447,1-1s-0.447-1-1-1H7c-0.553,0-1,0.447-1,1S6.447,29,7,29z" />
                                <path d="M7,25h2c0.553,0,1-0.447,1-1s-0.447-1-1-1H7c-0.553,0-1,0.447-1,1S6.447,25,7,25z" />
                                <path d="M7,21h2c0.553,0,1-0.447,1-1s-0.447-1-1-1H7c-0.553,0-1,0.447-1,1S6.447,21,7,21z" />
                                <path d="M7,17h2c0.553,0,1-0.447,1-1s-0.447-1-1-1H7c-0.553,0-1,0.447-1,1S6.447,17,7,17z" />
                                <path d="M7,13h2c0.553,0,1-0.447,1-1s-0.447-1-1-1H7c-0.553,0-1,0.447-1,1S6.447,13,7,13z" />
                                <path d="M7,9h2c0.553,0,1-0.447,1-1S9.553,7,9,7H7C6.447,7,6,7.447,6,8S6.447,9,7,9z" />
                                <path d="M7,5h2c0.553,0,1-0.447,1-1S9.553,3,9,3H7C6.447,3,6,3.447,6,4S6.447,5,7,5z" />
                                <path d="M11.013,48.987c3.309,0,6-2.691,6-6c0-1.549-0.595-2.958-1.562-4.024l3.526-3.526C20.042,36.405,21.451,37,23,37
      s2.958-0.595,4.024-1.562l4.538,4.538C30.595,41.042,30,42.451,30,44c0,3.309,2.691,6,6,6s6-2.691,6-6
      c0-1.035-0.263-2.009-0.726-2.86l8.703-8.703C51.042,33.405,52.451,34,54,34c3.309,0,6-2.691,6-6s-2.691-6-6-6s-6,2.691-6,6
      c0,1.035,0.263,2.009,0.726,2.86l-8.703,8.703C38.958,38.595,37.549,38,36,38c-1.035,0-2.009,0.263-2.86,0.726l-4.867-4.867
      C28.737,33.009,29,32.035,29,31c0-3.309-2.691-6-6-6s-6,2.691-6,6c0,1.035,0.263,2.009,0.726,2.86l-3.854,3.854
      c-0.851-0.463-1.825-0.726-2.86-0.726c-3.309,0-6,2.691-6,6S7.704,48.987,11.013,48.987z M54,24c2.206,0,4,1.794,4,4s-1.794,4-4,4
      s-4-1.794-4-4S51.794,24,54,24z M40,44c0,2.206-1.794,4-4,4s-4-1.794-4-4s1.794-4,4-4S40,41.794,40,44z M23,27c2.206,0,4,1.794,4,4
      s-1.794,4-4,4s-4-1.794-4-4S20.794,27,23,27z M11.013,38.987c2.206,0,4,1.794,4,4s-1.794,4-4,4s-4-1.794-4-4
      S8.807,38.987,11.013,38.987z"/>
                            </g>
                        </svg>
                        <Link href='/leaderboard'>
                            <span className="ml-4 flex items-start flex-col leading-none">
                                <span className="text-xs text-gray-400 mb-1">Compete With VITians</span>
                                <span className="title-font font-medium">Leaderboards</span>
                            </span>
                        </Link>
                    </button>

                </div>
            </div>
        </div >
    );
};

export default Hero;
