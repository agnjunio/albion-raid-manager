import { useState } from "react";

import { faEdit, faSave, faStickyNote, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { useRaidContext } from "../contexts/raid-context";

interface RaidNotesProps {
  className?: string;
}

export function RaidNotes({ className }: RaidNotesProps) {
  const { raid, handleUpdateRaidNotes } = useRaidContext();
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(raid.note || "");

  const handleSave = () => {
    handleUpdateRaidNotes(notes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNotes(raid.note || "");
    setIsEditing(false);
  };

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
        ) : raid.note ? (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{raid.note}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-muted mb-4 rounded-full p-4">
              <FontAwesomeIcon icon={faStickyNote} className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-muted-foreground mb-2 text-lg font-semibold">No notes yet</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Add notes to keep track of important information about this raid.
            </p>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <FontAwesomeIcon icon={faEdit} className="mr-2 h-4 w-4" />
              Add Notes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
