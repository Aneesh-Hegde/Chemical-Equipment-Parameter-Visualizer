import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter = ({
  value,
  duration = 1.5,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  const spring = useSpring(previousValue.current, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (current) => {
    return `${prefix}${current.toFixed(decimals)}${suffix}`;
  });

  useEffect(() => {
    spring.set(value);
    previousValue.current = value;
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => {
      setDisplayValue(parseFloat(v.replace(prefix, '').replace(suffix, '')));
    });
    return () => unsubscribe();
  }, [display, prefix, suffix]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {display}
    </motion.span>
  );
};
