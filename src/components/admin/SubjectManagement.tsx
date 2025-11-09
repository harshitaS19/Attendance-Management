import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSubjects, getCourses, getStaff, saveToStorage, type Subject } from "@/lib/storage";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>(getSubjects());
  const [courses] = useState(getCourses());
  const [staff] = useState(getStaff());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", courseId: "", staffId: "unassigned" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSubject) {
      const updated = subjects.map(s => 
        s.id === editingSubject.id ? { 
          ...s, 
          ...formData,
          staffId: formData.staffId === "unassigned" ? undefined : formData.staffId
        } : s
      );
      setSubjects(updated);
      saveToStorage('subjects', updated);
      toast.success("Subject updated successfully");
    } else {
      const newSubject: Subject = {
        id: Date.now().toString(),
        ...formData,
        staffId: formData.staffId === "unassigned" ? undefined : formData.staffId
      };
      const updated = [...subjects, newSubject];
      setSubjects(updated);
      saveToStorage('subjects', updated);
      toast.success("Subject added successfully");
    }
    
    setIsDialogOpen(false);
    setEditingSubject(null);
    setFormData({ name: "", code: "", courseId: "", staffId: "unassigned" });
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ 
      name: subject.name, 
      code: subject.code, 
      courseId: subject.courseId,
      staffId: subject.staffId || "unassigned"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    saveToStorage('subjects', updated);
    toast.success("Subject deleted successfully");
  };

  const handleAddNew = () => {
    setEditingSubject(null);
    setFormData({ name: "", code: "", courseId: "", staffId: "unassigned" });
    setIsDialogOpen(true);
  };

  const getCourseName = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.name || "N/A";
  };

  const getStaffName = (staffId?: string) => {
    if (!staffId) return "Unassigned";
    return staff.find(s => s.id === staffId)?.name || "N/A";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subject Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Subject Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Artificial Intelligence"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Subject Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., AI101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })} required>
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
                <div className="space-y-2">
                  <Label htmlFor="staff">Assign Staff (Optional)</Label>
                  <Select value={formData.staffId} onValueChange={(value) => setFormData({ ...formData, staffId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingSubject ? "Update" : "Add"} Subject</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-base">{subject.name}</span>
                <span className="text-sm font-normal text-muted-foreground">{subject.code}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="font-medium">{getCourseName(subject.courseId)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Staff</p>
                <p className="font-medium">{getStaffName(subject.staffId)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(subject)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(subject.id)}>
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

export default SubjectManagement;
