import SortableList from "./SortableList";
import { RowType, SectionType, SegmentKind, ActionType } from "./enums";
import { FieldFormatterStyles } from "./FieldFormatterStyles";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export { RowType, SectionType, SegmentKind, ActionType };

export interface SegmentConfig {
  kind: SegmentKind;
  field?: string;
  key?: string;
  iconPath?: string;
  title?: string;
}

export interface RowTypeConfig {
  segments?: SegmentConfig[];
  transitions?: Record<string, string>;
  extraFields?: Record<string, { default?: unknown }>;
  actions?: string[];
  label?: string;
}

export interface SectionTypeConfig {
  label: string;
  requiresTitle?: boolean;
  allowedRowTypes?: string[];
  defaultRowType?: string;
  examples?: string[];
}

export interface FormatterConfig {
  sectionTypes: Record<string, SectionTypeConfig>;
  rowTypes: Record<string, RowTypeConfig>;
}

export interface FormatterItem {
  row_type: string;
  content: string;
  order?: number;
  count?: number;
  start?: string;
  end?: string;
  phone?: string;
  role?: string;
  [key: string]: unknown;
}

export interface FormatterSection {
  type: string;
  title: string;
  order: number;
  items: FormatterItem[];
  _viewMode?: "plain" | "hybrid";
  _plainText?: string | null;
}

export interface FormatterState {
  sections: FormatterSection[];
}

// =============================================================================
// UTILITIES
// =============================================================================

function escapeHtml(text: string | null | undefined): string {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

/**
 * Normalize time string to HH:MM format
 */
export function normalizeTime(time: string): string {
  try {
    const t = (time || "").toLowerCase().trim();

    // Already in HH:MM format
    let m = t.match(/^(\d{1,2}):(\d{2})$/);
    if (m) {
      return `${m[1]!.padStart(2, "0")}:${m[2]}`;
    }

    // Handle am/pm
    m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
    if (m) {
      let hour = parseInt(m[1]!, 10);
      const min = m[2] || "00";
      const period = m[3]!.toLowerCase();

      if (period === "pm" && hour < 12) {
        hour += 12;
      } else if (period === "am" && hour === 12) {
        hour = 0;
      }

      return `${hour.toString().padStart(2, "0")}:${min}`;
    }

    return t;
  } catch {
    return time || "";
  }
}

// =============================================================================
// RENDERING LOGIC
// =============================================================================

function renderSegment(item: FormatterItem, segment: SegmentConfig, index: number): string {
  const value = segment.field ? (item[segment.field] ?? "") : "";

  switch (segment.kind) {
    case SegmentKind.Counter: {
      const count = (value as number) || 0;
      return `
        <div class="field-formatter-line__counter">
          <button type="button" class="field-formatter-line__btn field-formatter-line__btn--decrement" data-action="${ActionType.Decrement}" data-index="${index}" ${count <= 0 ? "disabled" : ""} title="Decrease">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
          </button>
          <span class="field-formatter-line__count">${count}</span>
          <button type="button" class="field-formatter-line__btn field-formatter-line__btn--increment" data-action="${ActionType.Increment}" data-index="${index}" title="Increase">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
        </div>
      `;
    }

    case SegmentKind.Time:
      return `<span class="field-formatter-line__time">${escapeHtml(value as string)}</span>`;

    case SegmentKind.Badge:
      return value ? `<span class="field-formatter-line__extra">${escapeHtml(value as string)}</span>` : "";

    case SegmentKind.Icon:
      return segment.iconPath ? `
        <svg class="field-formatter-line__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${segment.iconPath}" />
        </svg>
      ` : "";

    case SegmentKind.Text:
    default:
      return "";
  }
}

export function renderRow(item: FormatterItem, index: number, rowTypes: Record<string, RowTypeConfig>): string {
  const rowType = item.row_type;
  const cfg = rowTypes[rowType] || {};
  const segments = cfg.segments || [];

  let extraHtml = "";
  let iconHtml = "";

  for (const seg of segments) {
    if (seg.kind === SegmentKind.Icon) {
      iconHtml = seg.iconPath || "";
    } else if (seg.kind !== SegmentKind.Text) {
      extraHtml += renderSegment(item, seg, index);
    }
    if (seg.key === "start") {
      extraHtml += `<span class="field-formatter-line__time-sep">–</span>`;
    }
  }

  let actionsHtml = "";
  const transitions = cfg.transitions || {};
  if (transitions[ActionType.ConvertToItem]) {
    actionsHtml = `
      <span class="field-formatter-line__type-hint">item →</span>
      <button type="button" class="field-formatter-line__btn field-formatter-line__btn--convert" data-action="${ActionType.ConvertToItem}" data-index="${index}" title="Convert">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
      </button>
    `;
  }

  return `
    <div class="field-formatter-line field-formatter-line--${rowType.replace(/_/g, "-")}" data-index="${index}" draggable="true">
      <div class="field-formatter-line__drag-handle" title="Drag to reorder">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
        </svg>
      </div>
      ${iconHtml ? `
        <svg class="field-formatter-line__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconHtml}" />
        </svg>
      ` : ""}
      <span class="field-formatter-line__name">${escapeHtml(item.content)}</span>
      ${extraHtml}
      <div class="field-formatter-line__actions">
        ${actionsHtml}
        <button type="button" class="field-formatter-line__btn field-formatter-line__btn--remove" data-action="${ActionType.Remove}" data-index="${index}" title="Remove">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  `;
}

// =============================================================================
// PARSER REGISTRY
// =============================================================================

export type ParserFunction = (text: string, typeConfig?: SectionTypeConfig) => FormatterItem | null;

const parserRegistry: Record<string, ParserFunction> = {
  [RowType.TimeBlock]: (trimmed) => {
    const timePattern = "(\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)?|\\d{1,2}:\\d{2})";
    const regex = new RegExp(`^${timePattern}\\s*[-–—]\\s*${timePattern}[:\\s]+(.+)$`, "i");
    const matches = trimmed.match(regex);
    if (matches) {
      return {
        row_type: RowType.TimeBlock,
        content: matches[3]!.trim(),
        start: normalizeTime(matches[1]!),
        end: normalizeTime(matches[2]!),
      };
    }
    return null;
  },
  [RowType.Contact]: (trimmed) => {
    let matches = trimmed.match(/^(.+?)\s*\(([^)]+)\)$/);
    if (matches) {
      const content = matches[1]!.trim();
      const extra = matches[2]!.trim();
      if (/[\d\-( )\s]{7,}/.test(extra)) {
        return { row_type: RowType.Contact, content, phone: extra };
      }
      return { row_type: RowType.Contact, content, role: extra };
    }
    matches = trimmed.match(/^(.+?)\s*[-–—]\s*([\d\-( )\s]{7,})$/);
    if (matches) {
      return {
        row_type: RowType.Contact,
        content: matches[1]!.trim(),
        phone: matches[2]!.trim(),
      };
    }
    return null;
  },
  [RowType.Item]: (trimmed, typeConfig) => {
    const allowedRowTypes = typeConfig?.allowedRowTypes || [];
    const rowType = allowedRowTypes.includes(RowType.DrinkItem) ? RowType.DrinkItem : RowType.Item;
    let matches = trimmed.match(/^\((\d+)\)\s*(.+)$/);
    if (!matches) {
      matches = trimmed.match(/^(.+?)\s*\((\d+)\)$/);
    }
    if (matches) {
      const isNumFirst = /^\d+$/.test(matches[1]!);
      return {
        row_type: rowType,
        content: (isNumFirst ? matches[2] : matches[1])!.trim(),
        count: parseInt(isNumFirst ? matches[1]! : matches[2]!, 10),
      };
    }
    return null;
  }
};

export function registerParser(name: string, parser: ParserFunction) {
  parserRegistry[name] = parser;
}

export function parseLine(text: string, typeConfig?: SectionTypeConfig): FormatterItem | null {
  try {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const allowedRowTypes = typeConfig?.allowedRowTypes || [RowType.Text];

    for (const type of allowedRowTypes) {
      const parserKey = (type === RowType.DrinkItem) ? RowType.Item : type;
      const parser = parserRegistry[parserKey];
      if (parser) {
        const result = parser(trimmed, typeConfig);
        if (result) return result;
      }
    }

    const defaultRowType = typeConfig?.defaultRowType || allowedRowTypes[0] || RowType.Text;
    const rowType = allowedRowTypes.includes(RowType.Category) ? RowType.Category : defaultRowType;

    return {
      row_type: rowType,
      content: trimmed,
    };
  } catch {
    return {
      row_type: RowType.Text,
      content: text.trim(),
    };
  }
}

export function parseTextToItems(text: string, typeConfig?: SectionTypeConfig): FormatterItem[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, index) => {
      const item = parseLine(line, typeConfig) || { row_type: RowType.Text, content: line };
      item.order = index;
      return item;
    });
}

export function itemToPlainText(item: FormatterItem, rowTypes: Record<string, RowTypeConfig>): string {
  const cfg = rowTypes[item.row_type] || {};
  const segments = cfg.segments || [];
  const parts: string[] = [];

  for (const seg of segments) {
    if (seg.kind === SegmentKind.Counter && (item.count || 0) > 0) {
      parts.push(`(${item.count})`);
    } else if (seg.kind === SegmentKind.Time && item[seg.field!]) {
      parts.push(item[seg.field!] as string);
    }
  }

  if (parts.length > 0) {
    if (item.start && item.end) {
      return `${item.start} - ${item.end}: ${item.content}`;
    }
    return `${parts.join(" ")} ${item.content}`;
  }

  return item.content;
}

export function itemsToPlainText(items: FormatterItem[], rowTypes: Record<string, RowTypeConfig>): string {
  return items.map((item) => itemToPlainText(item, rowTypes)).join("\n");
}

// =============================================================================
// EDITOR CLASS
// =============================================================================

export class FieldFormatter {
  private container: HTMLElement;
  private sectionsContainer: HTMLElement;
  private jsonInput: HTMLInputElement;
  private sectionTypes: Record<string, SectionTypeConfig>;
  private rowTypes: Record<string, RowTypeConfig>;
  private defaultMode: "plain" | "hybrid";
  private fixedType: string | null;
  private sections: FormatterSection[];
  private _shouldFocusSectionIndex: number | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.defaultMode = (container.dataset.defaultMode as "plain" | "hybrid") || "hybrid";
    this.fixedType = container.dataset.fixedType || null;
    
    const configEl = container.querySelector("[data-config]");
    const jsonInput = container.querySelector("[data-formatter-json]") as HTMLInputElement;
    this.jsonInput = jsonInput;

    let config: FormatterConfig = { sectionTypes: {}, rowTypes: {} };
    if (configEl) {
      try {
        config = JSON.parse(configEl.textContent || "{}");
      } catch {
        console.error("FieldFormatter: Invalid config JSON");
      }
    }
    this.sectionTypes = config.sectionTypes;
    this.rowTypes = config.rowTypes;

    this.sectionsContainer = container.querySelector("[data-sections-container]") as HTMLElement;
    this.sections = this.loadInitialState();

    this.bindEvents();
    this.bindDragEvents();
    this.render();
  }

  private loadInitialState(): FormatterSection[] {
    const initialValue = (this.jsonInput.value || "").trim();
    const fallbackType = this.fixedType || Object.keys(this.sectionTypes)[0] || "generic";
    const fallbackTypeConfig = this.sectionTypes[fallbackType];

    if (!initialValue) return [];

    try {
      const startIndex = Math.min(
        initialValue.indexOf("{") === -1 ? Infinity : initialValue.indexOf("{"),
        initialValue.indexOf("[") === -1 ? Infinity : initialValue.indexOf("[")
      );

      if (startIndex !== Infinity) {
        const possibleJson = initialValue.substring(startIndex);
        const parsed = JSON.parse(possibleJson);
        if (parsed && Array.isArray(parsed.sections)) {
          return (parsed.sections as FormatterSection[]).map(s => ({
            ...s,
            items: Array.isArray(s.items) ? s.items : [],
            _viewMode: s._viewMode || "hybrid",
            _plainText: itemsToPlainText(s.items, this.rowTypes)
          }));
        }
      }
      throw new Error("No structured data found");
    } catch {
      return [{
        type: fallbackType,
        title: fallbackTypeConfig?.label || fallbackType,
        order: 0,
        items: parseTextToItems(initialValue, fallbackTypeConfig),
        _plainText: initialValue,
        _viewMode: this.defaultMode
      }];
    }
  }

  private bindEvents(): void {
    const addBtn = this.container.querySelector('[data-action="add-section"]');
    if (addBtn) {
      addBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.addSection();
      });
    }

    const clearAllBtn = this.container.querySelector('[data-action="clear-all"]');
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.clearAll();
      });
    }

    this.sectionsContainer.addEventListener("click", (e) => {
      const btn = (e.target as HTMLElement).closest("[data-action]") as HTMLElement;
      if (!btn) return;

      const action = btn.dataset.action;
      const { sectionIndex, itemIndex } = this.getIndices(btn);

      e.preventDefault();

      if (action === "clear-all") {
        this.clearAll();
      } else if (sectionIndex !== null) {
        if (action === "remove-section") {
          this.removeSection(sectionIndex);
        } else if (action === "toggle-section-view") {
          this.toggleSectionView(sectionIndex);
        } else if (itemIndex !== null) {
          this.handleItemAction(sectionIndex, action!, itemIndex);
        }
      }
    });

    this.sectionsContainer.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement | HTMLSelectElement;
      const { sectionIndex } = this.getIndices(target);
      if (sectionIndex === null) return;

      if (target.matches("[data-section-type-select]")) {
        this.changeSectionType(sectionIndex, target.value);
      } else if (target.matches("[data-section-title-input]")) {
        const section = this.sections[sectionIndex];
        if (section) {
          section.title = target.value;
          this.updateJson();
        }
      }
    });

    this.sectionsContainer.addEventListener("input", (e) => {
      const target = e.target as HTMLTextAreaElement;
      const { sectionIndex } = this.getIndices(target);
      if (sectionIndex === null) return;

      if (target.matches("[data-section-plain-text]")) {
        this.syncSectionFromPlainText(sectionIndex, target.value);
      }
    });

    this.sectionsContainer.addEventListener("keydown", (e) => {
      const target = e.target as HTMLInputElement;
      if (e.key === "Enter" && target.matches("[data-new-item-input]")) {
        e.preventDefault();
        const { sectionIndex } = this.getIndices(target);
        const text = target.value.trim();
        if (sectionIndex !== null && text) {
          this._shouldFocusSectionIndex = sectionIndex;
          this.addItemToSection(sectionIndex, text);
        }
      }
    });

    this.sectionsContainer.addEventListener("paste", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.matches("[data-new-item-input]")) {
        e.preventDefault();
        const { sectionIndex } = this.getIndices(target);
        const text = (e.clipboardData || (window as any).clipboardData).getData("text");
        if (sectionIndex !== null && text) {
          this._shouldFocusSectionIndex = sectionIndex;
          this.addMultipleItemsToSection(sectionIndex, text);
        }
      }
    });
  }

  private getIndices(el: HTMLElement): { sectionIndex: number | null; itemIndex: number | null } {
    const sectionEl = el.closest("[data-section-index]") as HTMLElement;
    const lineEl = el.closest(".field-formatter-line") as HTMLElement;
    return {
      sectionIndex: sectionEl ? parseInt(sectionEl.dataset.sectionIndex!, 10) : null,
      itemIndex: lineEl ? parseInt(lineEl.dataset.index!, 10) : null,
    };
  }

  private addSection(): void {
    const defaultType = Object.keys(this.sectionTypes)[0] || "generic";
    const typeConfig = this.sectionTypes[defaultType];

    this.sections.push({
      type: defaultType,
      title: typeConfig?.label || defaultType,
      order: this.sections.length,
      items: [],
      _viewMode: this.defaultMode,
      _plainText: "",
    });

    this.render();
  }

  private removeSection(index: number): void {
    this.sections.splice(index, 1);
    this.reorderSections();
    this.render();
  }

  private clearAll(): void {
    const section = this.sections[0];
    if (this.fixedType && section) {
      section.items = [];
      section._plainText = "";
      this.render();
    } else {
      this.sections = [];
      this.render();
    }
  }

  private changeSectionType(index: number, newType: string): void {
    const section = this.sections[index];
    if (!section) return;
    const typeConfig = this.sectionTypes[newType];
    section.type = newType;
    if (!typeConfig?.requiresTitle) {
      section.title = typeConfig?.label || newType;
    }
    section.items = [];
    section._plainText = "";
    this.render();
  }

  private toggleSectionView(index: number): void {
    const section = this.sections[index];
    if (!section) return;
    if (section._viewMode === "plain") {
      const typeConfig = this.sectionTypes[section.type];
      section.items = parseTextToItems(section._plainText || "", typeConfig);
      section._viewMode = "hybrid";
    } else {
      section._plainText = itemsToPlainText(section.items, this.rowTypes);
      section._viewMode = "plain";
    }
    this.render();
  }

  private handleItemAction(sectionIndex: number, action: string, itemIndex: number): void {
    const section = this.sections[sectionIndex];
    if (!section) return;
    const item = section.items[itemIndex];

    if (action === ActionType.Remove) {
      section.items.splice(itemIndex, 1);
      this.render();
      return;
    }

    if (!item) return;

    const cfg = this.rowTypes[item.row_type] || {};
    const transitions = cfg.transitions || {};

    if (transitions[action]) {
      item.row_type = transitions[action]!;
      this.ensureDefaults(item);
      this.render();
    } else if (action === ActionType.Increment) {
      if (transitions[ActionType.Increment]) {
        item.row_type = transitions[ActionType.Increment]!;
        this.ensureDefaults(item);
      }
      item.count = (item.count || 0) + 1;
      this.render();
    } else if (action === ActionType.Decrement) {
      if ((item.count || 0) > 0) {
        item.count!--;
        if (item.count === 0 && transitions[ActionType.DecrementZero]) {
          item.row_type = transitions[ActionType.DecrementZero]!;
          delete item.count;
        }
        this.render();
      }
    }
  }

  private ensureDefaults(item: FormatterItem): void {
    const cfg = this.rowTypes[item.row_type] || {};
    const extraFields = cfg.extraFields || {};
    for (const [field, fieldCfg] of Object.entries(extraFields)) {
      if (item[field] == null && (fieldCfg as { default: unknown }).default != null) {
        item[field] = (fieldCfg as { default: unknown }).default;
      }
    }
  }

  private syncSectionFromPlainText(sectionIndex: number, text: string): void {
    const section = this.sections[sectionIndex];
    if (!section) return;
    section._plainText = text;
    const typeConfig = this.sectionTypes[section.type];
    section.items = parseTextToItems(text, typeConfig);
    this.updateJson();
  }

  private addItemToSection(sectionIndex: number, text: string): void {
    const section = this.sections[sectionIndex];
    if (!section) return;
    const typeConfig = this.sectionTypes[section.type];
    const item = parseLine(text, typeConfig) || { row_type: RowType.Text, content: text };
    item.order = section.items.length;
    section.items.push(item);
    this.render();
  }

  private addMultipleItemsToSection(sectionIndex: number, text: string): void {
    const section = this.sections[sectionIndex];
    if (!section) return;
    const typeConfig = this.sectionTypes[section.type];
    const items = parseTextToItems(text, typeConfig);
    section.items.push(...items);
    this.render();
  }

  private reorderSections(): void {
    this.sections.forEach((s, i) => (s.order = i));
  }

  private updateJson(): void {
    if (!this.jsonInput) return;

    if (this.sections.length === 0) {
      this.jsonInput.value = "";
      return;
    }

    const allPlain = this.sections.every(s => s._viewMode === "plain");
    const firstSection = this.sections[0];
    const canStorePlain = allPlain && (this.fixedType || this.sections.length === 1) && firstSection;

    if (canStorePlain) {
      this.jsonInput.value = firstSection._plainText || "";
      return;
    }

    // Clean up internal properties before saving JSON
    const cleanSections = this.sections.map(({ _viewMode: _, _plainText: __, ...s }) => s);
    this.jsonInput.value = JSON.stringify({ sections: cleanSections });
    this.jsonInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  private bindDragEvents(): void {
    if (!this.fixedType) {
      new SortableList(this.sectionsContainer, {
        itemSelector: ".field-formatter-section",
        handleSelector: ".field-formatter-section__drag-handle",
        dataKey: "sectionIndex",
        onSort: (from, to) => {
          const [moved] = this.sections.splice(from, 1);
          if (moved) {
            this.sections.splice(to, 0, moved);
            this.reorderSections();
            this.render();
          }
        },
      });
    }

    this.sectionsContainer.addEventListener("dblclick", (e) => {
      const nameEl = (e.target as HTMLElement).closest(".field-formatter-line__name") as HTMLElement;
      if (!nameEl) return;
      const { sectionIndex, itemIndex } = this.getIndices(nameEl);
      if (sectionIndex !== null && itemIndex !== null) {
        this.handleItemDblClick(sectionIndex, itemIndex, nameEl);
      }
    });
  }

  private handleItemDblClick(sectionIndex: number, itemIndex: number, nameEl: HTMLElement): void {
    const section = this.sections[sectionIndex];
    const item = section?.items[itemIndex];
    if (!item) return;

    const rowConfig = this.rowTypes[item.row_type] || {};
    if (!rowConfig.actions?.includes(ActionType.DoubleClick)) return;

    const original = item.content;
    const input = document.createElement("input");
    input.type = "text";
    input.className = "field-formatter-inline-edit";
    input.value = original;

    const save = () => {
      const val = input.value.trim();
      if (val && val !== original) {
        item.content = val;
      }
      this.render();
    };

    input.addEventListener("blur", save);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") save();
      else if (e.key === "Escape") this.render();
    });

    nameEl.innerHTML = "";
    nameEl.appendChild(input);
    input.focus();
    input.select();
  }

  private bindItemDragEvents(): void {
    this.sectionsContainer.querySelectorAll("[data-items-container]").forEach((container) => {
      const sectionEl = container.closest("[data-section-index]") as HTMLElement;
      if (!sectionEl) return;
      const sectionIndex = parseInt(sectionEl.dataset.sectionIndex!, 10);

      new SortableList(container as HTMLElement, {
        itemSelector: ".field-formatter-line",
        handleSelector: ".field-formatter-line__drag-handle",
        dataKey: "index",
        onSort: (from, to) => {
          const section = this.sections[sectionIndex];
          if (!section) return;
          const [moved] = section.items.splice(from, 1);
          if (moved) {
            section.items.splice(to, 0, moved);
            this.render();
          }
        },
      });
    });
  }

  private render(): void {
    this.sectionsContainer.innerHTML = "";

    if (this.sections.length === 0) {
      this.sectionsContainer.innerHTML = `
        <div class="field-formatter-empty-sections">
          <p class="text-gray-500 text-sm">No sections yet. Click "Add Section" to start.</p>
        </div>`;
      this.updateJson();
      return;
    }

    this.sections.forEach((section, sectionIndex) => {
      const typeConfig = this.sectionTypes[section.type];
      const sectionEl = document.createElement("div");
      sectionEl.className = "field-formatter-section";
      sectionEl.dataset.sectionIndex = sectionIndex.toString();
      sectionEl.draggable = !this.fixedType;
      const plainText = section._plainText ?? itemsToPlainText(section.items, this.rowTypes);

      const headerHtml = this.fixedType
        ? `
          <div class="field-formatter-section__header field-formatter-section__header--fixed">
            <span class="field-formatter-section__title">${escapeHtml(section.title)}</span>
            <div class="field-formatter-section__actions">
              <button type="button" class="field-formatter-section__action-btn" data-action="toggle-section-view">
                ${section._viewMode === "plain" ? "Structured" : "Plain Text"}
              </button>
              <button type="button" class="field-formatter__action-btn field-formatter__action-btn--danger" data-action="${ActionType.Remove}" title="Clear all">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
              </button>
            </div>
          </div>
        `
        : `
          <div class="field-formatter-section__header">
            <div class="field-formatter-section__drag-handle" title="Drag to reorder">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
              </svg>
            </div>
            <select data-section-type-select class="field-formatter-section__type-select">
              ${Object.entries(this.sectionTypes)
                .map(([key, config]) => `<option value="${key}" ${key === section.type ? "selected" : ""}>${config.label}</option>`)
                .join("")}
            </select>
            ${typeConfig?.requiresTitle ? `
              <input type="text" data-section-title-input value="${escapeHtml(section.title)}"
                     class="field-formatter-section__title-input" placeholder="Section title...">
            ` : `
              <span class="field-formatter-section__title">${escapeHtml(section.title)}</span>
            `}
            <div class="field-formatter-section__actions">
              <button type="button" class="field-formatter-section__action-btn" data-action="toggle-section-view">
                ${section._viewMode === "plain" ? "Structured" : "Plain Text"}
              </button>
              <button type="button" class="field-formatter-section__action-btn field-formatter-section__action-btn--danger" data-action="remove-section">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        `;

      sectionEl.innerHTML = `
        ${headerHtml}
        <div class="field-formatter-section__body">
          <div data-items-container style="${section._viewMode === "plain" ? "display: none;" : ""}">
            ${this.renderSectionItems(section)}
          </div>
          <textarea data-section-plain-text class="field-formatter-plain-text"
                    style="${section._viewMode === "plain" ? "display: block;" : "display: none;"}"
                    placeholder="Paste items here...">${plainText}</textarea>
        </div>
        <div class="field-formatter-section__input-area" style="${section._viewMode === "plain" ? "display: none;" : ""}">
          <input type="text" data-new-item-input placeholder="Add or paste items here..." class="field-formatter-section__input">
        </div>
      `;

      this.sectionsContainer.appendChild(sectionEl);
    });

    this.updateJson();

    if (this._shouldFocusSectionIndex !== null) {
      const input = this.sectionsContainer.querySelector(`[data-section-index="${this._shouldFocusSectionIndex}"] [data-new-item-input]`) as HTMLInputElement;
      input?.focus();
      this._shouldFocusSectionIndex = null;
    }

    this.bindItemDragEvents();
  }

  private renderSectionItems(section: FormatterSection): string {
    if (section.items.length === 0) {
      const typeConfig = this.sectionTypes[section.type];
      const examples = typeConfig?.examples || ['Add items here...'];
      return `
        <div class="field-formatter-empty">
          <div class="field-formatter-empty__label">Example formats:</div>
          <div class="field-formatter-empty__examples">
            ${examples.map(ex => `<code>${escapeHtml(ex)}</code>`).join('')}
          </div>
        </div>`;
    }
    return section.items.map((item, index) => renderRow(item, index, this.rowTypes)).join("");
  }

  static initialize(container: HTMLElement): void {
    if (!container || container.dataset.initialized === "true") return;

    // Inject styles if not already present
    if (!document.getElementById('field-formatter-styles')) {
      const style = document.createElement('style');
      style.id = 'field-formatter-styles';
      style.textContent = FieldFormatterStyles;
      document.head.appendChild(style);
    }

    container.dataset.initialized = "true";
    new FieldFormatter(container);
  }
}

export default FieldFormatter;
