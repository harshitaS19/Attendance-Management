import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getCourses, saveToStorage, type Course } from "@/lib/storage";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>(getCourses());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCourse) {
      const updated = courses.map(c => 
        c.id === editingCourse.id ? { ...c, ...formData } : c
      );
      setCourses(updated);
      saveToStorage('courses', updated);
      toast.success("Course updated successfully");
    } else {
      const newCourse: Course = {
        id: Date.now().toString(),
        ...formData
      };
      const updated = [...courses, newCourse];
      setCourses(updated);
      saveToStorage('courses', updated);
      toast.success("Course added successfully");
    }
    
    setIsDialogOpen(false);
    setEditingCourse(null);
    setFormData({ name: "", code: "" });
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({ name: course.name, code: course.code });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    saveToStorage('courses', updated);
    toast.success("Course deleted successfully");
  };

  const handleAddNew = () => {
    setEditingCourse(null);
    setFormData({ name: "", code: "" });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Information Technology"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Course Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., IT"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingCourse ? "Update" : "Add"} Course</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{course.name}</span>
                <span className="text-sm font-normal text-muted-foreground">{course.code}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(course)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(course.id)}>
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

export default CourseManagement;
