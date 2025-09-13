import { useRef, useState } from "react";

import { faFileImport } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "sonner";

import { useRaidContext } from "../contexts/raid-context";
import { canImportToRaid, validateRaidConfiguration } from "../utils/raid-export-import";

interface RaidImportDragDropProps {
  disabled?: boolean;
}

export function RaidImportDragDrop({ disabled = false }: RaidImportDragDropProps) {
  const { raid, handleImportRaidConfiguration } = useRaidContext();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (file: File) => {
    if (!file) return;

    setIsImporting(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const validation = validateRaidConfiguration(data);
      if (!validation.isValid) {
        toast.error("Invalid configuration file", {
          description: validation.error || "The file format is not valid.",
        });
        return;
      }

      const configuration = validation.configuration;
      if (!configuration) {
        toast.error("Invalid configuration file", {
          description: "The configuration could not be parsed.",
        });
        return;
      }

      if (!canImportToRaid(raid?.contentType || undefined, configuration.contentType)) {
        toast.error("Content type mismatch", {
          description: `This configuration is for ${configuration.contentType} raids, but this raid is ${raid?.contentType || "unspecified"}.`,
        });
        return;
      }

      await handleImportRaidConfiguration(configuration);
    } catch (error) {
      toast.error("Failed to import raid configuration", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled || isImporting) return;

    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find((file) => file.type === "application/json" || file.name.endsWith(".json"));

    if (jsonFile) {
      handleImport(jsonFile);
    } else {
      toast.error("Invalid file type", {
        description: "Please drop a JSON configuration file.",
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImport(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && !isImporting) {
      fileInputRef.current?.click();
    }
  };

  if (disabled || isImporting) {
    return (
      <div className="border-border/50 bg-muted/30 rounded-lg border-2 border-dashed p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-lg">
            <FontAwesomeIcon icon={faFileImport} className="text-muted-foreground h-8 w-8" />
          </div>
          <div>
            <p className="text-muted-foreground text-lg font-medium">
              {isImporting ? "Importing configuration..." : "Import unavailable"}
            </p>
            <p className="text-muted-foreground text-sm">
              {isImporting ? "Please wait while we apply the configuration" : "Import is disabled for this raid status"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-border/50 bg-muted/30 rounded-lg border-2 border-dashed p-8 transition-all duration-200 ${
        isDragOver
          ? "border-primary bg-primary/5 scale-105"
          : "hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileInput} className="hidden" />

      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-lg transition-colors ${
            isDragOver ? "bg-primary/10" : "bg-muted"
          }`}
        >
          <FontAwesomeIcon
            icon={faFileImport}
            className={`h-8 w-8 transition-colors ${isDragOver ? "text-primary" : "text-muted-foreground"}`}
          />
        </div>

        <div className="space-y-2">
          <p className={`text-lg font-medium transition-colors ${isDragOver ? "text-primary" : "text-foreground"}`}>
            {isDragOver ? "Drop configuration file here" : "Import Raid Configuration"}
          </p>
          <p className="text-muted-foreground text-sm">Drag & drop a JSON file or click to browse</p>
        </div>
      </div>
    </div>
  );
}
