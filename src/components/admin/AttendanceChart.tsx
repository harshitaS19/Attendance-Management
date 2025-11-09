import { useEffect, useRef } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getCourses, getStudents, getAttendance, getSubjects } from "@/lib/storage";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AttendanceChart = () => {
  const courses = getCourses();
  const students = getStudents();
  const attendance = getAttendance();
  const subjects = getSubjects();

  const data = {
    labels: courses.map(c => c.name),
    datasets: [
      {
        label: 'Overall Attendance %',
        data: courses.map(course => {
          const courseStudents = students.filter(s => s.courseId === course.id);
          if (courseStudents.length === 0) return 0;

          let totalAttendance = 0;
          let totalRecords = 0;

          courseStudents.forEach(student => {
            const studentAttendance = attendance.filter(a => a.studentId === student.id);
            const presentCount = studentAttendance.filter(a => a.status === 'present').length;
            totalAttendance += studentAttendance.length > 0 ? (presentCount / studentAttendance.length) * 100 : 0;
            totalRecords += studentAttendance.length > 0 ? 1 : 0;
          });

          return totalRecords > 0 ? totalAttendance / totalRecords : 0;
        }),
        backgroundColor: 'hsl(var(--primary))',
        borderColor: 'hsl(var(--primary))',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
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

  return (
    <div className="h-[300px]">
      <Bar data={data} options={options} />
    </div>
  );
};

export default AttendanceChart;
