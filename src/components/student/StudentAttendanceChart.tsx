import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { getAttendance } from "@/lib/storage";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface StudentAttendanceChartProps {
  studentId: string;
}

const StudentAttendanceChart = ({ studentId }: StudentAttendanceChartProps) => {
  const attendance = getAttendance().filter(a => a.studentId === studentId);
  
  // Sort by date and calculate cumulative percentage
  const sortedAttendance = attendance.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const cumulativeData = sortedAttendance.map((record, index) => {
    const records = sortedAttendance.slice(0, index + 1);
    const presentCount = records.filter(r => r.status === 'present').length;
    return {
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      percentage: Math.round((presentCount / records.length) * 100)
    };
  });

  const chartData = {
    labels: cumulativeData.map(d => d.date),
    datasets: [
      {
        label: 'Attendance Trend',
        data: cumulativeData.map(d => d.percentage),
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsla(var(--primary), 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Required (75%)',
        data: cumulativeData.map(() => 75),
        borderColor: 'hsl(var(--destructive))',
        borderDash: [5, 5],
        pointRadius: 0,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        }
      }
    }
  };

  if (attendance.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No attendance data available yet</p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default StudentAttendanceChart;
