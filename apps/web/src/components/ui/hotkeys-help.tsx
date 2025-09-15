import { useState } from "react";

import { faKeyboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface HotkeyHelpProps {
  hotkeys: Array<{
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
    description: string;
  }>;
}

export function HotkeysHelp({ hotkeys }: HotkeyHelpProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const formatKey = (hotkey: (typeof hotkeys)[0]) => {
    const keys = [];

    if (hotkey.ctrlKey || hotkey.metaKey) {
      keys.push(navigator.platform.includes("Mac") ? t("hotkeys.keys.cmd") : t("hotkeys.keys.ctrl"));
    }
    if (hotkey.altKey) {
      keys.push(t("hotkeys.keys.alt"));
    }
    if (hotkey.shiftKey) {
      keys.push(t("hotkeys.keys.shift"));
    }

    // Format the main key
    let mainKey = hotkey.key;
    if (mainKey === " ") {
      mainKey = t("hotkeys.keys.space");
    } else if (mainKey.length === 1) {
      mainKey = mainKey.toUpperCase();
    }

    keys.push(mainKey);

    return keys.join(" + ");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <FontAwesomeIcon icon={faKeyboard} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("hotkeys.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {hotkeys.map((hotkey, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">{hotkey.description}</span>
              <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border px-2 font-mono text-xs font-medium">
                {formatKey(hotkey)}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
