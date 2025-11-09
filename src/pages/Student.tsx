import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, logout, getStudents, getAttendance, getSubjects, checkAttendanceAndNotify, getNotifications, type Student as StudentType, type AttendanceRecord } from "@/lib/storage";
import { toast } from "sonner";
import DashboardNav from "@/components/DashboardNav";
import StudentAttendanceChart from "@/components/student/StudentAttendanceChart";
import SubjectWiseAttendance from "@/components/student/SubjectWiseAttendance";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Student = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<StudentType | null>(null);
  const [attendancePercentage, setAttendancePercentage] = useState(0);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'student') {
      toast.error("Access denied. Student privileges required.");
      navigate('/');
      return;
    }

    const student = getStudents().find(s => s.id === user.profileId);
    if (student) {
      setStudentData(student);
      const percentage = calculateAttendance(student);
      
      // Check attendance and create notification if needed
      checkAttendanceAndNotify(student.id);
      
      // Show toast for unread notifications
      const notifications = getNotifications(user.id).filter(n => !n.read);
      if (notifications.length > 0) {
        notifications.forEach(notification => {
          if (notification.type === 'warning') {
            toast.error(notification.title, {
              description: notification.message,
            });
          }
        });
      }
    }
  }, [navigate]);

  const calculateAttendance = (student: StudentType) => {
    const attendance = getAttendance();
    const studentAttendance = attendance.filter(a => a.studentId === student.id);
    
    if (studentAttendance.length === 0) {
      setAttendancePercentage(0);
      return 0;
    }

    const presentCount = studentAttendance.filter(a => a.status === 'present').length;
    const percentage = (presentCount / studentAttendance.length) * 100;
    const roundedPercentage = Math.round(percentage);
    setAttendancePercentage(roundedPercentage);
    return roundedPercentage;
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate('/');
  };

  if (!studentData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav
        title="Student Dashboard"
        onLogout={handleLogout}
        showNotifications={true}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{studentData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roll Number</p>
                  <p className="font-semibold">{studentData.rollNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{studentData.email}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Overall Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative w-48 h-48">
                    <svg className="transform -rotate-90 w-48 h-48">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-muted"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={552}
                        strokeDashoffset={552 - (552 * attendancePercentage) / 100}
                        className={attendancePercentage >= 75 ? "text-success" : "text-destructive"}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-bold">{attendancePercentage}%</span>
                    </div>
                  </div>
                </div>

                {attendancePercentage < 75 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your attendance is below 75%. Please attend classes regularly to meet the minimum requirement.
                    </AlertDescription>
                  </Alert>
                )}

                {attendancePercentage >= 75 && (
                  <Alert className="mt-4 border-success">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <AlertDescription>
                      Great job! Your attendance meets the required criteria.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <SubjectWiseAttendance studentId={studentData.id} subjects={studentData.subjects} />

          <Card>
            <CardHeader>
              <CardTitle>Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentAttendanceChart studentId={studentData.id} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Student;
