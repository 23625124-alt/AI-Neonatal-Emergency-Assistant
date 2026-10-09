import React, {useCallback, useEffect, useState} from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import notifee from '@notifee/react-native';

import {
  NavigationContainer,
  useFocusEffect,
} from '@react-navigation/native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import * as API from './src/services/api';

import CarePlanScreen from './screens/CarePlanScreen';
import FeedingCarePlanScreen from './screens/FeedingCarePlanScreen';
import SleepCarePlanScreen from './screens/SleepCarePlanScreen';
import WeightCarePlanScreen from './screens/WeightCarePlanScreen';
import VaccinationCarePlanScreen from './screens/VaccinationCarePlanScreen';
import RemindersScreen from './screens/RemindersScreen';
import AIGuidanceScreen from './screens/AIGuidanceScreen';
import BabyHealthScreen from './screens/BabyHealthScreen';
import AddHealthReadingScreen from './screens/AddHealthReadingScreen';
import EmergencySupportScreen from './screens/EmergencySupportScreen';
import LoginScreen from './screens/LoginScreen';
import QuickReadingScreen from './screens/QuickReadingScreen';
import DailyFeedingLogScreen from './screens/DailyFeedingLogScreen';

const Stack = createNativeStackNavigator();

function HomeScreen({navigation, route}: any) {
  const user = route?.params?.user;
  const babyId = user?.baby_id;

  const [latestReading, setLatestReading] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchLatestHealth = async () => {
        try {
          setLoadingHealth(true);

          if (!babyId) {
            console.warn(
              'No baby ID linked to logged-in user.',
            );

            setLatestReading(null);
            setLoadingHealth(false);
            return;
          }

          const response =
            await API.getMonitoringHistory(babyId);

          console.log(
            'Home Health Response:',
            response,
          );

          const readings =
            response?.readings || [];

          if (readings.length > 0) {
            const latest =
              readings[readings.length - 1];

            setLatestReading(latest);
          } else {
            setLatestReading(null);
          }
        } catch (error) {
          console.log(
            'Home Health Fetch Error:',
            error,
          );

          setLatestReading(null);
        } finally {
          setLoadingHealth(false);
        }
      };

      fetchLatestHealth();
    }, [babyId]),
  );

  const isUrgent =
    latestReading?.risk_level === 'urgent review';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}>

        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.title}>
            Neonatal Care Assistant
          </Text>

          <Text style={styles.subtitle}>
            Intelligent care & decision support for your baby
          </Text>
        </View>

        {/* Welcome */}

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>
            Welcome 👶
          </Text>

          <Text style={styles.welcomeText}>
            Monitor your baby's health and get
            personalized care guidance.
          </Text>
        </View>

        {/* Latest Health Status */}

        <Text style={styles.sectionTitle}>
          Latest Health Status
        </Text>

        <View style={styles.healthCard}>

          {loadingHealth ? (
            <Text style={styles.loadingText}>
              Loading latest health data...
            </Text>
          ) : latestReading ? (
            <>
              <View style={styles.statusRow}>
                <Text style={styles.healthCardTitle}>
                  Current Status
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    isUrgent
                      ? styles.urgentBadge
                      : styles.normalBadge,
                  ]}>
                  <Text style={styles.statusBadgeText}>
                    {isUrgent
                      ? '⚠️ URGENT REVIEW'
                      : '✅ NORMAL'}
                  </Text>
                </View>
              </View>

              <Text style={styles.riskText}>
                Risk Level:{' '}
                {latestReading.risk_level ||
                  'Not available'}
              </Text>

              {/* Temperature + Heart Rate */}

              <View style={styles.vitalsRow}>
                <View style={styles.vitalBox}>
                  <Text style={styles.vitalLabel}>
                    Temperature
                  </Text>

                  <Text style={styles.vitalValue}>
                    {latestReading.temperature_c} °C
                  </Text>
                </View>

                <View style={styles.vitalBox}>
                  <Text style={styles.vitalLabel}>
                    Heart Rate
                  </Text>

                  <Text style={styles.vitalValue}>
                    {latestReading.heart_rate_bpm} bpm
                  </Text>
                </View>
              </View>

              {/* SpO2 + Weight */}

              <View style={styles.vitalsRow}>
                <View style={styles.vitalBox}>
                  <Text style={styles.vitalLabel}>
                    SpO₂
                  </Text>

                  <Text style={styles.vitalValue}>
                    {latestReading.oxygen_saturation}%
                  </Text>
                </View>

                <View style={styles.vitalBox}>
                  <Text style={styles.vitalLabel}>
                    Weight
                  </Text>

                  <Text style={styles.vitalValue}>
                    {latestReading.weight_kg} kg
                  </Text>
                </View>
              </View>

              {/* View Full Health Details */}

              <TouchableOpacity
                style={styles.viewHealthButton}
                onPress={() =>
                  navigation.navigate('CarePlan', {
  infantId: user?.baby_id,
  user,
})
                }>
                <Text
                  style={styles.viewHealthButtonText}>
                  View Full Health Details
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.noDataTitle}>
                No Health Reading Available
              </Text>

              <Text style={styles.noDataText}>
                Add the baby's first health reading
                to start monitoring.
              </Text>

              <TouchableOpacity
                style={styles.addReadingButton}
                onPress={() =>
                 navigation.navigate('AddHealthReading', {user})
                }>
                <Text
                  style={styles.addReadingButtonText}>
                  Add First Health Reading
                </Text>
              </TouchableOpacity>
            </>
          )}

        </View>

        {/* Warning */}

        {isUrgent && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>
              ⚠️ Clinical Review Recommended
            </Text>

            <Text style={styles.warningText}>
              Some health readings require further
              clinical assessment. Please consult a
              qualified healthcare professional.
            </Text>

            <TouchableOpacity
              style={styles.warningButton}
              onPress={() =>
                navigation.navigate(
                  'BabyHealth',
                  {user},
                )
              }>
              <Text
                style={styles.warningButtonText}>
                View Health Details
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}

        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.cardContainer}>

          {/* Baby Health */}

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate(
                'BabyHealth',
                {user},
              )
            }>
            <Text style={styles.cardIcon}>
              ❤️
            </Text>

            <Text style={styles.cardTitle}>
              Baby Health
            </Text>

            <Text style={styles.cardText}>
              View baby's current health information
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('DailyFeedingLog', {
                infantId: babyId,
              })
            }>
            <Text style={styles.cardIcon}>🍼</Text>
            <Text style={styles.cardTitle}>Daily Feeding Log</Text>
            <Text style={styles.cardText}>
              Record feeding, urine, and stool counts by date
            </Text>
          </TouchableOpacity>

          {/* Add Health Reading */}
          <TouchableOpacity
  style={styles.card}
  onPress={() =>
    navigation.navigate('QuickReading', {
      infantId: babyId,
      user,
    })
  }>
  <Text style={styles.cardIcon}>⚡</Text>

  <Text style={styles.cardTitle}>
    Quick Reading
  </Text>

  <Text style={styles.cardText}>
    Quickly record the baby's current observations
  </Text>
</TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
            navigation.navigate(
  'AddHealthReading',
  {user},
)
            }>
            <Text style={styles.cardIcon}>
              🩺
            </Text>

            <Text style={styles.cardTitle}>
              Add Health Reading
            </Text>

            <Text style={styles.cardText}>
              Record baby's latest health measurements
            </Text>
          </TouchableOpacity>

          {/* Care Plan */}

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate(
                'CarePlan',
              )
            }>
            <Text style={styles.cardIcon}>
              🍼
            </Text>

            <Text style={styles.cardTitle}>
              Care Plan
            </Text>

            <Text style={styles.cardText}>
              Personalized daily care recommendations
            </Text>
          </TouchableOpacity>

          {/* Reminders */}

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate(
                'Reminders',
              )
            }>
            <Text style={styles.cardIcon}>
              ⏰
            </Text>

            <Text style={styles.cardTitle}>
              Reminders
            </Text>

            <Text style={styles.cardText}>
              Feeding, medicine and vaccination reminders
            </Text>
          </TouchableOpacity>

          {/* AI Guidance */}

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate(
                'AIGuidance',
              )
            }>
            <Text style={styles.cardIcon}>
              🤖
            </Text>

            <Text style={styles.cardTitle}>
              AI Guidance
            </Text>

            <Text style={styles.cardText}>
              Get intelligent neonatal care assistance
            </Text>
          </TouchableOpacity>

        </View>

        {/* Emergency Support */}

        <TouchableOpacity
          style={styles.alertCard}
          onPress={() =>
            navigation.navigate(
              'EmergencySupport',
            )
          }>

          <Text style={styles.alertTitle}>
            🚨 Emergency Support
          </Text>

          <Text style={styles.alertText}>
            Get timely alerts when abnormal health
            conditions are detected.
          </Text>

        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function App() {
  useEffect(() => {
    const requestNotificationPermission =
      async () => {
        await notifee.requestPermission();
      };

    requestNotificationPermission();
  }, []);

  return (
    <NavigationContainer>

      <Stack.Navigator
        initialRouteName="Login">

        {/* Login */}

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* Home */}

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* Baby Health */}

        <Stack.Screen
          name="BabyHealth"
          component={BabyHealthScreen}
          options={{
            title: 'Baby Health',
          }}
        />

        {/* Add Health Reading */}

        <Stack.Screen
          name="AddHealthReading"
          component={AddHealthReadingScreen}
          options={{
            title: 'Add Health Reading',
          }}
        />
        <Stack.Screen
  name="QuickReading"
  component={QuickReadingScreen}
  options={{
    title: 'Quick Reading',
  }}
/>

        <Stack.Screen
          name="DailyFeedingLog"
          component={DailyFeedingLogScreen}
          options={{title: 'Daily Feeding Log'}}
        />

        {/* Care Plan */}

        <Stack.Screen
          name="CarePlan"
          component={CarePlanScreen}
          options={{
            title: 'Care Plan',
          }}
        />

        {/* Feeding Care Plan */}

        <Stack.Screen
          name="FeedingCarePlan"
          component={FeedingCarePlanScreen}
          options={{
            title: 'Feeding Care Plan',
          }}
        />

        {/* Sleep Care Plan */}

        <Stack.Screen
          name="SleepCarePlan"
          component={SleepCarePlanScreen}
          options={{
            title: 'Sleep Care Plan',
          }}
        />

        {/* Weight Care Plan */}

        <Stack.Screen
          name="WeightCarePlan"
          component={WeightCarePlanScreen}
          options={{
            title: 'Weight Care Plan',
          }}
        />

        {/* Vaccination Care Plan */}

        <Stack.Screen
          name="VaccinationCarePlan"
          component={VaccinationCarePlanScreen}
          options={{
            title: 'Vaccination Care Plan',
          }}
        />

        {/* Reminders */}

        <Stack.Screen
          name="Reminders"
          component={RemindersScreen}
          options={{
            title: 'Smart Reminders',
          }}
        />

        {/* AI Guidance */}

        <Stack.Screen
          name="AIGuidance"
          component={AIGuidanceScreen}
          options={{
            title: 'AI Guidance',
          }}
        />

        {/* Emergency Support */}

        <Stack.Screen
          name="EmergencySupport"
          component={EmergencySupportScreen}
          options={{
            title: 'Emergency Support',
          }}
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },

  header: {
    padding: 20,
    paddingTop: 25,
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
  },

  welcomeCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#E6FFFA',
    elevation: 3,
  },

  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F766E',
  },

  welcomeText: {
    fontSize: 15,
    color: '#475569',
    marginTop: 8,
    lineHeight: 22,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },

  healthCard: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  healthCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  normalBadge: {
    backgroundColor: '#DCFCE7',
  },

  urgentBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  riskText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 12,
  },

  vitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  vitalBox: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },

  vitalLabel: {
    fontSize: 12,
    color: '#64748B',
  },

  vitalValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },

  viewHealthButton: {
    marginTop: 16,
    padding: 13,
    borderRadius: 10,
    backgroundColor: '#0F766E',
  },

  viewHealthButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  loadingText: {
    color: '#64748B',
    textAlign: 'center',
  },

  noDataTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  noDataText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 20,
  },

  addReadingButton: {
    marginTop: 14,
    padding: 13,
    borderRadius: 10,
    backgroundColor: '#0F766E',
  },

  addReadingButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  warningCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FDA4AF',
  },

  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#BE123C',
  },

  warningText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 8,
    lineHeight: 21,
  },

  warningButton: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#BE123C',
  },

  warningButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  cardContainer: {
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 3,
  },

  cardIcon: {
    fontSize: 28,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },

  cardText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    lineHeight: 20,
  },

  alertCard: {
    margin: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    elevation: 3,
  },

  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#BE123C',
  },

  alertText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 20,
  },
});

export default App;