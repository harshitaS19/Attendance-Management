import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAttendance, getSubjects } from "@/lib/storage";

interface SubjectWiseAttendanceProps {
  studentId: string;
  subjects: string[];
}

const SubjectWiseAttendance = ({ studentId, subjects }: SubjectWiseAttendanceProps) => {
  const allSubjects = getSubjects();
  const attendance = getAttendance();

  const subjectData = subjects.map(subjectId => {
    const subject = allSubjects.find(s => s.id === subjectId);
    const subjectAttendance = attendance.filter(a => 
      a.studentId === studentId && a.subjectId === subjectId
    );
    
    const presentCount = subjectAttendance.filter(a => a.status === 'present').length;
    const totalCount = subjectAttendance.length;
    const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    return {
      name: subject?.name || 'Unknown',
      code: subject?.code || '',
      percentage,
      present: presentCount,
      total: totalCount
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject-wise Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {subjectData.map((subject, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{subject.name}</p>
                  <p className="text-sm text-muted-foreground">{subject.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{subject.percentage}%</p>
                  <p className="text-sm text-muted-foreground">
                    {subject.present}/{subject.total} classes
                  </p>
                </div>
              </div>
              <Progress 
                value={subject.percentage} 
                className="h-2"
              />
            </div>
          ))}
          
          {subjectData.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No subjects assigned yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectWiseAttendance;
