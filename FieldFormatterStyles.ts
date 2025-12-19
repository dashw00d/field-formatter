export const FieldFormatterStyles = `
.field-formatter-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  max-width: 100%;
}

.field-formatter-section {
  border-bottom: 1px solid #e5e7eb;
}

.field-formatter-section:last-child {
  border-bottom: none;
}

.field-formatter-section__header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  gap: 0.75rem;
}

.field-formatter-section__header--fixed {
  background: #f3f4f6;
  font-weight: 600;
}

.field-formatter-section__drag-handle {
  cursor: grab;
  color: #9ca3af;
  flex-shrink: 0;
}

.field-formatter-section__type-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
}

.field-formatter-section__title-input {
  flex-grow: 1;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.field-formatter-section__title {
  flex-grow: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.field-formatter-section__actions {
  display: flex;
  gap: 0.5rem;
}

.field-formatter-section__action-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: #4b5563;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
}

.field-formatter-section__action-btn:hover {
  background: #f3f4f6;
}

.field-formatter-section__action-btn--danger:hover {
  color: #dc2626;
  border-color: #fca5a5;
  background: #fef2f2;
}

.field-formatter-section__body {
  padding: 0.5rem;
}

.field-formatter-line {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  background: white;
  border: 1px solid #f3f4f6;
  border-radius: 0.375rem;
  gap: 0.75rem;
}

.field-formatter-line:hover {
  background: #f9fafb;
  border-color: #e5e7eb;
}

.field-formatter-line.is-dragging {
  opacity: 0.5;
  background: #eff6ff;
}

.field-formatter-line.drag-over {
  border-top: 2px solid #3b82f6;
}

.field-formatter-line__drag-handle {
  cursor: grab;
  color: #d1d5db;
}

.field-formatter-line__icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.field-formatter-line__name {
  flex-grow: 1;
  font-size: 0.875rem;
}

.field-formatter-line__counter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f3f4f6;
  padding: 0.125rem;
  border-radius: 9999px;
}

.field-formatter-line__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0.25rem;
  color: #4b5563;
  border: none;
  background: transparent;
  border-radius: 9999px;
  cursor: pointer;
}

.field-formatter-line__btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.field-formatter-line__btn:disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

.field-formatter-line__btn svg {
  width: 1rem;
  height: 1rem;
}

.field-formatter-line__count {
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 1rem;
  text-align: center;
}

.field-formatter-line__time {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.field-formatter-line__time-sep {
  color: #d1d5db;
  font-size: 0.75rem;
}

.field-formatter-line__extra {
  font-size: 0.75rem;
  background: #ebf5ff;
  color: #1e40af;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.field-formatter-line__type-hint {
  font-size: 0.625rem;
  color: #9ca3af;
  text-transform: uppercase;
}

.field-formatter-line__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.field-formatter-line__btn--remove:hover {
  color: #dc2626;
  background: #fef2f2;
}

.field-formatter-inline-edit {
  width: 100%;
  padding: 0.125rem 0.25rem;
  border: 1px solid #3b82f6;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.field-formatter-plain-text {
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-family: ui-monospace, monospace;
  font-size: 0.875rem;
  resize: vertical;
}

.field-formatter-section__input-area {
  padding: 0.75rem;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
}

.field-formatter-section__input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.field-formatter-section__input:focus {
  outline: none;
  border-color: #3b82f6;
  ring: 2px solid #bfdbfe;
}

.field-formatter-empty {
  padding: 1.5rem;
  text-align: center;
  background: #f9fafb;
  border: 2px dashed #e5e7eb;
  border-radius: 0.5rem;
}

.field-formatter-empty__label {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.field-formatter-empty__examples {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.field-formatter-empty__examples code {
  font-size: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  color: #6b7280;
}
`;
