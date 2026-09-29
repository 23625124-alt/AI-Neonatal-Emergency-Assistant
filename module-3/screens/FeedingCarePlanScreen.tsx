import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

function FeedingCarePlanScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🍼 Feeding Care Plan</Text>
          <Text style={styles.subtitle}>
            Personalized feeding guidance for your baby
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recommended Feeding</Text>
          <Text style={styles.cardText}>
            Follow the feeding schedule recommended by your healthcare
            professional.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏰ Feeding Schedule</Text>
          <Text style={styles.cardText}>
            Maintain regular feeding intervals and observe your baby's hunger
            cues.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💧 Important Care</Text>
          <Text style={styles.cardText}>
            Monitor feeding amount, feeding duration and any difficulty during
            feeding.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Care Tip</Text>
          <Text style={styles.tipText}>
            If your baby refuses multiple feeds, vomits repeatedly, or shows
            unusual feeding difficulty, contact your healthcare professional.
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

export default FeedingCarePlanScreen;