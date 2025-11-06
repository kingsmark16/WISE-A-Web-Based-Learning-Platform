import { useFacultyCourseStudents } from "@/hooks/faculty/useFacultyCourseStudents";
import { useClearCourseSubmissions, useClearStudentSubmissions } from "@/hooks/faculty/useClearCourseSubmissions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, AlertCircle, Eye, Trash2, MoreVertical } from "lucide-react";
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
  const { mutate: clearSubmissions, isLoading: isClearing } = useClearCourseSubmissions();
  const { mutate: clearStudentSubmissions } = useClearStudentSubmissions();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearStudentConfirm, setShowClearStudentConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const handleViewQuizzes = (studentId, studentName) => {
    setSelectedStudent({ id: studentId, name: studentName });
    setIsModalOpen(true);
  };

  const handleClearSubmissions = () => {
    clearSubmissions(courseId);
    setShowClearConfirm(false);
  };

  const handleClearStudentSubmissions = () => {
    if (studentToDelete) {
      clearStudentSubmissions({ 
        courseId, 
        studentId: studentToDelete.id 
      });
      setShowClearStudentConfirm(false);
      setStudentToDelete(null);
    }
  };

  const openClearStudentDialog = (studentId, studentName) => {
    setStudentToDelete({ id: studentId, name: studentName });
    setShowClearStudentConfirm(true);
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
        
        {students.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            disabled={isClearing}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All Submissions</span>
          </Button>
        )}
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
                          onClick={() => openClearStudentDialog(student.id, student.fullName)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear Submissions
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

      {/* Clear All Submissions Confirmation Dialog */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Quiz Submissions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all quiz submissions for all {students.length} enrolled student{students.length !== 1 ? 's' : ''} in this course.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearSubmissions}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All Submissions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Student Submissions Confirmation Dialog */}
      <AlertDialog open={showClearStudentConfirm} onOpenChange={setShowClearStudentConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Student Quiz Submissions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all quiz submissions for <strong>{studentToDelete?.name}</strong> in this course.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStudentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearStudentSubmissions}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear Submissions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FacultyCourseStudents;
