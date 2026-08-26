import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

function EmergencySupportScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Emergency Support 🚨</Text>
          <Text style={styles.subtitle}>
            Quick guidance when urgent attention may be needed
          </Text>
        </View>

        <View style={styles.alertCard}>
          <Text style={styles.alertIcon}>🚨</Text>
          <Text style={styles.alertTitle}>Emergency Warning</Text>
          <Text style={styles.alertText}>
            If your baby is having severe breathing difficulty, is
            unresponsive, has a seizure, or appears seriously unwell, seek
            emergency medical care immediately.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Warning Signs</Text>

        <View style={styles.signCard}>
          <Text style={styles.signIcon}>🫁</Text>
          <View style={styles.signContent}>
            <Text style={styles.signTitle}>Breathing Difficulty</Text>
            <Text style={styles.signText}>
              Watch for severe difficulty breathing, pauses in breathing, or
              unusual breathing patterns.
            </Text>
          </View>
        </View>

        <View style={styles.signCard}>
          <Text style={styles.signIcon}>🌡️</Text>
          <View style={styles.signContent}>
            <Text style={styles.signTitle}>Abnormal Temperature</Text>
            <Text style={styles.signText}>
              Unusual temperature changes in a newborn should be assessed by a
              healthcare professional.
            </Text>
          </View>
        </View>

        <View style={styles.signCard}>
          <Text style={styles.signIcon}>😴</Text>
          <View style={styles.signContent}>
            <Text style={styles.signTitle}>Unusual Unresponsiveness</Text>
            <Text style={styles.signText}>
              Seek urgent help if the baby is unusually difficult to wake or
              does not respond normally.
            </Text>
          </View>
        </View>

        <View style={styles.signCard}>
          <Text style={styles.signIcon}>🍼</Text>
          <View style={styles.signContent}>
            <Text style={styles.signTitle}>Feeding Problems</Text>
            <Text style={styles.signText}>
              Significant feeding difficulty or a sudden change in feeding
              behavior should be discussed with a healthcare professional.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpButtonText}>📞 Contact Healthcare Provider</Text>
        </TouchableOpacity>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Important</Text>
          <Text style={styles.noteText}>
            This app provides decision-support information and does not replace
            professional medical diagnosis or emergency services.
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

  alertCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    elevation: 3,
  },

  alertIcon: {
    fontSize: 34,
  },

  alertTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#BE123C',
    marginTop: 8,
  },

  alertText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 8,
    lineHeight: 21,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },

  signCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 18,
    borderRadius: 16,
    elevation: 3,
  },

  signIcon: {
    fontSize: 30,
    marginRight: 15,
  },

  signContent: {
    flex: 1,
  },

  signTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  signText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    lineHeight: 20,
  },

  helpButton: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#BE123C',
    alignItems: 'center',
  },

  helpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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

export default EmergencySupportScreen;