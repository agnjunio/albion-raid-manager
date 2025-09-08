import type { Raid } from "@albion-raid-manager/types";

import { faStickyNote, faEdit, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface RaidNotesProps {
  raid: Raid;
  onUpdateNotes?: (notes: string) => void;
  className?: string;
}

export function RaidNotes({ raid, onUpdateNotes, className }: RaidNotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(raid.note || "");

  const handleSave = () => {
    if (onUpdateNotes) {
      onUpdateNotes(notes);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNotes(raid.note || "");
    setIsEditing(false);
  };

  if (!raid.note && !isEditing) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faStickyNote} className="h-5 w-5" />
            Raid Notes
          </CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <FontAwesomeIcon icon={faEdit} className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for this raid..."
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <FontAwesomeIcon icon={faTimes} className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{raid.note}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
