"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const phrases = [
    "La única forma de hacer un gran trabajo es amar lo que haces.",
    "El éxito no es definitivo, el fracaso no es fatal: lo que cuenta es el coraje para continuar.",
    "Cree que puedes y ya estás a medio camino.",
    "El mejor momento para plantar un árbol fue hace 20 años. El segundo mejor momento es ahora.",
    "Tu tiempo es limitado, no lo desperdicies viviendo la vida de otra persona.",
    "La mente es todo. En lo que piensas, te conviertes.",
    "Un viaje de mil millas comienza con un solo paso."
];


export function PhrasesCarousel() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % phrases.length);
        }, 4000); // Change phrase every 4 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-10 flex items-center justify-center overflow-hidden text-center">
            <AnimatePresence>
                <motion.p
                    key={index}
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -24, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 text-sm text-muted-foreground flex items-center justify-center"
                >
                    {phrases[index]}
                </motion.p>
            </AnimatePresence>
        </div>
    );
}
