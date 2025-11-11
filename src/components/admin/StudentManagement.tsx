import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CoursesAPI, SubjectsAPI, StudentsAPI, type Student as ApiStudent } from "@/lib/api";
import { Plus, Edit, Trash2 } from "lucide-react";

const StudentManagement = () => {
  const qc = useQueryClient();
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: CoursesAPI.list });
  const { data: subjects = [] } = useQuery({ queryKey: ['subjects'], queryFn: SubjectsAPI.list });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: StudentsAPI.list });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<ApiStudent | null>(null);
  const [formData, setFormData] = useState<ApiStudent>({ 
    name: "", 
    rollNumber: "", 
    email: "", 
    courseId: "", 
    subjects: [] 
  });

  const availableSubjects = subjects.filter((s: any) => s.courseId === formData.courseId);

  const createMut = useMutation({
    mutationFn: (s: ApiStudent) => StudentsAPI.create(s),
    onSuccess: () => {
      toast.success("Student added successfully");
      qc.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => toast.error("Failed to add student")
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApiStudent }) => StudentsAPI.update(id, data),
    onSuccess: () => {
      toast.success("Student updated successfully");
      qc.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => toast.error("Failed to update student")
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => StudentsAPI.remove(id),
    onSuccess: () => {
      toast.success("Student deleted successfully");
      qc.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => toast.error("Failed to delete student")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStudent?.id) {
      updateMut.mutate({ id: editingStudent.id, data: formData });
    } else {
      createMut.mutate(formData);
    }
    
    setIsDialogOpen(false);
    setEditingStudent(null);
    setFormData({ name: "", rollNumber: "", email: "", courseId: "", subjects: [] });
  };

  const handleEdit = (student: ApiStudent) => {
    setEditingStudent(student);
    setFormData({ 
      name: student.name, 
      rollNumber: student.rollNumber, 
      email: student.email,
      courseId: student.courseId,
      subjects: student.subjects
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMut.mutate(id);
  };

  const handleAddNew = () => {
    setEditingStudent(null);
    setFormData({ name: "", rollNumber: "", email: "", courseId: "", subjects: [] });
    setIsDialogOpen(true);
  };

  const handleSubjectToggle = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(id => id !== subjectId)
        : [...prev.subjects, subjectId]
    }));
  };

  const getCourseName = (courseId: string) => {
    return courses.find((c: any) => c.id === courseId)?.name || "N/A";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Student Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Student Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Blake"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    placeholder="e.g., IT001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., Blake@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select 
                    value={formData.courseId} 
                    onValueChange={(value) => setFormData({ ...formData, courseId: value, subjects: [] })} 
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.courseId && availableSubjects.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select Subjects</Label>
                    <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                      {availableSubjects.map((subject) => (
                        <div key={subject.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={subject.id}
                            checked={formData.subjects.includes(subject.id)}
                            onCheckedChange={() => handleSubjectToggle(subject.id)}
                          />
                          <Label htmlFor={subject.id} className="font-normal cursor-pointer">
                            {subject.name} ({subject.code})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">{editingStudent ? "Update" : "Add"} Student</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <Card key={student.id}>
            <CardHeader>
              <CardTitle className="text-base">{student.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Roll Number</p>
                <p className="font-medium">{student.rollNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-sm">{student.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="font-medium">{getCourseName(student.courseId)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subjects</p>
                <p className="font-medium">{student.subjects.length}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(student)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(student.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentManagement;
