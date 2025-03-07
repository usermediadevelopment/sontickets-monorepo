'use client';

import { Box } from '@chakra-ui/react';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

interface ChartDataPoint {
  month: string;
  date?: Date;
  value: number;
}

interface PerformanceChartProps {
  data: ChartDataPoint[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  // Sort data by date if available
  const sortedData = [...data].sort((a, b) => {
    if (a.date && b.date) {
      return a.date.getTime() - b.date.getTime();
    }
    return 0;
  });

  const chartData = {
    labels: sortedData.map((item) => item.month),
    datasets: [
      {
        data: sortedData.map((item) => item.value),
        borderColor: '#3182CE', // blue.500
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
        pointBackgroundColor: '#3182CE',
        pointBorderColor: '#3182CE',
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Update the options object to better handle dynamic data
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#A0AEC0', // gray.400
          maxRotation: 45,
          minRotation: 45,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(160, 174, 192, 0.1)', // gray.400 with opacity
          drawBorder: false,
        },
        ticks: {
          color: '#A0AEC0', // gray.400
          padding: 10,
          // Add a callback to ensure we have reasonable y-axis values
          callback: (value: number) => (value % 60 === 0 ? value : ''),
        },
        border: {
          display: false,
        },
        // Make the y-axis adapt to the data range
        min: (context: any) => {
          const min = Math.min(...context.chart.data.datasets[0].data);
          return Math.max(0, min - 20); // Ensure we don't go below 0
        },
        max: (context: any) => {
          const max = Math.max(...context.chart.data.datasets[0].data);
          return max + 20; // Add some padding at the top
        },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: '#2D3748', // gray.700
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        },
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context: any) => context[0].label,
          label: (context: any) => context.parsed.y.toString(),
        },
      },
      legend: {
        display: false,
      },
    },
  };

  return (
    <Box h='100%' w='100%'>
      <Line data={chartData} options={options as any} />
    </Box>
  );
}
