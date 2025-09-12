# Raid Planning Feature Documentation

## Overview

The Raid Planning feature allows raid leaders to define detailed compositions for their raids, including weapon requirements and optional complex builds. This feature enhances the existing raid management system with flexible composition planning capabilities.

## Core Concepts

### 1. **Raid Slots**

Individual positions within a raid that can be assigned to specific players.

**Fields:**

- `name`: Slot identifier (e.g., "Main Tank", "Healer 1")
- `role`: RaidRole enum (TANK, HEALER, RANGED_DPS, MELEE_DPS, SUPPORT, BATTLEMOUNT)
- `weapon`: Albion item reference using official pattern (e.g., "T6_2H_HOLYSTAFF@0")
- `comment`: Additional notes or requirements
- `user`: Assigned Discord user (optional)
- `build`: Reference to build (optional)

### 2. **Albion Item Reference Pattern**

The system uses Albion Online's official item naming pattern for consistent item references.

**Pattern:** `{TIER}_{ITEM_NAME}@{ENCHANTMENT}`

**Examples:**

- `T6_2H_HOLYSTAFF@0` - Tier 6 Holy Staff with no enchantment
- `T8_2H_MACE@0` - Tier 8 Mace with no enchantment
- `T7_2H_FIRE_RINGPAIR_AVALON@1` - Tier 7 Avalonian Fire Ring Pair with enchantment 1
- `T5_MAIN_SWORD@2` - Tier 5 Sword with enchantment 2

**Benefits:**

- **Official Compatibility**: Uses Albion's standard item naming
- **Render API Integration**: Compatible with Albion's render API
- **Clear Specification**: Tier, item type, and enchantment in one string
- **Validation**: Easy to validate against Albion's item database
- **Future-Proof**: Compatible with Albion's ecosystem

### 3. **Simple Weapon Specification**

The primary method for defining gear requirements using Albion's item pattern.

**Benefits:**

- Quick setup for 90% of raid scenarios
- Clear communication to players
- Easy to understand and modify
- Compatible with Albion's render system
- No complex configuration needed

**Example:**

```
Slot: "Healer"
Weapon: "T6_2H_HOLYSTAFF@0"
```

### 4. **Complex Builds (Advanced)**

Optional detailed build definitions for advanced raid planning.

**Components:**

- **Build**: Container for build pieces
- **BuildPiece**: Individual gear pieces with alternatives

**Use Cases:**

- Detailed gear requirements
- Multiple weapon alternatives
- Inventory management (consumables, swaps)
- Reusable build templates

## Database Schema

### Updated RaidSlot Model

```prisma
model RaidSlot {
  id        String    @id @default(uuid())
  name      String
  comment   String?
  order     Int       @default(0)
  raid      Raid?     @relation(fields: [raidId], references: [id])
  raidId    String?
  role      RaidRole?
  user      User?     @relation(fields: [userId], references: [id])
  userId    String?

  // Albion item reference (primary)
  weapon    String?   // Albion item pattern: T6_2H_HOLYSTAFF@0

  // Complex build approach (optional)
  build     Build?    @relation(fields: [buildId], references: [id])
  buildId   String?

  createdAt DateTime  @default(now())
  joinedAt  DateTime?
}
```

### Build System Models

```prisma
enum GearSlot {
  MAIN_HAND
  OFF_HAND
  HEAD
  BODY
  FEET
  CAPE
  BAG
  MOUNT
  FOOD
  POTION
  INVENTORY
}

model Build {
  id          String       @id @default(uuid())
  name        String
  description String?
  role        RaidRole
  serverId    String
  server      Server       @relation(fields: [serverId], references: [id], onDelete: Cascade)
  pieces      BuildPiece[]
  raidSlots   RaidSlot[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model BuildPiece {
  id          String   @id @default(uuid())
  buildId     String
  build       Build    @relation(fields: [buildId], references: [id], onDelete: Cascade)
  gearSlot    GearSlot
  itemName    String   // Albion item pattern: T6_2H_HOLYSTAFF@0
  quantity    Int      @default(1)
  description String?
  order       Int      @default(0)
  createdAt   DateTime @default(now())
}
```

## User Interface Design

### Web Interface

#### 1. **Enhanced RaidSlotSheet**

Sub-sheet approach for clean, focused editing:

**Weapon Section (Primary):**

```tsx
<FormField
  control={form.control}
  name="weapon"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Weapon (Optional)</FormLabel>
      <FormControl>
        <div className="space-y-3">
          <Input
            placeholder="T6_2H_HOLYSTAFF@0"
            value={field.value || ""}
            onChange={(e) => field.onChange(e.target.value || null)}
            className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-colors"
          />
          <div className="text-muted-foreground text-sm">
            Use Albion item pattern: T{number}_{ITEM_NAME}@{enchantment}
          </div>
        </div>
      </FormControl>
      <FormDescription>Specify the weapon using Albion's item pattern</FormDescription>
    </FormItem>
  )}
/>
```

**Advanced Build Section (Collapsible):**

- Build selection dropdown
- "Create New Build" option
- Sub-sheet for build creation/editing

#### 2. **Build Management Sub-Sheets**

**Build Selector Sheet:**

- List of existing builds
- Filter by role
- Preview build pieces

**Build Creator Sheet:**

- Build name and description
- Role selection
- Build pieces management
- Gear slot organization

#### 3. **Composition Copy Feature**

**Raid Creation Enhancement:**

```tsx
<FormField
  control={form.control}
  name="copyFromRaidId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Copy Composition (Optional)</FormLabel>
      <FormControl>
        <Select onValueChange={field.onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a raid to copy composition from..." />
          </SelectTrigger>
          <SelectContent>
            {availableRaids.map((raid) => (
              <SelectItem key={raid.id} value={raid.id}>
                {raid.title} ({raid.slots.length} slots)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <FormDescription>Copy slots, roles, and weapons from an existing raid</FormDescription>
    </FormItem>
  )}
/>
```

**Copy Options:**

- Copy slots and roles
- Copy weapons
- Copy comments
- Copy member assignments

### Discord Bot Interface

#### 1. **Enhanced Raid Commands**

**`/raid create` (Enhanced):**

```
/raid create title:"5v5 Hellgate" date:"2024-12-31 20:00" type:FIXED max-players:5 copy-from:raid-id-123
```

**`/raid slot add` (New):**

```
/raid slot add raid-id:abc123 name:"Healer" role:HEALER weapon:"T6_2H_HOLYSTAFF@0" comment:"Main healer"
```

#### 2. **Build Management Commands**

**`/build create`:**

```
/build create name:"Tank Build" role:TANK description:"Standard tank build for group content"
```

**`/build add-piece`:**

```
/build add-piece build:"Tank Build" slot:MAIN_HAND item:"T6_2H_MACE@0" quantity:1
```

**`/build list`:**

```
/build list [role:TANK] [server:all]
```

**`/build show`:**

```
/build show "Tank Build"
```

## User Experience Flows

### Scenario 1: Simple Raid Planning

1. **Create Raid**: Fill basic info (title, date, type)
2. **Add Slots**: Specify slot name, role, and Albion item reference
3. **Assign Members**: Players join slots
4. **Ready to Go**: Clear weapon requirements for all participants

### Scenario 2: Advanced Build Planning

1. **Create Raid**: Basic raid setup
2. **Create Build**: Define detailed gear requirements using Albion item patterns
3. **Assign Build**: Link build to raid slots
4. **Share Build**: Export/import builds between raids

### Scenario 3: Composition Copying

1. **Select Source**: Choose successful raid to copy from
2. **Preview Composition**: Review slots, roles, and Albion item references
3. **Copy Options**: Choose what to copy and what to leave
4. **Create Raid**: New raid created with copied composition
5. **Modify**: Adjust individual slots as needed

### Scenario 4: Template Usage

1. **Choose Template**: Select pre-defined composition
2. **Customize**: Modify slots for specific needs
3. **Create Raid**: New raid with proven composition

## Technical Implementation

### Phase 1: Database & API

- ✅ Database schema design (completed)
- Create Build API endpoints
- Create BuildPiece API endpoints
- Update RaidSlot API to include weapon field
- Update RaidSlot API to include buildId

### Phase 2: Web Interface

- Enhanced RaidSlotSheet with weapon field
- Build management sub-sheets
- Composition copy functionality
- Build selection and creation UI
- Import/export functionality

### Phase 3: Discord Bot

- Enhanced raid commands
- Build management commands
- Composition copying commands
- Rich embeds for build display
- Error handling and validation

### Phase 4: Integration & Polish

- Cross-platform synchronization
- Build templates and presets
- Advanced composition features
- Performance optimization
- User experience refinements

## Albion Integration

### Render API Compatibility

The system is designed to be compatible with Albion's render API for item visualization:

**Item Image URLs:**

```
https://render.albiononline.com/v1/item/{ITEM_REFERENCE}
```

**Examples:**

- `https://render.albiononline.com/v1/item/T6_2H_HOLYSTAFF@0`
- `https://render.albiononline.com/v1/item/T8_2H_MACE@0`
- `https://render.albiononline.com/v1/item/T7_2H_FIRE_RINGPAIR_AVALON@1`

### Item Validation

**Validation Rules:**

- Must follow pattern: `T{number}_{ITEM_NAME}@{enchantment}`
- Tier must be between 1-8
- Enchantment must be between 0-3
- Item name must match Albion's item database

**Future Integration:**

- Validate against Albion's official item database
- Auto-complete item names
- Display item icons in UI
- Integration with Albion's market data

## Benefits

### For Raid Leaders

- **Efficiency**: Save 80% of raid setup time
- **Consistency**: Use proven compositions
- **Flexibility**: Simple weapons or complex builds
- **Learning**: Copy from experienced leaders
- **Templates**: Pre-defined compositions

### For Players

- **Clarity**: Clear weapon requirements using official Albion patterns
- **Preparation**: Know exactly what to bring
- **Flexibility**: Multiple weapon options
- **Consistency**: Standardized expectations
- **Visual**: Can see item icons via render API

### For the System

- **Scalability**: Handles simple to complex scenarios
- **Maintainability**: Clean, focused components
- **Extensibility**: Easy to add new features
- **Performance**: Efficient data structures
- **Compatibility**: Integrates with Albion's ecosystem

## Migration Strategy

### Backward Compatibility

- Existing raids continue to work unchanged
- New weapon field is optional
- Build system is completely optional
- Gradual migration path available

### Data Migration

1. **Add new fields** to RaidSlot model
2. **Keep existing data** intact
3. **Provide migration tools** for converting comments to Albion item references
4. **Offer both approaches** in UI

### User Adoption

1. **Start simple**: Albion item pattern is primary interface
2. **Progressive enhancement**: Advanced users can use builds
3. **Copy feature**: Easy transition from old to new approach
4. **Templates**: Pre-made compositions for common scenarios

## Future Enhancements

### Short Term

- Build templates for common compositions
- Enhanced item validation against Albion database
- Item icon integration via render API
- Auto-complete for item names

### Medium Term

- Albion API integration for item validation
- Advanced build sharing between servers
- Composition analytics and success tracking
- Mobile-optimized interfaces
- Market price integration

### Long Term

- AI-powered composition suggestions
- Integration with Albion guild systems
- Advanced raid scheduling and management
- Community-driven composition library
- Real-time item availability checking

## Conclusion

The Raid Planning feature provides a comprehensive solution for raid composition management while maintaining simplicity for basic use cases. The adoption of Albion's official item naming pattern ensures compatibility with the broader Albion ecosystem and provides a standardized way to reference items.

The dual approach of simple weapon specification and complex builds ensures the system scales from casual raids to professional guild management. The sub-sheet design pattern ensures a clean, focused user experience, while the composition copying feature dramatically improves efficiency for raid leaders.

This feature significantly enhances the Albion Raid Manager's capabilities while maintaining the simplicity and ease of use that makes the system accessible to all types of users, and ensures seamless integration with Albion Online's official systems and APIs.
