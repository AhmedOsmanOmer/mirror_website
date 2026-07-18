import { motion } from 'framer-motion';

const samples = [
    {
        color: 'rgb(108,192,168)',
        name: 'Amira Hassan',
        title: 'Interior Architect',
        font: 'font-serif',
        orientation: 'vertical',
    },
    {
        color: 'rgb(229,182,164)',
        name: 'Marcus Reed',
        title: 'Founder, Reed & Co.',
        font: 'font-sans',
        orientation: 'horizontal',
    },
    {
        color: '#1E3A5F',
        name: 'Sofia Lindqvist',
        title: 'Creative Director',
        font: 'font-sans',
        orientation: 'vertical',
    },
    {
        color: 'rgb(229,217,219)',
        name: 'Noah Kim',
        title: 'Product Designer',
        font: 'font-mono',
        orientation: 'vertical',
    },
];

export default function ProductShowcase() {
    return (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {samples.map((sample, i) => {
                const isVertical = sample.orientation === 'vertical';
                const light = sample.color === 'rgb(229,217,219)';

                return (
                    <motion.div
                        key={sample.name}
                        initial={{ opacity: 0, y: 32 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ y: -6, rotate: i % 2 === 0 ? -1.5 : 1.5, scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative flex flex-col items-center gap-4"
                    >
                        <div
                            className="absolute inset-2 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-70"
                            style={{ backgroundColor: sample.color }}
                            aria-hidden="true"
                        />
                        <div
                            className={
                                'flex justify-center overflow-hidden rounded-xl shadow-lg ring-1 ring-black/10 transition-shadow duration-300 group-hover:shadow-2xl ' +
                                (isVertical ? 'aspect-[50/85] w-full max-w-[200px]' : 'aspect-[85/50] w-full')
                            }
                            style={{ backgroundColor: sample.color }}
                        >
                            <div className={`flex w-full flex-col justify-end p-5 ${light ? 'text-ink' : 'text-white'}`}>
                                <p className={`text-base font-semibold leading-tight ${sample.font}`}>{sample.name}</p>
                                <p className={`text-xs opacity-80 ${sample.font}`}>{sample.title}</p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
