import { useCallback, useEffect, useMemo, useState } from "react";

import { Item, ItemSlotType } from "@albion-raid-manager/types/services";
import {
  faFlask,
  faHorse,
  faSearch,
  faShield,
  faShirt,
  faShoePrints,
  faSpinner,
  faTimes,
  faUser,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandTips,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getLocalizedName } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { useGetItemQuery, useSearchItemsQuery } from "@/store/items";

import { AlbionItemIcon } from "./item-icon";

// Slot type icons mapping
const slotTypeIcons = {
  mainhand: faUser, // Using faUser as a generic weapon icon
  offhand: faShield,
  head: faUser, // Using faUser as a generic head icon
  armor: faShirt,
  shoes: faShoePrints,
  cape: faUser, // Using faUser as a generic cape icon
  bag: faUser, // Using faUser as a generic bag icon
  food: faUtensils,
  potion: faFlask,
  mount: faHorse,
} as const;

// Slot type display names (currently unused but kept for future use)
// const slotTypeNames = {
//   mainhand: "Main Hand",
//   offhand: "Off Hand",
//   head: "Head",
//   armor: "Armor",
//   shoes: "Shoes",
//   cape: "Cape",
//   bag: "Bag",
//   food: "Food",
//   potion: "Potion"a
//   mount: "Mount",
// } as const;

interface ItemPickerProps {
  value?: Pick<Item, "item_id"> | Item | null;
  onValueChange?: (item: Item | null) => void;
  placeholder?: string;
  slotType?: ItemSlotType;
  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxResults?: number;
}

interface ItemPickerDialogProps extends ItemPickerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
}

interface ItemPickerTriggerProps extends ItemPickerProps {
  onOpenChange?: (open: boolean) => void;
  triggerClassName?: string;
}

// Main ItemPicker component
export function ItemPicker({
  value,
  onValueChange,
  placeholder,
  slotType,
  disabled = false,
  className,
  searchPlaceholder,
  emptyMessage,
  maxResults = 20,
}: ItemPickerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback(
    (item: Item | null) => {
      onValueChange?.(item);
      setIsOpen(false);
    },
    [onValueChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onValueChange?.(null);
    },
    [onValueChange],
  );

  // Fetch the item's full details if we have an item ID but the display name is the same as the ID
  const { data: itemDetails } = useGetItemQuery(
    { id: value?.item_id || "" },
    {
      skip: !value?.item_id,
    },
  );

  const displayName = useMemo(() => {
    if (!value) return placeholder || t("raids.itemPicker.placeholder");

    // If we fetched item details and it has a proper display name, use it
    if (itemDetails?.item) {
      return getLocalizedName(itemDetails.item);
    }

    return getLocalizedName(value);
  }, [value, placeholder, itemDetails, t]);

  const slotIcon = useMemo(() => {
    if (!slotType) return null;
    return slotTypeIcons[slotType];
  }, [slotType]);

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            type="button"
            className={cn(
              "focus:border-primary/50 h-12 w-full justify-between border-2 text-left text-base font-medium transition-colors",
              !value && "text-muted-foreground",
            )}
            disabled={disabled}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {value ? (
                <>
                  <AlbionItemIcon item={value.item_id} size="sm" />
                  <span className="truncate">{displayName}</span>
                </>
              ) : (
                <>
                  {slotIcon && <FontAwesomeIcon icon={slotIcon} className="text-muted-foreground h-4 w-4" />}
                  <span className="truncate">{displayName}</span>
                </>
              )}
            </div>
            <div className="ml-2 flex items-center gap-1">
              {value && (
                <div
                  className="hover:bg-destructive hover:text-destructive-foreground flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm p-0 pr-2 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClear(e);
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                </div>
              )}
              <FontAwesomeIcon icon={faSearch} className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <ItemSearchContent
            onSelect={handleSelect}
            selectedItem={value as Item | null}
            slotType={slotType}
            searchPlaceholder={searchPlaceholder || t("raids.itemPicker.searchPlaceholder")}
            emptyMessage={emptyMessage || t("raids.itemPicker.emptyMessage")}
            maxResults={maxResults}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Dialog version of ItemPicker
export function ItemPickerDialog({
  open = false,
  onOpenChange,
  value,
  onValueChange,
  slotType,
  searchPlaceholder,
  emptyMessage,
  maxResults = 20,
  title,
  description,
}: ItemPickerDialogProps) {
  const { t } = useTranslation();

  const handleSelect = useCallback(
    (item: Item | null) => {
      onValueChange?.(item);
      onOpenChange?.(false);
    },
    [onValueChange, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faSearch} className="h-5 w-5" />
            {title || t("raids.itemPicker.title")}
          </DialogTitle>
          <DialogDescription>{description || t("raids.itemPicker.description")}</DialogDescription>
        </DialogHeader>

        <ItemSearchContent
          onSelect={handleSelect}
          selectedItem={value as Item | null}
          slotType={slotType}
          searchPlaceholder={searchPlaceholder || t("raids.itemPicker.searchPlaceholder")}
          emptyMessage={emptyMessage || t("raids.itemPicker.emptyMessage")}
          maxResults={maxResults}
        />
      </DialogContent>
    </Dialog>
  );
}

// Trigger version for custom triggers
export function ItemPickerTrigger({
  value,
  onValueChange,
  slotType,
  searchPlaceholder,
  emptyMessage,
  maxResults = 20,
  onOpenChange,
  triggerClassName,
  children,
}: ItemPickerTriggerProps & { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange],
  );

  const handleSelect = useCallback(
    (item: Item | null) => {
      onValueChange?.(item);
      handleOpenChange(false);
    },
    [onValueChange, handleOpenChange],
  );

  return (
    <>
      <div className={triggerClassName} onClick={() => handleOpenChange(true)}>
        {children}
      </div>

      <ItemPickerDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        value={value}
        onValueChange={handleSelect}
        slotType={slotType}
        searchPlaceholder={searchPlaceholder || t("raids.itemPicker.searchPlaceholder")}
        emptyMessage={emptyMessage || t("raids.itemPicker.emptyMessage")}
        maxResults={maxResults}
      />
    </>
  );
}

// Internal search content component
interface ItemSearchContentProps {
  onSelect: (item: Item | null) => void;
  selectedItem?: Item | null;
  slotType?: ItemSlotType;
  searchPlaceholder: string;
  emptyMessage: string;
  maxResults: number;
}

function ItemSearchContent({
  onSelect,
  selectedItem,
  slotType,
  searchPlaceholder,
  emptyMessage,
  maxResults,
}: ItemSearchContentProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce the search term with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Use the actual API hook with debounced search term
  const { data, isLoading, error } = useSearchItemsQuery(
    {
      query: {
        q: debouncedSearchTerm,
        slotType,
        limit: maxResults,
        offset: 0,
      },
    },
    {
      skip: debouncedSearchTerm.length < 2, // Don't search until at least 2 characters
    },
  );

  const items = useMemo(() => {
    return data?.items || [];
  }, [data]);

  const weaponSearchTips = t("raids.itemPicker.weaponSearchTips", { returnObjects: true }) as string[];

  return (
    <Command className="rounded-lg border shadow-md" shouldFilter={false}>
      <CommandInput placeholder={searchPlaceholder} value={searchTerm} onValueChange={setSearchTerm} className="h-9" />
      <CommandList>
        {(isLoading || (searchTerm.length >= 2 && debouncedSearchTerm !== searchTerm)) && (
          <div className="text-muted-foreground py-6 text-center text-sm">
            <FontAwesomeIcon icon={faSpinner} className="mr-2 h-4 w-4 animate-spin" />
            {isLoading ? t("raids.itemPicker.searching") : t("raids.itemPicker.searchingShort")}
          </div>
        )}

        {!!error && (
          <div className="text-destructive py-6 text-center text-sm">{t("raids.itemPicker.searchError")}</div>
        )}

        {!isLoading && !error && items.length === 0 && debouncedSearchTerm.length >= 2 && (
          <CommandEmpty>{emptyMessage}</CommandEmpty>
        )}

        {!isLoading && !error && searchTerm.length === 0 && items.length === 0 && (
          <CommandTips
            tips={[
              t("raids.itemPicker.searchTips"),
              t("raids.itemPicker.tierPattern"),
              "\n",
              <b key="examples">{t("raids.itemPicker.examples")}</b>,
              ...weaponSearchTips,
            ]}
          />
        )}

        {!isLoading && !error && items.length > 0 && (
          <CommandGroup>
            {items.map((item) => (
              <CommandItem
                key={item.item_id}
                value={item.item_id}
                onSelect={() => onSelect(item)}
                className="flex items-center gap-3 px-3 py-2"
              >
                <AlbionItemIcon item={item.item_id} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium leading-tight">{getLocalizedName(item)}</div>
                  <div className="text-muted-foreground truncate text-xs">{item.item_id}</div>
                </div>
                {selectedItem?.item_id === item.item_id && (
                  <FontAwesomeIcon icon={faSearch} className="text-primary h-4 w-4" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
