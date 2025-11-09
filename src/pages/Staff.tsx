import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, getSubjects, getStaff, getStudents, getAttendance, saveToStorage, type Subject, type Student, type AttendanceRecord } from "@/lib/storage";
import { toast } from "sonner";
import DashboardNav from "@/components/DashboardNav";
import AttendanceMarking from "@/components/staff/AttendanceMarking";
import AttendanceHistory from "@/components/staff/AttendanceHistory";
import StaffAnalytics from "@/components/staff/StaffAnalytics";

const Staff = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mark");
  const [staffSubjects, setStaffSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'staff') {
      toast.error("Access denied. Staff privileges required.");
      navigate('/');
      return;
    }

    // Get staff's assigned subjects
    const staff = getStaff().find(s => s.id === user.profileId);
    if (staff) {
      const subjects = getSubjects().filter(s => staff.assignedSubjects.includes(s.id));
      setStaffSubjects(subjects);
      if (subjects.length > 0) {
        setSelectedSubject(subjects[0].id);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav
        title="Staff Dashboard"
        onLogout={handleLogout}
        tabs={[
          { id: "mark", label: "Mark Attendance" },
          { id: "history", label: "Attendance History" },
          { id: "analytics", label: "Analytics" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="container mx-auto px-4 py-8">
        {activeTab === "mark" && (
          <AttendanceMarking
            subjects={staffSubjects}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
          />
        )}

        {activeTab === "history" && (
          <AttendanceHistory
            subjects={staffSubjects}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
          />
        )}

        {activeTab === "analytics" && (
          <StaffAnalytics
            subjects={staffSubjects}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
          />
        )}
      </main>
    </div>
  );
};

export default Staff;
