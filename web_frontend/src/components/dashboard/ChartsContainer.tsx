import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Scatter } from 'react-chartjs-2';
import { useDashboard } from '@/context/DashboardContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          family: 'Inter',
          size: 12,
        },
        usePointStyle: true,
        padding: 20,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: 'Inter',
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          family: 'Inter',
          size: 11,
        },
      },
    },
  },
};

export const ChartsContainer = () => {
  const { currentData } = useDashboard();

  const equipmentTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    currentData.forEach(item => {
      typeCounts[item.equipmentType] = (typeCounts[item.equipmentType] || 0) + 1;
    });

    const labels = Object.keys(typeCounts);
    const data = Object.values(typeCounts);
    
    const colors = [
      'hsl(210, 100%, 50%)',
      'hsl(175, 70%, 45%)',
      'hsl(262, 80%, 55%)',
      'hsl(38, 92%, 50%)',
      'hsl(0, 72%, 55%)',
      'hsl(145, 63%, 42%)',
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Equipment Count',
          data,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [currentData]);

  const pressureTempData = useMemo(() => {
    return {
      datasets: [
        {
          label: 'Pressure vs Temperature',
          data: currentData.map(item => ({
            x: item.temperature,
            y: item.pressure,
          })),
          backgroundColor: 'hsla(210, 100%, 50%, 0.6)',
          borderColor: 'hsl(210, 100%, 50%)',
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  }, [currentData]);

  const scatterOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales.x,
        title: {
          display: true,
          text: 'Temperature (°C)',
          font: {
            family: 'Inter',
            size: 12,
            weight: 500,
          },
        },
      },
      y: {
        ...chartOptions.scales.y,
        title: {
          display: true,
          text: 'Pressure (bar)',
          font: {
            family: 'Inter',
            size: 12,
            weight: 500,
          },
        },
      },
    },
  };

  if (currentData.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Equipment Type Distribution</h3>
        <div className="h-72">
          <Bar data={equipmentTypeData} options={chartOptions} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Pressure vs Temperature</h3>
        <div className="h-72">
          <Scatter data={pressureTempData} options={scatterOptions as any} />
        </div>
      </motion.div>
    </div>
  );
};
