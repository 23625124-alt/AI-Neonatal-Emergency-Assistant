import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {createBabyProfile} from '../src/services/api';

type Props = {
  onBack: () => void;
  onCreated: (infantId: string) => void;
};

type BabyProfileForm = {
  baby_id: string;
  baby_name: string;
  date_of_birth: string;
  sex: string;
  gestational_age_weeks: string;
  birth_weight_kg: string;
  birth_length_cm: string;
  birth_head_circumference_cm: string;
  feeding_type: string;
  parent_name: string;
  hospital_name: string;
};

type Sex = 'Male' | 'Female';

const SEX_OPTIONS: Sex[] = ['Male', 'Female'];

const FEEDING_OPTIONS = [
  'Breastfeeding',
  'Formula',
  'Mixed Feeding',
];

export default function BabyProfileScreen({
  onBack,
  onCreated,
}: Props) {
  const [form, setForm] = React.useState<BabyProfileForm>({
    baby_id: '',
    baby_name: '',
    date_of_birth: '',
    sex: '',
    gestational_age_weeks: '',
    birth_weight_kg: '',
    birth_length_cm: '',
    birth_head_circumference_cm: '',
    feeding_type: '',
    parent_name: '',
    hospital_name: '',
  });

  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const update = (
    key: keyof BabyProfileForm,
    value: string,
  ) => {
    setForm(current => ({
      ...current,
      [key]: value,
    }));

    if (error) {
      setError('');
    }
  };

  const validateDate = (value: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const parsed = new Date(`${value}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return false;
    }

    const [year, month, day] = value
      .split('-')
      .map(Number);

    return (
      parsed.getFullYear() === year &&
      parsed.getMonth() + 1 === month &&
      parsed.getDate() === day
    );
  };

  const validateForm = (): string | null => {
    const requiredFields = Object.values(form);

    if (
      requiredFields.some(
        value => !value.trim(),
      )
    ) {
      return 'Please complete all baby profile fields.';
    }

    const babyId = form.baby_id.trim();

    if (!/^[a-zA-Z0-9_-]+$/.test(babyId)) {
      return (
        'Baby ID can contain only letters, numbers, hyphen, and underscore.'
      );
    }

    if (babyId.length < 3) {
      return 'Baby ID must contain at least 3 characters.';
    }

    if (!validateDate(form.date_of_birth.trim())) {
      return 'Please enter a valid date in YYYY-MM-DD format.';
    }

    const dob = new Date(
      `${form.date_of_birth.trim()}T00:00:00`,
    );

    const today = new Date();

    if (dob > today) {
      return 'Date of birth cannot be in the future.';
    }

    const gestationalAge = Number(
      form.gestational_age_weeks,
    );

    const birthWeight = Number(
      form.birth_weight_kg,
    );

    const birthLength = Number(
      form.birth_length_cm,
    );

    const birthHeadCircumference = Number(
      form.birth_head_circumference_cm,
    );

    if (!Number.isFinite(gestationalAge)) {
      return 'Please enter a valid gestational age.';
    }

    if (
      gestationalAge < 20 ||
      gestationalAge > 44
    ) {
      return 'Gestational age must be between 20 and 44 weeks.';
    }

    if (!Number.isFinite(birthWeight)) {
      return 'Please enter a valid birth weight.';
    }

    if (
      birthWeight <= 0 ||
      birthWeight > 10
    ) {
      return 'Please enter a realistic birth weight.';
    }

    if (!Number.isFinite(birthLength)) {
      return 'Please enter a valid birth length.';
    }

    if (
      birthLength <= 0 ||
      birthLength > 70
    ) {
      return 'Please enter a valid birth length.';
    }

    if (
      !Number.isFinite(
        birthHeadCircumference,
      )
    ) {
      return 'Please enter a valid head circumference.';
    }

    if (
      birthHeadCircumference <= 0 ||
      birthHeadCircumference > 50
    ) {
      return 'Please enter a valid birth head circumference.';
    }

    if (
      !SEX_OPTIONS.includes(
        form.sex as Sex,
      )
    ) {
      return 'Please select Male or Female.';
    }

    if (
      !FEEDING_OPTIONS.includes(
        form.feeding_type,
      )
    ) {
      return 'Please select a feeding type.';
    }

    return null;
  };

  const submit = async () => {
    setError('');

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const gestationalAge = Number(
      form.gestational_age_weeks,
    );

    const birthWeight = Number(
      form.birth_weight_kg,
    );

    const birthLength = Number(
      form.birth_length_cm,
    );

    const birthHeadCircumference = Number(
      form.birth_head_circumference_cm,
    );

    setSaving(true);

    try {
      const response =
        await createBabyProfile({
          baby_id: form.baby_id.trim(),
          baby_name: form.baby_name.trim(),
          date_of_birth:
            form.date_of_birth.trim(),
          sex: form.sex.trim(),
          gestational_age_weeks:
            gestationalAge,
          birth_weight_kg:
            birthWeight,
          birth_length_cm:
            birthLength,
          birth_head_circumference_cm:
            birthHeadCircumference,
          feeding_type:
            form.feeding_type.trim(),
          parent_name:
            form.parent_name.trim(),
          hospital_name:
            form.hospital_name.trim(),
        } as any);

      const baby = response?.baby;

      const infantId =
        baby?.baby_id ||
        form.baby_id.trim();

      const ageDisplay =
        baby?.age?.age_display ||
        'Age calculated automatically';

      Alert.alert(
        'Profile Created',
        [
          `Baby: ${
            baby?.baby_name ||
            form.baby_name.trim()
          }`,
          `Baby ID: ${infantId}`,
          `Age: ${ageDisplay}`,
          '',
          'The baby profile is now ready for health monitoring.',
        ].join('\n'),
        [
          {
            text: 'Continue',
            onPress: () => {
              onCreated(infantId);
            },
          },
        ],
      );
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Profile creation failed. Please try again.';

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={
        styles.content
      }
      keyboardShouldPersistTaps="handled">

      <Pressable
        style={styles.backButton}
        onPress={onBack}
        disabled={saving}>
        <Text style={styles.backButtonText}>
          ← Back
        </Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.headerIcon}>
          👶
        </Text>

        <View style={styles.headerText}>
          <Text style={styles.heading}>
            Baby Profile
          </Text>

          <Text style={styles.subtitle}>
            Create a hospital-oriented neonatal
            monitoring profile.
          </Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>
          Automatic Age Calculation
        </Text>

        <Text style={styles.infoText}>
          Enter the baby's actual date of birth.
          The system calculates the baby's current
          age automatically and uses it for
          age-aware monitoring and growth assessment.
        </Text>
      </View>

      <SectionTitle title="Basic Information" />

      <Field
        label="Baby ID"
        required
        placeholder="Example: baby-002"
        value={form.baby_id}
        onChangeText={value =>
          update('baby_id', value)
        }
        autoCapitalize="none"
      />

      <Field
        label="Baby Name"
        required
        placeholder="Example: Shree"
        value={form.baby_name}
        onChangeText={value =>
          update('baby_name', value)
        }
        autoCapitalize="words"
      />

      <Field
        label="Date of Birth"
        required
        placeholder="YYYY-MM-DD"
        value={form.date_of_birth}
        onChangeText={value =>
          update('date_of_birth', value)
        }
        keyboardType="numeric"
      />

      <Text style={styles.label}>
        Sex <Text style={styles.required}>*</Text>
      </Text>

      <View style={styles.optionRow}>
        {SEX_OPTIONS.map(option => {
          const selected =
            form.sex === option;

          return (
            <Pressable
              key={option}
              style={[
                styles.optionButton,
                selected &&
                  styles.optionButtonSelected,
              ]}
              onPress={() =>
                update('sex', option)
              }>
              <Text
                style={[
                  styles.optionText,
                  selected &&
                    styles.optionTextSelected,
                ]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle title="Birth Information" />

      <Field
        label="Gestational Age"
        required
        placeholder="Example: 38"
        value={form.gestational_age_weeks}
        onChangeText={value =>
          update(
            'gestational_age_weeks',
            value,
          )
        }
        keyboardType="decimal-pad"
        suffix="weeks"
      />

      <Field
        label="Birth Weight"
        required
        placeholder="Example: 2.8"
        value={form.birth_weight_kg}
        onChangeText={value =>
          update(
            'birth_weight_kg',
            value,
          )
        }
        keyboardType="decimal-pad"
        suffix="kg"
      />

      <Field
        label="Birth Length"
        required
        placeholder="Example: 48"
        value={form.birth_length_cm}
        onChangeText={value =>
          update(
            'birth_length_cm',
            value,
          )
        }
        keyboardType="decimal-pad"
        suffix="cm"
      />

      <Field
        label="Birth Head Circumference"
        required
        placeholder="Example: 34"
        value={
          form.birth_head_circumference_cm
        }
        onChangeText={value =>
          update(
            'birth_head_circumference_cm',
            value,
          )
        }
        keyboardType="decimal-pad"
        suffix="cm"
      />

      <Text style={styles.label}>
        Feeding Type{' '}
        <Text style={styles.required}>*</Text>
      </Text>

      <View style={styles.optionColumn}>
        {FEEDING_OPTIONS.map(option => {
          const selected =
            form.feeding_type === option;

          return (
            <Pressable
              key={option}
              style={[
                styles.optionButtonFull,
                selected &&
                  styles.optionButtonSelected,
              ]}
              onPress={() =>
                update(
                  'feeding_type',
                  option,
                )
              }>
              <Text
                style={[
                  styles.optionText,
                  selected &&
                    styles.optionTextSelected,
                ]}>
                {selected ? '✓ ' : ''}
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle title="Parent & Hospital" />

      <Field
        label="Parent / Guardian Name"
        required
        placeholder="Example: Muthu"
        value={form.parent_name}
        onChangeText={value =>
          update(
            'parent_name',
            value,
          )
        }
        autoCapitalize="words"
      />

      <Field
        label="Hospital Name"
        required
        placeholder="Example: City Care Hospital"
        value={form.hospital_name}
        onChangeText={value =>
          update(
            'hospital_name',
            value,
          )
        }
        autoCapitalize="words"
      />

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>
            Attention
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}

      <Pressable
        style={[
          styles.createButton,
          saving &&
            styles.createButtonDisabled,
        ]}
        onPress={submit}
        disabled={saving}>
        <Text style={styles.createButtonText}>
          {saving
            ? 'Creating Profile...'
            : 'Create Baby Profile'}
        </Text>
      </Pressable>

      <Text style={styles.footerNote}>
        This system is a research prototype for
        neonatal monitoring and clinical
        decision support. It does not replace
        professional medical assessment.
      </Text>
    </ScrollView>
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
  required,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  suffix,
  autoCapitalize = 'none',
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?:
    | 'default'
    | 'numeric'
    | 'decimal-pad';
  suffix?: string;
  autoCapitalize?:
    | 'none'
    | 'sentences'
    | 'words'
    | 'characters';
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {label}{' '}
        {required && (
          <Text style={styles.required}>
            *
          </Text>
        )}
      </Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable
        />

        {suffix && (
          <Text style={styles.suffix}>
            {suffix}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 50,
    backgroundColor: '#F8FAFC',
  },

  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 12,
  },

  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  headerIcon: {
    fontSize: 38,
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    marginTop: 3,
  },

  infoBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D4ED8',
    marginBottom: 5,
  },

  infoText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 22,
    marginBottom: 10,
  },

  fieldContainer: {
    marginBottom: 13,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },

  required: {
    color: '#DC2626',
  },

  inputWrapper: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },

  suffix: {
    paddingRight: 13,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },

  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },

  optionColumn: {
    gap: 8,
  },

  optionButton: {
    flex: 1,
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  optionButtonFull: {
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  optionButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },

  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },

  optionTextSelected: {
    color: '#1D4ED8',
    fontWeight: '800',
  },

  errorBox: {
    marginTop: 18,
    padding: 13,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B91C1C',
    marginBottom: 4,
  },

  errorText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#991B1B',
  },

  createButton: {
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 11,
    marginTop: 20,
  },

  createButtonDisabled: {
    opacity: 0.6,
  },

  createButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  footerNote: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 18,
  },
});