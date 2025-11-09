import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStudents, getAttendance, type Subject } from "@/lib/storage";
import { Bar } from 'react-chartjs-2';

interface StaffAnalyticsProps {
  subjects: Subject[];
  selectedSubject: string;
  onSubjectChange: (subjectId: string) => void;
}

const StaffAnalytics = ({ subjects, selectedSubject, onSubjectChange }: StaffAnalyticsProps) => {
  const students = getStudents().filter(s => s.subjects.includes(selectedSubject));
  const attendance = getAttendance().filter(a => a.subjectId === selectedSubject);

  const studentAttendanceData = students.map(student => {
    const studentRecords = attendance.filter(a => a.studentId === student.id);
    const presentCount = studentRecords.filter(a => a.status === 'present').length;
    const percentage = studentRecords.length > 0 ? (presentCount / studentRecords.length) * 100 : 0;
    
    return {
      name: student.name,
      percentage: Math.round(percentage)
    };
  });

  const chartData = {
    labels: studentAttendanceData.map(d => d.name),
    datasets: [
      {
        label: 'Attendance %',
        data: studentAttendanceData.map(d => d.percentage),
        backgroundColor: studentAttendanceData.map(d => 
          d.percentage >= 75 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'
        ),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
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

  if (subjects.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No subjects assigned to you yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subject Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Select Subject</Label>
            <Select value={selectedSubject} onValueChange={onSubjectChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {studentAttendanceData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No data available</p>
          ) : (
            <div className="h-[400px]">
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Above 75%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {studentAttendanceData.filter(d => d.percentage >= 75).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Below 75%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {studentAttendanceData.filter(d => d.percentage < 75).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffAnalytics;
