import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getBabyProfile,
  getMonitoringHistory,
} from '../src/services/api';

function FeedingCarePlanScreen({route}: any) {
  const infantId =
    route?.params?.infantId ||
    route?.params?.babyId ||
    route?.params?.user?.baby_id;

  const [baby, setBaby] = useState<any>(null);
  const [latestReading, setLatestReading] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedingData();
  }, []);

  const loadFeedingData = async () => {
    if (!infantId) {
      Alert.alert(
        'Baby information unavailable',
        'Baby profile could not be identified.',
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [babyResponse, historyResponse] =
        await Promise.all([
          getBabyProfile(infantId),
          getMonitoringHistory(infantId),
        ]);

      setBaby(babyResponse?.baby || babyResponse);

      const readings = historyResponse?.readings || [];

      if (readings.length > 0) {
        setLatestReading(readings[0]);
      }
    } catch (error: any) {
      Alert.alert(
        'Unable to load feeding information',
        error?.message ||
          'Please check the backend connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>
            Loading feeding information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const babyName = baby?.baby_name || 'Baby';

  const feedingType =
    baby?.feeding_type ||
    latestReading?.feeding_type ||
    'As advised by healthcare professional';

  const feedingFrequency =
    latestReading?.feeding_frequency_per_day;

  const ageDisplay =
    baby?.age?.age_display || 'Age information unavailable';

  const feedingFrequencyText =
    feedingFrequency !== undefined
      ? `${feedingFrequency} feeds recorded today`
      : 'No recent feeding frequency recorded';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <Text style={styles.title}>
            🍼 Feeding Care Plan
          </Text>

          <Text style={styles.subtitle}>
            Personalized feeding guidance based on the baby's
            profile and latest monitoring record.
          </Text>
        </View>

        {/* Baby Summary */}
        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileEmoji}>👶</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.babyName}>
              {babyName}
            </Text>

            <Text style={styles.profileText}>
              Age: {ageDisplay}
            </Text>

            <Text style={styles.profileText}>
              Feeding type: {feedingType}
            </Text>
          </View>
        </View>

        {/* Recommended Feeding */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            🍼 Recommended Feeding
          </Text>

          <Text style={styles.highlightText}>
            {feedingType}
          </Text>

          <Text style={styles.cardText}>
            Continue the feeding method recommended by the
            baby's healthcare professional. Observe feeding
            behaviour, hunger cues, swallowing and comfort
            during feeds.
          </Text>
        </View>

        {/* Feeding Schedule */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            ⏰ Feeding Schedule
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Latest recorded frequency
            </Text>

            <Text style={styles.value}>
              {feedingFrequencyText}
            </Text>
          </View>

          <Text style={styles.cardText}>
            Maintain regular feeds according to the care plan
            provided by the healthcare professional. Feeding
            frequency may vary with age, feeding method and
            individual clinical needs.
          </Text>
        </View>

        {/* Monitoring */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            📊 Feeding Monitoring
          </Text>

          <View style={styles.monitorRow}>
            <Text style={styles.monitorLabel}>
              Feeding frequency
            </Text>

            <Text style={styles.monitorValue}>
              {feedingFrequency !== undefined
                ? `${feedingFrequency}/day`
                : 'Not recorded'}
            </Text>
          </View>

          <View style={styles.monitorRow}>
            <Text style={styles.monitorLabel}>
              Urine output
            </Text>

            <Text style={styles.monitorValue}>
              {latestReading?.urine_output_count !==
              undefined
                ? `${latestReading.urine_output_count}`
                : 'Not recorded'}
            </Text>
          </View>

          <View style={styles.monitorRow}>
            <Text style={styles.monitorLabel}>
              Stool count
            </Text>

            <Text style={styles.monitorValue}>
              {latestReading?.stool_count !== undefined
                ? `${latestReading.stool_count}`
                : 'Not recorded'}
            </Text>
          </View>
        </View>

        {/* Important Care */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            💧 Important Care
          </Text>

          <Text style={styles.bullet}>
            • Observe whether the baby feeds comfortably.
          </Text>

          <Text style={styles.bullet}>
            • Monitor feeding frequency and overall feeding
            behaviour.
          </Text>

          <Text style={styles.bullet}>
            • Record significant changes in feeding,
            urine or stool output.
          </Text>

          <Text style={styles.bullet}>
            • Follow the individual care plan provided by the
            healthcare professional.
          </Text>
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>
            ⚠️ When to seek clinical advice
          </Text>

          <Text style={styles.warningText}>
            Contact a qualified healthcare professional if
            the baby repeatedly refuses feeds, has significant
            feeding difficulty, repeatedly vomits, becomes
            unusually sleepy, or shows other concerning
            changes.
          </Text>
        </View>

        {/* Prototype Notice */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>
            Research Prototype
          </Text>

          <Text style={styles.noticeText}>
            This feeding care plan provides decision-support
            information only. It does not diagnose a medical
            condition or replace professional clinical advice.
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

  scrollContent: {
    paddingBottom: 30,
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 7,
    lineHeight: 21,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },

  profileCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#EAF5F8',
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  profileEmoji: {
    fontSize: 30,
  },

  profileInfo: {
    flex: 1,
  },

  babyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#164E63',
  },

  profileText: {
    marginTop: 4,
    fontSize: 13,
    color: '#475569',
  },

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 18,
    borderRadius: 16,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },

  highlightText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F766E',
    marginBottom: 7,
  },

  cardText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
  },

  infoRow: {
    marginBottom: 10,
  },

  label: {
    fontSize: 13,
    color: '#64748B',
  },

  value: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F766E',
  },

  monitorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  monitorLabel: {
    fontSize: 14,
    color: '#64748B',
  },

  monitorValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  bullet: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 8,
  },

  warningCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
  },

  warningTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#9A3412',
  },

  warningText: {
    marginTop: 8,
    fontSize: 14,
    color: '#7C2D12',
    lineHeight: 21,
  },

  noticeCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
  },

  noticeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3730A3',
  },

  noticeText: {
    marginTop: 6,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
});

export default FeedingCarePlanScreen;