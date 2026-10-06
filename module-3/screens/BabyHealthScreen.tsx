import React, {useEffect, useState} from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import API from '../services/api';

type Reading = {
  temperature_c: number;
  heart_rate_bpm: number;
  respiratory_rate_bpm: number;
  oxygen_saturation: number;
  weight_kg: number;
  feeding_frequency_per_day: number;
  sleeping_hours: number;
  vaccination_status: string;
  risk_level: string;
  recorded_at?: string;

  model?: {
    prediction?: string;
    probability_at_risk?: number;
  };
};

function BabyHealthScreen() {
  const [reading, setReading] = useState<Reading | null>(null);
  const [history, setHistory] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const response = await API.get(
          '/monitoring/demo-baby-001',
        );

        console.log(
          'Baby Health Response:',
          response.data,
        );

        const readings = response.data?.readings || [];

        if (readings.length > 0) {
          // Last saved reading = latest reading
          const latestReading =
            readings[readings.length - 1];

          setReading(latestReading);

          // Store all readings
          setHistory(readings);
        } else {
          setError(true);
        }
      } catch (err) {
        console.log(
          'Health API Error:',
          err,
        );

        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>
            Loading baby health...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !reading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            Unable to load baby health data.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get previous reading
  const previousReading =
    history.length > 1
      ? history[history.length - 2]
      : null;

  // Calculate basic health trend
  const getTrend = (
    current: number,
    previous: number | undefined,
  ) => {
    if (previous === undefined) {
      return 'No previous data';
    }

    const difference = current - previous;

    if (difference > 0.1) {
      return '↗ Increased';
    }

    if (difference < -0.1) {
      return '↘ Decreased';
    }

    return '→ Stable';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Baby Health ❤️
          </Text>

          <Text style={styles.subtitle}>
            Current health observations of your baby
          </Text>
        </View>

        {/* Health Status */}
        <View
          style={[
            styles.statusCard,
            reading.risk_level === 'urgent review' &&
              styles.urgentStatusCard,
          ]}
        >
          <Text style={styles.statusIcon}>
            {reading.risk_level === 'urgent review'
              ? '⚠️'
              : '✅'}
          </Text>

          <View style={styles.statusContent}>
            <Text
              style={[
                styles.statusTitle,
                reading.risk_level === 'urgent review' &&
                  styles.urgentStatusTitle,
              ]}
            >
              Health Status
            </Text>

            <Text style={styles.statusText}>
              {reading.risk_level}
            </Text>

            {reading.model?.prediction && (
              <Text style={styles.predictionText}>
                AI Prediction: {reading.model.prediction}
              </Text>
            )}
          </View>
        </View>

        {/* Abnormal Warning */}
        {reading.risk_level === 'urgent review' && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>
              ⚠️ Clinical Review Recommended
            </Text>

            <Text style={styles.warningText}>
              Some health readings require further
              clinical assessment. Please consult a
              qualified healthcare professional.
            </Text>

            <Text style={styles.warningAction}>
              Action: Seek qualified clinical assessment.
            </Text>
          </View>
        )}

        {/* Vital Signs */}
        <Text style={styles.sectionTitle}>
          Vital Signs
        </Text>

        <View style={styles.grid}>

          {/* Temperature */}
          <View style={styles.vitalCard}>
            <Text style={styles.icon}>🌡️</Text>

            <Text style={styles.label}>
              Temperature
            </Text>

            <Text style={styles.value}>
              {reading.temperature_c} °C
            </Text>
          </View>

          {/* Heart Rate */}
          <View style={styles.vitalCard}>
            <Text style={styles.icon}>❤️</Text>

            <Text style={styles.label}>
              Heart Rate
            </Text>

            <Text style={styles.value}>
              {reading.heart_rate_bpm} bpm
            </Text>
          </View>

          {/* Respiratory Rate */}
          <View style={styles.vitalCard}>
            <Text style={styles.icon}>🫁</Text>

            <Text style={styles.label}>
              Respiratory Rate
            </Text>

            <Text style={styles.value}>
              {reading.respiratory_rate_bpm} /min
            </Text>
          </View>

          {/* Oxygen Saturation */}
          <View style={styles.vitalCard}>
            <Text style={styles.icon}>💧</Text>

            <Text style={styles.label}>
              Oxygen Saturation
            </Text>

            <Text style={styles.value}>
              {reading.oxygen_saturation}%
            </Text>
          </View>

        </View>

        {/* Daily Information */}
        <Text style={styles.sectionTitle}>
          Daily Information
        </Text>

        {/* Weight */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>⚖️</Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Weight
            </Text>

            <Text style={styles.infoValue}>
              {reading.weight_kg} kg
            </Text>
          </View>
        </View>

        {/* Feeding */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🍼</Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Feeding Frequency
            </Text>

            <Text style={styles.infoValue}>
              {reading.feeding_frequency_per_day} times today
            </Text>
          </View>
        </View>

        {/* Sleep */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>😴</Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Sleep
            </Text>

            <Text style={styles.infoValue}>
              {reading.sleeping_hours} hours today
            </Text>
          </View>
        </View>

        {/* Vaccination */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💉</Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Vaccination Status
            </Text>

            <Text style={styles.infoValue}>
              {reading.vaccination_status}
            </Text>
          </View>
        </View>

        {/* Health Trends */}
        <Text style={styles.sectionTitle}>
          Health Trends 📈
        </Text>

        <View style={styles.trendCard}>

          {/* Temperature Trend */}
          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>
              🌡️ Temperature
            </Text>

            <Text style={styles.trendValue}>
              {getTrend(
                reading.temperature_c,
                previousReading?.temperature_c,
              )}
            </Text>
          </View>

          {/* Heart Rate Trend */}
          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>
              ❤️ Heart Rate
            </Text>

            <Text style={styles.trendValue}>
              {getTrend(
                reading.heart_rate_bpm,
                previousReading?.heart_rate_bpm,
              )}
            </Text>
          </View>

          {/* Oxygen Trend */}
          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>
              💧 Oxygen Saturation
            </Text>

            <Text style={styles.trendValue}>
              {getTrend(
                reading.oxygen_saturation,
                previousReading?.oxygen_saturation,
              )}
            </Text>
          </View>

          {/* Weight Trend */}
          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>
              ⚖️ Weight
            </Text>

            <Text style={styles.trendValue}>
              {getTrend(
                reading.weight_kg,
                previousReading?.weight_kg,
              )}
            </Text>
          </View>

        </View>

        {/* Health Reading History */}
        <Text style={styles.sectionTitle}>
          Health Reading History
        </Text>

        {history
          .slice()
          .reverse()
          .map((item, index) => {

            const isUrgent =
              item.risk_level === 'urgent review';

            return (
              <View
                key={index}
                style={[
                  styles.historyCard,
                  isUrgent &&
                    styles.urgentHistoryCard,
                ]}
              >

                <View style={styles.historyHeader}>

                  <Text style={styles.historyNumber}>
                    Reading {history.length - index}
                  </Text>

                  <Text
                    style={[
                      styles.historyRisk,
                      isUrgent &&
                        styles.urgentHistoryRisk,
                    ]}
                  >
                    {isUrgent
                      ? '⚠️ Urgent Review'
                      : '✅ Routine Monitoring'}
                  </Text>

                </View>

                <View style={styles.historyRow}>
                  <Text style={styles.historyLabel}>
                    Temperature
                  </Text>

                  <Text style={styles.historyValue}>
                    {item.temperature_c} °C
                  </Text>
                </View>

                <View style={styles.historyRow}>
                  <Text style={styles.historyLabel}>
                    Heart Rate
                  </Text>

                  <Text style={styles.historyValue}>
                    {item.heart_rate_bpm} bpm
                  </Text>
                </View>

                <View style={styles.historyRow}>
                  <Text style={styles.historyLabel}>
                    SpO₂
                  </Text>

                  <Text style={styles.historyValue}>
                    {item.oxygen_saturation}%
                  </Text>
                </View>

                <View style={styles.historyRow}>
                  <Text style={styles.historyLabel}>
                    Weight
                  </Text>

                  <Text style={styles.historyValue}>
                    {item.weight_kg} kg
                  </Text>
                </View>

              </View>
            );
          })}

        {/* Monitoring Note */}
        <View style={styles.noteCard}>

          <Text style={styles.noteTitle}>
            ℹ️ Monitoring Note
          </Text>

          <Text style={styles.noteText}>
            Previous health readings are stored in the
            neonatal monitoring backend and can be
            reviewed to observe health trends over time.
          </Text>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  loadingText: {
    fontSize: 17,
    color: '#6B7280',
  },

  errorText: {
    fontSize: 17,
    color: '#DC2626',
    textAlign: 'center',
  },

  header: {
    padding: 24,
    paddingTop: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 21,
  },

  statusCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    elevation: 2,
  },

  urgentStatusCard: {
    backgroundColor: '#FEF2F2',
  },

  statusIcon: {
    fontSize: 30,
    marginRight: 15,
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
  },

  urgentStatusTitle: {
    color: '#B91C1C',
  },

  statusText: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },

  predictionText: {
    fontSize: 14,
    color: '#166534',
    marginTop: 4,
    fontWeight: '600',
  },

  /* Abnormal Warning */

  warningCard: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },

  warningTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#B91C1C',
    marginBottom: 8,
  },

  warningText: {
    fontSize: 14,
    color: '#7F1D1D',
    lineHeight: 21,
  },

  warningAction: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#991B1B',
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },

  grid: {
    paddingHorizontal: 20,
  },

  vitalCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 3,
  },

  icon: {
    fontSize: 28,
  },

  label: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },

  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },

  infoIcon: {
    fontSize: 27,
    marginRight: 15,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 15,
    color: '#6B7280',
  },

  infoValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 3,
  },

  trendCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    elevation: 2,
  },

  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  trendLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },

  trendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  historyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },

  urgentHistoryCard: {
    backgroundColor: '#FFF7F7',
  },

  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  historyNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  historyRisk: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
  },

  urgentHistoryRisk: {
    color: '#B91C1C',
  },

  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  historyLabel: {
    fontSize: 14,
    color: '#6B7280',
  },

  historyValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  noteCard: {
    margin: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#E8F4F8',
  },

  noteTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#164E63',
  },

  noteText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 6,
    lineHeight: 20,
  },
});

export default BabyHealthScreen;