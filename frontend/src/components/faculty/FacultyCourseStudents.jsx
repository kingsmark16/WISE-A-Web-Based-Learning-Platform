import { useFacultyCourseStudents, useRemoveStudentFromCourse } from "@/hooks/faculty/useFacultyCourseStudents";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, AlertCircle, Eye, MoreVertical, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import StudentQuizResultsModal from "@/components/faculty/StudentQuizResultsModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const FacultyCourseStudents = ({ courseId }) => {
  const { data: students, isLoading, error } = useFacultyCourseStudents(courseId);
  const removeStudentMutation = useRemoveStudentFromCourse();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const handleViewQuizzes = (studentId, studentName) => {
    setSelectedStudent({ id: studentId, name: studentName });
    setIsModalOpen(true);
  };

  const handleRemoveStudent = (studentId, studentName) => {
    setStudentToRemove({ id: studentId, name: studentName });
    setIsRemoveDialogOpen(true);
  };

  const confirmRemoveStudent = () => {
    if (studentToRemove) {
      removeStudentMutation.mutate({ courseId, studentId: studentToRemove.id });
      setIsRemoveDialogOpen(false);
      setStudentToRemove(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Student Name</TableHead>
                <TableHead className="w-[30%] text-center">Progress</TableHead>
                <TableHead className="w-[30%] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load students. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="p-8 md:p-12 text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-muted mb-4">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground mb-1">No students enrolled</p>
        <p className="text-sm text-muted-foreground">Students will appear here as they enroll</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Enrolled Students ({students.length})</h2>
        </div>
      </div>
        <div className="overflow-x-auto">
          <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[40%] font-semibold text-sm py-3 text-left text-foreground">Student Name</TableHead>
              <TableHead className="w-[30%] text-center font-semibold text-sm py-3 text-foreground">Progress</TableHead>
              <TableHead className="w-[30%] text-center font-semibold text-sm py-3 text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id} className="hover:bg-primary/5 transition-all duration-200 hover:shadow-sm">
                  <TableCell className="py-4 text-base text-left">
                    <p className="font-medium text-foreground">{student.fullName}</p>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center text-base font-bold text-primary">
                    {student.progress.percentage}%
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center mx-auto hover:bg-primary/10 h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewQuizzes(student.id, student.fullName)}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Quiz Results
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRemoveStudent(student.id, student.fullName)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove from Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                  No students enrolled
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Quiz Results Modal */}
      {selectedStudent && (
        <StudentQuizResultsModal
          courseId={courseId}
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {/* Remove Student Confirmation Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student from Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold">{studentToRemove?.name}</span> from this course? 
              This will remove their enrollment and all associated progress data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStudentToRemove(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveStudent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeStudentMutation.isPending}
            >
              {removeStudentMutation.isPending ? "Removing..." : "Remove Student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default FacultyCourseStudents;
