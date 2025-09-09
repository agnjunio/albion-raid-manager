import { useState } from "react";

import { faCheck, faEdit, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface InlineEditFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSave: (newValue: string) => Promise<void>;
  onCancel: () => void;
  canEdit: boolean;
  isLoading?: boolean;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  emptyText?: string;
}

export function InlineEditField({
  value,
  onChange,
  onSave,
  onCancel,
  canEdit,
  isLoading = false,
  multiline = false,
  placeholder = "",
  className = "",
  displayClassName = "",
  emptyText = "",
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = async () => {
    const trimmedValue = editValue.trim();

    if (trimmedValue === value) {
      setIsEditing(false);
      return;
    }

    if (!trimmedValue && !multiline) {
      return;
    }

    onChange(trimmedValue);
    try {
      await onSave(trimmedValue);
      setIsEditing(false);
    } catch {
      setEditValue(value); // Reset to original value on error
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    onCancel();
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (multiline) {
      if (e.key === "Enter" && e.ctrlKey) {
        handleSave();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    } else {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    }
  };

  if (!canEdit) {
    if (!value) return null;
    return <span className={`${className} ${displayClassName}`}>{value || (multiline ? emptyText : "")}</span>;
  }

  if (isEditing) {
    const InputComponent = multiline ? Textarea : Input;

    return (
      <div className={cn(multiline ? "flex flex-col gap-2" : "flex items-center gap-2")}>
        <InputComponent
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={multiline ? "min-h-[130px]" : "flex-1"}
          placeholder={placeholder}
          autoFocus
          disabled={isLoading}
        />
        <div className="flex justify-between gap-2">
          {multiline && <p className="text-muted-foreground text-xs">Press Ctrl+Enter to save, Escape to cancel</p>}
          <div className="flex justify-end gap-2">
            <Button size="sm" onClick={handleSave} disabled={isLoading} className="h-8">
              <FontAwesomeIcon icon={faCheck} className="mr-1 h-3 w-3" />
              {multiline && "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} disabled={isLoading} className="h-8">
              <FontAwesomeIcon icon={faTimes} className="mr-1 h-3 w-3" />
              {multiline && "Cancel"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(`group cursor-pointer ${className}`)}
      onClick={() => {
        setEditValue(value);
        setIsEditing(true);
      }}
    >
      <div className="group-hover:bg-muted/50 flex items-center justify-between gap-2">
        {value ? (
          <pre className={`${displayClassName} rounded font-sans transition-colors ${multiline ? "block" : ""}`}>
            {value}
          </pre>
        ) : (
          <span
            className={`${displayClassName} text-muted-foreground rounded italic transition-colors ${multiline ? "block" : ""}`}
          >
            {emptyText || "Click to edit"}
          </span>
        )}
        <FontAwesomeIcon
          icon={faEdit}
          className="size-4 pr-2 font-sans opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
    </div>
  );
}
