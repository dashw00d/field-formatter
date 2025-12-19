// =============================================================================
// ENUMS
// Mirror of Laravel Backend Enums
// =============================================================================

export enum RowType {
  Text = "text",
  TimeBlock = "time_block",
  Contact = "contact",
  Item = "item",
  DrinkItem = "drink_item",
  Category = "category",
}

export enum SectionType {
  Generic = "generic",
  // Add other section types here as they are defined in your Laravel backend
}

export enum SegmentKind {
  Text = "text",
  Counter = "counter",
  Time = "time",
  Badge = "badge",
  Icon = "icon",
}

export enum ActionType {
  Increment = "increment",
  Decrement = "decrement",
  Remove = "remove",
  ConvertToItem = "convert-to-item",
  DoubleClick = "dblclick",
  DecrementZero = "decrement_zero",
}
