import { motion } from 'framer-motion';
import { Activity, Gauge, Thermometer, Box, CheckCircle, XCircle } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useDashboard } from '@/context/DashboardContext';

const statCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  }),
};

export const StatsGrid = () => {
  const { stats, currentData } = useDashboard();

  const statsCards = [
    {
      label: 'Total Equipment',
      value: stats.totalEquipment,
      icon: Box,
      color: 'primary',
      decimals: 0,
      suffix: '',
    },
    {
      label: 'Avg Flowrate',
      value: stats.avgFlowrate,
      icon: Activity,
      color: 'accent',
      decimals: 2,
      suffix: ' m³/h',
    },
    {
      label: 'Avg Pressure',
      value: stats.avgPressure,
      icon: Gauge,
      color: 'warning',
      decimals: 2,
      suffix: ' bar',
    },
    {
      label: 'Avg Temperature',
      value: stats.avgTemperature,
      icon: Thermometer,
      color: 'destructive',
      decimals: 1,
      suffix: ' °C',
    },
    {
      label: 'Active',
      value: stats.activeCount,
      icon: CheckCircle,
      color: 'success',
      decimals: 0,
      suffix: '',
    },
    {
      label: 'Inactive',
      value: stats.inactiveCount,
      icon: XCircle,
      color: 'muted-foreground',
      decimals: 0,
      suffix: '',
    },
  ];

  if (currentData.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            custom={index}
            variants={statCardVariants}
            initial="hidden"
            animate="visible"
            className="glass-card rounded-xl p-4 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${stat.color}/10`}
                style={{
                  backgroundColor: `hsl(var(--${stat.color}) / 0.1)`,
                }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{
                    color: `hsl(var(--${stat.color}))`,
                  }}
                />
              </div>
            </div>
            
            <div>
              <AnimatedCounter
                value={stat.value}
                decimals={stat.decimals}
                suffix={stat.suffix}
                className="text-2xl font-bold text-foreground"
              />
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
