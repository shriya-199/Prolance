"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export const LayoutTextFlip = ({
  text = "Discover",
  words = [
    "Graphic Designers",
    "Web Developers",
    "Video Editors",
    "Videographers",
    "Photographers",
    "Content Writers",
    "Meme Creators"
  ],
  duration = 2500,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMouseIndicator, setShowMouseIndicator] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, []);

  // Scroll detection to hide/show mouse indicator
  useEffect(() => {
    const handleScroll = () => {
      // Show indicator when at the top (within 100px of top)
      // Hide when scrolled down
      setShowMouseIndicator(window.scrollY < 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen w-full -mt-10 relative">
        <div className="flex items-center gap-6">
          <motion.span
            layoutId="subtext"
            className="text-2xl font-bold tracking-tight drop-shadow-lg md:text-4xl">
            {text}
          </motion.span>
          <motion.span
            layout
            className=" relative overflow-hidden rounded-md border border-transparent bg-white px-4 py-2 font-sans text-2xl font-bold tracking-tight text-green-400 shadow-sm ring shadow-black/10 ring-black/10 drop-shadow-lg md:text-4xl dark:bg-neutral-900 dark:text-white dark:shadow-sm dark:ring-1 dark:shadow-white/10 dark:ring-white/10">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={currentIndex}
                initial={{ y: -40, filter: "blur(10px)" }}
                animate={{
                  y: 0,
                  filter: "blur(0px)",
                }}
                exit={{ y: 50, filter: "blur(10px)", opacity: 0 }}
                transition={{
                  duration: 0.5,
                }}
                className={cn("inline-block whitespace-nowrap")}>
                {words[currentIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.span>
          <br /><br />
        </div>
        <p className="text-center font-light text-gray-400 mt-8 max-w-2xl">
          Find the perfect freelancer for your project. Browse our talented professionals and get your work done efficiently.
        </p><br /><br />
        <div className="flex gap-4 flex-wrap relative mt-10">
          <button
            className=" cursor-pointer px-5 py-1.5 text-sm text-gray-700 font-light rounded-full border border-gray-300 hover:bg-green-300/30 hover:text-black hover:border-green-400 transition-all duration-300">
            Programming and Tech
          </button>
          <button
            className="cursor-pointer px-5 py-1.5 text-sm text-gray-700 font-light rounded-full border border-gray-300 hover:bg-green-300/30 hover:text-black hover:border-green-400 transition-all duration-300">
            Graphics and Design
          </button>
          <button
            className="cursor-pointer px-5 py-1.5 text-sm text-gray-700 font-light rounded-full border border-gray-300 hover:bg-green-300/30 hover:text-black hover:border-green-400 transition-all duration-300">
            Digital Marketing
          </button>
          <button
            className="cursor-pointer px-5 py-1.5 text-sm text-gray-700 font-light rounded-full border border-gray-300 hover:bg-green-300/30 hover:text-black hover:border-green-400 transition-all duration-300">
            Writing and Translation
          </button>
          <button
            className="cursor-pointer px-5 py-1.5 text-sm text-gray-700 font-light rounded-full border border-gray-300 hover:bg-green-300/30 hover:text-black hover:border-green-400 transition-all duration-300">
            Video and Animation
          </button>
          <button
            className="cursor-pointer px-5 py-1.5 text-sm text-gray-700 font-light rounded-full border border-gray-300 hover:bg-green-300/30 hover:text-black hover:border-green-400 transition-all duration-300">
            Ai Services
          </button>
          <button
            className="cursor-pointer px-5 py-1.5 text-sm text-gray-700 font-light rounded-full border border-gray-300 hover:bg-green-300/30 hover:text-black hover:border-green-400 transition-all duration-300">
            Music and Audio
          </button>
        </div>
        <div className="flex gap-4 flex-wrap relative mt-5">
          <button
            className="cursor-pointer px-5 py-1.5 text-sm text-gray-700 font-light rounded-full border border-gray-300 hover:bg-green-300/30 hover:text-black hover:border-green-400 transition-all duration-300">
            Business
          </button>
          <button
            className="cursor-pointer px-5 py-1.5 text-sm text-gray-700 font-light rounded-full border border-gray-300 hover:bg-green-300/30 hover:text-black hover:border-green-400 transition-all duration-300">
            Consulting
          </button>
          <button
            className="cursor-pointer px-5 py-1.5 text-sm text-gray-700 font-light rounded-full border border-gray-300 hover:bg-green-300/30 hover:text-black hover:border-green-400 transition-all duration-300">
            Health and Fitness
          </button>
          <button
            className="cursor-pointer px-5 py-1.5 text-sm text-gray-700 font-light rounded-full border border-gray-300 hover:bg-green-300/30 hover:text-black hover:border-green-400 transition-all duration-300">
            Education
          </button>
          <button
            className="cursor-pointer px-5 py-1.5 text-sm text-gray-700 font-light rounded-full border border-gray-300 hover:bg-green-300/30 hover:text-black hover:border-green-400 transition-all duration-300">
            Legal
          </button>
        </div>

        {/* Scroll Down Indicator */}
        <AnimatePresence>
          {showMouseIndicator && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                y: [0, 8, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.3 },
                y: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              }}
              className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
            >
              <svg
                width="18"
                height="32"
                viewBox="0 0 18 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="opacity-50"
              >
                {/* Mouse body */}
                <rect
                  x="1"
                  y="1"
                  width="16"
                  height="30"
                  rx="8"
                  stroke="#4b5563"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Scroll wheel */}
                <motion.line
                  x1="9"
                  y1="8"
                  x2="9"
                  y2="14"
                  stroke="#4b5563"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  animate={{
                    y1: [8, 11],
                    y2: [14, 17],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </>
  );
};
