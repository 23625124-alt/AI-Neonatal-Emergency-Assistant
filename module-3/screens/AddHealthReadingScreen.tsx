import React, {useState} from 'react';

import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import API from '../services/api';

function AddHealthReadingScreen({navigation}: any) {
  const [temperature, setTemperature] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [oxygenSaturation, setOxygenSaturation] = useState('');
  const [weight, setWeight] = useState('');
  const [feedingFrequency, setFeedingFrequency] = useState('');
  const [sleepingHours, setSleepingHours] = useState('');
  const [symptoms, setSymptoms] = useState('');

  // Save Health Reading
  const handleSaveReading = async () => {
    try {
      // Check required fields
      if (
        !temperature ||
        !heartRate ||
        !respiratoryRate ||
        !oxygenSaturation ||
        !weight ||
        !feedingFrequency ||
        !sleepingHours
      ) {
        Alert.alert(
          'Missing Information',
          'Please enter all health readings.',
        );
        return;
      }

      // Convert symptoms into an array
      const symptomsList = symptoms
        ? symptoms
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0)
        : [];

      // Data sent to FastAPI backend
      const payload = {
        infant_id: 'demo-baby-001',
        simulated: true,

        gender: 'Not specified',
        gestational_age_weeks: 38,
        birth_weight_kg: 2.8,
        birth_length_cm: 48,
        birth_head_circumference_cm: 34,

        age_days: 10,
        length_cm: 50,
        head_circumference_cm: 35,

        temperature_c: Number(temperature),
        heart_rate_bpm: Number(heartRate),
        respiratory_rate_bpm: Number(respiratoryRate),
        oxygen_saturation: Number(oxygenSaturation),
        weight_kg: Number(weight),

        feeding_type: 'Breastfeeding',
        feeding_frequency_per_day: Number(feedingFrequency),

        urine_output_count: 6,
        stool_count: 3,
        jaundice_level_mg_dl: 0,

        apgar_score: 9,
        immunizations_done: 1,
        reflexes_normal: 1,

        sleeping_hours: Number(sleepingHours),

        vaccination_status: 'Up to date',

        symptoms: symptomsList,
      };

      console.log(
        'Sending Health Reading:',
        payload,
      );

      // Send data to backend
      const response = await API.post(
        '/monitoring/readings',
        payload,
      );

      // Get backend response
      const result = response.data;

      console.log(
        'Backend Response:',
        result,
      );

      const riskLevel =
        result?.record?.risk_level || 'unknown';

      const action =
        result?.action ||
        'Continue monitoring.';

      // Show result and navigate to Baby Health
      if (riskLevel === 'urgent review') {
        Alert.alert(
          '⚠️ Health Risk Detected',
          `Risk Level: ${riskLevel}\n\n${action}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('BabyHealth'),
            },
          ],
        );
      } else {
        Alert.alert(
          '✅ Health Reading Saved',
          `Risk Level: ${riskLevel}\n\n${action}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('BabyHealth'),
            },
          ],
        );
      }
    } catch (error: any) {
      console.log(
        'Save Health Reading Error:',
        error?.response?.data || error,
      );

      Alert.alert(
        'Backend Error',
        JSON.stringify(
          error?.response?.data || error,
          null,
          2,
        ),
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>
            Add Health Reading
          </Text>

          <Text style={styles.subtitle}>
            Enter your baby's latest health information
          </Text>
        </View>

        <View style={styles.card}>

          <Text style={styles.cardTitle}>
            Health Monitoring
          </Text>

          {/* Temperature */}
          <Text style={styles.inputLabel}>
            Temperature (°C)
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter temperature"
            keyboardType="decimal-pad"
            value={temperature}
            onChangeText={setTemperature}
          />

          {/* Heart Rate */}
          <Text style={styles.inputLabel}>
            Heart Rate (BPM)
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter heart rate"
            keyboardType="number-pad"
            value={heartRate}
            onChangeText={setHeartRate}
          />

          {/* Respiratory Rate */}
          <Text style={styles.inputLabel}>
            Respiratory Rate (Breaths/min)
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter respiratory rate"
            keyboardType="number-pad"
            value={respiratoryRate}
            onChangeText={setRespiratoryRate}
          />

          {/* Oxygen Saturation */}
          <Text style={styles.inputLabel}>
            Oxygen Saturation (SpO₂ %)
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter oxygen saturation"
            keyboardType="decimal-pad"
            value={oxygenSaturation}
            onChangeText={setOxygenSaturation}
          />

          {/* Weight */}
          <Text style={styles.inputLabel}>
            Weight (kg)
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter weight"
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
          />

          {/* Feeding Frequency */}
          <Text style={styles.inputLabel}>
            Feeding Frequency (times/day)
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter feeding frequency"
            keyboardType="number-pad"
            value={feedingFrequency}
            onChangeText={setFeedingFrequency}
          />

          {/* Sleeping Hours */}
          <Text style={styles.inputLabel}>
            Sleeping Hours (per day)
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter sleeping hours"
            keyboardType="decimal-pad"
            value={sleepingHours}
            onChangeText={setSleepingHours}
          />

          {/* Symptoms */}
          <Text style={styles.inputLabel}>
            Symptoms / Daily Observation
          </Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter symptoms, separated by commas"
            multiline
            numberOfLines={4}
            value={symptoms}
            onChangeText={setSymptoms}
          />

          {/* Save Health Reading Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveReading}
          >
            <Text style={styles.saveButtonText}>
              Save Health Reading
            </Text>
          </TouchableOpacity>

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
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },

  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  saveButton: {
    marginTop: 24,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddHealthReadingScreen;