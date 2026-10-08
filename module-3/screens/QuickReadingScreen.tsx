import React, {useCallback, useEffect, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  getBabyProfile,
  submitQuickReading,
} from '../src/services/api';

import {
  QuickReadingPayload,
} from '../src/types/api';

type Props = {
  navigation: any;
  route: any;
};

type FormState = {
  weight: string;
  length: string;
  headCircumference: string;
  temperature: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  feedingFrequency: string;
  urineOutput: string;
  stoolCount: string;
  jaundiceLevel: string;
  sleepingHours: string;
  symptoms: string;
};

export default function QuickReadingScreen({
  navigation,
  route,
}: Props) {
  const infantId =
    route?.params?.infantId ||
    route?.params?.user?.baby_id ||
    '';

  const [babyName, setBabyName] = useState('');
  const [ageDays, setAgeDays] = useState<number | null>(null);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] =
    useState<FormState>({
      weight: '',
      length: '',
      headCircumference: '',
      temperature: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      feedingFrequency: '',
      urineOutput: '',
      stoolCount: '',
      jaundiceLevel: '',
      sleepingHours: '',
      symptoms: '',
    });

  const loadBabyProfile =
    useCallback(async () => {
      try {
        setLoadingProfile(true);
        setError('');

        if (!infantId) {
          throw new Error(
            'Baby profile is not linked to this account.',
          );
        }

        const response =
          await getBabyProfile(infantId);

        const baby = response?.baby;

        if (!baby) {
          throw new Error(
            'Baby profile was not found.',
          );
        }

        setBabyName(
          baby.baby_name || 'Baby',
        );

        setAgeDays(
          typeof baby.age?.age_days === 'number'
            ? baby.age.age_days
            : null,
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load baby profile.',
        );
      } finally {
        setLoadingProfile(false);
      }
    }, [infantId]);

  useEffect(() => {
    loadBabyProfile();
  }, [loadBabyProfile]);

  const updateField = (
    key: keyof FormState,
    value: string,
  ) => {
    setForm(current => ({
      ...current,
      [key]: value,
    }));
  };

  const validate = () => {
    const requiredFields: Array<
      keyof FormState
    > = [
      'weight',
      'length',
      'headCircumference',
      'temperature',
      'heartRate',
      'respiratoryRate',
      'oxygenSaturation',
      'feedingFrequency',
      'urineOutput',
      'stoolCount',
      'jaundiceLevel',
      'sleepingHours',
    ];

    for (const field of requiredFields) {
      if (!form[field].trim()) {
        return false;
      }
    }

    return true;
  };

  const submitReading = async () => {
    if (!infantId) {
      setError(
        'Baby profile is not linked to this account.',
      );
      return;
    }

    if (!validate()) {
      setError(
        'Please complete all current observation fields.',
      );
      return;
    }

    const number = (
      value: string,
    ): number => Number(value);

    const numericValues = [
      number(form.weight),
      number(form.length),
      number(form.headCircumference),
      number(form.temperature),
      number(form.heartRate),
      number(form.respiratoryRate),
      number(form.oxygenSaturation),
      number(form.feedingFrequency),
      number(form.urineOutput),
      number(form.stoolCount),
      number(form.jaundiceLevel),
      number(form.sleepingHours),
    ];

    if (
      numericValues.some(
        value => !Number.isFinite(value),
      )
    ) {
      setError(
        'Please enter valid numeric values.',
      );
      return;
    }

    const payload: QuickReadingPayload = {
      infant_id: infantId,
      simulated: false,
      recorded_at:
        new Date().toISOString(),

      age_days:
        ageDays ?? 0,

      weight_kg:
        number(form.weight),

      length_cm:
        number(form.length),

      head_circumference_cm:
        number(form.headCircumference),

      temperature_c:
        number(form.temperature),

      heart_rate_bpm:
        number(form.heartRate),

      respiratory_rate_bpm:
        number(form.respiratoryRate),

      oxygen_saturation:
        number(form.oxygenSaturation),

      feeding_frequency_per_day:
        number(form.feedingFrequency),

      urine_output_count:
        number(form.urineOutput),

      stool_count:
        number(form.stoolCount),

      jaundice_level_mg_dl:
        number(form.jaundiceLevel),

      immunizations_done: 1,

      reflexes_normal: 1,

      sleeping_hours:
        number(form.sleepingHours),

      symptoms:
        form.symptoms
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
    };

    try {
      setSaving(true);
      setError('');

      const response =
        await submitQuickReading(
          payload,
        );

      const risk =
        response?.record?.risk_level ||
        'routine monitoring';

      const reasons =
        response?.record?.risk_reasons || [];

      const reasonText =
        reasons.length > 0
          ? `\n\nReview reasons:\n• ${reasons.join(
              '\n• ',
            )}`
          : '';

      Alert.alert(
        'Reading Saved',
        `Current health observation has been recorded.\n\nStatus: ${risk}${reasonText}`,
        [
          {
            text: 'View Health',
            onPress: () => {
              navigation.navigate(
                'BabyHealth',
                {
                  user:
                    route?.params?.user,
                },
              );
            },
          },
          {
            text: 'Done',
            style: 'cancel',
          },
        ],
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to save the health reading.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <SafeAreaView
        style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text style={styles.loadingText}>
            Loading baby profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }>
            <Text style={styles.backText}>
              ‹ Back
            </Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            Quick Reading
          </Text>

          <Text style={styles.subtitle}>
            Record the baby's current
            observations
          </Text>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.profileLabel}>
            Baby
          </Text>

          <Text style={styles.profileName}>
            {babyName || 'Baby'}
          </Text>

          <Text style={styles.profileId}>
            ID: {infantId}
          </Text>

          {ageDays !== null && (
            <Text style={styles.profileAge}>
              Age: {ageDays} days
            </Text>
          )}
        </View>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        <SectionTitle title="Growth Measurements" />

        <Field
          label="Current weight (kg)"
          value={form.weight}
          onChangeText={value =>
            updateField('weight', value)
          }
        />

        <Field
          label="Current length (cm)"
          value={form.length}
          onChangeText={value =>
            updateField('length', value)
          }
        />

        <Field
          label="Head circumference (cm)"
          value={
            form.headCircumference
          }
          onChangeText={value =>
            updateField(
              'headCircumference',
              value,
            )
          }
        />

        <SectionTitle title="Vital Signs" />

        <Field
          label="Temperature (°C)"
          value={form.temperature}
          onChangeText={value =>
            updateField(
              'temperature',
              value,
            )
          }
        />

        <Field
          label="Heart rate (bpm)"
          value={form.heartRate}
          onChangeText={value =>
            updateField(
              'heartRate',
              value,
            )
          }
        />

        <Field
          label="Respiratory rate (breaths/min)"
          value={
            form.respiratoryRate
          }
          onChangeText={value =>
            updateField(
              'respiratoryRate',
              value,
            )
          }
        />

        <Field
          label="Oxygen saturation (%)"
          value={
            form.oxygenSaturation
          }
          onChangeText={value =>
            updateField(
              'oxygenSaturation',
              value,
            )
          }
        />

        <SectionTitle title="Daily Care" />

        <Field
          label="Feeding frequency / day"
          value={
            form.feedingFrequency
          }
          onChangeText={value =>
            updateField(
              'feedingFrequency',
              value,
            )
          }
        />

        <Field
          label="Urine output count"
          value={
            form.urineOutput
          }
          onChangeText={value =>
            updateField(
              'urineOutput',
              value,
            )
          }
        />

        <Field
          label="Stool count"
          value={form.stoolCount}
          onChangeText={value =>
            updateField(
              'stoolCount',
              value,
            )
          }
        />

        <Field
          label="Jaundice level (mg/dL)"
          value={
            form.jaundiceLevel
          }
          onChangeText={value =>
            updateField(
              'jaundiceLevel',
              value,
            )
          }
        />

        <Field
          label="Sleeping hours / day"
          value={
            form.sleepingHours
          }
          onChangeText={value =>
            updateField(
              'sleepingHours',
              value,
            )
          }
        />

        <SectionTitle title="Symptoms" />

        <TextInput
          style={[
            styles.input,
            styles.symptomInput,
          ]}
          placeholder="Example: poor feeding, fever"
          placeholderTextColor="#94A3B8"
          value={form.symptoms}
          onChangeText={value =>
            updateField(
              'symptoms',
              value,
            )
          }
          multiline
        />

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>
            Clinical decision support
          </Text>

          <Text style={styles.noticeText}>
            This reading is analyzed using
            prototype newborn reference
            rules, reported symptoms and
            the baby's stored profile.
          </Text>

          <Text style={styles.noticeWarning}>
            This is a research prototype and
            does not provide a diagnosis.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            saving &&
              styles.saveButtonDisabled,
          ]}
          onPress={submitReading}
          disabled={saving}>

          {saving ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.saveButtonText
              }>
              Save Health Reading
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <Text style={styles.sectionTitle}>
      {title}
    </Text>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (
    value: string,
  ) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor="#94A3B8"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 18,
  },

  backText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: '#64748B',
  },

  profileCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  profileLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E3A8A',
    marginTop: 3,
  },

  profileId: {
    marginTop: 4,
    color: '#475569',
  },

  profileAge: {
    marginTop: 3,
    color: '#475569',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 10,
  },

  field: {
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },

  symptomInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },

  errorText: {
    color: '#B91C1C',
    fontSize: 14,
  },

  notice: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    marginBottom: 18,
  },

  noticeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
  },

  noticeText: {
    marginTop: 5,
    color: '#475569',
    lineHeight: 20,
  },

  noticeWarning: {
    marginTop: 8,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 19,
  },

  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#64748B',
  },
});