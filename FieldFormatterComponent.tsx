import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FormatterConfig, 
  FormatterSection, 
  FormatterItem, 
  parseLine,
  parseTextToItems,
  itemsToPlainText,
  ActionType,
  SegmentKind,
  RowType
} from './FieldFormatter';
import { FieldFormatterStyles } from './FieldFormatterStyles';

interface Props {
  config: FormatterConfig;
  initialValue?: string;
  onChange?: (value: string) => void;
  defaultMode?: "plain" | "hybrid";
  fixedType?: string | null;
}

export const FieldFormatterComponent: React.FC<Props> = ({
  config,
  initialValue = "",
  onChange,
  defaultMode = "hybrid",
  fixedType = null
}) => {
  const [sections, setSections] = useState<FormatterSection[]>(() => {
    const val = initialValue.trim();
    const fallbackType = fixedType || Object.keys(config.sectionTypes)[0] || "generic";
    const fallbackTypeConfig = config.sectionTypes[fallbackType];

    if (!val) return [];

    try {
      const startIndex = Math.min(
        val.indexOf("{") === -1 ? Infinity : val.indexOf("{"),
        val.indexOf("[") === -1 ? Infinity : val.indexOf("[")
      );

      if (startIndex !== Infinity) {
        const possibleJson = val.substring(startIndex);
        const parsed = JSON.parse(possibleJson);
        if (parsed && Array.isArray(parsed.sections)) {
          return (parsed.sections as FormatterSection[]).map((s) => ({
            ...s,
            items: Array.isArray(s.items) ? s.items : [],
            _viewMode: s._viewMode || defaultMode,
            _plainText: itemsToPlainText(s.items, config.rowTypes)
          }));
        }
      }
    } catch {
      // Fallback
    }

    return [{
      type: fallbackType,
      title: fallbackTypeConfig?.label || fallbackType,
      order: 0,
      items: parseTextToItems(val, fallbackTypeConfig),
      _plainText: val,
      _viewMode: defaultMode
    }];
  });

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Update parent when sections change
  useEffect(() => {
    if (!isMounted.current) return;
    
    const allPlain = sections.every(s => s._viewMode === "plain");
    const canStorePlain = allPlain && (fixedType || sections.length === 1);

    let output = "";
    if (canStorePlain && sections[0]) {
      output = sections[0]._plainText || itemsToPlainText(sections[0].items, config.rowTypes);
    } else if (sections.length > 0) {
      const cleanSections = sections.map(({ _viewMode: _, _plainText: __, ...s }) => s);
      output = JSON.stringify({ sections: cleanSections });
    }

    onChange?.(output);
  }, [sections, config.rowTypes, fixedType, onChange]);

  const addSection = () => {
    const defaultType = Object.keys(config.sectionTypes)[0] || "generic";
    const typeConfig = config.sectionTypes[defaultType];
    setSections([...sections, {
      type: defaultType,
      title: typeConfig?.label || defaultType,
      order: sections.length,
      items: [],
      _viewMode: defaultMode,
      _plainText: ""
    }]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })));
  };

  const updateSection = (index: number, updates: Partial<FormatterSection>) => {
    setSections(sections.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  const toggleViewMode = (index: number) => {
    const section = sections[index]!;
    if (section._viewMode === "plain") {
      const typeConfig = config.sectionTypes[section.type];
      const items = parseTextToItems(section._plainText || "", typeConfig);
      updateSection(index, { items, _viewMode: "hybrid" });
    } else {
      const _plainText = itemsToPlainText(section.items, config.rowTypes);
      updateSection(index, { _plainText, _viewMode: "plain" });
    }
  };

  return (
    <div className="field-formatter-container">
      <style>{FieldFormatterStyles}</style>
      
      <div className="field-formatter-sections">
        {sections.length === 0 ? (
          <div className="field-formatter-empty-sections">
            <p className="text-gray-500 text-sm">No sections yet. Click "Add Section" to start.</p>
          </div>
        ) : (
          sections.map((section, idx) => (
            <SectionComponent
              key={idx}
              index={idx}
              section={section}
              config={config}
              onUpdate={(u) => updateSection(idx, u)}
              onRemove={() => removeSection(idx)}
              onToggleView={() => toggleViewMode(idx)}
              fixedMode={!!fixedType}
            />
          ))
        )}
      </div>

      {!fixedType && (
        <div className="p-4 border-t border-gray-100">
          <button 
            type="button"
            onClick={addSection}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Section
          </button>
        </div>
      )}
    </div>
  );
};

const SectionComponent: React.FC<{
  index: number;
  section: FormatterSection;
  config: FormatterConfig;
  onUpdate: (updates: Partial<FormatterSection>) => void;
  onRemove: () => void;
  onToggleView: () => void;
  fixedMode: boolean;
}> = ({ index, section, config, onUpdate, onRemove, onToggleView, fixedMode }) => {
  const typeConfig = config.sectionTypes[section.type];
  const [newItemText, setNewItemText] = useState("");

  const handleAddItem = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const item = parseLine(trimmed, typeConfig) || { row_type: RowType.Text, content: trimmed };
    onUpdate({ items: [...section.items, { ...item, order: section.items.length }] });
    setNewItemText("");
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const newItems = parseTextToItems(text, typeConfig);
    onUpdate({ items: [...section.items, ...newItems] });
  };

  const handleItemAction = useCallback((itemIdx: number, action: string) => {
    const item = section.items[itemIdx]!;
    const items = [...section.items];

    if (action === ActionType.Remove) {
      items.splice(itemIdx, 1);
      onUpdate({ items });
      return;
    }

    const rowCfg = config.rowTypes[item.row_type] || {};
    const transitions = rowCfg.transitions || {};

    if (transitions[action]) {
      items[itemIdx] = { ...item, row_type: transitions[action]! };
      onUpdate({ items });
    } else if (action === ActionType.Increment) {
      items[itemIdx] = { 
        ...item, 
        count: (item.count || 0) + 1,
        row_type: (transitions[ActionType.Increment] as string) || item.row_type
      };
      onUpdate({ items });
    } else if (action === ActionType.Decrement) {
      if ((item.count || 0) > 0) {
        const newCount = (item.count || 0) - 1;
        items[itemIdx] = { 
          ...item, 
          count: newCount,
          row_type: (newCount === 0 && transitions[ActionType.DecrementZero]) ? (transitions[ActionType.DecrementZero] as string) : item.row_type
        };
        onUpdate({ items });
      }
    }
  }, [section.items, config.rowTypes, onUpdate]);

  return (
    <div className="field-formatter-section" data-section-index={index}>
      <div className={`field-formatter-section__header ${fixedMode ? 'field-formatter-section__header--fixed' : ''}`}>
        {!fixedMode && (
          <div className="field-formatter-section__drag-handle">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
            </svg>
          </div>
        )}
        
        {!fixedMode && (
          <select 
            value={section.type}
            onChange={(e) => onUpdate({ type: e.target.value })}
            className="field-formatter-section__type-select"
          >
            {Object.entries(config.sectionTypes).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        )}

        {typeConfig?.requiresTitle && !fixedMode ? (
          <input 
            type="text"
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="field-formatter-section__title-input"
            placeholder="Section title..."
          />
        ) : (
          <span className="field-formatter-section__title">{section.title}</span>
        )}

        <div className="field-formatter-section__actions">
          <button type="button" onClick={onToggleView} className="field-formatter-section__action-btn">
            {section._viewMode === "plain" ? "Structured" : "Plain Text"}
          </button>
          {!fixedMode && (
            <button type="button" onClick={onRemove} className="field-formatter-section__action-btn field-formatter-section__action-btn--danger">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="field-formatter-section__body">
        {section._viewMode === "plain" ? (
          <textarea 
            className="field-formatter-plain-text"
            value={section._plainText || ""}
            onChange={(e) => onUpdate({ _plainText: e.target.value })}
            placeholder="Paste items here..."
          />
        ) : (
          <div className="field-formatter-items">
            {section.items.length === 0 ? (
              <div className="field-formatter-empty">
                <div className="field-formatter-empty__label">Example formats:</div>
                <div className="field-formatter-empty__examples">
                  {(typeConfig?.examples || ['Add items here...']).map((ex, i) => (
                    <code key={i}>{ex}</code>
                  ))}
                </div>
              </div>
            ) : (
              section.items.map((item, i) => (
                <ItemRow 
                  key={i} 
                  item={item} 
                  index={i} 
                  rowTypes={config.rowTypes}
                  onAction={(action) => handleItemAction(i, action)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {section._viewMode !== "plain" && (
        <div className="field-formatter-section__input-area">
          <input 
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem(newItemText)}
            onPaste={handlePaste}
            placeholder="Add or paste items here..."
            className="field-formatter-section__input"
          />
        </div>
      )}
    </div>
  );
};

const ItemRow: React.FC<{
  item: FormatterItem;
  index: number;
  rowTypes: Record<string, RowTypeConfig>;
  onAction: (action: string) => void;
}> = ({ item, index, rowTypes, onAction }) => {
  const rowType = item.row_type;
  const cfg = rowTypes[rowType] || {};
  const segments = cfg.segments || [];

  return (
    <div className={`field-formatter-line field-formatter-line--${rowType.replace(/_/g, '-')}`} data-index={index}>
      <div className="field-formatter-line__drag-handle">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {segments.find(s => s.kind === SegmentKind.Icon) && (
        <svg className="field-formatter-line__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={(segments.find(s => s.kind === SegmentKind.Icon)?.iconPath) as string} />
        </svg>
      )}

      <span className="field-formatter-line__name">{item.content}</span>

      {segments.map((seg, i) => {
        if (seg.kind === SegmentKind.Text || seg.kind === SegmentKind.Icon) return null;
        
        const value = seg.field ? item[seg.field] : null;
        
        return (
          <React.Fragment key={i}>
            {seg.kind === SegmentKind.Counter && (
              <div className="field-formatter-line__counter">
                <button type="button" onClick={() => onAction(ActionType.Decrement)} disabled={(value as number || 0) <= 0} className="field-formatter-line__btn">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                </button>
                <span className="field-formatter-line__count">{value as number || 0}</span>
                <button type="button" onClick={() => onAction(ActionType.Increment)} className="field-formatter-line__btn">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </button>
              </div>
            )}
            {seg.kind === SegmentKind.Time && value && (
              <span className="field-formatter-line__time">{value as string}</span>
            )}
            {seg.kind === SegmentKind.Badge && value && (
              <span className="field-formatter-line__extra">{value as string}</span>
            )}
            {seg.key === 'start' && <span className="field-formatter-line__time-sep">–</span>}
          </React.Fragment>
        );
      })}

      <div className="field-formatter-line__actions">
        {cfg.transitions?.[ActionType.ConvertToItem] && (
          <>
            <span className="field-formatter-line__type-hint">item →</span>
            <button type="button" onClick={() => onAction(ActionType.ConvertToItem)} className="field-formatter-line__btn">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </button>
          </>
        )}
        <button type="button" onClick={() => onAction(ActionType.Remove)} className="field-formatter-line__btn field-formatter-line__btn--remove">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};
