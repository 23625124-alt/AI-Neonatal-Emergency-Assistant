import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

function CarePlanScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Care Plan 🍼</Text>
          <Text style={styles.subtitle}>
            Personalized care recommendations for your baby
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.icon}>🍼</Text>
          <View style={styles.content}>
            <Text style={styles.cardTitle}>Feeding</Text>
            <Text style={styles.cardText}>
              Follow the recommended feeding schedule for your baby.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.icon}>😴</Text>
          <View style={styles.content}>
            <Text style={styles.cardTitle}>Sleep</Text>
            <Text style={styles.cardText}>
              Maintain a safe and comfortable sleeping routine.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.icon}>⚖️</Text>
          <View style={styles.content}>
            <Text style={styles.cardTitle}>Weight Monitoring</Text>
            <Text style={styles.cardText}>
              Keep track of your baby's weight regularly.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.icon}>💉</Text>
          <View style={styles.content}>
            <Text style={styles.cardTitle}>Vaccination</Text>
            <Text style={styles.cardText}>
              Stay updated with scheduled vaccinations.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Care Tip</Text>
          <Text style={styles.infoText}>
            Always follow your healthcare professional's advice for neonatal
            care.
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

  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 18,
    borderRadius: 16,
    elevation: 3,
  },

  icon: {
    fontSize: 30,
    marginRight: 15,
  },

  content: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  cardText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    lineHeight: 20,
  },

  infoCard: {
    margin: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#E8F4F8',
  },

  infoTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#164E63',
  },

  infoText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 6,
    lineHeight: 20,
  },
});

export default CarePlanScreen;