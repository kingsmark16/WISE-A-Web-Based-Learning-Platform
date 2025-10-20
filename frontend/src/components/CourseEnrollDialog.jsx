import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CourseEnrollDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  isLoading = false,
  courseName = "this course"
}) => {
  const [courseCode, setCourseCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate course code
    const trimmedCode = courseCode.trim();
    if (!trimmedCode) {
      setError("Please enter a course code");
      return;
    }

    if (trimmedCode.length < 3) {
      setError("Course code must be at least 3 characters");
      return;
    }

    onConfirm(trimmedCode);
  };

  const handleOpenChange = (newOpen) => {
    if (!isLoading) {
      if (!newOpen) {
        // Reset state when closing
        setCourseCode("");
        setError("");
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Enroll in Course</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-2">
            Please enter the course code provided by your instructor to enroll in{" "}
            <span className="font-semibold text-foreground">{courseName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="courseCode" className="text-sm font-medium">
                Course Code
              </Label>
              <Input
                id="courseCode"
                placeholder="Enter course code"
                value={courseCode}
                onChange={(e) => {
                  setCourseCode(e.target.value);
                  setError(""); // Clear error on input
                }}
                disabled={isLoading}
                className="col-span-3"
                autoComplete="off"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !courseCode.trim()}>
              {isLoading ? "Enrolling..." : "Enroll"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseEnrollDialog;
