import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useIoT } from '../context/IoTContext';

type Props = {
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
};

export default function FilterChips({
  options,
  selectedOption,
  onSelect,
}: Props) {
  const { theme } = useIoT();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const isSelected = selectedOption === option;

        return (
          <TouchableOpacity
            key={option}
            onPress={() => onSelect(option)}
            activeOpacity={0.7}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? theme.primary : theme.surface,
                borderColor: isSelected ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: isSelected ? '#FFFFFF' : theme.textSecondary,
                  fontWeight: isSelected ? '700' : '500',
                },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
});
