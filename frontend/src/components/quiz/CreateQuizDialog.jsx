import { useState } from "react";
import { 
  Plus, 
  Loader2, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Clock, 
  Target, 
  HelpCircle,
  GripVertical,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  ToggleLeft,
  ListChecks
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
import { useCreateQuiz } from "@/hooks/useQuizAPI";

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

export const CreateQuizDialog = ({ moduleId, onSuccess, trigger }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [attemptLimit, setAttemptLimit] = useState("");
  const [questions, setQuestions] = useState([]);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  
  const createQuizMutation = useCreateQuiz();
  const isSubmitting = createQuizMutation.isPending;

  const handleExpandQuestion = (questionId) => {
    setExpandedQuestionId(expandedQuestionId === questionId ? null : questionId);
  };

  const handleResetForm = () => {
    setTitle("");
    setDescription("");
    setTimeLimit("");
    setAttemptLimit("");
    setQuestions([]);
    setExpandedQuestionId(null);
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
      moduleId,
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

    createQuizMutation.mutate(payload, {
      onSuccess: (response) => {
        toast.success("Quiz created successfully!");
        
        // Reset form
        setTitle("");
        setDescription("");
        setTimeLimit("");
        setAttemptLimit("");
        setQuestions([]);
        setOpen(false);
        
        onSuccess?.(response.quiz);
      },
      onError: (err) => {
        const errorMessage = err.response?.data?.message || err.message || "Failed to create quiz";
        toast.error(errorMessage);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm" className="gap-2 shadow-sm hover:shadow-md transition-shadow">
            <Sparkles className="h-4 w-4" />
            Create Quiz
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="!max-w-[calc(100vw-1rem)] sm:!max-w-[calc(100vw-2rem)] lg:!max-w-5xl w-full h-[90vh] sm:h-[90vh] overflow-hidden border shadow-2xl flex flex-col p-0 bg-background" showCloseButton={false}>
        {/* Header */}
        <DialogHeader className="border-b bg-card pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold">Create New Quiz</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-0.5">
                Build an interactive quiz for your students
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-0 min-h-0">
          {/* Desktop Settings Panel - Left Sidebar */}
          <div className="hidden lg:flex flex-col w-80 border-r border-border bg-muted/30 flex-shrink-0 min-h-0 overflow-y-auto">
            <div className="p-5 space-y-6">
              {/* Quiz Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  Quiz Details
                </div>
                
                {/* Title */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Quiz Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 200))}
                    placeholder="e.g., Chapter 1 Review"
                    disabled={isSubmitting}
                    maxLength={200}
                    className="h-10 border-border bg-background"
                  />
                  <div className="text-xs text-muted-foreground text-right">{title.length}/200</div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Instructions <span className="text-xs font-normal">(Optional)</span>
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                    placeholder="Add any instructions for students..."
                    disabled={isSubmitting}
                    maxLength={500}
                    className="min-h-[80px] resize-none text-sm border-border bg-background"
                  />
                  <div className="text-xs text-muted-foreground text-right">{description.length}/500</div>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Quiz Settings
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Time Limit */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Time Limit</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        placeholder="∞"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(e.target.value)}
                        disabled={isSubmitting}
                        className="h-10 pr-12 border-border bg-background"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">min</span>
                    </div>
                  </div>

                  {/* Attempt Limit */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Attempts</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="∞"
                      value={attemptLimit}
                      onChange={(e) => setAttemptLimit(e.target.value)}
                      disabled={isSubmitting}
                      className="h-10 border-border bg-background"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Summary Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  Summary
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-2xl font-bold text-primary">{questions.length}</p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-center">
                    <p className="text-2xl font-bold text-green-600">{questions.reduce((sum, q) => sum + (q.points || 1), 0)}</p>
                    <p className="text-xs text-muted-foreground">Total Points</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Time
                    </span>
                    <span className="font-medium">{timeLimit ? `${timeLimit} min` : "Unlimited"}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Target className="h-3 w-3" /> Attempts
                    </span>
                    <span className="font-medium">{attemptLimit || "Unlimited"}</span>
                  </div>
                </div>

                {questions.length < 5 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Add {5 - questions.length} more question{5 - questions.length > 1 ? 's' : ''} to create quiz
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Settings Panel */}
          <div className="lg:hidden border-b border-border bg-muted/30 flex-shrink-0">
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 200))}
                    placeholder="Quiz name"
                    disabled={isSubmitting}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Time (min)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="∞"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Attempts</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="∞"
                    value={attemptLimit}
                    onChange={(e) => setAttemptLimit(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              
              {/* Mobile Summary */}
              <div className="flex items-center gap-4 text-xs">
                <Badge variant="outline" className="gap-1">
                  <BookOpen className="h-3 w-3" />
                  {questions.length}/5 Questions
                </Badge>
                <Badge variant="outline" className="gap-1 text-green-600 border-green-500/30">
                  <Target className="h-3 w-3" />
                  {questions.reduce((sum, q) => sum + (q.points || 1), 0)} pts
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Questions Area */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {/* Questions Header */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-muted/50 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Questions</h3>
                <Badge variant="secondary" className="text-xs">
                  {questions.length} / 5 min
                </Badge>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleAddQuestion}
                disabled={isSubmitting}
                className="gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Question</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4">
              {questions.length > 0 ? (
                <div className="space-y-3 pb-4">
                  {questions.map((q, index) => (
                    <QuestionBuilder
                      key={q.id}
                      question={q}
                      onUpdate={(updated) => handleUpdateQuestion(q.id, updated)}
                      onRemove={() => handleRemoveQuestion(q.id)}
                      onExpand={handleExpandQuestion}
                      isExpanded={expandedQuestionId === q.id}
                      questionNumber={index + 1}
                      isSubmitting={isSubmitting}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">No questions yet</h4>
                  <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                    Start building your quiz by adding at least 5 questions
                  </p>
                  <Button
                    type="button"
                    onClick={handleAddQuestion}
                    disabled={isSubmitting}
                    className="gap-2 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Question
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t bg-card px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || questions.length < 5}
              className="gap-2 shadow-sm hover:shadow-md transition-all order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create Quiz
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuizDialog;
