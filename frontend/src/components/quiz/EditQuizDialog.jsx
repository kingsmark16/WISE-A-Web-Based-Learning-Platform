import { useState, useEffect } from "react";
import { 
  Plus, 
  Loader2, 
  Trash2, 
  ChevronDown, 
  BookOpen, 
  Clock, 
  Target, 
  HelpCircle,
  CheckCircle2, 
  AlertCircle,
  FileText,
  ToggleLeft,
  ListChecks,
  RefreshCw
} from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { useUpdateQuiz } from "@/hooks/useQuizAPI";

const QUESTION_TYPES = [
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice", icon: ListChecks, color: "text-blue-500" },
  { value: "TRUE_FALSE", label: "True/False", icon: ToggleLeft, color: "text-green-500" },
  { value: "IDENTIFICATION", label: "Identification", icon: FileText, color: "text-purple-500" },
];

// Validate a single question and return errors
const validateQuestion = (question) => {
  const errors = [];
  
  if (!question.question?.trim()) {
    errors.push("Question text is required");
  }
  
  if (!question.correctAnswer) {
    errors.push("Correct answer is required");
  }
  
  if (question.type === "MULTIPLE_CHOICE") {
    const validOptions = (question.options || []).filter((o) => o.trim());
    if (validOptions.length < 2) {
      errors.push("At least 2 options required");
    }
    
    const duplicates = (question.options || []).filter((o) => o.trim()).some((o, idx, arr) => arr.indexOf(o) !== idx);
    if (duplicates) {
      errors.push("Duplicate options not allowed");
    }
    
    if (!validOptions.includes(question.correctAnswer)) {
      errors.push("Correct answer must be one of the options");
    }
  }
  
  return errors;
};

const QuestionBuilder = ({ question, onUpdate, onRemove, onExpand, isExpanded, questionNumber, isSubmitting }) => {
  const errors = validateQuestion(question);
  const hasErrors = errors.length > 0;
  const questionType = QUESTION_TYPES.find(t => t.value === question.type);
  const TypeIcon = questionType?.icon || HelpCircle;
  
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

  const setCorrectAnswer = (answer) => {
    onUpdate({ ...question, correctAnswer: answer });
  };

  return (
    <Card className={`group relative overflow-hidden rounded-xl border-2 bg-card transition-all duration-300 ${
      hasErrors 
        ? 'border-destructive/40 bg-destructive/5 shadow-destructive/10' 
        : isExpanded 
          ? 'border-primary/40 shadow-lg shadow-primary/10' 
          : 'border-border/60 hover:border-primary/30 hover:shadow-md'
    }`}>
      {/* Collapsed Header */}
      <div 
        className="flex items-center gap-3 p-3 sm:p-4 cursor-pointer select-none"
        onClick={() => onExpand(question.id)}
      >
        {/* Drag Handle & Number */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm transition-colors ${
            hasErrors 
              ? 'bg-destructive/10 text-destructive' 
              : 'bg-primary/10 text-primary'
          }`}>
            {questionNumber}
          </div>
        </div>

        {/* Question Preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <TypeIcon className={`h-4 w-4 flex-shrink-0 ${questionType?.color || 'text-muted-foreground'}`} />
            <span className="text-xs font-medium text-muted-foreground">
              {questionType?.label || "Select type"}
            </span>
            {question.points > 1 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {question.points} pts
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium truncate text-foreground/90">
            {question.question || "Click to add question..."}
          </p>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasErrors ? (
            <div className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs hidden sm:inline">{errors.length} issue{errors.length > 1 ? 's' : ''}</span>
            </div>
          ) : question.question && question.correctAnswer ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : null}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            disabled={isSubmitting}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border/50" onClick={(e) => e.stopPropagation()}>
          {/* Error Alert */}
          {hasErrors && (
            <div className="px-4 pt-4">
              <Alert className="border-destructive/30 bg-destructive/5">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive text-sm">
                  {errors.map((error, idx) => (
                    <span key={idx} className="block">{error}</span>
                  ))}
                </AlertDescription>
              </Alert>
            </div>
          )}

          <CardContent className="p-4 space-y-5">
            {/* Question Text */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                Question Text
              </Label>
              <Textarea
                value={question.question || ""}
                onChange={(e) => onUpdate({ ...question, question: e.target.value })}
                placeholder="Type your question here..."
                disabled={isSubmitting}
                className="min-h-[80px] resize-none text-sm border-border/60 focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Type & Points Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Question Type</Label>
                <Select 
                  value={question.type || ""} 
                  onValueChange={(val) => {
                    const updates = { ...question, type: val };
                    if (val === "TRUE_FALSE") {
                      updates.options = [];
                      updates.correctAnswer = "";
                    } else if (val === "MULTIPLE_CHOICE" && (!question.options || question.options.length < 2)) {
                      updates.options = ["", "", ""];
                    }
                    onUpdate(updates);
                  }} 
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-10 border-border/60">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((t) => {
                      const Icon = t.icon;
                      return (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${t.color}`} />
                            {t.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  Points
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={question.points || 1}
                  onChange={(e) => onUpdate({ ...question, points: Math.max(1, Math.min(100, parseInt(e.target.value) || 1)) })}
                  disabled={isSubmitting}
                  className="h-10 border-border/60"
                />
              </div>
            </div>

            {/* Multiple Choice Options */}
            {question.type === "MULTIPLE_CHOICE" && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                  Answer Options
                  <span className="text-xs text-muted-foreground font-normal">(Click to set correct answer)</span>
                </Label>
                
                <div className="space-y-2">
                  {(question.options || []).map((opt, idx) => {
                    const isCorrect = opt.trim() && opt.trim() === question.correctAnswer?.trim();
                    const isDuplicate = opt.trim() && (question.options || []).filter((o) => o.trim() === opt.trim()).length > 1;
                    
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => opt.trim() && setCorrectAnswer(opt)}
                          disabled={!opt.trim() || isSubmitting}
                          className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCorrect 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-border/60 hover:border-primary/50 text-muted-foreground hover:text-primary'
                          } ${!opt.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {isCorrect ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-semibold">{String.fromCharCode(65 + idx)}</span>
                          )}
                        </button>
                        
                        <Input
                          value={opt}
                          onChange={(e) => handleOptionUpdate(idx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          disabled={isSubmitting}
                          className={`flex-1 h-10 transition-colors ${
                            isDuplicate ? 'border-destructive/50 bg-destructive/5' : 
                            isCorrect ? 'border-green-500/50 bg-green-50 dark:bg-green-950/20' : 
                            'border-border/60'
                          }`}
                        />
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOptionRemove(idx)}
                          disabled={(question.options || []).length <= 2 || isSubmitting}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {(question.options || []).length < 6 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOptionAdd}
                    disabled={isSubmitting}
                    className="w-full border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>
            )}

            {/* True/False Options */}
            {question.type === "TRUE_FALSE" && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Select Correct Answer</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'true', label: 'True', color: 'green' },
                    { value: 'false', label: 'False', color: 'red' }
                  ].map(({ value, label, color }) => {
                    const isSelected = question.correctAnswer === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCorrectAnswer(value)}
                        disabled={isSubmitting}
                        className={`p-4 rounded-xl border-2 font-semibold text-lg transition-all ${
                          isSelected 
                            ? color === 'green'
                              ? 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
                              : 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
                            : 'border-border/60 hover:border-primary/30 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-5 w-5 mx-auto mb-1" />}
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Identification Answer */}
            {question.type === "IDENTIFICATION" && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Correct Answer
                </Label>
                <Input
                  value={question.correctAnswer || ""}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="Type the correct answer..."
                  disabled={isSubmitting}
                  className="h-10 border-border/60"
                />
                <p className="text-xs text-muted-foreground">
                  Student answers will be compared to this (case-insensitive)
                </p>
              </div>
            )}
          </CardContent>
        </div>
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

              {/* Quiz Limits */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold text-sm">Quiz Limits</h4>
                </div>
                
                <div className="space-y-4 pl-6">
                  {/* Time Limit */}
                  <div className="space-y-2">
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
                      className="h-10 border-border/60"
                    />
                    <p className="text-xs text-muted-foreground">
                      {timeLimit ? `${timeLimit} minute${timeLimit !== '1' ? 's' : ''} (${timeLimit * 60} seconds)` : "No time limit"}
                    </p>
                  </div>

                  {/* Attempt Limit */}
                  <div className="space-y-2">
                    <Label htmlFor="attempt-limit" className="text-sm font-medium flex items-center gap-2">
                      <RefreshCw className="h-3 w-3 text-muted-foreground" />
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
                      className="h-10 border-border/60"
                    />
                    <p className="text-xs text-muted-foreground">
                      {attemptLimit ? `${attemptLimit} attempt(s) allowed` : "Unlimited attempts"}
                    </p>
                  </div>
                </div>
              </div>
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
                            isSubmitting={isSubmitting}
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
                    <div className="space-y-2 text-xs">
                      {QUESTION_TYPES.map((type) => {
                        const count = questions.filter((q) => q.type === type.value).length;
                        const Icon = type.icon;
                        return (
                          <div key={type.value} className="flex items-center justify-between text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Icon className={`h-3 w-3 ${type.color}`} />
                              <span>{type.label}</span>
                            </div>
                            <Badge variant={count > 0 ? "default" : "secondary"} className="text-xs px-1.5 py-0 h-5">
                              {count}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-sm mb-3">Validation Status</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        {title.trim() ? (
                          <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 bg-green-500 flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 bg-red-500 flex items-center justify-center">
                            <AlertCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <span className="text-muted-foreground">{title.trim() ? 'Title provided' : 'Title required'}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        {questions.length >= 5 ? (
                          <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 bg-green-500 flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 bg-red-500 flex items-center justify-center">
                            <AlertCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <span className="text-muted-foreground">{questions.length >= 5 ? `${questions.length} question(s)` : `At least 5 questions (${questions.length}/5)`}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        {questions.every((q) => q.question && q.correctAnswer) ? (
                          <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 bg-green-500 flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 bg-red-500 flex items-center justify-center">
                            <AlertCircle className="h-3 w-3 text-white" />
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
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded mt-0.5 flex-shrink-0 bg-red-500 flex items-center justify-center">
                            <AlertCircle className="h-3 w-3 text-white" />
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
