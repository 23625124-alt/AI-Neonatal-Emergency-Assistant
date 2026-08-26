import React from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
<<<<<<< HEAD
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CarePlanScreen from './screens/CarePlanScreen';
import RemindersScreen from './screens/RemindersScreen';
import AIGuidanceScreen from './screens/AIGuidanceScreen';
import EmergencySupportScreen from './screens/EmergencySupportScreen';
import BabyHealthScreen from './screens/BabyHealthScreen';

const Stack = createNativeStackNavigator();

function HomeScreen({navigation}: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Neonatal Care Assistant</Text>
          <Text style={styles.subtitle}>
            Intelligent care & decision support for your baby
          </Text>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome 👶</Text>
          <Text style={styles.welcomeText}>
            Monitor your baby's health and get personalized care guidance.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('BabyHealth')}>
            <Text style={styles.cardIcon}>❤️</Text>
            <Text style={styles.cardTitle}>Baby Health</Text>
            <Text style={styles.cardText}>
              View baby's current health information
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CarePlan')}>
            <Text style={styles.cardIcon}>🍼</Text>
            <Text style={styles.cardTitle}>Care Plan</Text>
            <Text style={styles.cardText}>
              Personalized daily care recommendations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Reminders')}>
            <Text style={styles.cardIcon}>⏰</Text>
            <Text style={styles.cardTitle}>Reminders</Text>
            <Text style={styles.cardText}>
              Feeding, medicine and vaccination reminders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AIGuidance')}>
            <Text style={styles.cardIcon}>🤖</Text>
            <Text style={styles.cardTitle}>AI Guidance</Text>
            <Text style={styles.cardText}>
              Get intelligent neonatal care assistance
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.alertCard}
          onPress={() => navigation.navigate('EmergencySupport')}>
          <Text style={styles.alertTitle}>🚨 Emergency Support</Text>
          <Text style={styles.alertText}>
            Get timely alerts when abnormal health conditions are detected.
          </Text>
        </TouchableOpacity>
=======
import { getGlobalExplanation, getMonitoringHistory, getWhatIfExplanation, submitReading } from './src/services/api';
import {
  ApplicationFields,
  ModelFeatureFields,
  MonitoringResponse,
  NeonatalReadingPayload,
  GlobalExplanation,
  WhatIfResponse,
} from './src/types/api';

type Screen = 'home' | 'manual' | 'result' | 'history' | 'global';

const initialForm: Record<string, string> = {
  infant_id: '', gender: '', gestational_age_weeks: '', birth_weight_kg: '',
  birth_length_cm: '', birth_head_circumference_cm: '', age_days: '', weight_kg: '',
  length_cm: '', head_circumference_cm: '', temperature_c: '', heart_rate_bpm: '',
  respiratory_rate_bpm: '', oxygen_saturation: '', feeding_type: '',
  feeding_frequency_per_day: '', urine_output_count: '', stool_count: '',
  jaundice_level_mg_dl: '', apgar_score: '', immunizations_done: '',
  reflexes_normal: '', sleeping_hours: '', vaccination_status: '', symptoms: '',
};

const modelFields: { key: ModelFeatureFields; label: string; numeric?: boolean }[] = [
  { key: 'gender', label: 'Gender' },
  { key: 'gestational_age_weeks', label: 'Gestational age (weeks)', numeric: true },
  { key: 'birth_weight_kg', label: 'Birth weight (kg)', numeric: true },
  { key: 'birth_length_cm', label: 'Birth length (cm)', numeric: true },
  { key: 'birth_head_circumference_cm', label: 'Birth head circumference (cm)', numeric: true },
  { key: 'age_days', label: 'Age (days)', numeric: true },
  { key: 'weight_kg', label: 'Current weight (kg)', numeric: true },
  { key: 'length_cm', label: 'Current length (cm)', numeric: true },
  { key: 'head_circumference_cm', label: 'Current head circumference (cm)', numeric: true },
  { key: 'temperature_c', label: 'Temperature (C)', numeric: true },
  { key: 'heart_rate_bpm', label: 'Heart rate (bpm)', numeric: true },
  { key: 'respiratory_rate_bpm', label: 'Respiratory rate (bpm)', numeric: true },
  { key: 'oxygen_saturation', label: 'Oxygen saturation (%)', numeric: true },
  { key: 'feeding_type', label: 'Feeding type' },
  { key: 'feeding_frequency_per_day', label: 'Feeding frequency per day', numeric: true },
  { key: 'urine_output_count', label: 'Urine output count', numeric: true },
  { key: 'stool_count', label: 'Stool count', numeric: true },
  { key: 'jaundice_level_mg_dl', label: 'Jaundice level (mg/dL)', numeric: true },
  { key: 'apgar_score', label: 'Apgar score', numeric: true },
  { key: 'immunizations_done', label: 'Immunizations done (0 or 1)', numeric: true },
  { key: 'reflexes_normal', label: 'Reflexes normal (0 or 1)', numeric: true },
];

const applicationFields: { key: ApplicationFields; label: string; numeric?: boolean }[] = [
  { key: 'sleeping_hours', label: 'Sleeping hours', numeric: true },
  { key: 'vaccination_status', label: 'Vaccination status' },
  { key: 'symptoms', label: 'Symptoms (comma-separated, optional)' },
];

function toPayload(form: Record<string, string>): NeonatalReadingPayload {
  const numericKeys = new Set([
    ...modelFields.filter(field => field.numeric).map(field => field.key),
    ...applicationFields.filter(field => field.numeric).map(field => field.key),
  ]);
  const payload = { infant_id: form.infant_id.trim(), simulated: false, recorded_at: new Date().toISOString() } as Record<string, unknown>;
  [...modelFields.map(field => field.key), ...applicationFields.map(field => field.key)].forEach(key => {
    const value = form[key];
    payload[key] = numericKeys.has(key as ModelFeatureFields) ? Number(value) : value.trim();
  });
  payload.symptoms = form.symptoms.split(',').map(item => item.trim()).filter(Boolean);
  return payload as NeonatalReadingPayload;
}

function App() {
  const [screen, setScreen] = React.useState<Screen>('home');
  const [form, setForm] = React.useState(initialForm);
  const [response, setResponse] = React.useState<MonitoringResponse | null>(null);
  const [history, setHistory] = React.useState<MonitoringResponse['record'][]>([]);
  const [globalExplanation, setGlobalExplanation] = React.useState<GlobalExplanation | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const updateField = (key: string, value: string) => setForm(current => ({ ...current, [key]: value }));

  const submit = async () => {
    const required = ['infant_id', ...modelFields.map(field => field.key), 'sleeping_hours', 'vaccination_status'];
    const missing = required.filter(key => !form[key].trim());
    if (missing.length) {
      setError('Complete all required fields before submitting.');
      return;
    }
    if (modelFields.some(field => field.numeric && !Number.isFinite(Number(form[field.key])))) {
      setError('Numeric fields must contain valid numbers.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await submitReading(toPayload(form));
      setResponse(result);
      setScreen('result');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'The request failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!form.infant_id.trim()) {
      setError('Enter an infant ID first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await getMonitoringHistory(form.infant_id.trim());
      setHistory(result.readings);
      setScreen('history');
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : 'The request failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadGlobal = async () => {
    setLoading(true);
    setError('');
    try {
      setGlobalExplanation(await getGlobalExplanation());
      setScreen('global');
    } catch (globalError) {
      setError(globalError instanceof Error ? globalError.message : 'The request failed.');
    } finally {
      setLoading(false);
    }
  };

  if (screen === 'manual') {
    return <FormScreen form={form} error={error} loading={loading} onBack={() => setScreen('home')} onChange={updateField} onSubmit={submit} />;
  }
  if (screen === 'result' && response) {
    return <ResultScreen response={response} onBack={() => setScreen('home')} onNew={() => { setResponse(null); setError(''); setScreen('manual'); }} />;
  }
  if (screen === 'history') {
    return <HistoryScreen history={history} onBack={() => setScreen('home')} />;
  }
  if (screen === 'global' && globalExplanation) {
    return <GlobalScreen explanation={globalExplanation} onBack={() => setScreen('home')} />;
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Neonatal Care Assistant</Text>
        <Text style={styles.subtitle}>Research monitoring and explainable decision support</Text>
        <View style={styles.warning}><Text style={styles.warningText}>Research prototype only. Not a diagnostic tool.</Text></View>
        <TouchableOpacity testID="manual-entry" style={styles.primaryButton} onPress={() => { setError(''); setScreen('manual'); }}>
          <Text style={styles.primaryButtonText}>Enter neonatal reading</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="history" style={styles.secondaryButton} onPress={loadHistory}>
          <Text style={styles.secondaryButtonText}>View monitoring history</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="global-xai" style={styles.secondaryButton} onPress={loadGlobal}>
          <Text style={styles.secondaryButtonText}>View global feature importance</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator accessibilityLabel="Loading" />}
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.note}>The training dataset is used for model development and evaluation. New manual readings are application inputs.</Text>
>>>>>>> 5a409db1 (Complete AI XAI monitoring integration for Lock 2)
      </ScrollView>
    </SafeAreaView>
  );
}

<<<<<<< HEAD
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="BabyHealth"
          component={BabyHealthScreen}
          options={{title: 'Baby Health'}}
        />

        <Stack.Screen
          name="CarePlan"
          component={CarePlanScreen}
          options={{title: 'Care Plan'}}
        />

        <Stack.Screen
          name="Reminders"
          component={RemindersScreen}
          options={{title: 'Smart Reminders'}}
        />

        <Stack.Screen
          name="AIGuidance"
          component={AIGuidanceScreen}
          options={{title: 'AI Guidance'}}
        />

        <Stack.Screen
          name="EmergencySupport"
          component={EmergencySupportScreen}
          options={{title: 'Emergency Support'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

=======
function FormScreen({ form, error, loading, onBack, onChange, onSubmit }: { form: Record<string, string>; error: string; loading: boolean; onBack: () => void; onChange: (key: string, value: string) => void; onSubmit: () => void }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Button title="Back" onPress={onBack} />
        <Text style={styles.heading}>Manual neonatal reading</Text>
        <Text style={styles.note}>All model fields are required. Enter reviewed research data; no clinical defaults are supplied.</Text>
        <Field label="Infant ID" value={form.infant_id} onChange={value => onChange('infant_id', value)} />
        {modelFields.map(field => <Field key={field.key} label={field.label} numeric={field.numeric} value={form[field.key]} onChange={value => onChange(field.key, value)} />)}
        {applicationFields.map(field => <Field key={field.key} label={field.label} numeric={field.numeric} value={form[field.key]} onChange={value => onChange(field.key, value)} />)}
        <TouchableOpacity testID="submit-reading" style={styles.primaryButton} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Submit reading</Text>}
        </TouchableOpacity>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, numeric, onChange }: { label: string; value: string; numeric?: boolean; onChange: (value: string) => void }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} style={styles.input} value={value} onChangeText={onChange} keyboardType={numeric ? 'numeric' : 'default'} /></View>;
}

function ResultScreen({ response, onBack, onNew }: { response: MonitoringResponse; onBack: () => void; onNew: () => void }) {
  const model = response.record.model;
  const [whatIfValue, setWhatIfValue] = React.useState('');
  const [whatIfResult, setWhatIfResult] = React.useState<WhatIfResponse | null>(null);
  const [whatIfError, setWhatIfError] = React.useState('');
  const runWhatIf = async () => {
    const value = Number(whatIfValue);
    if (!Number.isFinite(value)) { setWhatIfError('Enter a numeric temperature.'); return; }
    try {
      setWhatIfError('');
      const result = await getWhatIfExplanation(response.record as NeonatalReadingPayload, { temperature_c: value });
      setWhatIfResult(result);
    } catch (error) { setWhatIfError(error instanceof Error ? error.message : 'What-if request failed.'); }
  };
  return <SafeAreaView style={styles.container}><ScrollView contentContainerStyle={styles.content}><Button title="Home" onPress={onBack} /><Text style={styles.heading}>Explainable result</Text><Text style={styles.result}>Risk status: {response.record.risk_level}</Text><Text>Prediction: {model?.prediction ?? 'unavailable'}</Text><Text>Probability at risk: {model?.probability_at_risk ?? 'unavailable'}</Text><Text>Reading type: {response.record.simulated ? 'Software simulated' : 'Manual'}</Text><Text style={styles.alert}>{response.warning}</Text><Text style={styles.sectionTitle}>Top contributing features</Text>{model?.explanation?.top_contributions?.map(item => <Text testID={`shap-${item.feature}`} key={`${item.feature}-${item.shap_value}`}>{item.feature}: {item.shap_value.toFixed(4)}</Text>)}<Text style={styles.sectionTitle}>What-if analysis</Text><Text>Change temperature and compare the model output.</Text><TextInput accessibilityLabel="What-if temperature" style={styles.input} value={whatIfValue} onChangeText={setWhatIfValue} keyboardType="numeric" placeholder="Temperature (C)" /><Button testID="run-what-if" title="Run what-if" onPress={runWhatIf} />{!!whatIfError && <Text style={styles.error}>{whatIfError}</Text>}{whatIfResult && <View><Text testID="what-if-prediction" style={styles.result}>What-if prediction: {whatIfResult.prediction}</Text><Text>What-if probability at risk: {whatIfResult.probability_at_risk}</Text><Text>Top changed contributors:</Text>{whatIfResult.top_contributions.slice(0, 5).map(item => <Text key={`what-if-${item.feature}`}>{item.feature}: {item.shap_value.toFixed(4)}</Text>)}</View>}<Text style={styles.note}>SHAP values describe model associations, not causes or clinical advice.</Text><Button title="Enter another reading" onPress={onNew} /></ScrollView></SafeAreaView>;
}

function HistoryScreen({ history, onBack }: { history: MonitoringResponse['record'][]; onBack: () => void }) {
  return <SafeAreaView style={styles.container}><ScrollView contentContainerStyle={styles.content}><Button title="Home" onPress={onBack} /><Text style={styles.heading}>Monitoring history</Text>{history.length === 0 ? <Text>No readings found.</Text> : history.map(record => <View key={record.id} style={styles.historyRow}><Text>{record.recorded_at}</Text><Text>{record.simulated ? 'Simulated' : 'Manual'} - {record.risk_level}</Text></View>)}</ScrollView></SafeAreaView>;
}

function GlobalScreen({ explanation, onBack }: { explanation: GlobalExplanation; onBack: () => void }) {
  return <SafeAreaView style={styles.container}><ScrollView contentContainerStyle={styles.content}><Button title="Home" onPress={onBack} /><Text style={styles.heading}>Global feature importance</Text><Text>Held-out rows explained: {explanation.rows_explained}</Text>{explanation.global_feature_importance.map(item => <Text testID={`global-${item.feature}`} key={item.feature}>{item.feature}: {item.mean_absolute_shap.toFixed(4)}</Text>)}<Text style={styles.note}>{explanation.warning}</Text></ScrollView></SafeAreaView>;
}

>>>>>>> 5a409db1 (Complete AI XAI monitoring integration for Lock 2)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  content: { padding: 24, gap: 12 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 6,
  },

  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },

  primaryButton: {
    backgroundColor: '#0F766E',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
<<<<<<< HEAD
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 3,
  },

  cardIcon: {
    fontSize: 28,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },

  cardText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    lineHeight: 20,
  },

  alertCard: {
    margin: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    elevation: 3,
  },

  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#BE123C',
  },

  alertText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 20,
=======
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0F766E',
>>>>>>> 5a409db1 (Complete AI XAI monitoring integration for Lock 2)
  },
  secondaryButtonText: { color: '#0F766E', fontWeight: 'bold' },
  warning: { backgroundColor: '#FEF3C7', padding: 14, borderRadius: 8 },
  warningText: { color: '#92400E', fontWeight: 'bold' },
  note: { color: '#64748B', lineHeight: 20 },
  error: { color: '#B91C1C', fontWeight: 'bold' },
  field: { gap: 4 },
  label: { color: '#334155', fontWeight: '600' },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, padding: 10 },
  result: { fontSize: 18, fontWeight: 'bold', color: '#0F766E' },
  alert: { backgroundColor: '#FFF7ED', color: '#9A3412', padding: 12 },
  historyRow: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 6, gap: 4 },
});

export default App;