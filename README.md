# Field Formatter

A robust, TypeScript-based text-to-structured-data formatter. Designed to work seamlessly with Laravel backends but fully independent on the frontend.

## Features

- **Hybrid Editing**: Switch between plain text (copy-paste friendly) and structured UI (drag-and-drop, counters, icons).
- **Type Safety**: Fully typed with TypeScript Enums mirroring Laravel backend definitions.
- **Extensible Parsing**: Register custom parsers for new row types easily.
- **React Component**: Modern, hook-based React wrapper included.
- **Vanilla JS Support**: Standalone class for legacy systems.

## Usage

### React

```tsx
import { FieldFormatterComponent } from './FieldFormatterComponent';
import { DefaultConfig } from './defaultConfig';

function MyEditor() {
  const [data, setData] = useState("");

  return (
    <FieldFormatterComponent
      config={DefaultConfig} // Or inject from backend
      initialValue={data}
      onChange={setData}
    />
  );
}
```

### Vanilla JS

```js
import FieldFormatter from './FieldFormatter';

const container = document.getElementById('editor');
FieldFormatter.initialize(container);
```

## Configuration

The configuration is driven by `sectionTypes` and `rowTypes`. 
See `defaultConfig.ts` for a comprehensive example of how to define:

- **Segments**: The building blocks of a row (Icon, Time, Text, Counter, Badge).
- **Transitions**: How a row changes type (e.g., clicking "Convert to Item").
- **Parsers**: Logic is handled via `registerParser` in `FieldFormatter.ts`.

## Backend Integration (Laravel)

1. Define your Enums in Laravel.
2. Generate a JSON config matching the structure in `FormatterConfig`.
3. Pass this JSON to the frontend (e.g., via `data-config` attribute or props).

## Development

- **Tests**: Run `npm test` (requires Vitest).
- **Styles**: Styles are self-contained in `FieldFormatterStyles.ts`.
```
