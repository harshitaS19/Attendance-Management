import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getStaff, saveToStorage, type Staff } from "@/lib/storage";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const StaffManagement = () => {
  const [staff, setStaff] = useState<Staff[]>(getStaff());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStaff) {
      const updated = staff.map(s => 
        s.id === editingStaff.id ? { ...s, ...formData } : s
      );
      setStaff(updated);
      saveToStorage('staff', updated);
      toast.success("Staff updated successfully");
    } else {
      const newStaff: Staff = {
        id: Date.now().toString(),
        ...formData,
        assignedSubjects: []
      };
      const updated = [...staff, newStaff];
      setStaff(updated);
      saveToStorage('staff', updated);
      toast.success("Staff added successfully");
    }
    
    setIsDialogOpen(false);
    setEditingStaff(null);
    setFormData({ name: "", email: "" });
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({ name: staff.name, email: staff.email });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = staff.filter(s => s.id !== id);
    setStaff(updated);
    saveToStorage('staff', updated);
    toast.success("Staff deleted successfully");
  };

  const handleAddNew = () => {
    setEditingStaff(null);
    setFormData({ name: "", email: "" });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Staff Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStaff ? "Edit Staff" : "Add New Staff"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Staff Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Dr. John Smith"
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
                    placeholder="e.g., john@example.com"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingStaff ? "Update" : "Add"} Staff</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <CardTitle className="text-base">{member.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{member.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned Subjects</p>
                <p className="font-medium">{member.assignedSubjects.length}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(member)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(member.id)}>
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

export default StaffManagement;
