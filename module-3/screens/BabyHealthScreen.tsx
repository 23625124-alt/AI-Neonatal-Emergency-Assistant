import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

function BabyHealthScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Baby Health ❤️</Text>
          <Text style={styles.subtitle}>
            Current health observations of your baby
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>✅</Text>
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>Health Status</Text>
            <Text style={styles.statusText}>Currently monitoring</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Vital Signs</Text>

        <View style={styles.grid}>
          <View style={styles.vitalCard}>
            <Text style={styles.icon}>🌡️</Text>
            <Text style={styles.label}>Temperature</Text>
            <Text style={styles.value}>36.8 °C</Text>
          </View>

          <View style={styles.vitalCard}>
            <Text style={styles.icon}>❤️</Text>
            <Text style={styles.label}>Heart Rate</Text>
            <Text style={styles.value}>142 bpm</Text>
          </View>

          <View style={styles.vitalCard}>
            <Text style={styles.icon}>🫁</Text>
            <Text style={styles.label}>Respiratory Rate</Text>
            <Text style={styles.value}>42 /min</Text>
          </View>

          <View style={styles.vitalCard}>
            <Text style={styles.icon}>💧</Text>
            <Text style={styles.label}>Oxygen Saturation</Text>
            <Text style={styles.value}>98%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Daily Information</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>⚖️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Weight</Text>
            <Text style={styles.infoValue}>2.8 kg</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🍼</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Feeding Frequency</Text>
            <Text style={styles.infoValue}>8 times today</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>😴</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Sleep</Text>
            <Text style={styles.infoValue}>14 hours today</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💉</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Vaccination Status</Text>
            <Text style={styles.infoValue}>Up to date</Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>ℹ️ Monitoring Note</Text>
          <Text style={styles.noteText}>
            These values are sample observations for the application interface.
            In the complete system, health data can be connected to actual
            monitoring inputs.
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

  statusText: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
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