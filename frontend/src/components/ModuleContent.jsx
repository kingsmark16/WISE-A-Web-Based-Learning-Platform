import { BookOpen, ChevronRight, ExternalLink } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
//import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ModuleContent = () => {

    //const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-lg">Modules</h4>
        </div>
        <Button
          variant="outline"
          size="sm"
          //onClick={() => navigate(`/admin/courses/${course.id}/content`)}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Add/Edit Modules
        </Button>
      </div>
      <div className="grid gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium">Module 1: Introduction</h5>
              <p className="text-sm text-muted-foreground">
                Getting started with the basics
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium">Module 2: Advanced Topics</h5>
              <p className="text-sm text-muted-foreground">
                Deep dive into complex concepts
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ModuleContent