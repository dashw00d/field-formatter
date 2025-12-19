import { FormatterConfig } from "./FieldFormatter";
import { RowType, SectionType, SegmentKind, ActionType } from "./enums";

export const DefaultConfig: FormatterConfig = {
  sectionTypes: {
    [SectionType.Generic]: {
      label: "General Section",
      requiresTitle: false,
      allowedRowTypes: [
        RowType.Text,
        RowType.TimeBlock,
        RowType.Contact,
        RowType.Item,
        RowType.DrinkItem,
        RowType.Category
      ],
      defaultRowType: RowType.Text,
      examples: [
        "Simple text item",
        "10:00 - 11:00: Meeting",
        "John Doe (555-0123)",
        "(5) Equipment Count"
      ]
    }
  },
  rowTypes: {
    [RowType.Text]: {
      label: "Text",
      segments: [
        { kind: SegmentKind.Text }
      ]
    },
    [RowType.TimeBlock]: {
      label: "Schedule",
      segments: [
        { kind: SegmentKind.Time, field: "start", key: "start" },
        { kind: SegmentKind.Time, field: "end", key: "end" },
        { kind: SegmentKind.Text }
      ]
    },
    [RowType.Contact]: {
      label: "Contact",
      segments: [
        { kind: SegmentKind.Icon, iconPath: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
        { kind: SegmentKind.Text },
        { kind: SegmentKind.Badge, field: "phone" },
        { kind: SegmentKind.Badge, field: "role" }
      ],
      actions: [ActionType.DoubleClick]
    },
    [RowType.Item]: {
      label: "Equipment",
      segments: [
        { kind: SegmentKind.Counter, field: "count" },
        { kind: SegmentKind.Text }
      ],
      actions: [ActionType.Increment, ActionType.Decrement]
    },
    [RowType.DrinkItem]: {
      label: "Beverage",
      segments: [
        { kind: SegmentKind.Counter, field: "count" },
        { kind: SegmentKind.Icon, iconPath: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
        { kind: SegmentKind.Text }
      ],
      actions: [ActionType.Increment, ActionType.Decrement]
    },
    [RowType.Category]: {
      label: "Category",
      segments: [
        { kind: SegmentKind.Text }
      ],
      transitions: {
        [ActionType.ConvertToItem]: RowType.Item,
        [ActionType.Increment]: RowType.Item
      },
      extraFields: {
        count: { default: 1 }
      }
    }
  }
};
