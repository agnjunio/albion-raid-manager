import { ReactNode, useState } from "react";

import { faCheck, faEdit, faTimes, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InlineEditCardProps {
  title: string;
  icon: IconDefinition;
  canEdit: boolean;
  children: ReactNode;
  editContent: ReactNode;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

export function InlineEditCard({
  title,
  icon,
  canEdit,
  children,
  editContent,
  onSave,
  onCancel,
  isLoading = false,
  className = "",
}: InlineEditCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      await onSave();
      setIsEditing(false);
    } catch {
      // Error handling is done in the parent component
    }
  };

  const handleCancel = () => {
    onCancel();
    setIsEditing(false);
  };

  if (!canEdit) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <FontAwesomeIcon icon={icon} className="size-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <FontAwesomeIcon icon={icon} className="size-4" />
            Edit {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {editContent}
          <div className="flex justify-end gap-2">
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} disabled={isLoading}>
              <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`hover:bg-muted/30 group cursor-pointer transition-colors ${className}`}
      onClick={() => setIsEditing(true)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={icon} className="size-4" />
            {title}
          </div>
          <FontAwesomeIcon icon={faEdit} className="size-4 pr-2 opacity-0 transition-opacity group-hover:opacity-100" />
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
