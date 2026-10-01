import React from 'react';
import {Button, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {registerBaby} from '../src/services/api';

type Props = {onBack: () => void; onCreated: (infantId: string) => void};
const fields = [
  ['gender', 'Gender'], ['gestational_age_weeks', 'Gestational age (weeks)'], ['birth_weight_kg', 'Birth weight (kg)'],
  ['birth_length_cm', 'Birth length (cm)'], ['birth_head_circumference_cm', 'Birth head circumference (cm)'],
  ['feeding_type', 'Feeding type'], ['apgar_score', 'Apgar score'], ['vaccination_status', 'Vaccination status'],
] as const;

export default function BabyProfileScreen({onBack, onCreated}: Props) {
  const [form, setForm] = React.useState<Record<string, string>>({infant_id: '', password: '', ...Object.fromEntries(fields.map(([key]) => [key, '']))});
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const update = (key: string, value: string) => setForm(current => ({...current, [key]: value}));
  const submit = async () => {
    if (Object.values(form).some(value => !value.trim())) {setError('Complete every profile field and password.'); return;}
    setSaving(true); setError('');
    try {
      await registerBaby({infant_id: form.infant_id.trim(), password: form.password, gender: form.gender.trim(), gestational_age_weeks: Number(form.gestational_age_weeks), birth_weight_kg: Number(form.birth_weight_kg), birth_length_cm: Number(form.birth_length_cm), birth_head_circumference_cm: Number(form.birth_head_circumference_cm), feeding_type: form.feeding_type.trim(), apgar_score: Number(form.apgar_score), vaccination_status: form.vaccination_status.trim()});
      onCreated(form.infant_id.trim());
    } catch (requestError) {setError(requestError instanceof Error ? requestError.message : 'Profile creation failed.');}
    finally {setSaving(false);}
  };
  return <ScrollView contentContainerStyle={styles.content}><Button title="Back" onPress={onBack} /><Text style={styles.heading}>Create baby login and profile</Text><Text style={styles.note}>Save stable birth and care details once. Use the login ID for future readings.</Text><Field label="Baby login ID" value={form.infant_id} onChangeText={value => update('infant_id', value)} /><Field label="Password (minimum 8 characters)" value={form.password} onChangeText={value => update('password', value)} secureTextEntry />{fields.map(([key, label]) => <Field key={key} label={label} value={form[key]} onChangeText={value => update(key, value)} />)}<Button title={saving ? 'Saving...' : 'Create profile'} onPress={submit} disabled={saving} />{!!error && <Text style={styles.error}>{error}</Text>}</ScrollView>;
}
function Field({label, value, onChangeText, secureTextEntry}: {label: string; value: string; onChangeText: (value: string) => void; secureTextEntry?: boolean}) {return <View><Text style={styles.label}>{label}</Text><TextInput style={styles.input} value={value} onChangeText={onChangeText} secureTextEntry={secureTextEntry} /></View>;}
const styles = StyleSheet.create({content: {padding: 24, gap: 12}, heading: {fontSize: 22, fontWeight: 'bold', color: '#1F2937'}, note: {color: '#4B5563'}, label: {fontWeight: '600', color: '#374151'}, input: {borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, padding: 10, backgroundColor: '#FFFFFF'}, error: {color: '#B91C1C'}});
