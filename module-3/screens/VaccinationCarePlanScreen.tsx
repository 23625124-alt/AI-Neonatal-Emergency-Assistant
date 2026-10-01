import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

function VaccinationCarePlanScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>💉 Vaccination Care Plan</Text>

          <Text style={styles.subtitle}>
            Keep your baby's vaccinations up to date
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Vaccination Schedule</Text>

          <Text style={styles.cardText}>
            Follow the vaccination schedule recommended by your healthcare
            professional.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💉 Vaccination Records</Text>

          <Text style={styles.cardText}>
            Keep a record of completed and upcoming vaccinations for your
            baby.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏰ Vaccination Reminders</Text>

          <Text style={styles.cardText}>
            Set reminders for upcoming vaccinations so important doses are not
            missed.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>👩‍⚕️ Healthcare Guidance</Text>

          <Text style={styles.cardText}>
            Consult your healthcare professional if you have questions about
            vaccination timing or possible reactions.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Care Tip</Text>

          <Text style={styles.tipText}>
            Keep your baby's vaccination record safe and bring it during
            healthcare visits.
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

export default VaccinationCarePlanScreen;