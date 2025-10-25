import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2, ChevronDown, ChevronUp, BookOpen, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "react-toastify";
import { useUpdateQuiz } from "@/hooks/useQuizAPI";

const QUESTION_TYPES = [
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "TRUE_FALSE", label: "True/False" },
  { value: "ENUMERATION", label: "Enumeration" },
];

const QuestionBuilder = ({ question, onUpdate, onRemove, onExpand, isExpanded, questionNumber }) => {
  const handleOptionAdd = () => {
    const newOptions = [...(question.options || []), ""];
    onUpdate({ ...question, options: newOptions });
  };

  const handleOptionUpdate = (idx, value) => {
    const newOptions = [...question.options];
    newOptions[idx] = value;
    onUpdate({ ...question, options: newOptions });
  };

  const handleOptionRemove = (idx) => {
    const newOptions = question.options.filter((_, i) => i !== idx);
    onUpdate({ ...question, options: newOptions });
  };

  return (
    <Card className="relative rounded-lg border-2 bg-card shadow-sm hover:shadow-lg border-input transition-all duration-200 hover:border-primary/30 cursor-pointer" onClick={() => onExpand(question.id)}>
      <div className="flex items-center justify-between px-3">
        <div className="flex-1">
          <p className="font-semibold text-sm">
            <span className="text-muted-foreground mr-2">{questionNumber}.</span>
            {question.question || "Untitled Question"}
          </p>
          <p className="text-xs text-muted-foreground">{question.type || "No type selected"}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {isExpanded && (
        <>
          <Separator />
          <CardContent className="" onClick={(e) => e.stopPropagation()}>
            <div className="grid gap-4">
              {/* Question Text */}
              <div className="grid gap-1">
                <Label htmlFor={`q-text-${question.id}`} className="text-sm font-medium">
                  Question
                </Label>
                <Textarea
                  id={`q-text-${question.id}`}
                  value={question.question || ""}
                  onChange={(e) => onUpdate({ ...question, question: e.target.value })}
                  placeholder="Enter your question here"
                  className="min-h-20 resize-none border-border/80"
                />
              </div>

              {/* Question Type */}
              <div className="grid gap-1">
                <Label htmlFor={`q-type-${question.id}`} className="text-sm font-medium">
                  Question Type
                </Label>
                <Select value={question.type || ""} onValueChange={(val) => onUpdate({ ...question, type: val })}>
                  <SelectTrigger id={`q-type-${question.id}`} className="border-border/80">
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Points */}
              <div className="grid gap-1">
                <Label htmlFor={`q-points-${question.id}`} className="text-sm font-medium">
                  Points
                </Label>
                <Input
                  id={`q-points-${question.id}`}
                  type="number"
                  min="1"
                  value={question.points || 1}
                  onChange={(e) => onUpdate({ ...question, points: Math.max(1, parseInt(e.target.value) || 1) })}
                  placeholder="1"
                  className="border-border/80"
                />
              </div>

              {/* Options */}
              {question.type === "MULTIPLE_CHOICE" && (
                <div className="grid gap-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    Options <span className="text-destructive">*</span>
                  </Label>
                  <div className="space-y-2">
                    {(question.options || []).map((opt, idx) => {
                      const isDuplicate = opt.trim() && (question.options || []).filter((o) => o.trim() === opt.trim()).length > 1;
                      const isCorrectAnswer = opt.trim() === question.correctAnswer;
                      return (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={opt}
                            onChange={(e) => handleOptionUpdate(idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                            className={`flex-1 border-border/80 ${isDuplicate ? 'border-destructive/50 bg-destructive/5' : ''} ${isCorrectAnswer ? 'border-green-500/50 bg-green-500/5' : ''}`}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOptionRemove(idx)}
                            disabled={(question.options || []).length <= 2}
                            className="text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  {(question.options || []).length < 4 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOptionAdd}
                      className="w-full border-border/80"
                    >
                      <Plus className="h-3 w-3 mr-2" />
                      Add Option
                    </Button>
                  )}
                  <div className="text-xs space-y-1">
                    {(question.options || []).length < 2 && (
                      <p className="text-destructive">Minimum 2 options required</p>
                    )}
                    {(question.options || []).some((opt) => opt.trim() && (question.options || []).filter((o) => o.trim() === opt.trim()).length > 1) && (
                      <p className="text-destructive">Duplicate options are not allowed</p>
                    )}
                    {!question.correctAnswer ? (
                      <p className="text-destructive">Correct answer is required</p>
                    ) : !(question.options || []).includes(question.correctAnswer) ? (
                      <p className="text-destructive">Correct answer must be one of the options</p>
                    ) : (question.options || []).filter((o) => o.trim() === question.correctAnswer.trim()).length > 1 ? (
                      <p className="text-destructive">Correct answer appears multiple times in options</p>
                    ) : (
                      <p className="text-green-600">Valid configuration</p>
                    )}
                  </div>
                </div>
              )}

              {/* Correct Answer */}
              <div className="grid gap-1">
                <Label htmlFor={`q-answer-${question.id}`} className="text-sm font-medium">
                  Correct Answer
                </Label>
                {question.type === "TRUE_FALSE" ? (
                  <Select value={question.correctAnswer || ""} onValueChange={(val) => onUpdate({ ...question, correctAnswer: val })}>
                    <SelectTrigger id={`q-answer-${question.id}`} className="border-border/80">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`q-answer-${question.id}`}
                    value={question.correctAnswer || ""}
                    onChange={(e) => onUpdate({ ...question, correctAnswer: e.target.value })}
                    placeholder="Enter the correct answer"
                    className="border-border/80"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export const EditQuizDialog = ({ quiz, onSuccess, trigger }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [attemptLimit, setAttemptLimit] = useState("");
  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  
  const updateQuizMutation = useUpdateQuiz();
  const isSubmitting = updateQuizMutation.isPending;

  // Check if questions have changed
  const questionsHaveChanged = (() => {
    if (questions.length !== originalQuestions.length) return true;
    return questions.some((newQ, idx) => {
      const oldQ = originalQuestions[idx];
      if (!oldQ) return true;
      return (
        newQ.question !== oldQ.question ||
        newQ.type !== oldQ.type ||
        JSON.stringify(newQ.options) !== JSON.stringify(oldQ.options) ||
        newQ.correctAnswer !== oldQ.correctAnswer ||
        (newQ.points ?? 1) !== (oldQ.points ?? 1)
      );
    });
  })();

  // Initialize form with quiz data
  useEffect(() => {
    if (quiz && open) {
      setTitle(quiz.title || "");
      setDescription(quiz.description || "");
      setTimeLimit(quiz.timeLimit ? Math.floor(quiz.timeLimit / 60) : "");
      setAttemptLimit(quiz.attemptLimit || "");
      setQuestions(quiz.questions || []);
      setOriginalQuestions(quiz.questions || []);
      setExpandedQuestionId(null);
    }
  }, [quiz, open]);

  const handleExpandQuestion = (questionId) => {
    setExpandedQuestionId(expandedQuestionId === questionId ? null : questionId);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: `q-${Date.now()}`,
      question: "",
      type: "MULTIPLE_CHOICE",
      options: ["", "", ""],
      correctAnswer: "",
      points: 1,
      position: questions.length + 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (id, updated) => {
    setQuestions(questions.map((q) => (q.id === id ? updated : q)));
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const validateForm = () => {
    if (!title.trim()) {
      const msg = "Quiz title is required";
      toast.error(msg);
      return false;
    }
    if (questions.length < 5) {
      const msg = "Add at least 5 questions";
      toast.error(msg);
      return false;
    }

    for (const q of questions) {
      if (!q.question.trim()) {
        const msg = "All questions must have text";
        toast.error(msg);
        return false;
      }
      if (!q.correctAnswer) {
        const msg = "All questions must have a correct answer";
        toast.error(msg);
        return false;
      }
      
      // Validation for MULTIPLE_CHOICE
      if (q.type === "MULTIPLE_CHOICE") {
        const validOptions = (q.options || []).filter((o) => o.trim());
        if (validOptions.length < 2) {
          const msg = `Multiple Choice questions must have at least 2 options`;
          toast.error(msg);
          return false;
        }
        // Check for duplicate options
        const uniqueOptions = new Set(validOptions.map(o => o.trim().toLowerCase()));
        if (uniqueOptions.size !== validOptions.length) {
          const msg = `Duplicate options are not allowed`;
          toast.error(msg);
          return false;
        }
        if (!validOptions.includes(q.correctAnswer)) {
          const msg = `The correct answer must be one of the options`;
          toast.error(msg);
          return false;
        }
        // Check if correct answer appears multiple times
        const correctAnswerCount = validOptions.filter((o) => o.trim() === q.correctAnswer.trim()).length;
        if (correctAnswerCount > 1) {
          const msg = `The correct answer appears multiple times in the options`;
          toast.error(msg);
          return false;
        }
      }
      
      // Validation for TRUE_FALSE
      if (q.type === "TRUE_FALSE") {
        if (!["true", "false"].includes(q.correctAnswer)) {
          const msg = `True/False questions must have a valid correct answer (true or false)`;
          toast.error(msg);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      quizId: quiz.id,
      title: title.trim(),
      description: description.trim() || null,
      timeLimit: timeLimit ? parseInt(timeLimit) * 60 : null,
      attemptLimit: attemptLimit ? parseInt(attemptLimit) : null,
      questions: questions.map((q, idx) => ({
        question: q.question,
        type: q.type,
        options: q.type === "TRUE_FALSE" ? [] : q.options.filter((o) => o.trim()),
        correctAnswer: q.correctAnswer,
        points: q.points,
        position: idx + 1,
      })),
    };

    updateQuizMutation.mutate(payload, {
      onSuccess: (response) => {
        toast.success("Quiz updated successfully!");
        setOpen(false);
        onSuccess?.(response.quiz);
      },
      onError: (err) => {
        const errorMessage = err.response?.data?.message || err.message || "Failed to update quiz";
        toast.error(errorMessage);
      },
    });
  };

  const handleOpenChange = (newOpen) => {
    if (newOpen && quiz?.isPublished) {
      toast.warning("You must unpublish the quiz before editing", {
        autoClose: 3000,
        pauseOnHover: true,
      });
      return;
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="!max-w-[calc(100vw-2rem)] sm:!max-w-[90vw] w-full max-h-[90vh] overflow-hidden border-2 border-border flex flex-col">
        <DialogHeader className="border-b pb-4 flex-shrink-0">
          <DialogTitle className="text-lg font-bold">Edit Quiz</DialogTitle>
          <DialogDescription className="text-sm mt-1">
            Update quiz settings and questions
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-6">
          {/* Settings Section */}
          <div className="w-80 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-muted-foreground scrollbar-track-transparent hover:scrollbar-thumb-muted border-r flex-shrink-0">
            <form className="space-y-6 p-6">
              {/* Title */}
              <div className="grid gap-3">
                <Label htmlFor="quiz-title" className="text-sm font-semibold flex items-center gap-2">
                  Quiz Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quiz-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 200))}
                  placeholder="e.g., Chapter 1 Assessment"
                  required
                  disabled={isSubmitting}
                  maxLength={200}
                  className="h-11"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {title.length}/200 characters
                </div>
              </div>

              {/* Description */}
              <div className="grid gap-3">
                <Label htmlFor="quiz-desc" className="text-sm font-semibold">
                  Description <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Textarea
                  id="quiz-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  placeholder="Add instructions or context for students..."
                  disabled={isSubmitting}
                  maxLength={500}
                  className="min-h-24 resize-none"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {description.length}/500 characters
                </div>
              </div>

              <Separator />

              {/* Limits Card */}
              <Card className="bg-muted/50 border-0">
                <CardHeader>
                  <CardTitle className="text-base">Quiz Limits</CardTitle>
                  <CardDescription>Configure time and attempt restrictions</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                  {/* Time Limit */}
                  <div className="grid gap-3">
                    <Label htmlFor="time-limit" className="text-sm font-medium">
                      Time Limit <span className="text-xs text-muted-foreground font-normal">(minutes)</span>
                    </Label>
                    <Input
                      id="time-limit"
                      type="number"
                      min="0"
                      placeholder="Leave empty for unlimited"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.value)}
                      disabled={isSubmitting}
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      {timeLimit ? `${timeLimit} minute${timeLimit !== '1' ? 's' : ''} (${timeLimit * 60} seconds)` : "No time limit"}
                    </p>
                  </div>

                  {/* Attempt Limit */}
                  <div className="grid gap-3">
                    <Label htmlFor="attempt-limit" className="text-sm font-medium">
                      Attempt Limit
                    </Label>
                    <Input
                      id="attempt-limit"
                      type="number"
                      min="1"
                      placeholder="Leave empty for unlimited"
                      value={attemptLimit}
                      onChange={(e) => setAttemptLimit(e.target.value)}
                      disabled={isSubmitting}
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      {attemptLimit ? `${attemptLimit} attempt(s) allowed` : "Unlimited attempts"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Questions Section */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <h3 className="font-semibold text-base mb-3 flex-shrink-0">Questions</h3>

            {/* Questions Layout with Preview */}
            <div className="flex-1 overflow-hidden flex gap-4">
              {/* Questions List - Left Side */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Questions Header with Add Button - Aligned with questions container */}
                <div className="flex items-center justify-between gap-4 mb-3 flex-shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {questions.length === 0 ? "No questions yet" : `${questions.length} question${questions.length !== 1 ? 's' : ''} added`}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddQuestion}
                    disabled={isSubmitting}
                    className="gap-2 flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    Add Question
                  </Button>
                </div>

                {/* Questions List Scroll Area */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-muted-foreground scrollbar-track-transparent hover:scrollbar-thumb-muted pr-2">
                  {questions.length > 0 ? (
                    <div className="space-y-2">
                      {questions.map((q, index) => (
                        <div key={q.id}>
                          <QuestionBuilder
                            question={q}
                            onUpdate={(updated) => handleUpdateQuestion(q.id, updated)}
                            onRemove={() => handleRemoveQuestion(q.id)}
                            onExpand={handleExpandQuestion}
                            isExpanded={expandedQuestionId === q.id}
                            questionNumber={index + 1}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          No questions yet
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Click "Add Question" to add questions to your quiz
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddQuestion}
                          disabled={isSubmitting}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Your First Question
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Questions Summary - Right Side */}
              <div className="w-56 border rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-muted-foreground scrollbar-track-transparent hover:scrollbar-thumb-muted flex-shrink-0">
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Quiz Summary</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Questions:</span>
                        <span className="font-medium">{questions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Points:</span>
                        <span className="font-medium">{questions.reduce((sum, q) => sum + (q.points || 1), 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time Limit:</span>
                        <span className="font-medium">{timeLimit ? `${timeLimit} min` : "Unlimited"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Attempts:</span>
                        <span className="font-medium">{attemptLimit ? attemptLimit : "Unlimited"}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-sm mb-3">Question Types</h4>
                    <div className="space-y-1 text-xs">
                      {QUESTION_TYPES.map((type) => {
                        const count = questions.filter((q) => q.type === type.value).length;
                        return count > 0 ? (
                          <div key={type.value} className="flex justify-between text-muted-foreground">
                            <span>{type.label}:</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ) : null;
                      })}
                      {questions.every((q) => !q.type) && (
                        <p className="text-muted-foreground italic">No question types assigned yet</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-sm mb-3">Validation Status</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        {title.trim() ? (
                          <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 bg-green-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 bg-red-500 flex items-center justify-center">
                            <X className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <span className="text-muted-foreground">{title.trim() ? 'Title provided' : 'Title required'}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        {questions.length >= 5 ? (
                          <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 bg-green-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 bg-red-500 flex items-center justify-center">
                            <X className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <span className="text-muted-foreground">{questions.length >= 5 ? `${questions.length} question(s)` : `At least 5 questions (${questions.length}/5)`}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        {questions.every((q) => q.question && q.correctAnswer) ? (
                          <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 bg-green-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 bg-red-500 flex items-center justify-center">
                            <X className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <span className="text-muted-foreground">All questions complete</span>
                      </div>
                      <div className="flex items-start gap-2">
                        {questions.every((q) => {
                          if (q.type === "MULTIPLE_CHOICE") {
                            const validOpts = (q.options || []).filter(o => o.trim());
                            return validOpts.length >= 2 && validOpts.includes(q.correctAnswer);
                          }
                          if (q.type === "TRUE_FALSE") {
                            return ["true", "false"].includes(q.correctAnswer);
                          }
                          return q.type !== "" && q.correctAnswer;
                        }) ? (
                          <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 bg-green-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 bg-red-500 flex items-center justify-center">
                            <X className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <span className="text-muted-foreground">All validations pass</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <DialogFooter className="border-t px-6 py-3 flex flex-shrink-0 mt-auto">
          <div className="w-full flex items-center justify-between">
            {questionsHaveChanged && (
              <Alert variant="destructive" className="flex-1 mr-4 py-2 px-3 h-auto">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription className="text-sm whitespace-nowrap">
                  <p><strong>Warning:</strong> Modifying questions will delete all student submissions.</p>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2 ml-auto">
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || questions.length < 5}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Update Quiz
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                className="hover:bg-muted/50 transition-colors duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuizDialog;
