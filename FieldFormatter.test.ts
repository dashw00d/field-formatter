import { describe, it, expect } from 'vitest';
import { parseLine, normalizeTime, itemToPlainText } from './FieldFormatter';
import { RowType, SegmentKind } from './enums';
import { FormatterItem, RowTypeConfig } from './FieldFormatter';

describe('FieldFormatter Logic', () => {
  
  describe('normalizeTime', () => {
    it('normalizes simple HH:MM', () => {
      expect(normalizeTime('14:30')).toBe('14:30');
      expect(normalizeTime('2:30')).toBe('02:30');
    });

    it('normalizes AM/PM', () => {
      expect(normalizeTime('2:30 pm')).toBe('14:30');
      expect(normalizeTime('2:30pm')).toBe('14:30');
      expect(normalizeTime('11:00 am')).toBe('11:00');
      expect(normalizeTime('12:00 pm')).toBe('12:00'); // Noon
      expect(normalizeTime('12:00 am')).toBe('00:00'); // Midnight
      expect(normalizeTime('12:30 am')).toBe('00:30');
    });

    it('returns original string on failure', () => {
      expect(normalizeTime('invalid')).toBe('invalid');
      expect(normalizeTime('')).toBe('');
    });
  });

  describe('parseLine', () => {
    it('parses basic text', () => {
      const result = parseLine('Hello World');
      expect(result).toEqual({ row_type: 'text', content: 'Hello World' });
    });

    it('parses time blocks', () => {
      const config = { label: 'Test', allowedRowTypes: ['time_block'] };
      const result = parseLine('10:00 - 11:00: Meeting', config);
      expect(result).toEqual({
        row_type: 'time_block',
        content: 'Meeting',
        start: '10:00',
        end: '11:00'
      });
    });

    it('parses contacts with phone', () => {
      const config = { label: 'Test', allowedRowTypes: ['contact'] };
      const result = parseLine('John Doe (555-0123)', config);
      expect(result).toEqual({
        row_type: 'contact',
        content: 'John Doe',
        phone: '555-0123'
      });
    });

    it('parses contacts with role', () => {
      const config = { label: 'Test', allowedRowTypes: ['contact'] };
      const result = parseLine('Jane Doe (Manager)', config);
      expect(result).toEqual({
        row_type: 'contact',
        content: 'Jane Doe',
        role: 'Manager'
      });
    });

    it('parses counted items', () => {
      const config = { label: 'Test', allowedRowTypes: ['item'] };
      const result1 = parseLine('(5) Chairs', config);
      expect(result1).toEqual({
        row_type: 'item',
        content: 'Chairs',
        count: 5
      });

      const result2 = parseLine('Tables (3)', config);
      expect(result2).toEqual({
        row_type: 'item',
        content: 'Tables',
        count: 3
      });
    });
  });

  describe('itemToPlainText', () => {
    const rowTypes: Record<string, RowTypeConfig> = {
      [RowType.Item]: {
        segments: [{ kind: SegmentKind.Counter, field: 'count' }, { kind: SegmentKind.Text }]
      },
      [RowType.TimeBlock]: {
        segments: [{ kind: SegmentKind.Time, field: 'start' }, { kind: SegmentKind.Text }]
      }
    };

    it('formats counted items', () => {
      const item: FormatterItem = { row_type: RowType.Item, content: 'Chairs', count: 5 };
      expect(itemToPlainText(item, rowTypes)).toBe('(5) Chairs');
    });

    it('formats time blocks', () => {
      // Note: The logic in itemToPlainText for time_blocks is specific (checks start && end)
      const item: FormatterItem = { 
        row_type: RowType.TimeBlock, 
        content: 'Meeting', 
        start: '10:00', 
        end: '11:00' 
      };
      // The function specifically handles start & end as a special case
      expect(itemToPlainText(item, rowTypes)).toBe('10:00 - 11:00: Meeting');
    });
  });

});
