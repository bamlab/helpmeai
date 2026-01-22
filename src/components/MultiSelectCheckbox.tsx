import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface Item<T> {
  label: string;
  value: T;
}

interface MultiSelectCheckboxProps<T> {
  items: Item<T>[];
  defaultSelected?: T[];
  onSubmit: (selected: T[]) => void;
}

export function MultiSelectCheckbox<T>({ items, defaultSelected = [], onSubmit }: MultiSelectCheckboxProps<T>) {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(
    new Set(
      items
        .map((item, index) => 
          defaultSelected.includes(item.value) ? index : -1
        )
        .filter((i) => i !== -1)
    )
  );

  useInput((input, key) => {
    if (key.upArrow) {
      setCursor(Math.max(0, cursor - 1));
    } else if (key.downArrow) {
      setCursor(Math.min(items.length - 1, cursor + 1));
    } else if (input === ' ') {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(cursor)) {
          next.delete(cursor);
        } else {
          next.add(cursor);
        }
        return next;
      });
    } else if (key.return) {
      const selectedItems = items.filter((_, index) => selected.has(index)).map((item) => item.value);
      onSubmit(selectedItems);
    }
  });

  return (
    <Box flexDirection="column">
      {items.map((item, index) => {
        const isSelected = selected.has(index);
        const isCursor = cursor === index;

        return (
          <Box key={index}>
            <Text color={isCursor ? 'cyan' : undefined}>
              {isCursor ? '❯ ' : '  '}
              {isSelected ? '☑ ' : '☐ '}
              {item.label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
