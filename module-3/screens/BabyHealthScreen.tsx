import React, {useCallback, useState} from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as API from '../src/services/api';

type Reading = {
  infant_id?: string;
  recorded_at?: string;
  simulated?: boolean;

  age_days?: number;
  gender?: string;
  gestational_age_weeks?: number;

  temperature_c?: number;
  heart_rate_bpm?: number;
  respiratory_rate_bpm?: number;
  oxygen_saturation?: number;

  weight_kg?: number;
  length_cm?: number;
  head_circumference_cm?: number;

  feeding_type?: string;
  feeding_frequency_per_day?: number;
  urine_output_count?: number;
  stool_count?: number;

  jaundice_level_mg_dl?: number;
  sleeping_hours?: number;
  vaccination_status?: string;

  risk_level?: string;
  risk_reasons?: string[];
  risk_basis?: string;

  symptoms?: string[];
};

type MonitoringResponseLocal = {
  infant_id?: string;
  count?: number;
  readings?: Reading[];
};

function formatDate(value?: string) {
  if (!value) {
    return 'Not available';
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatAge(ageDays?: number) {
  if (ageDays === undefined || ageDays === null) {
    return 'Age not available';
  }

  if (ageDays < 30) {
    return `${ageDays} day${ageDays === 1 ? '' : 's'}`;
  }

  const months = Math.floor(ageDays / 30);
  const days = ageDays % 30;

  if (days === 0) {
    return `${months} month${months === 1 ? '' : 's'}`;
  }

  return `${months} month${months === 1 ? '' : 's'} ${days} day${
    days === 1 ? '' : 's'
  }`;
}

function getStatusText(riskLevel?: string) {
  if (!riskLevel) {
    return 'Monitoring';
  }

  return riskLevel
    .replace(/_/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function getTemperatureStatus(temperature?: number) {
  if (temperature === undefined) {
    return 'Not available';
  }

  if (temperature >= 38) {
    return 'High - medical review required';
  }

  if (temperature < 36) {
    return 'Low - medical review required';
  }

  if (temperature < 36.5 || temperature > 37.5) {
    return 'Outside reference range - review';
  }

  return 'Within reference range';
}

function getHeartRateStatus(heartRate?: number) {
  if (heartRate === undefined) {
    return 'Not available';
  }

  if (heartRate < 100 || heartRate > 160) {
    return 'Outside reference range';
  }

  return 'Within reference range';
}

function getRespiratoryStatus(rate?: number) {
  if (rate === undefined) {
    return 'Not available';
  }

  if (rate > 60) {
    return 'Fast breathing - review';
  }

  if (rate < 30) {
    return 'Low - review';
  }

  return 'Within reference range';
}

function getOxygenStatus(value?: number) {
  if (value === undefined) {
    return 'Not available';
  }

  if (value < 94) {
    return 'Low - review required';
  }

  return 'Acceptable for prototype monitoring';
}

export default function BabyHealthScreen({route}: any) {
  const babyId = route?.params?.user?.baby_id;

  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadHealthData = useCallback(async () => {
    try {
      setError('');

      if (!babyId) {
        setReadings([]);
        setError(
          'No baby profile is linked to the logged-in user.',
        );
        return;
      }

      console.log(
        'Loading baby health data for:',
        babyId,
      );

      const response = await API.getMonitoringHistory(babyId);

console.log('BABY HEALTH RESPONSE:', response);

if (!response || !Array.isArray(response.readings)) {
  throw new Error('Invalid monitoring response from backend.');
}
      console.log(
        'Baby Health Response:',
        JSON.stringify(response, null, 2),
      );

      const receivedReadings = Array.isArray(
        response?.readings,
      )
        ? response.readings
        : [];

      console.log(
        'Number of readings:',
        receivedReadings.length,
      );

      setReadings(receivedReadings);
    } catch (err: any) {
      console.log(
        'Baby Health Error:',
        err,
      );

      setReadings([]);

      setError(
        err?.message ||
          'Unable to load baby health data. Please check that health readings are available.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [babyId]);

  React.useEffect(() => {
    loadHealthData();
  }, [loadHealthData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadHealthData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading baby health data...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        contentContainerStyle={styles.center}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }>
        <Text style={styles.errorTitle}>
          Unable to load baby health data
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <Text style={styles.retryText}>
          Pull down to refresh after confirming that the
          FastAPI backend is running on port 8001.
        </Text>
      </ScrollView>
    );
  }

  if (readings.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.center}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }>
        <Text style={styles.emptyTitle}>
          No health readings yet
        </Text>

        <Text style={styles.emptyText}>
          No monitoring reading is currently available
          for this baby.
        </Text>
      </ScrollView>
    );
  }

  const latest = readings[0];

  const isUrgent =
    latest.risk_level?.toLowerCase() ===
    'urgent review';

  const temperatureStatus =
    getTemperatureStatus(
      latest.temperature_c,
    );

  const heartRateStatus =
    getHeartRateStatus(
      latest.heart_rate_bpm,
    );

  const respiratoryStatus =
    getRespiratoryStatus(
      latest.respiratory_rate_bpm,
    );

  const oxygenStatus =
    getOxygenStatus(
      latest.oxygen_saturation,
    );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Baby Health
        </Text>

        <Text style={styles.subtitle}>
          Neonatal monitoring and health overview
        </Text>
      </View>

      {/* Baby Information */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Baby Information
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Baby ID
          </Text>

          <Text style={styles.value}>
            {babyId}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Age
          </Text>

          <Text style={styles.value}>
            {formatAge(latest.age_days)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Sex
          </Text>

          <Text style={styles.value}>
            {latest.gender || 'Not available'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Gestational age
          </Text>

          <Text style={styles.value}>
            {latest.gestational_age_weeks
              ? `${latest.gestational_age_weeks} weeks`
              : 'Not available'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Last recorded
          </Text>

          <Text style={styles.value}>
            {formatDate(latest.recorded_at)}
          </Text>
        </View>
      </View>

      {/* Monitoring Status */}
      <View
        style={[
          styles.statusCard,
          isUrgent && styles.urgentCard,
        ]}>

        <Text style={styles.cardTitle}>
          Monitoring Status
        </Text>

        <Text
          style={[
            styles.statusText,
            isUrgent && styles.urgentText,
          ]}>
          {getStatusText(
            latest.risk_level,
          )}
        </Text>

        {latest.risk_reasons &&
          latest.risk_reasons.length > 0 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>
                Review points
              </Text>

              {latest.risk_reasons.map(
                (reason, index) => (
                  <Text
                    key={`${reason}-${index}`}
                    style={styles.warningText}>
                    • {reason}
                  </Text>
                ),
              )}
            </View>
          )}

        <Text style={styles.note}>
          This screen is a research prototype for
          monitoring and decision support. It does not
          provide a medical diagnosis.
        </Text>
      </View>

      {/* Vital Signs */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Vital Signs
        </Text>

        <View style={styles.vitalCard}>
          <Text style={styles.vitalName}>
            Temperature
          </Text>

          <Text style={styles.vitalValue}>
            {latest.temperature_c !== undefined
              ? `${latest.temperature_c} °C`
              : '--'}
          </Text>

          <Text style={styles.vitalStatus}>
            {temperatureStatus}
          </Text>
        </View>

        <View style={styles.vitalCard}>
          <Text style={styles.vitalName}>
            Heart Rate
          </Text>

          <Text style={styles.vitalValue}>
            {latest.heart_rate_bpm !== undefined
              ? `${latest.heart_rate_bpm} bpm`
              : '--'}
          </Text>

          <Text style={styles.vitalStatus}>
            {heartRateStatus}
          </Text>
        </View>

        <View style={styles.vitalCard}>
          <Text style={styles.vitalName}>
            Respiratory Rate
          </Text>

          <Text style={styles.vitalValue}>
            {latest.respiratory_rate_bpm !== undefined
              ? `${latest.respiratory_rate_bpm} /min`
              : '--'}
          </Text>

          <Text style={styles.vitalStatus}>
            {respiratoryStatus}
          </Text>
        </View>

        <View style={styles.vitalCard}>
          <Text style={styles.vitalName}>
            Oxygen Saturation
          </Text>

          <Text style={styles.vitalValue}>
            {latest.oxygen_saturation !== undefined
              ? `${latest.oxygen_saturation}%`
              : '--'}
          </Text>

          <Text style={styles.vitalStatus}>
            {oxygenStatus}
          </Text>
        </View>
      </View>

      {/* Growth Measurements */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Growth Measurements
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Weight
          </Text>

          <Text style={styles.value}>
            {latest.weight_kg !== undefined
              ? `${latest.weight_kg} kg`
              : 'Not available'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Length
          </Text>

          <Text style={styles.value}>
            {latest.length_cm !== undefined
              ? `${latest.length_cm} cm`
              : 'Not available'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Head circumference
          </Text>

          <Text style={styles.value}>
            {latest.head_circumference_cm !== undefined
              ? `${latest.head_circumference_cm} cm`
              : 'Not available'}
          </Text>
        </View>

        <Text style={styles.note}>
          Growth interpretation will use age-, sex-, and
          gestational-age-aware reference standards in the
          complete implementation.
        </Text>
      </View>

      {/* Daily Information */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Daily Health Information
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Feeding
          </Text>

          <Text style={styles.value}>
            {latest.feeding_type ||
              'Not available'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Feedings per day
          </Text>

          <Text style={styles.value}>
            {latest.feeding_frequency_per_day ??
              '--'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Urine count
          </Text>

          <Text style={styles.value}>
            {latest.urine_output_count ?? '--'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Stool count
          </Text>

          <Text style={styles.value}>
            {latest.stool_count ?? '--'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Sleep
          </Text>

          <Text style={styles.value}>
            {latest.sleeping_hours !== undefined
              ? `${latest.sleeping_hours} hours`
              : '--'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Vaccination
          </Text>

          <Text style={styles.value}>
            {latest.vaccination_status ||
              'Not available'}
          </Text>
        </View>
      </View>

      {/* Symptoms */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Reported Symptoms
        </Text>

        {latest.symptoms &&
        latest.symptoms.length > 0 ? (
          latest.symptoms.map(
            (symptom, index) => (
              <Text
                key={`${symptom}-${index}`}
                style={styles.symptom}>
                • {symptom}
              </Text>
            ),
          )
        ) : (
          <Text style={styles.noSymptoms}>
            No symptoms reported in this reading.
          </Text>
        )}
      </View>

      {/* Reading History */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Monitoring History
        </Text>

        <Text style={styles.historyCount}>
          {readings.length} reading
          {readings.length === 1
            ? ''
            : 's'} available
        </Text>

        {readings
          .slice(0, 5)
          .map((reading, index) => (
            <View
              key={`${reading.recorded_at}-${index}`}
              style={styles.historyItem}>

              <Text style={styles.historyDate}>
                {formatDate(
                  reading.recorded_at,
                )}
              </Text>

              <Text style={styles.historyRisk}>
                {getStatusText(
                  reading.risk_level,
                )}
              </Text>

              <Text style={styles.historyVitals}>
                Temp:{' '}
                {reading.temperature_c ?? '--'} °C
                {'   '}
                HR:{' '}
                {reading.heart_rate_bpm ?? '--'} bpm
                {'   '}
                SpO₂:{' '}
                {reading.oxygen_saturation ?? '--'}%
              </Text>
            </View>
          ))}
      </View>

      {/* Monitoring Note */}
      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>
          Clinical Decision Support
        </Text>

        <Text style={styles.footerText}>
          The system combines reported health measurements,
          baby profile information, monitoring history and
          AI-assisted risk analysis to support healthcare
          review. Any concerning measurement should be
          assessed by a qualified healthcare professional.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  center: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F7FA',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#555',
  },

  header: {
    marginBottom: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#17202A',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: '#6B7280',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },

  statusCard: {
    backgroundColor: '#EAF7EF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },

  urgentCard: {
    backgroundColor: '#FFF0F0',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#17202A',
    marginBottom: 14,
  },

  statusText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#18794E',
  },

  urgentText: {
    color: '#C62828',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F4',
  },

  label: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },

  value: {
    flex: 1,
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '600',
    color: '#17202A',
  },

  vitalCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },

  vitalName: {
    fontSize: 14,
    color: '#6B7280',
  },

  vitalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#17202A',
    marginTop: 4,
  },

  vitalStatus: {
    fontSize: 13,
    color: '#5B6470',
    marginTop: 4,
  },

  warningBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
  },

  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7A5B00',
    marginBottom: 5,
  },

  warningText: {
    fontSize: 13,
    color: '#6B5200',
    marginTop: 3,
  },

  note: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },

  symptom: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 7,
  },

  noSymptoms: {
    fontSize: 14,
    color: '#6B7280',
  },

  historyCount: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },

  historyItem: {
    borderTopWidth: 1,
    borderTopColor: '#EEF1F4',
    paddingVertical: 12,
  },

  historyDate: {
    fontSize: 13,
    color: '#6B7280',
  },

  historyRisk: {
    fontSize: 15,
    fontWeight: '700',
    color: '#17202A',
    marginTop: 4,
  },

  historyVitals: {
    fontSize: 12,
    color: '#5B6470',
    marginTop: 5,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#C62828',
    textAlign: 'center',
  },

  errorText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },

  retryText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#17202A',
  },

  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },

  footerCard: {
    backgroundColor: '#EAF2FF',
    borderRadius: 14,
    padding: 16,
    marginTop: 2,
  },

  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#174A7E',
    marginBottom: 7,
  },

  footerText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#36536B',
  },
});