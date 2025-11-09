import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStudents, getAttendance, saveToStorage, checkAttendanceAndNotify, type Subject, type AttendanceRecord } from "@/lib/storage";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface AttendanceMarkingProps {
  subjects: Subject[];
  selectedSubject: string;
  onSubjectChange: (subjectId: string) => void;
}

const AttendanceMarking = ({ subjects, selectedSubject, onSubjectChange }: AttendanceMarkingProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent'>>({});
  
  const students = getStudents().filter(s => s.subjects.includes(selectedSubject));
  
  const handleMarkAttendance = (studentId: string, status: 'present' | 'absent') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = () => {
    if (Object.keys(attendanceData).length === 0) {
      toast.error("Please mark attendance for at least one student");
      return;
    }

    const attendance = getAttendance();
    const newRecords: AttendanceRecord[] = Object.entries(attendanceData).map(([studentId, status]) => ({
      date: selectedDate,
      studentId,
      subjectId: selectedSubject,
      status
    }));

    // Remove existing records for this date, subject
    const filtered = attendance.filter(a => 
      !(a.date === selectedDate && a.subjectId === selectedSubject)
    );

    saveToStorage('attendance', [...filtered, ...newRecords]);
    
    // Check each student's attendance and create notifications if needed
    students.forEach(student => {
      checkAttendanceAndNotify(student.id);
    });
    
    toast.success("Attendance saved successfully");
    setAttendanceData({});
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
          <CardTitle>Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label>Date</Label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No students enrolled in this subject.</p>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={attendanceData[student.id] === 'present' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkAttendance(student.id, 'present')}
                      className={attendanceData[student.id] === 'present' ? 'bg-success hover:bg-success/90' : ''}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      variant={attendanceData[student.id] === 'absent' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkAttendance(student.id, 'absent')}
                      className={attendanceData[student.id] === 'absent' ? 'bg-destructive hover:bg-destructive/90' : ''}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Absent
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {students.length > 0 && (
            <Button onClick={handleSave} className="w-full mt-6" size="lg">
              Save Attendance
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceMarking;
