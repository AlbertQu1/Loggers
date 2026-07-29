# Ground Coffee Annual Virtual Bag Implementation

## Overview

This implementation adds automatic annual Ground Coffee virtual bag functionality to the Coffee Logger PWA. When users select Ground Coffee for a preparation event, the system automatically creates or reuses a virtual bag named `Molido <Current Year>` to group all ground coffee events for tracking and analytics.

## How It Works

### Automatic Bag Management

1. **First Ground Coffee Event of Year**
   - When a user records the first ground coffee preparation of the year
   - The system searches for `Molido 2026` (or current year)
   - If it doesn't exist, it's automatically created
   - If it exists, it's reused

2. **Virtual Bag Properties**
   - Name: `Molido <Current Year>` (e.g., `Molido 2026`)
   - Purchase Date: January 1st of current year
   - Open Date: January 1st of current year
   - Close Date: December 31st of current year
   - Purchase City: `Anual` (intentional analytics value)
   - Weight: 0g
   - Price: $0
   - Gift: false

### Active Bag Independence

Ground Coffee is completely independent from the Active Coffee Bag workflow:

- Using Ground Coffee does NOT close the active bag
- Using Ground Coffee does NOT replace the active bag
- Using Ground Coffee does NOT modify the active bag in any way
- The Active Coffee Bag remains unchanged before and after the preparation

### Example Workflow

```
Current State: Active Bag = "Finca Santa Cruz"
              ↓
User selects Ground Coffee + records preparation
              ↓
System creates/reuses "Molido 2026" virtual bag
              ↓
Preparation is linked to "Molido 2026"
              ↓
Active Bag: Still "Finca Santa Cruz" (unchanged)
```

## Implementation Details

### Files Modified

1. **services/api/ground-coffee.ts** (NEW)
   - New service that handles annual ground coffee bag creation/retrieval
   - `getOrCreateAnnualGroundCoffeeBag()` function

2. **components/screens/new-cup/cup-form.tsx**
   - Updated `handleRegister()` to call `getOrCreateAnnualGroundCoffeeBag()` when ground coffee is selected
   - Updated offline sync to handle ground coffee bag linking
   - Active bag remains unaffected throughout the process

### No Database Changes

- No new fields added to the Cup or CoffeeBag tables
- Uses existing `activeBagId` field to link cups to their coffee bag source
- Purchase City field stores `Anual` for annual virtual bags (used by analytics)

### No Breaking Changes

- All existing Coffee Logger functionality works exactly as before
- Normal coffee bags use the existing workflow unchanged
- Active bag workflow is unaffected
- Offline queue continues to work normally
- Rest API remains unchanged

## Technical Flow

```
User selects Ground Coffee
      ↓
handleRegister() called
      ↓
getOrCreateAnnualGroundCoffeeBag()
      ├─ Fetch all bags
      ├─ Search for "Molido 2026" with city="Anual"
      ├─ If found: Return existing bag
      └─ If not found: Create new virtual bag and return it
      ↓
Link preparation to annual bag ID
      ↓
Record cup with annual bag ID in activeBagId field
```

## Key Features

✓ Automatic annual bag creation and reuse  
✓ One bag per year (no duplicates)  
✓ Ground Coffee independent from Active Bag  
✓ Preserves all existing functionality  
✓ Works with offline queue  
✓ Uses existing database structure  
✓ Analytics-ready with intentional "Anual" city value  

## Testing Recommendations

1. Record a ground coffee preparation in January - should create `Molido 2026`
2. Record another ground coffee preparation - should reuse the same bag
3. Switch to active coffee bag and record a normal preparation - active bag should remain unchanged
4. Go offline and record ground coffee - should queue correctly and sync with annual bag

## Important Notes

- The Purchase City field intentionally contains `Anual` (not `Annual`) for analytics script compatibility
- The annual virtual bag has 0 weight and 0 price - these are intentional markers for the analytics system
- Do not modify or manually rename annual virtual bags - the system manages them automatically
