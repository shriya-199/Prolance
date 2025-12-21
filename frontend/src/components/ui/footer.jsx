import React, { useState, useEffect, useRef } from 'react';
import ClickSpark from '../ClickSpark';
import { Link } from 'react-router-dom';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const footerRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!footerRef.current) return;

            const footerTop = footerRef.current.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            // Calculate progress (0 to 1) as footer comes into view
            const progress = Math.max(0, Math.min(1, 1 - (footerTop - windowHeight * 0.5) / (windowHeight * 0.5)));
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getLetterStyle = (index, totalLetters) => {
        // Only animate last 3 letters (indices 6, 7, 8 for "Prolancer")
        if (index < totalLetters - 3) return {};

        // Calculate multiplier: c=1, e=2, r=3
        const positionFromEnd = index - (totalLetters - 3) + 1; // 1, 2, 3
        const translateY = -30 * positionFromEnd * scrollProgress; // Increasing upward movement

        return {
            display: 'inline-block',
            transform: `translateY(${translateY}px)`,
            transition: 'transform 0.4s ease-out'
        };
    };

    const text = "Prolance";
    const letters = text.split('');

    return (
        <footer ref={footerRef} className="w-full bg-theme py-16 px-8 ">
            <ClickSpark sparkColor="#000000ff" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400} easing="ease-out" extraScale={1.0}>
                <div className="max-w-7xl mx-auto">

                    {/* Center - Large Prolancer Text */}
                    <div className="mb-20 flex justify-center relative">

                        <h1
                            className="text-[8rem] md:text-[12rem] lg:text-[16rem] font-bold tracking-tight select-none relative"
                            style={{
                                WebkitTextStroke: '1px rgb(156, 163, 175)',
                                WebkitTextFillColor: 'transparent',
                                color: 'transparent',
                                WebkitMaskImage: 'linear-gradient(to top right, transparent 0%, black 20%, black 100%)',
                                maskImage: 'linear-gradient(to top right, transparent 0%, black 20%, black 100%)'
                            }}
                        >
                            {letters.map((letter, index) => (
                                <span key={index} style={getLetterStyle(index, letters.length)}>
                                    {letter}
                                </span>
                            ))}
                        </h1>
                    </div>

                    {/* Bottom Section */}
                    <div className="pt-8 border-t border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            {/* Left - Brand */}
                            <Link to="/" className="flex items-center gap-2">
                                <h2 className="text-lg font-light tracking-wide flex items-center">
                                    <span className="text-green-600">Pro</span>
                                    <span className="text-gray-700">&lt;lance&gt;</span>
                                </h2>
                            </Link>

                            {/* Right - Links */}
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                <Link to="/about" className="hover:text-green-600 transition font-light">
                                    About Prolance
                                </Link>
                                <Link to="/careers" className="hover:text-green-600 transition font-light">
                                    Careers
                                </Link>
                                <Link to="/privacy" className="hover:text-green-600 transition font-light">
                                    Privacy
                                </Link>
                                <Link to="/terms" className="hover:text-green-600 transition font-light">
                                    Terms
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </ClickSpark>
        </footer>
    );
}
