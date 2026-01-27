
export default {
  "title": "Structures & Payouts",
  "subtitle": "Configure blind levels and payout structures.",
  "btn": {
    "createStructure": "New Structure",
    "createMatrix": "New Matrix",
    "createModel": "New Model"
  },
  "tabs": {
    "blinds": "Blind Structures",
    "payouts": "Payout Models"
  },
  "blindsTable": {
    "empty": "No structures defined",
    "createFirst": "Create your first blind structure",
    "name": "Name",
    "chips": "Starting Chips",
    "blinds": "Starting Blinds",
    "levels": "Levels",
    "rebuys": "Rebuys",
    "length": "Est. Length",
    "deleteTitle": "Delete Structure?"
  },
  "payouts": {
    "algorithms": "Algorithms",
    "matrices": "Custom Matrices",
    "deleteTitle": "Delete Payout Model?",
    "table": {
      "name": "Name",
      "splits": "Splits",
      "rules": "Rules",
      "range": "Player Range",
      "ranges": "Ranges",
      "noRules": "No rules defined",
      "empty": "No custom payout matrices defined.",
      "emptySplits": "Empty"
    }
  },
  "form": {
    "editTitle": "Edit Structure",
    "createTitle": "Create Structure",
    "name": "Structure Name",
    "chips": "Chips",
    "startChips": "Starting Chips",
    "rebuys": "Rebuys",
    "rebuyLimit": "Rebuy Limit",
    "freezeout": "0 = Freezeout",
    "lastRebuyLevel": "Last Rebuy Level",
    "estLength": "EST. LENGTH",
    "schedule": {
      "headerSeq": "#",
      "headerDur": "Duration (min)",
      "headerSmall": "Small Blind",
      "headerBig": "Big Blind",
      "headerAnte": "Ante",
      "headerActions": "Actions",
      "addLevel": "Add Level",
      "addBreak": "Add Break"
    },
    "save": "Save Structure",
    "create": "Create Structure",
    "placeholders": {
        "name": "e.g. Turbo Deepstack"
    }
  },
  "payoutForm": {
    "editTitle": "Edit Payout Model",
    "createTitle": "Create Payout Model",
    "name": "Model Name",
    "desc": "Description",
    "rules": "Payout Rules",
    "addRange": "Add Range",
    "rangeLabel": "PLAYER RANGE (MIN - MAX)",
    "placesLabel": "PLACES PAID",
    "distributionLabel": "DISTRIBUTION %",
    "total": "Total",
    "noRules": "No rules added yet. Click 'Add Range' to start.",
    "validation": {
      "valid": "Structure Valid",
      "sum": "Percentages must sum to 100%",
      "minMax": "Min players cannot be greater than Max players",
      "descending": "Payouts must be in descending order",
      "overlap": "Ranges overlap",
      "gap": "Gap between ranges",
      "nameRequired": "Name is required",
      "totalMustBe100": "Total: {{total}}% (Must be 100%)",
      "invalidFormat": "Invalid format: missing 'allocations' array.",
      "allocationError": "{{name}} - {{error}}"
    },
    "save": "Save Model",
    "create": "Create Model",
    "importJson": "Import JSON",
    "exportJson": "Export JSON",
    "exportTitle": "Export Payout Model",
    "importTitle": "Import Payout Model",
    "splits": "Splits",
    "addSplit": "Add",
    "direct": "Direct",
    "selectSplitPrompt": "Select a split to configure",
    "allocationName": "Allocation Name",
    "method": "Method",
    "placesPaid": "Places Paid",
    "chipEvTitle": "Chip EV Engine",
    "chipEvDesc": "Payouts for this portion ({{percent}}%) are calculated based on raw chip percentage.",
    "hiddenConfig": "Distribution configuration hidden for > 50 places to maintain performance.",
    "defaultSplitName": "Split",
    "placeholders": {
        "name": "e.g. Standard Top 15%",
        "description": "Description..."
    }
  }
};