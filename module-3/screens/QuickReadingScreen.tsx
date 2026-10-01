import React from 'react';
import {Button, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {submitQuickReading} from '../src/services/api';
import {MonitoringResponse, QuickReadingPayload} from '../src/types/api';

type Props = {infantId: string; onBack: () => void; onSubmitted: (response: MonitoringResponse) => void};
const fields = [
  ['age_days', 'Age (days)'], ['weight_kg', 'Current weight (kg)'], ['length_cm', 'Current length (cm)'], ['head_circumference_cm', 'Current head circumference (cm)'],
  ['temperature_c', 'Temperature (C)'], ['heart_rate_bpm', 'Heart rate (bpm)'], ['respiratory_rate_bpm', 'Respiratory rate (bpm)'], ['oxygen_saturation', 'Oxygen saturation (%)'],
  ['feeding_frequency_per_day', 'Feeding frequency per day'], ['urine_output_count', 'Urine output count'], ['stool_count', 'Stool count'], ['jaundice_level_mg_dl', 'Jaundice level (mg/dL)'],
  ['immunizations_done', 'Immunizations done (0 or 1)'], ['reflexes_normal', 'Reflexes normal (0 or 1)'], ['sleeping_hours', 'Sleeping hours'], ['symptoms', 'Symptoms (comma-separated, optional)'],
] as const;
export default function QuickReadingScreen({infantId, onBack, onSubmitted}: Props) {
  const [form, setForm] = React.useState<Record<string, string>>({infant_id: infantId, ...Object.fromEntries(fields.map(([key]) => [key, '']))});
  const [error, setError] = React.useState(''); const [saving, setSaving] = React.useState(false);
  React.useEffect(() => setForm(current => ({...current, infant_id: infantId})), [infantId]);
  const update = (key: string, value: string) => setForm(current => ({...current, [key]: value}));
  const submit = async () => {
    if (!form.infant_id.trim() || fields.some(([key]) => key !== 'symptoms' && !form[key].trim())) {setError('Complete the changing reading fields.'); return;}
    const number = (key: string) => Number(form[key]);
    const payload: QuickReadingPayload = {infant_id: form.infant_id.trim(), simulated: false, recorded_at: new Date().toISOString(), age_days: number('age_days'), weight_kg: number('weight_kg'), length_cm: number('length_cm'), head_circumference_cm: number('head_circumference_cm'), temperature_c: number('temperature_c'), heart_rate_bpm: number('heart_rate_bpm'), respiratory_rate_bpm: number('respiratory_rate_bpm'), oxygen_saturation: number('oxygen_saturation'), feeding_frequency_per_day: number('feeding_frequency_per_day'), urine_output_count: number('urine_output_count'), stool_count: number('stool_count'), jaundice_level_mg_dl: number('jaundice_level_mg_dl'), immunizations_done: number('immunizations_done'), reflexes_normal: number('reflexes_normal'), sleeping_hours: number('sleeping_hours'), symptoms: form.symptoms.split(',').map(item => item.trim()).filter(Boolean)};
    setSaving(true); setError('');
    try {onSubmitted(await submitQuickReading(payload));} catch (requestError) {setError(requestError instanceof Error ? requestError.message : 'Reading submission failed.');} finally {setSaving(false);}
  };
  return <ScrollView contentContainerStyle={styles.content}><Button title="Back" onPress={onBack} /><Text style={styles.heading}>Lightweight changing reading</Text><Text style={styles.note}>Stable baby details come from the saved profile. Enter only current observations here.</Text><Field label="Baby login ID" value={form.infant_id} onChangeText={value => update('infant_id', value)} />{fields.map(([key, label]) => <Field key={key} label={label} value={form[key]} onChangeText={value => update(key, value)} />)}<Button title={saving ? 'Submitting...' : 'Submit reading'} onPress={submit} disabled={saving} />{!!error && <Text style={styles.error}>{error}</Text>}</ScrollView>;
}
function Field({label, value, onChangeText}: {label: string; value: string; onChangeText: (value: string) => void}) {return <View><Text style={styles.label}>{label}</Text><TextInput style={styles.input} value={value} onChangeText={onChangeText} keyboardType="numeric" /></View>;}
const styles = StyleSheet.create({content: {padding: 24, gap: 12}, heading: {fontSize: 22, fontWeight: 'bold', color: '#1F2937'}, note: {color: '#4B5563'}, label: {fontWeight: '600', color: '#374151'}, input: {borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, padding: 10, backgroundColor: '#FFFFFF'}, error: {color: '#B91C1C'}});
