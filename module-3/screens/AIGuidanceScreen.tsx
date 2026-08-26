import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

function AIGuidanceScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Guidance 🤖</Text>
          <Text style={styles.subtitle}>
            Intelligent assistance for your baby's daily care
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>🧠</Text>
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>AI Assistant Ready</Text>
            <Text style={styles.statusText}>
              Enter your baby's health information to receive guidance.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Health Guidance</Text>

        <TouchableOpacity style={styles.guidanceCard}>
          <Text style={styles.icon}>🌡️</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Temperature</Text>
            <Text style={styles.cardText}>
              Monitor your baby's temperature regularly and watch for unusual
              changes.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guidanceCard}>
          <Text style={styles.icon}>❤️</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Health Monitoring</Text>
            <Text style={styles.cardText}>
              Keep track of feeding, sleep, weight and other important health
              observations.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guidanceCard}>
          <Text style={styles.icon}>🍼</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Feeding Guidance</Text>
            <Text style={styles.cardText}>
              Maintain a consistent feeding routine and record feeding
              frequency.
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Important</Text>
          <Text style={styles.warningText}>
            AI guidance is intended to support parents and should not replace
            professional medical advice.
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
    backgroundColor: '#E8F4F8',
  },

  statusIcon: {
    fontSize: 32,
    marginRight: 15,
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#164E63',
  },

  statusText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 5,
    lineHeight: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },

  guidanceCard: {
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

  cardContent: {
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

  warningCard: {
    margin: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
  },

  warningTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#C2410C',
  },

  warningText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 20,
  },
});

export default AIGuidanceScreen;