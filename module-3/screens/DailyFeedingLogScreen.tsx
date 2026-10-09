import React from 'react';
import {ActivityIndicator, Button, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {createFeedingLog, getFeedingLogs, updateFeedingLog} from '../src/services/api';
import {FeedingLog} from '../src/types/api';

type Props = {infantId?: string; route?: {params?: {infantId?: string}}};
type Form = {log_date: string; feeding_count: string; urine_output_count: string; stool_count: string};

const emptyForm = (): Form => ({
  log_date: new Date().toISOString().slice(0, 10),
  feeding_count: '',
  urine_output_count: '',
  stool_count: '',
});

export default function DailyFeedingLogScreen({infantId: propInfantId, route}: Props) {
  const infantId = propInfantId || route?.params?.infantId || '';
  const [form, setForm] = React.useState<Form>(emptyForm);
  const [logs, setLogs] = React.useState<FeedingLog[]>([]);
  const [editingDate, setEditingDate] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const loadLogs = React.useCallback(async () => {
    if (!infantId.trim()) {
      setStatus('Create or select a baby profile before recording a daily log.');
      return;
    }
    try {
      setLogs(await getFeedingLogs(infantId.trim()));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to load daily logs.');
    }
  }, [infantId]);

  React.useEffect(() => { loadLogs(); }, [loadLogs]);

  const update = (key: keyof Form, value: string) => setForm(current => ({...current, [key]: value}));
  const submit = async () => {
    if (!infantId.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(form.log_date)) {
      setStatus('Enter a date in YYYY-MM-DD format.');
      return;
    }
    const values = ['feeding_count', 'urine_output_count', 'stool_count'].map(key => Number(form[key as keyof Form]));
    if (values.some(value => !Number.isInteger(value) || value < 0)) {
      setStatus('Counts must be non-negative whole numbers.');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      const counts = {feeding_count: values[0], urine_output_count: values[1], stool_count: values[2]};
      if (editingDate) {
        await updateFeedingLog(infantId.trim(), editingDate, counts);
      } else {
        await createFeedingLog({infant_id: infantId.trim(), log_date: form.log_date, ...counts});
      }
      setForm(emptyForm());
      setEditingDate(null);
      await loadLogs();
      setStatus(editingDate ? 'Daily log updated.' : 'Daily log saved.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save the daily log.');
    } finally {
      setLoading(false);
    }
  };

  const edit = (log: FeedingLog) => {
    setEditingDate(log.log_date);
    setForm({
      log_date: log.log_date,
      feeding_count: String(log.feeding_count),
      urine_output_count: String(log.urine_output_count),
      stool_count: String(log.stool_count),
    });
    setStatus('Editing the selected date. Save to update it.');
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Daily feeding log</Text>
      <Text style={styles.note}>Record only today&apos;s feeding, urine, and stool counts. This log is separate from clinical readings.</Text>
      {!infantId.trim() && <Text style={styles.error}>A registered baby profile is required.</Text>}
      <Field label="Date (YYYY-MM-DD)" value={form.log_date} onChangeText={value => update('log_date', value)} />
      <Field label="Feeding count" value={form.feeding_count} onChangeText={value => update('feeding_count', value)} />
      <Field label="Urine output count" value={form.urine_output_count} onChangeText={value => update('urine_output_count', value)} />
      <Field label="Stool count" value={form.stool_count} onChangeText={value => update('stool_count', value)} />
      {loading ? <ActivityIndicator accessibilityLabel="Saving daily log" /> : <Button title={editingDate ? 'Update daily log' : 'Save daily log'} onPress={submit} disabled={!infantId.trim()} />}
      {!!editingDate && <Button title="Cancel edit" onPress={() => {setEditingDate(null); setForm(emptyForm());}} />}
      {!!status && <Text style={styles.status}>{status}</Text>}
      <Text style={styles.section}>Saved records</Text>
      {logs.length === 0 ? <Text style={styles.note}>No daily logs saved for this baby.</Text> : logs.map(log => (
        <View key={log.id} style={styles.card}>
          <Text style={styles.date}>{log.log_date}</Text>
          <Text>Feeds: {log.feeding_count} | Urine: {log.urine_output_count} | Stool: {log.stool_count}</Text>
          <Button title="Edit" onPress={() => edit(log)} />
        </View>
      ))}
    </ScrollView>
  );
}

function Field({label, value, onChangeText}: {label: string; value: string; onChangeText: (value: string) => void}) {
  return <View><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} style={styles.input} value={value} onChangeText={onChangeText} keyboardType="numeric" /></View>;
}

const styles = StyleSheet.create({
  content: {padding: 24, gap: 12},
  heading: {fontSize: 22, fontWeight: 'bold', color: '#1F2937'},
  note: {color: '#4B5563', lineHeight: 20},
  label: {fontWeight: '600', color: '#374151'},
  input: {borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, padding: 10, backgroundColor: '#FFFFFF'},
  status: {color: '#164E63'},
  error: {color: '#B91C1C'},
  section: {fontSize: 18, fontWeight: 'bold', marginTop: 12, color: '#1F2937'},
  card: {padding: 12, borderRadius: 8, backgroundColor: '#FFFFFF', gap: 6},
  date: {fontWeight: 'bold', color: '#164E63'},
});
