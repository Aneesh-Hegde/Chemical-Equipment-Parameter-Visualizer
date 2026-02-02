import { motion } from 'framer-motion';
import { Activity, Gauge, Thermometer, Box } from 'lucide-react';
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

// Color palette for equipment types
const typeColors: Record<string, string> = {
  Pump: 'primary',
  Valve: 'accent',
  Compressor: 'warning',
  HeatExchanger: 'success',
  Reactor: 'destructive',
  Condenser: 'secondary',
};

export const StatsGrid = () => {
  const { stats, currentData } = useDashboard();

  const mainStatsCards = [
    {
      label: 'Total Equipment',
      value: stats.total_count,
      icon: Box,
      color: 'primary',
      decimals: 0,
      suffix: '',
    },
    {
      label: 'Avg Flowrate',
      value: stats.averages.Flowrate,
      icon: Activity,
      color: 'accent',
      decimals: 2,
      suffix: ' m³/h',
    },
    {
      label: 'Avg Pressure',
      value: stats.averages.Pressure,
      icon: Gauge,
      color: 'warning',
      decimals: 2,
      suffix: ' bar',
    },
    {
      label: 'Avg Temperature',
      value: stats.averages.Temperature,
      icon: Thermometer,
      color: 'destructive',
      decimals: 2,
      suffix: ' °C',
    },
  ];

  if (currentData.length === 0) {
    return null;
  }

  const typeEntries = Object.entries(stats.type_distribution);

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mainStatsCards.map((stat, index) => {
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
                  className={`w-10 h-10 rounded-lg flex items-center justify-center`}
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

      {/* Type Distribution */}
      {typeEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="glass-card rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">Equipment Type Distribution</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {typeEntries.map(([type, count], index) => {
              const color = typeColors[type] || 'muted-foreground';
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex flex-col items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span
                    className="text-xl font-bold"
                    style={{ color: `hsl(var(--${color}))` }}
                  >
                    {count}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 text-center">
                    {type}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
