import React from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {createReminder, getReminders} from '../src/services/api';
import {Reminder} from '../src/types/api';

function RemindersScreen({
  route,
}: {
  route?: {params?: {infantId?: string; user?: {baby_id?: string}}};
}) {
  const infantId =
    route?.params?.infantId || route?.params?.user?.baby_id || '';
  const [title, setTitle] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [reminders, setReminders] = React.useState<Reminder[]>([]);
  const [status, setStatus] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [loadingReminders, setLoadingReminders] = React.useState(false);

  const loadReminders = React.useCallback(async () => {
    if (!infantId.trim()) {
      setStatus('Sign in with a linked baby profile to manage reminders.');
      return;
    }
    setLoadingReminders(true);
    try {
      setReminders(await getReminders(infantId.trim()));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to load reminders.');
    } finally {
      setLoadingReminders(false);
    }
  }, [infantId]);

  React.useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const saveReminder = async () => {
    if (!infantId?.trim() || !title.trim() || !dueDate.trim()) {
      setStatus('Enter an infant ID, reminder title, and date (YYYY-MM-DD).');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      await createReminder({infant_id: infantId.trim(), title: title.trim(), due_date: dueDate.trim(), category: 'care'});
      setStatus('Reminder saved to the research prototype backend.');
      setTitle('');
      setDueDate('');
      await loadReminders();
    } catch {
      setStatus('Unable to save the reminder. Check that the FastAPI backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Smart Reminders ⏰</Text>
          <Text style={styles.subtitle}>
            Keep track of your baby's important care activities
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔔 Reminder Tip</Text>
          <Text style={styles.infoText}>
            Regular reminders can help parents maintain consistent neonatal
            care routines.
          </Text>
        </View>

        <View style={styles.createCard}>
          <Text style={styles.infoTitle}>Add a care reminder</Text>
          <TextInput accessibilityLabel="Reminder title" style={styles.input} value={title} onChangeText={setTitle} placeholder="Reminder title" />
          <TextInput accessibilityLabel="Reminder due date" style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" />
          {loading ? <ActivityIndicator accessibilityLabel="Saving reminder" /> : <Button title="Save reminder" onPress={saveReminder} />}
          {!!status && <Text style={styles.infoText}>{status}</Text>}
        </View>
        <View style={styles.createCard}>
          <Text style={styles.infoTitle}>Saved reminders</Text>
          {loadingReminders ? <ActivityIndicator accessibilityLabel="Loading reminders" /> :
            reminders.length === 0 ? <Text style={styles.infoText}>No reminders saved for this baby.</Text> :
            reminders.map(reminder => (
              <View key={reminder.id} style={styles.reminderCard}>
                <Text style={styles.reminderTitle}>{reminder.title}</Text>
                <Text style={styles.time}>{reminder.due_date}</Text>
              </View>
            ))}
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

  reminderCard: {
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

  reminderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  time: {
    fontSize: 15,
    fontWeight: '600',
    color: '#164E63',
    marginTop: 5,
  },
  createCard: {
    margin: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 10,
  },

  description: {
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

export default RemindersScreen;