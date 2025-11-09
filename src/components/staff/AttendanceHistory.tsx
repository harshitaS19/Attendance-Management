import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStudents, getAttendance, type Subject } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";

interface AttendanceHistoryProps {
  subjects: Subject[];
  selectedSubject: string;
  onSubjectChange: (subjectId: string) => void;
}

const AttendanceHistory = ({ subjects, selectedSubject, onSubjectChange }: AttendanceHistoryProps) => {
  const students = getStudents().filter(s => s.subjects.includes(selectedSubject));
  const attendance = getAttendance().filter(a => a.subjectId === selectedSubject);

  // Group by date
  const attendanceByDate = attendance.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, typeof attendance>);

  const sortedDates = Object.keys(attendanceByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

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
          <CardTitle>Attendance History</CardTitle>
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

      {sortedDates.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">No attendance records found for this subject.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => {
            const records = attendanceByDate[date];
            const presentCount = records.filter(r => r.status === 'present').length;
            const absentCount = records.filter(r => r.status === 'absent').length;

            return (
              <Card key={date}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        Present: {presentCount}
                      </Badge>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
                        Absent: {absentCount}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {records.map((record) => {
                      const student = students.find(s => s.id === record.studentId);
                      return (
                        <div
                          key={record.studentId}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{student?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{student?.rollNumber}</p>
                          </div>
                          <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                            {record.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
