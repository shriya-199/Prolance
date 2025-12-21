import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Support() {
    const [startDust, setStartDust] = useState(false);

    useEffect(() => {
        // start the dust animation 1s after appearing
        const t = setTimeout(() => setStartDust(true), 1400);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="min-h-screen bg-theme flex items-center justify-center">
            <div className="flex gap-4 text-6xl font-light text-gray-700">

                {/* WE */}
                <motion.span
                    initial={{ opacity: 0, filter: "brightness(400%)" }}
                    animate={{ opacity: 1, filter: "brightness(100%)" }}
                    transition={{ duration: 0.4 }}
                >
                    We
                </motion.span>

                {/* DON'T */}
                <motion.span
                    initial={{ opacity: 0, filter: "brightness(400%)" }}
                    animate={{ opacity: 1, filter: "brightness(100%)" }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    Don’t
                </motion.span>

                {/* <Support> JUMP CUT + DUST VANISH */}
                <motion.span
                    className="text-green-600 relative inline-block"
                    initial={{ opacity: 0, filter: "brightness(600%)" }}
                    animate={{ opacity: 1, filter: "brightness(100%)" }}
                    transition={{ delay: 0.8, duration: 0.05 }}
                >
                    {/* Original Text */}
                    <motion.span
                        animate={
                            startDust
                                ? {
                                    opacity: 0,
                                    filter: "blur(6px) brightness(250%)",
                                    x: 20,
                                    y: -10,
                                }
                                : {}
                        }
                        transition={{ duration: 1.6, ease: "easeOut" }}
                        className="absolute top-0 left-0"
                    >
                        &lt;Support&gt;
                    </motion.span>

                    {/* Dust Particles */}
                    {[...Array(35)].map((_, i) => (
                        <motion.span
                            key={i}
                            className="absolute w-1 h-1 bg-green-600 rounded-full"
                            initial={{
                                opacity: 0,
                                x: 0,
                                y: 0,
                                scale: 0.6,
                            }}
                            animate={
                                startDust
                                    ? {
                                        opacity: [0, 1, 0],
                                        x: (Math.random() - 0.5) * 150,
                                        y: (Math.random() - 0.5) * 80,
                                        scale: Math.random() * 1.6,
                                        filter: "blur(2px)"
                                    }
                                    : {}
                            }
                            transition={{
                                delay: 0.05 * (i % 5),
                                duration: 1.6,
                                ease: "easeOut",
                            }}
                        />
                    ))}

                    {/* Invisible placeholder to keep layout stable */}
                    <span className="opacity-0">&lt;Support&gt;</span>
                </motion.span>

            </div>
        </div>
    );
}
