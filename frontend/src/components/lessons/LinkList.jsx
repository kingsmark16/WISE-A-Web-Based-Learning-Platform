import SortableLink from "./SortableLink";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link as LinkIcon, ExternalLink } from "lucide-react";

const LinkList = ({
  links,
  onEditLink,
  onDeleteLink,
  editPending = false,
  isAdminView = false,
}) => {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h5 className="font-semibold text-sm md:text-base text-foreground flex items-center gap-2">
          External Links
        </h5>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            {links.length} link{links.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3 w-full overflow-hidden">
        {links.length === 0 ? (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="rounded-full bg-blue-100 p-4 mb-4">
                <LinkIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                No External Links Yet
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground max-w-sm">
                Add external resources, articles, or websites that complement your course content.
                Links will open in a new tab when clicked.
              </p>
            </CardContent>
          </Card>
        ) : (
          links.map((link, idx) => (
            <SortableLink
              key={link.id}
              link={link}
              index={idx}
              onEditLink={onEditLink}
              onDeleteLink={onDeleteLink}
              editPending={editPending}
              isAdminView={isAdminView}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LinkList;