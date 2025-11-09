import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, logout, getCourses, getSubjects, getStaff, getStudents, getAttendance } from "@/lib/storage";
import { GraduationCap, Users, BookOpen, UserCheck, LogOut, Plus } from "lucide-react";
import { toast } from "sonner";
import DashboardNav from "@/components/DashboardNav";
import CourseManagement from "@/components/admin/CourseManagement";
import SubjectManagement from "@/components/admin/SubjectManagement";
import StaffManagement from "@/components/admin/StaffManagement";
import StudentManagement from "@/components/admin/StudentManagement";
import AttendanceChart from "@/components/admin/AttendanceChart";

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalCourses: 0,
    totalSubjects: 0,
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      toast.error("Access denied. Admin privileges required.");
      navigate('/');
      return;
    }

    // Calculate stats
    setStats({
      totalStudents: getStudents().length,
      totalStaff: getStaff().length,
      totalCourses: getCourses().length,
      totalSubjects: getSubjects().length,
    });
  }, [navigate]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate('/');
  };

  const statsCards = [
    { title: "Total Students", value: stats.totalStudents, icon: Users, color: "text-primary" },
    { title: "Total Staff", value: stats.totalStaff, icon: UserCheck, color: "text-success" },
    { title: "Total Courses", value: stats.totalCourses, icon: GraduationCap, color: "text-warning" },
    { title: "Total Subjects", value: stats.totalSubjects, icon: BookOpen, color: "text-destructive" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav
        title="Admin Dashboard"
        onLogout={handleLogout}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "courses", label: "Courses" },
          { id: "subjects", label: "Subjects" },
          { id: "staff", label: "Staff" },
          { id: "students", label: "Students" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="container mx-auto px-4 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Course-wise Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <AttendanceChart />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "courses" && <CourseManagement />}
        {activeTab === "subjects" && <SubjectManagement />}
        {activeTab === "staff" && <StaffManagement />}
        {activeTab === "students" && <StudentManagement />}
      </main>
    </div>
  );
};

export default Admin;
