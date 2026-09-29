import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import notifee, {
  AndroidImportance,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

type Reminder = {
  type: string;
  icon: string;
  time: string;
};

function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      type: 'Feeding Time',
      icon: '🍼',
      time: '10:00 AM',
    },
    {
      type: 'Medicine',
      icon: '💊',
      time: '01:00 PM',
    },
    {
      type: 'Vaccination',
      icon: '💉',
      time: '03:00 PM',
    },
    {
      type: 'Weight Check',
      icon: '⚖️',
      time: '06:00 PM',
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [reminderName, setReminderName] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');

    if (date) {
      setSelectedTime(date);
    }
  };

  // Create Android notification channel
  const createNotificationChannel = async () => {
    await notifee.createChannel({
      id: 'care-reminders',
      name: 'Care Reminders',
      importance: AndroidImportance.HIGH,
    });
  };

  // Schedule actual notification
  const scheduleNotification = async (
    title: string,
    time: Date,
  ) => {
    await createNotificationChannel();

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: time.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        title: `🔔 ${title}`,
        body: `It's time for your baby's ${title}.`,
        android: {
          channelId: 'care-reminders',
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger,
    );
  };

  const addReminder = async () => {
    if (reminderName.trim() === '') {
      Alert.alert(
        'Reminder Required',
        'Please enter a reminder name.',
      );
      return;
    }

    try {
      const reminderTime = new Date();

      reminderTime.setHours(
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        0,
        0,
      );

      // If selected time has already passed today,
      // schedule it for tomorrow.
      if (reminderTime.getTime() <= Date.now()) {
        reminderTime.setDate(
          reminderTime.getDate() + 1,
        );
      }

      const newReminder: Reminder = {
        type: reminderName.trim(),
        icon: '🔔',
        time: formatTime(reminderTime),
      };

      setReminders([...reminders, newReminder]);

      // Schedule notification
      await scheduleNotification(
        reminderName.trim(),
        reminderTime,
      );

      // Check scheduled notifications
      const scheduled =
        await notifee.getTriggerNotifications();

      console.log(
        'Scheduled Notifications:',
        scheduled,
      );

      setReminderName('');
      setSelectedTime(new Date());
      setShowAddForm(false);

      Alert.alert(
        'Reminder Scheduled 🔔',
        `${reminderName.trim()} reminder is scheduled for ${formatTime(
          reminderTime,
        )}.`,
      );
    } catch (error) {
      console.log('Notification Error:', error);

      Alert.alert(
        'Error',
        'Reminder was added, but notification could not be scheduled.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Smart Reminders ⏰
          </Text>

          <Text style={styles.subtitle}>
            Keep track of your baby's important care activities
          </Text>
        </View>

        {/* Existing Reminders */}
        {reminders.map((reminder, index) => (
          <TouchableOpacity
            key={index}
            style={styles.reminderCard}
            onPress={() =>
              Alert.alert(
                'Reminder',
                `${reminder.type}\nTime: ${reminder.time}`,
              )
            }
          >
            <Text style={styles.icon}>
              {reminder.icon}
            </Text>

            <View style={styles.content}>
              <Text style={styles.reminderTitle}>
                {reminder.type}
              </Text>

              <Text style={styles.time}>
                {reminder.time}
              </Text>

              <Text style={styles.description}>
                Reminder for your baby's care activity.
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Add Reminder Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.addButtonText}>
            {showAddForm
              ? '✖ Close'
              : '＋ Add Reminder'}
          </Text>
        </TouchableOpacity>

        {/* Add Reminder Form */}
        {showAddForm && (
          <View style={styles.formCard}>

            <Text style={styles.formTitle}>
              Add New Reminder
            </Text>

            <Text style={styles.label}>
              Reminder Name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Example: Feeding Time"
              value={reminderName}
              onChangeText={setReminderName}
            />

            <Text style={styles.label}>
              Reminder Time
            </Text>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeButtonText}>
                ⏰ {formatTime(selectedTime)}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={handleTimeChange}
              />
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={addReminder}
            >
              <Text style={styles.saveButtonText}>
                🔔 Schedule Reminder
              </Text>
            </TouchableOpacity>

          </View>
        )}

        {/* Reminder Tip */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            🔔 Reminder Tip
          </Text>

          <Text style={styles.infoText}>
            Regular reminders can help parents maintain
            consistent neonatal care routines.
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

  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    lineHeight: 20,
  },

  addButton: {
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#0F766E',
    alignItems: 'center',
  },

  addButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  formCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },

  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 18,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 16,
  },

  timeButton: {
    backgroundColor: '#E8F4F8',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },

  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#164E63',
  },

  saveButton: {
    backgroundColor: '#164E63',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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