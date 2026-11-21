import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Appointment,
  cancelAppointment,
  createAppointment,
  getAppointmentsByBaby,
} from '../src/services/api';

const AppointmentScreen = () => {
  const [infantId, setInfantId] = useState('BABY_TEST_2026_03');
  const [doctorName, setDoctorName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reason, setReason] = useState('');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  const loadAppointments = async () => {
    if (!infantId.trim()) {
      Alert.alert('Baby ID required', 'Please enter the Baby ID.');
      return;
    }

    setLoading(true);

    try {
      const data = await getAppointmentsByBaby(infantId.trim());
      setAppointments(data);
    } catch (error) {
      Alert.alert(
        'Unable to load appointments',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleBooking = async () => {
    if (
      !infantId.trim() ||
      !doctorName.trim() ||
      !appointmentDate.trim() ||
      !appointmentTime.trim() ||
      !reason.trim()
    ) {
      Alert.alert('Missing details', 'Please fill in all the fields.');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      Alert.alert(
        'Invalid date',
        'Enter the date in YYYY-MM-DD format, for example 2026-11-01.',
      );
      return;
    }

    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(appointmentTime)) {
      Alert.alert(
        'Invalid time',
        'Enter the time in 24-hour HH:MM format, for example 10:30.',
      );
      return;
    }

    setBooking(true);

    try {
      await createAppointment({
        infant_id: infantId.trim(),
        doctor_name: doctorName.trim(),
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        reason: reason.trim(),
      });

      Alert.alert('Success', 'Appointment booked successfully!');

      setDoctorName('');
      setAppointmentDate('');
      setAppointmentTime('');
      setReason('');

      await loadAppointments();
    } catch (error) {
      Alert.alert(
        'Booking failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = (appointmentId: string) => {
    Alert.alert(
      'Cancel appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'Keep appointment', style: 'cancel' },
        {
          text: 'Cancel appointment',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAppointment(appointmentId);
              Alert.alert('Success', 'Appointment cancelled.');
              await loadAppointments();
            } catch (error) {
              Alert.alert(
                'Cancellation failed',
                error instanceof Error
                  ? error.message
                  : 'Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <Text style={styles.doctorName}>{item.doctor_name}</Text>
      <Text style={styles.detail}>Date: {item.appointment_date}</Text>
      <Text style={styles.detail}>Time: {item.appointment_time}</Text>
      <Text style={styles.detail}>Reason: {item.reason}</Text>

      <Text
        style={[
          styles.status,
          item.status === 'cancelled'
            ? styles.cancelledStatus
            : styles.scheduledStatus,
        ]}
      >
        Status: {item.status}
      </Text>

      {item.status !== 'cancelled' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item.appointment_id)}
        >
          <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Doctor Appointment</Text>
          <Text style={styles.subtitle}>
            Book and manage your baby's appointments.
          </Text>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Book an Appointment</Text>

            <Text style={styles.label}>Baby ID</Text>
            <TextInput
              style={styles.input}
              value={infantId}
              onChangeText={setInfantId}
              placeholder="Enter Baby ID"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Doctor Name</Text>
            <TextInput
              style={styles.input}
              value={doctorName}
              onChangeText={setDoctorName}
              placeholder="e.g. Dr. Kumar"
            />

            <Text style={styles.label}>Appointment Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={appointmentDate}
              onChangeText={setAppointmentDate}
              placeholder="2026-11-01"
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.label}>Appointment Time (HH:MM)</Text>
            <TextInput
              style={styles.input}
              value={appointmentTime}
              onChangeText={setAppointmentTime}
              placeholder="10:30"
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.label}>Reason for Visit</Text>
            <TextInput
              style={[styles.input, styles.reasonInput]}
              value={reason}
              onChangeText={setReason}
              placeholder="e.g. Routine check-up"
              multiline
            />

            <TouchableOpacity
              style={[
                styles.bookButton,
                booking && styles.disabledButton,
              ]}
              onPress={handleBooking}
              disabled={booking}
            >
              {booking ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.bookButtonText}>Book Appointment</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>My Appointments</Text>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadAppointments}
              disabled={loading}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              style={styles.loader}
              color="#176B87"
            />
          ) : appointments.length === 0 ? (
            <Text style={styles.emptyText}>
              No appointments found for this Baby ID.
            </Text>
          ) : (
            <FlatList
              data={appointments}
              keyExtractor={item => item.appointment_id}
              renderItem={renderAppointment}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F7FA',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 35,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#123B52',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#647887',
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#123B52',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344B5A',
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D5E0E8',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: '#1E293B',
  },
  reasonInput: {
    minHeight: 75,
    textAlignVertical: 'top',
  },
  bookButton: {
    backgroundColor: '#176B87',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  refreshButton: {
    backgroundColor: '#DCEEF5',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#176B87',
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#647887',
    paddingVertical: 22,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E9EF',
  },
  doctorName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#123B52',
    marginBottom: 8,
  },
  detail: {
    color: '#455A64',
    fontSize: 14,
    marginTop: 5,
  },
  status: {
    marginTop: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  scheduledStatus: {
    color: '#16804A',
  },
  cancelledStatus: {
    color: '#C62828',
  },
  cancelButton: {
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    padding: 11,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#B42318',
    fontWeight: 'bold',
  },
});

export default AppointmentScreen;