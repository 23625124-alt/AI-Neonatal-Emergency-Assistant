import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

function SleepCarePlanScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>😴 Sleep Care Plan</Text>
          <Text style={styles.subtitle}>
            Safe and healthy sleep guidance for your baby
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛏️ Safe Sleep</Text>
          <Text style={styles.cardText}>
            Place your baby on their back on a firm and flat sleeping surface.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏰ Sleep Routine</Text>
          <Text style={styles.cardText}>
            Maintain a regular sleep routine and observe your baby's sleep
            patterns.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌙 Comfortable Environment</Text>
          <Text style={styles.cardText}>
            Keep the baby's sleeping area comfortable, quiet and free from
            unnecessary objects.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>👀 Sleep Monitoring</Text>
          <Text style={styles.cardText}>
            Observe unusual changes in sleep duration, movement or breathing
            and seek medical advice when necessary.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Care Tip</Text>
          <Text style={styles.tipText}>
            Always follow the safe-sleep recommendations provided by your
            healthcare professional.
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

  header: {
    padding: 24,
    paddingTop: 30,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 21,
  },

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 18,
    borderRadius: 16,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  cardText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 21,
  },

  tipCard: {
    margin: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#E8F4F8',
  },

  tipTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#164E63',
  },

  tipText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 7,
    lineHeight: 21,
  },
});

export default SleepCarePlanScreen;
