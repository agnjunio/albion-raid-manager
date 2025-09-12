import { useState } from "react";

import { Item, ItemSlotType } from "@albion-raid-manager/types/services";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ItemPicker, ItemPickerDialog, ItemPickerTrigger } from "./item-picker";

/**
 * Example component demonstrating different ways to use the ItemPicker
 */
export function ItemPickerExample() {
  const [selectedWeapon, setSelectedWeapon] = useState<Item | null>(null);
  const [selectedArmor, setSelectedArmor] = useState<Item | null>(null);
  const [selectedFood, setSelectedFood] = useState<Item | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogItem, setDialogItem] = useState<Item | null>(null);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Item Picker Examples</h2>
        <p className="text-muted-foreground">
          Different ways to use the ItemPicker component for selecting Albion Online items.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic ItemPicker */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Item Picker</CardTitle>
            <CardDescription>Simple item selection without slot filtering</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ItemPicker
              value={selectedWeapon}
              onValueChange={setSelectedWeapon}
              placeholder="Select any item..."
              searchPlaceholder="Search all items..."
            />
            {selectedWeapon && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium">Selected Item:</p>
                <p className="text-muted-foreground text-sm">
                  {selectedWeapon.localizedNames["EN-US"] || selectedWeapon.item_id}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Slot-specific ItemPicker */}
        <Card>
          <CardHeader>
            <CardTitle>Weapon Picker</CardTitle>
            <CardDescription>Filtered to main hand weapons only</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ItemPicker
              value={selectedArmor}
              onValueChange={setSelectedArmor}
              slotType="mainhand"
              placeholder="Select a weapon..."
              searchPlaceholder="Search weapons..."
            />
            {selectedArmor && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium">Selected Weapon:</p>
                <p className="text-muted-foreground text-sm">
                  {selectedArmor.localizedNames["EN-US"] || selectedArmor.item_id}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog ItemPicker */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog Item Picker</CardTitle>
            <CardDescription>Item selection in a modal dialog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setDialogOpen(true)}>Open Item Dialog</Button>
            {dialogItem && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium">Selected Item:</p>
                <p className="text-muted-foreground text-sm">
                  {dialogItem.localizedNames["EN-US"] || dialogItem.item_id}
                </p>
              </div>
            )}
            <ItemPickerDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              value={dialogItem}
              onValueChange={setDialogItem}
              slotType="food"
              title="Select Food Item"
              description="Choose a food item for your build."
            />
          </CardContent>
        </Card>

        {/* Trigger ItemPicker */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Trigger</CardTitle>
            <CardDescription>Item picker with custom trigger button</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ItemPickerTrigger value={selectedFood} onValueChange={setSelectedFood} slotType="food">
              <Button variant="outline" className="w-full justify-start">
                {selectedFood ? (
                  <span>{selectedFood.localizedNames["EN-US"] || selectedFood.item_id}</span>
                ) : (
                  <span className="text-muted-foreground">Select food item...</span>
                )}
              </Button>
            </ItemPickerTrigger>
            {selectedFood && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium">Selected Food:</p>
                <p className="text-muted-foreground text-sm">
                  {selectedFood.localizedNames["EN-US"] || selectedFood.item_id}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Slot Type Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Slot Type Examples</CardTitle>
          <CardDescription>Different slot types with appropriate filtering</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(
              [
                "mainhand",
                "offhand",
                "head",
                "armor",
                "shoes",
                "cape",
                "bag",
                "food",
                "potion",
                "mount",
              ] as ItemSlotType[]
            ).map((slotType) => (
              <div key={slotType} className="space-y-2">
                <Badge variant="secondary" className="capitalize">
                  {slotType.replace(/([A-Z])/g, " $1").trim()}
                </Badge>
                <ItemPicker
                  value={null}
                  onValueChange={() => {}}
                  slotType={slotType}
                  placeholder={`Select ${slotType}...`}
                  searchPlaceholder={`Search ${slotType}...`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
