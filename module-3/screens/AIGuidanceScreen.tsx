import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import API from '../services/api';

type GuidanceItem = {
  title: string;
  icon: string;
  description: string;
};

function AIGuidanceScreen() {
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const infantId = 'baby001';

  const guidanceItems: GuidanceItem[] = [
    {
      title: 'Temperature',
      icon: '🌡️',
      description:
        'Monitor your baby temperature regularly and watch for unusual changes.',
    },
    {
      title: 'Health Monitoring',
      icon: '❤️',
      description:
        'Keep track of feeding, sleep, weight and other important health observations.',
    },
    {
      title: 'Feeding Guidance',
      icon: '🍼',
      description:
        'Maintain a consistent feeding routine and record feeding frequency.',
    },
  ];

  const fetchGuidance = async (type: string) => {
    try {
      setSelected(type);
      setLoading(true);

      // Send the selected guidance type to the backend
      const response = await API.get(`/care/${infantId}`, {
        params: {
          type: type,
        },
      });

      setGuidance(response.data.guidance || []);
    } catch (error) {
      console.log('AI Guidance Error:', error);

      Alert.alert(
        'Connection Error',
        'AI Guidance server connect aagala. Backend running ah irukka nu check pannunga.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidance('Health Monitoring');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Guidance 🤖</Text>

          <Text style={styles.subtitle}>
            Intelligent assistance for your baby's daily care
          </Text>
        </View>

        {/* AI Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>🧠</Text>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              AI Assistant Ready
            </Text>

            <Text style={styles.statusText}>
              AI-powered neonatal care guidance is available.
            </Text>
          </View>
        </View>

        {/* Section */}
        <Text style={styles.sectionTitle}>
          Health Guidance
        </Text>

        {/* Temperature */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.guidanceCard,
            selected === 'Temperature' && styles.selectedCard,
          ]}
          onPress={() => fetchGuidance('Temperature')}>

          <Text style={styles.icon}>🌡️</Text>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Temperature
            </Text>

            <Text style={styles.cardText}>
              Monitor your baby's temperature regularly and watch for unusual
              changes.
            </Text>

            <Text style={styles.tapText}>
              Tap to view AI guidance →
            </Text>
          </View>
        </TouchableOpacity>

        {/* Health Monitoring */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.guidanceCard,
            selected === 'Health Monitoring' && styles.selectedCard,
          ]}
          onPress={() => fetchGuidance('Health Monitoring')}>

          <Text style={styles.icon}>❤️</Text>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Health Monitoring
            </Text>

            <Text style={styles.cardText}>
              Keep track of feeding, sleep, weight and other important health
              observations.
            </Text>

            <Text style={styles.tapText}>
              Tap to view AI guidance →
            </Text>
          </View>
        </TouchableOpacity>

        {/* Feeding */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.guidanceCard,
            selected === 'Feeding Guidance' && styles.selectedCard,
          ]}
          onPress={() => fetchGuidance('Feeding Guidance')}>

          <Text style={styles.icon}>🍼</Text>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Feeding Guidance
            </Text>

            <Text style={styles.cardText}>
              Maintain a consistent feeding routine and record feeding
              frequency.
            </Text>

            <Text style={styles.tapText}>
              Tap to view AI guidance →
            </Text>
          </View>
        </TouchableOpacity>

        {/* AI Response */}
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            🤖 AI Care Guidance
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />

              <Text style={styles.loadingText}>
                Getting guidance from AI...
              </Text>
            </View>
          ) : guidance.length > 0 ? (
            guidance.map((item, index) => (
              <View key={index} style={styles.guidanceRow}>
                <Text style={styles.bullet}>•</Text>

                <Text style={styles.guidanceText}>
                  {item}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noGuidance}>
              Select a guidance option above.
            </Text>
          )}
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>
            ⚠️ Important
          </Text>

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

  scrollContent: {
    paddingBottom: 30,
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

  selectedCard: {
    borderWidth: 2,
    borderColor: '#164E63',
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

  tapText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0E7490',
    marginTop: 10,
  },

  resultCard: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#164E63',
    marginBottom: 12,
  },

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },

  guidanceRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  bullet: {
    fontSize: 20,
    color: '#0E7490',
    marginRight: 8,
  },

  guidanceText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
  },

  noGuidance: {
    fontSize: 14,
    color: '#6B7280',
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