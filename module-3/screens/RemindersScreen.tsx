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
import {createReminder} from '../src/services/api';

function RemindersScreen({infantId}: {infantId?: string}) {
  const [title, setTitle] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [loading, setLoading] = React.useState(false);

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

        <View style={styles.reminderCard}>
          <Text style={styles.icon}>🍼</Text>
          <View style={styles.content}>
            <Text style={styles.reminderTitle}>Feeding Time</Text>
            <Text style={styles.time}>10:00 AM</Text>
            <Text style={styles.description}>
              Follow the recommended feeding schedule.
            </Text>
          </View>
        </View>

        <View style={styles.reminderCard}>
          <Text style={styles.icon}>💊</Text>
          <View style={styles.content}>
            <Text style={styles.reminderTitle}>Medicine</Text>
            <Text style={styles.time}>01:00 PM</Text>
            <Text style={styles.description}>
              Give medicine according to the doctor's instructions.
            </Text>
          </View>
        </View>

        <View style={styles.reminderCard}>
          <Text style={styles.icon}>💉</Text>
          <View style={styles.content}>
            <Text style={styles.reminderTitle}>Vaccination</Text>
            <Text style={styles.time}>03:00 PM</Text>
            <Text style={styles.description}>
              Check upcoming vaccination schedules.
            </Text>
          </View>
        </View>

        <View style={styles.reminderCard}>
          <Text style={styles.icon}>⚖️</Text>
          <View style={styles.content}>
            <Text style={styles.reminderTitle}>Weight Check</Text>
            <Text style={styles.time}>06:00 PM</Text>
            <Text style={styles.description}>
              Record your baby's latest weight.
            </Text>
          </View>
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