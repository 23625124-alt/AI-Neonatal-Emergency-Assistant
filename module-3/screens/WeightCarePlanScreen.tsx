import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

function WeightCarePlanScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>⚖️ Weight Care Plan</Text>

          <Text style={styles.subtitle}>
            Monitor your baby's growth and weight regularly
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Weight Monitoring</Text>

          <Text style={styles.cardText}>
            Record your baby's weight regularly and keep track of changes in
            growth over time.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Regular Tracking</Text>

          <Text style={styles.cardText}>
            Follow the weight-monitoring schedule recommended by your
            healthcare professional.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Growth Observation</Text>

          <Text style={styles.cardText}>
            Observe changes in your baby's weight and discuss unusual changes
            with your healthcare professional.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🍼 Feeding & Growth</Text>

          <Text style={styles.cardText}>
            Adequate feeding and regular monitoring can help track your baby's
            growth and development.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Care Tip</Text>

          <Text style={styles.tipText}>
            Do not compare your baby's weight directly with another baby.
            Follow the growth guidance provided by your healthcare
            professional.
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

export default WeightCarePlanScreen;