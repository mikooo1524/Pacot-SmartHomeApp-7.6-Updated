import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SensorHistoryPoint } from '../models/IoTModels';
import { useIoT } from '../context/IoTContext';

type MetricType = 'temperature' | 'humidity' | 'lightLevel';

type Props = {
  data: SensorHistoryPoint[];
};

export default function SensorChart({ data }: Props) {
  const { theme } = useIoT();
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('temperature');

  const metricConfig = {
    temperature: {
      label: 'Temperature',
      unit: '°C',
      color: '#EF4444',
      maxVal: 40,
      minVal: 15,
    },
    humidity: {
      label: 'Humidity',
      unit: '%',
      color: '#3B82F6',
      maxVal: 100,
      minVal: 30,
    },
    lightLevel: {
      label: 'Light Level',
      unit: 'lux',
      color: '#F59E0B',
      maxVal: 1000,
      minVal: 0,
    },
  };

  const currentCfg = metricConfig[selectedMetric];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: theme.cardShadow,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          24-Hour Telemetry Trends
        </Text>

        {/* Metric Selector Tabs */}
        <View
          style={[
            styles.tabGroup,
            { backgroundColor: theme.surfaceSubdued },
          ]}
        >
          {(Object.keys(metricConfig) as MetricType[]).map((key) => {
            const isActive = selectedMetric === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedMetric(key)}
                style={[
                  styles.tab,
                  isActive && {
                    backgroundColor: theme.surface,
                    shadowColor: theme.cardShadow,
                    elevation: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: isActive
                        ? theme.textPrimary
                        : theme.textSecondary,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {key === 'temperature'
                    ? 'Temp'
                    : key === 'humidity'
                    ? 'Humidity'
                    : 'Light'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Chart Bars */}
      <View style={styles.chartArea}>
        {data.map((point, index) => {
          const val = point[selectedMetric];
          const range = currentCfg.maxVal - currentCfg.minVal;
          const normalized = Math.min(
            Math.max((val - currentCfg.minVal) / range, 0.1),
            1
          );
          const barHeight = normalized * 110;

          return (
            <View key={index} style={styles.barColumn}>
              <Text style={[styles.barValText, { color: theme.textSecondary }]}>
                {val}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: barHeight,
                      backgroundColor: currentCfg.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: theme.textMuted }]}>
                {point.timestamp}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: currentCfg.color },
            ]}
          />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>
            Current metric: {currentCfg.label} ({currentCfg.unit})
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  tabGroup: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 12,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: 10,
    paddingBottom: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barValText: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 110,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 6,
    fontWeight: '500',
  },
  footer: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
  },
});
