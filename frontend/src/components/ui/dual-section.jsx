import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import AnimatedBeam from './AnimatedBeam';

export default function DualSection() {
    return (
        <div className="relative py-32 bg-theme overflow-hidden">
            {/* Dotted Pattern Background */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Content */}
            <div className="relative mx-auto max-w-6xl px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                    {/* For Freelancers */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <p className="text-xs text-black font-light mb-6 outline-1 outline-gray-200 rounded-xl w-36 mx-auto ">
                            Start earning today
                        </p>
                        <h2 className="text-4xl md:text-5xl font-light text-black mb-3">
                            For freelancers
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-600 font-light mb-8">
                            Find your next project
                        </p>
                        <Link
                            to="/signup"
                            className="inline-block px-8 py-3 bg-gray-900 text-white text-sm font-light rounded-full hover:bg-gray-800 transition-all"
                        >
                            Get Started
                        </Link>
                    </motion.div>

                    {/* Animated Beam in the Center */}
                    <div className="hidden lg:block relative h-48">
                        <AnimatedBeam />
                    </div>

                    {/* For Clients */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-center"
                    >
                        <p className="text-xs text-black font-light mb-6 outline-1 outline-gray-200 rounded-xl w-36 mx-auto ">
                            Hire top talent
                        </p>
                        <h2 className="text-4xl md:text-5xl font-light text-black mb-3">
                            For clients
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-600 font-light mb-8">
                            Build your dream team
                        </p>
                        <Link
                            to="/signup"
                            className="inline-block px-8 py-3 border border-gray-300 text-gray-800 text-sm font-light rounded-full hover:bg-gray-50 transition-all"
                        >
                            Post a Project
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
