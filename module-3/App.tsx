import React, {useEffect, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import * as API from './src/services/api';
import AppointmentScreen from './screens/AppointmentScreen';

type Screen =
  | 'auth'
  | 'home'
  | 'manual'
  | 'history'
  | 'global'
  | 'appointments';

type AuthMode = 'login' | 'register';

type FormFields = {
  infant_id: string;
  gender: string;
  gestational_age_weeks: string;
  birth_weight_kg: string;
  birth_length_cm: string;
  birth_head_circumference_cm: string;
  age_days: string;
  weight_kg: string;
  length_cm: string;
  head_circumference_cm: string;
  temperature_c: string;
  heart_rate_bpm: string;
  respiratory_rate_bpm: string;
  oxygen_saturation: string;
  feeding_type: string;
  feeding_frequency_per_day: string;
  urine_output_count: string;
  stool_count: string;
  jaundice_level_mg_dl: string;
  apgar_score: string;
  immunizations_done: string;
  reflexes_normal: string;
  sleeping_hours: string;
  vaccination_status: string;
  symptoms: string;
};

const initialFields: FormFields = {
  infant_id: '',
  gender: 'Female',
  gestational_age_weeks: '38',
  birth_weight_kg: '2.8',
  birth_length_cm: '48',
  birth_head_circumference_cm: '33',
  age_days: '7',
  weight_kg: '2.8',
  length_cm: '48',
  head_circumference_cm: '33',
  temperature_c: '36.8',
  heart_rate_bpm: '130',
  respiratory_rate_bpm: '40',
  oxygen_saturation: '98',
  feeding_type: 'Breastfeeding',
  feeding_frequency_per_day: '8',
  urine_output_count: '6',
  stool_count: '3',
  jaundice_level_mg_dl: '0',
  apgar_score: '9',
  immunizations_done: '1',
  reflexes_normal: '1',
  sleeping_hours: '16',
  vaccination_status: 'Up to date',
  symptoms: '',
};

const FORM_FIELDS: {
  key: keyof FormFields;
  label: string;
  numeric?: boolean;
}[] = [
  {key: 'infant_id', label: 'Baby ID'},
  {key: 'gender', label: 'Gender'},
  {
    key: 'gestational_age_weeks',
    label: 'Gestational age (weeks)',
    numeric: true,
  },
  {
    key: 'birth_weight_kg',
    label: 'Birth weight (kg)',
    numeric: true,
  },
  {
    key: 'birth_length_cm',
    label: 'Birth length (cm)',
    numeric: true,
  },
  {
    key: 'birth_head_circumference_cm',
    label: 'Birth head circumference (cm)',
    numeric: true,
  },
  {key: 'age_days', label: 'Baby age (days)', numeric: true},
  {key: 'weight_kg', label: 'Current weight (kg)', numeric: true},
  {key: 'length_cm', label: 'Current length (cm)', numeric: true},
  {
    key: 'head_circumference_cm',
    label: 'Current head circumference (cm)',
    numeric: true,
  },
  {
    key: 'temperature_c',
    label: 'Temperature (°C)',
    numeric: true,
  },
  {
    key: 'heart_rate_bpm',
    label: 'Heart rate (bpm)',
    numeric: true,
  },
  {
    key: 'respiratory_rate_bpm',
    label: 'Respiratory rate (bpm)',
    numeric: true,
  },
  {
    key: 'oxygen_saturation',
    label: 'Oxygen saturation (%)',
    numeric: true,
  },
  {key: 'feeding_type', label: 'Feeding type'},
  {
    key: 'feeding_frequency_per_day',
    label: 'Feedings per day',
    numeric: true,
  },
  {
    key: 'urine_output_count',
    label: 'Urine output count',
    numeric: true,
  },
  {
    key: 'stool_count',
    label: 'Stool count',
    numeric: true,
  },
  {
    key: 'jaundice_level_mg_dl',
    label: 'Jaundice level (mg/dL)',
    numeric: true,
  },
  {key: 'apgar_score', label: 'Apgar score', numeric: true},
  {
    key: 'immunizations_done',
    label: 'Immunizations done (0 or 1)',
    numeric: true,
  },
  {
    key: 'reflexes_normal',
    label: 'Reflexes normal (0 or 1)',
    numeric: true,
  },
  {
    key: 'sleeping_hours',
    label: 'Sleeping hours per day',
    numeric: true,
  },
  {key: 'vaccination_status', label: 'Vaccination status'},
  {key: 'symptoms', label: 'Symptoms (comma separated)'},
];

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildReadingPayload(fields: FormFields) {
  return {
    infant_id: fields.infant_id.trim(),
    simulated: false,
    recorded_at: new Date().toISOString(),
    gender: fields.gender,
    gestational_age_weeks: toNumber(fields.gestational_age_weeks),
    birth_weight_kg: toNumber(fields.birth_weight_kg),
    birth_length_cm: toNumber(fields.birth_length_cm),
    birth_head_circumference_cm: toNumber(
      fields.birth_head_circumference_cm,
    ),
    age_days: toNumber(fields.age_days),
    weight_kg: toNumber(fields.weight_kg),
    length_cm: toNumber(fields.length_cm),
    head_circumference_cm: toNumber(fields.head_circumference_cm),
    temperature_c: toNumber(fields.temperature_c),
    heart_rate_bpm: toNumber(fields.heart_rate_bpm),
    respiratory_rate_bpm: toNumber(fields.respiratory_rate_bpm),
    oxygen_saturation: toNumber(fields.oxygen_saturation),
    feeding_type: fields.feeding_type,
    feeding_frequency_per_day: toNumber(
      fields.feeding_frequency_per_day,
    ),
    urine_output_count: toNumber(fields.urine_output_count),
    stool_count: toNumber(fields.stool_count),
    jaundice_level_mg_dl: toNumber(fields.jaundice_level_mg_dl),
    apgar_score: toNumber(fields.apgar_score),
    immunizations_done: toNumber(fields.immunizations_done),
    reflexes_normal: toNumber(fields.reflexes_normal),
    sleeping_hours: toNumber(fields.sleeping_hours),
    vaccination_status: fields.vaccination_status,
    symptoms: fields.symptoms
      .split(',')
      .map(item => item.trim())
      .filter(Boolean),
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

function AppButton({
  title,
  onPress,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        secondary && styles.secondaryButton,
        disabled && styles.disabledButton,
      ]}>
      <Text
        style={[
          styles.buttonText,
          secondary && styles.secondaryButtonText,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function FieldInput({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
      />
    </View>
  );
}

function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (user: {
    username: string;
    role: string;
    babyId: string;
  }) => void;
}) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [babyId, setBabyId] = useState('');
  const [role, setRole] = useState('parent');

  const handleAuthentication = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing information', 'Enter your username and password.');
      return;
    }

    if (mode === 'register') {
      if (
        !fullName.trim() ||
        !phone.trim() ||
        !email.trim() ||
        !babyId.trim()
      ) {
        Alert.alert(
          'Missing information',
          'Please fill in all registration fields.',
        );
        return;
      }

      if (!email.includes('@')) {
        Alert.alert('Invalid email', 'Enter a valid email address.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        await API.registerUser(
          username.trim(),
          password,
          fullName.trim(),
          role,
          phone.trim(),
          email.trim(),
          babyId.trim(),
        );

        Alert.alert(
          'Registration successful',
          'Your account has been created. You can now log in.',
        );

        setMode('login');
      } else {
        await API.loginUser(username.trim(), password);

        onAuthenticated({
          username: username.trim(),
          role,
          babyId: babyId.trim(),
        });
      }
    } catch (error) {
      Alert.alert(
        mode === 'login' ? 'Login failed' : 'Registration failed',
        getErrorMessage(error),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
     <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.authContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>👶</Text>
        </View>

        <Text style={styles.appTitle}>Neonatal Care Assistant</Text>

        <Text style={styles.subtitle}>
          Intelligent care and decision support for your baby
        </Text>

        <View style={styles.authCard}>
          <Text style={styles.cardTitle}>
            {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
          </Text>

          <Text style={styles.mutedText}>
            {mode === 'login'
              ? 'Log in to continue to your baby care dashboard.'
              : 'Register to get started with neonatal care.'}
          </Text>

          <FieldInput
            label="Username"
            value={username}
            onChangeText={setUsername}
          />

          <FieldInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {mode === 'register' && (
            <>
              <FieldInput
                label="Full name"
                value={fullName}
                onChangeText={setFullName}
              />

              <FieldInput
                label="Phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <FieldInput
                label="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <FieldInput
                label="Baby ID"
                value={babyId}
                onChangeText={setBabyId}
              />

              <Text style={styles.fieldLabel}>Account role</Text>

              <View style={styles.roleRow}>
                {[
                  {label: 'Parent', value: 'parent'},
                  {label: 'Doctor', value: 'doctor'},
                  {label: 'Nurse', value: 'nurse'},
                ].map(item => (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() => setRole(item.value)}
                    style={[
                      styles.roleButton,
                      role === item.value && styles.selectedRole,
                    ]}>
                    <Text
                      style={[
                        styles.roleText,
                        role === item.value && styles.selectedRoleText,
                      ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <AppButton
            title={
              loading
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Login'
                  : 'Register'
            }
            onPress={handleAuthentication}
            disabled={loading}
          />

          <TouchableOpacity
            style={styles.switchAuth}
            onPress={() => {
              setMode(mode === 'login' ? 'register' : 'login');
            }}>
            <Text style={styles.switchAuthText}>
              {mode === 'login'
                ? "Don't have an account? Register"
                : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          This application supports care monitoring. It does not replace
          professional medical advice or emergency care.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const COLORS = {
  background: '#F0FDFA',
  primary: '#0F766E',
  dark: '#115E59',
  light: '#CCFBF1',
  border: '#D1FAE5',
  text: '#134E4A',
  muted: '#64748B',
  white: '#FFFFFF',
  danger: '#B91C1C',
};

function HomeScreen({
  username,
  babyId,
  latestReading,
  loading,
  onOpenManual,
  onOpenHistory,
  onOpenGlobal,
  onOpenAppointments,
  onLogout,
}: {
  username: string;
  babyId: string;
  latestReading: any;
  loading: boolean;
  onOpenManual: () => void;
  onOpenHistory: () => void;
  onOpenGlobal: () => void;
  onOpenAppointments: () => void;
  onLogout: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.pageContainer}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.appTitle}>Neonatal Care Assistant</Text>
            <Text style={styles.subtitle}>Your baby's care companion</Text>
          </View>

          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome, {username}! 👶</Text>
          <Text style={styles.welcomeText}>
            Monitor health information and review care guidance in one place.
          </Text>
          {!!babyId && (
            <Text style={styles.babyIdText}>Baby ID: {babyId}</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Appointments</Text>
          <Text style={styles.mutedText}>
            Book and manage your baby's doctor appointments.
          </Text>
          <AppButton
            title="Manage Appointments"
            onPress={onOpenAppointments}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🩺 Health Monitoring</Text>
          <Text style={styles.mutedText}>
            Enter your baby's measurements and submit a health reading.
          </Text>
          <AppButton title="Add Health Reading" onPress={onOpenManual} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Monitoring History</Text>
          <Text style={styles.mutedText}>
            Review previously recorded health readings.
          </Text>
          <AppButton
            title="View Monitoring History"
            onPress={onOpenHistory}
            secondary
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔎 Explainable AI</Text>
          <Text style={styles.mutedText}>
            Review available model-level feature importance information.
          </Text>
          <AppButton
            title="Global XAI Explanation"
            onPress={onOpenGlobal}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Latest Health Status</Text>

          {loading ? (
            <Text style={styles.mutedText}>Loading latest reading...</Text>
          ) : latestReading ? (
            <>
              <InfoRow
                label="Risk level"
                value={String(latestReading.risk_level ?? 'Not available')}
              />
              <InfoRow
                label="Temperature"
                value={`${latestReading.temperature_c ?? '--'} °C`}
              />
              <InfoRow
                label="Heart rate"
                value={`${latestReading.heart_rate_bpm ?? '--'} bpm`}
              />
              <InfoRow
                label="Oxygen saturation"
                value={`${latestReading.oxygen_saturation ?? '--'}%`}
              />
            </>
          ) : (
            <Text style={styles.mutedText}>
              No reading is available yet. Add a reading to get started.
            </Text>
          )}
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Important medical notice</Text>
          <Text style={styles.warningText}>
            This app is a research decision-support prototype, not a
            diagnostic tool. For urgent symptoms or breathing difficulty,
            seek emergency medical care immediately.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ManualEntryScreen({
  fields,
  setFields,
  result,
  globalResult,
  history,
  whatIfValue,
  setWhatIfValue,
  busy,
  onSubmit,
  onHistory,
  onGlobalXai,
  onWhatIf,
  onBack,
}: {
  fields: FormFields;
  setFields: React.Dispatch<React.SetStateAction<FormFields>>;
  result: any;
  globalResult: any;
  history: any[];
  whatIfValue: string;
  setWhatIfValue: (value: string) => void;
  busy: boolean;
  onSubmit: () => void;
  onHistory: () => void;
  onGlobalXai: () => void;
  onWhatIf: () => void;
  onBack: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.pageContainer}
        keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Baby Health Monitoring</Text>
        <Text style={styles.subtitle}>
          Enter the available measurements carefully.
        </Text>

        <View style={styles.card}>
          {FORM_FIELDS.map(field => (
            <FieldInput
              key={field.key}
              label={field.label}
              value={fields[field.key]}
              keyboardType={field.numeric ? 'numeric' : 'default'}
              multiline={field.key === 'symptoms'}
              onChangeText={value =>
                setFields(previous => ({
                  ...previous,
                  [field.key]: value,
                }))
              }
            />
          ))}

          <AppButton
            title={busy ? 'Submitting...' : 'Submit Health Reading'}
            onPress={onSubmit}
            disabled={busy}
          />

          <AppButton
            title="Load Monitoring History"
            onPress={onHistory}
            secondary
          />

          <AppButton
            title="Get Global XAI Explanation"
            onPress={onGlobalXai}
            secondary
          />
        </View>

        {!!result && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Health Reading Result</Text>

            <InfoRow
              label="Risk level"
              value={String(result.record?.risk_level ?? result.risk_level ?? 'Not available')}
            />

            <InfoRow
              label="Action"
              value={String(result.action ?? 'Review the returned result')}
            />

            {!!result.warning && (
              <Text style={styles.mutedText}>{result.warning}</Text>
            )}

            {!!result.record?.risk_reasons?.length && (
              <>
                <Text style={styles.sectionTitle}>Risk reasons</Text>
                {result.record.risk_reasons.map(
                  (reason: string, index: number) => (
                    <Text key={`${reason}-${index}`} style={styles.listItem}>
                      • {reason}
                    </Text>
                  ),
                )}
              </>
            )}

            {!!result.record?.model && (
              <>
                <Text style={styles.sectionTitle}>Model result</Text>
                <InfoRow
                  label="Prediction"
                  value={String(result.record.model.prediction ?? 'Not available')}
                />
                <InfoRow
                  label="Probability at risk"
                  value={
                    result.record.model.probability_at_risk != null
                      ? `${(
                          Number(
                            result.record.model.probability_at_risk,
                          ) * 100
                        ).toFixed(1)}%`
                      : 'Not available'
                  }
                />

                {!!result.record.model.explanation?.top_contributions
                  ?.length && (
                  <>
                    <Text style={styles.sectionTitle}>
                      Explanation contributions
                    </Text>
                    {result.record.model.explanation.top_contributions.map(
                      (item: any, index: number) => (
                        <Text
                          key={`${item.feature}-${index}`}
                          style={styles.listItem}>
                          • {item.feature}: {item.shap_value}
                        </Text>
                      ),
                    )}
                  </>
                )}
              </>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What-if Analysis</Text>
          <Text style={styles.mutedText}>
            Test a hypothetical temperature value. This is an experimental
            model feature, not a clinical recommendation.
          </Text>

          <FieldInput
            label="Hypothetical temperature (°C)"
            value={whatIfValue}
            keyboardType="numeric"
            onChangeText={setWhatIfValue}
          />

          <AppButton
            title="Run What-if Analysis"
            onPress={onWhatIf}
            secondary
            disabled={busy}
          />
        </View>

        {!!history.length && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Monitoring History</Text>
            {history.map((item: any, index: number) => (
              <View key={String(item.id ?? index)} style={styles.historyItem}>
                <Text style={styles.historyTitle}>
                  {item.recorded_at
                    ? new Date(item.recorded_at).toLocaleString()
                    : `Reading ${index + 1}`}
                </Text>
                <Text style={styles.mutedText}>
                  Temperature: {item.temperature_c ?? '--'} °C
                </Text>
                <Text style={styles.mutedText}>
                  Heart rate: {item.heart_rate_bpm ?? '--'} bpm
                </Text>
                <Text style={styles.mutedText}>
                  Risk level: {item.risk_level ?? 'Not available'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {!!globalResult && (
          <GlobalResultCard globalResult={globalResult} />
        )}

        <Text style={styles.disclaimer}>
          Research prototype only. This is not a diagnostic tool and should
          not replace assessment by a qualified healthcare professional.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function GlobalResultCard({globalResult}: {globalResult: any}) {
  const rows = globalResult.global_feature_importance ?? [];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Global XAI Feature Importance</Text>
      <Text style={styles.mutedText}>
        Rows explained: {globalResult.rows_explained ?? 0}
      </Text>

      {rows.length ? (
        rows.map((item: any, index: number) => (
          <View key={`${item.feature}-${index}`} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{item.feature}</Text>
            <Text style={styles.infoValue}>
              {Number(item.mean_absolute_shap ?? 0).toFixed(4)}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.mutedText}>
          No feature importance rows were returned by the API.
        </Text>
      )}

      {!!globalResult.warning && (
        <Text style={styles.mutedText}>{globalResult.warning}</Text>
      )}
    </View>
  );
}

function HistoryScreen({
  history,
  loading,
  onRefresh,
  onBack,
}: {
  history: any[];
  loading: boolean;
  onRefresh: () => void;
  onBack: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.pageContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Monitoring History</Text>

        <AppButton
          title={loading ? 'Loading...' : 'Refresh History'}
          onPress={onRefresh}
          disabled={loading}
        />

        {!history.length && !loading && (
          <View style={styles.card}>
            <Text style={styles.mutedText}>
              No monitoring records found for this Baby ID.
            </Text>
          </View>
        )}

        {history.map((item, index) => (
          <View
            key={String(item.id ?? index)}
            style={styles.card}>
            <Text style={styles.cardTitle}>
              Reading {index + 1}
            </Text>
            <Text style={styles.mutedText}>
              {item.recorded_at
                ? new Date(item.recorded_at).toLocaleString()
                : 'Time unavailable'}
            </Text>

            <InfoRow
              label="Risk level"
              value={String(item.risk_level ?? 'Not available')}
            />
            <InfoRow
              label="Temperature"
              value={`${item.temperature_c ?? '--'} °C`}
            />
            <InfoRow
              label="Heart rate"
              value={`${item.heart_rate_bpm ?? '--'} bpm`}
            />
            <InfoRow
              label="Oxygen saturation"
              value={`${item.oxygen_saturation ?? '--'}%`}
            />

            {!!item.risk_reasons?.length && (
              <>
                <Text style={styles.sectionTitle}>Risk reasons</Text>
                {item.risk_reasons.map(
                  (reason: string, reasonIndex: number) => (
                    <Text
                      key={`${reason}-${reasonIndex}`}
                      style={styles.listItem}>
                      • {reason}
                    </Text>
                  ),
                )}
              </>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function GlobalScreen({
  globalResult,
  loading,
  onRefresh,
  onBack,
}: {
  globalResult: any;
  loading: boolean;
  onRefresh: () => void;
  onBack: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.pageContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Explainable AI</Text>
        <Text style={styles.subtitle}>
          Global model feature importance returned by the backend.
        </Text>

        <AppButton
          title={loading ? 'Loading...' : 'Refresh Explanation'}
          onPress={onRefresh}
          disabled={loading}
        />

        {globalResult ? (
          <GlobalResultCard globalResult={globalResult} />
        ) : (
          <View style={styles.card}>
            <Text style={styles.mutedText}>
              No explanation data loaded yet.
            </Text>
          </View>
        )}

        <Text style={styles.disclaimer}>
          Model explanations describe model behaviour; they do not confirm a
          diagnosis or determine a baby's clinical condition.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('auth');
  const [username, setUsername] = useState('');
  const [babyId, setBabyId] = useState('');

  const [fields, setFields] = useState<FormFields>(initialFields);
  const [result, setResult] = useState<any>(null);
  const [globalResult, setGlobalResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [latestReading, setLatestReading] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [whatIfValue, setWhatIfValue] = useState('35.5');

  useEffect(() => {
    if (screen === 'home' && babyId) {
      void loadHistory(babyId, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, babyId]);

  const loadHistory = async (
    id: string,
    showError = true,
  ): Promise<any[]> => {
    if (!id.trim()) {
      if (showError) {
        Alert.alert('Baby ID required', 'Enter a Baby ID first.');
      }
      return [];
    }

    setLoading(true);

    try {
      const response: any = await API.getMonitoringHistory(id.trim());
      const records = Array.isArray(response)
        ? response
        : response.readings ?? response.records ?? [];

      setHistory(records);

      if (records.length) {
        setLatestReading(records[records.length - 1]);
      }

      return records;
    } catch (error) {
      if (showError) {
        Alert.alert('History error', getErrorMessage(error));
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticated = (user: {
    username: string;
    role: string;
    babyId: string;
  }) => {
    setUsername(user.username);
    setBabyId(user.babyId);

    setFields(previous => ({
      ...previous,
      infant_id: user.babyId || previous.infant_id,
    }));

    setScreen('home');
  };

  const handleLogout = () => {
    setUsername('');
    setBabyId('');
    setFields(initialFields);
    setResult(null);
    setGlobalResult(null);
    setHistory([]);
    setLatestReading(null);
    setScreen('auth');
  };

  const handleSubmit = async () => {
    if (!fields.infant_id.trim()) {
      Alert.alert('Baby ID required', 'Enter your Baby ID.');
      return;
    }

    setLoading(true);

    try {
      const response: any = await API.submitReading(
        buildReadingPayload(fields) as any,
      );

      setResult(response);

      const reading = response.record ?? response;
      setLatestReading(reading);

      await loadHistory(fields.infant_id.trim(), false);

      Alert.alert(
        'Success',
        'Health reading submitted successfully.',
      );
    } catch (error) {
      Alert.alert(
        'Submission failed',
        getErrorMessage(error),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHistory = async () => {
    const id = fields.infant_id.trim() || babyId.trim();

    if (!id) {
      Alert.alert('Baby ID required', 'Enter your Baby ID first.');
      return;
    }

    await loadHistory(id);
  };

  const handleGlobalXai = async () => {
    setLoading(true);

    try {
      const response = await API.getGlobalExplanation();
      setGlobalResult(response);
      Alert.alert('Success', 'Global XAI explanation loaded.');
    } catch (error) {
      Alert.alert(
        'XAI error',
        getErrorMessage(error),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWhatIf = async () => {
    if (!fields.infant_id.trim()) {
      Alert.alert('Baby ID required', 'Enter your Baby ID first.');
      return;
    }

    const temperature = Number(whatIfValue);

    if (!Number.isFinite(temperature) || temperature <= 0) {
      Alert.alert(
        'Invalid temperature',
        'Enter a valid hypothetical temperature.',
      );
      return;
    }

    setLoading(true);

    try {
      const response = await API.getWhatIfExplanation(
        buildReadingPayload(fields) as any,
        {temperature_c: temperature},
      );

      Alert.alert(
        'What-if Analysis',
        `Prediction: ${response.prediction ?? 'Not available'}\n` +
          `Probability at risk: ${
            response.probability_at_risk != null
              ? `${(Number(response.probability_at_risk) * 100).toFixed(1)}%`
              : 'Not available'
          }`,
      );
    } catch (error) {
      Alert.alert(
        'What-if error',
        getErrorMessage(error),
      );
    } finally {
      setLoading(false);
    }
  };

  if (screen === 'auth') {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  if (screen === 'appointments') {
    return <AppointmentScreen />;
  }

  if (screen === 'manual') {
    return (
      <ManualEntryScreen
        fields={fields}
        setFields={setFields}
        result={result}
        globalResult={globalResult}
        history={history}
        whatIfValue={whatIfValue}
        setWhatIfValue={setWhatIfValue}
        busy={loading}
        onSubmit={handleSubmit}
        onHistory={handleHistory}
        onGlobalXai={handleGlobalXai}
        onWhatIf={handleWhatIf}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'history') {
    return (
      <HistoryScreen
        history={history}
        loading={loading}
        onRefresh={() => {
          void loadHistory(fields.infant_id || babyId);
        }}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'global') {
    return (
      <GlobalScreen
        globalResult={globalResult}
        loading={loading}
        onRefresh={handleGlobalXai}
        onBack={() => setScreen('home')}
      />
    );
  }

  return (
    <HomeScreen
      username={username}
      babyId={babyId}
      latestReading={latestReading}
      loading={loading}
      onOpenManual={() => setScreen('manual')}
      onOpenHistory={() => setScreen('history')}
      onOpenGlobal={() => setScreen('global')}
      onOpenAppointments={() => setScreen('appointments')}
      onLogout={handleLogout}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  authContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 32,
  },

  pageContainer: {
    padding: 18,
    paddingBottom: 40,
  },

  logoCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light,
    marginBottom: 18,
  },

  logoEmoji: {
    fontSize: 42,
  },

  appTitle: {
    color: COLORS.dark,
    fontSize: 25,
    fontWeight: '800',
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
    marginBottom: 16,
  },

  authCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },

  cardTitle: {
    color: COLORS.dark,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
  },

  mutedText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },

  fieldContainer: {
    marginTop: 10,
    marginBottom: 5,
  },

  fieldLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0F172A',
  },

  multilineInput: {
    minHeight: 78,
    textAlignVertical: 'top',
  },

  button: {
    backgroundColor: COLORS.primary,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  secondaryButton: {
    backgroundColor: COLORS.light,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },

  secondaryButtonText: {
    color: COLORS.dark,
  },

  switchAuth: {
    paddingVertical: 18,
    alignItems: 'center',
  },

  switchAuthText: {
    color: COLORS.primary,
    fontWeight: '700',
    textAlign: 'center',
  },

  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },

  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  selectedRole: {
    backgroundColor: COLORS.light,
    borderColor: COLORS.primary,
  },

  roleText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
  },

  selectedRoleText: {
    color: COLORS.dark,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },

  headerTextContainer: {
    flex: 1,
  },

  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },

  logoutText: {
    color: COLORS.danger,
    fontWeight: '800',
  },

  welcomeCard: {
    backgroundColor: COLORS.light,
    borderRadius: 20,
    padding: 20,
    marginBottom: 22,
  },

  welcomeTitle: {
    color: COLORS.dark,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 9,
  },

  welcomeText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
  },

  babyIdText: {
    color: COLORS.dark,
    fontWeight: '800',
    marginTop: 10,
  },

  sectionTitle: {
    color: COLORS.dark,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 12,
  },

  pageTitle: {
    color: COLORS.dark,
    fontSize: 25,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 8,
  },

  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.light,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  backButtonText: {
    color: COLORS.dark,
    fontWeight: '800',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  infoLabel: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 14,
  },

  infoValue: {
    color: COLORS.dark,
    flex: 1,
    textAlign: 'right',
    fontWeight: '800',
    fontSize: 14,
  },

  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  historyTitle: {
    color: COLORS.dark,
    fontWeight: '800',
    marginBottom: 7,
  },

  listItem: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 5,
  },

  warningCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 17,
    marginTop: 3,
    marginBottom: 15,
  },

  warningTitle: {
    color: '#9A3412',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },

  warningText: {
    color: '#7C2D12',
    fontSize: 14,
    lineHeight: 21,
  },

  disclaimer: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 18,
    marginBottom: 12,
  },
});