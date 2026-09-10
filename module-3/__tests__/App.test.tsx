/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Button, TextInput } from 'react-native';
import App from '../App';
import { getGlobalExplanation, getMonitoringHistory, getWhatIfExplanation, submitReading } from '../src/services/api';

jest.mock('../src/services/api', () => ({
  getMonitoringHistory: jest.fn(),
  getGlobalExplanation: jest.fn(),
  getWhatIfExplanation: jest.fn(),
  submitReading: jest.fn(),
}));

const mockedSubmitReading = submitReading as jest.MockedFunction<typeof submitReading>;
const mockedGetMonitoringHistory = getMonitoringHistory as jest.MockedFunction<typeof getMonitoringHistory>;
const mockedGetGlobalExplanation = getGlobalExplanation as jest.MockedFunction<typeof getGlobalExplanation>;
const mockedGetWhatIfExplanation = getWhatIfExplanation as jest.MockedFunction<typeof getWhatIfExplanation>;

beforeEach(() => {
  jest.clearAllMocks();
});

async function fillForm(renderer: ReactTestRenderer.ReactTestRenderer, valueFor: (label: string) => string = () => '1') {
  for (const input of renderer.root.findAllByType(TextInput)) {
    await ReactTestRenderer.act(() => {
      input.props.onChangeText(valueFor(input.props.accessibilityLabel as string));
    });
  }
}

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

test('opens the manual form with all model fields', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ testID: 'manual-entry' }).props.onPress();
  });
  expect(renderer!.root.findAllByType(TextInput)).toHaveLength(25);
  expect(renderer!.root.findAllByProps({ children: 'Manual neonatal reading' }).length).toBeGreaterThan(0);
});

test('required-field validation prevents an empty submission', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ testID: 'manual-entry' }).props.onPress();
  });
  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ testID: 'submit-reading' }).props.onPress();
  });
  expect(mockedSubmitReading).not.toHaveBeenCalled();
  expect(renderer!.root.findAllByProps({ children: 'Complete all required fields before submitting.' }).length).toBeGreaterThan(0);
});

test('submits a complete manual payload and renders prediction plus SHAP', async () => {
  mockedSubmitReading.mockResolvedValue({
    record: {
      id: 'reading-1', infant_id: 'infant-1', simulated: false, recorded_at: '2026-08-26T00:00:00Z',
      gender: 'Female', gestational_age_weeks: 39, birth_weight_kg: 3.2, birth_length_cm: 50,
      birth_head_circumference_cm: 32, age_days: 2, weight_kg: 3.2, length_cm: 50,
      head_circumference_cm: 32, temperature_c: 37, heart_rate_bpm: 150, respiratory_rate_bpm: 40,
      oxygen_saturation: 98, feeding_type: 'Formula', feeding_frequency_per_day: 8,
      urine_output_count: 6, stool_count: 2, jaundice_level_mg_dl: 4.2, apgar_score: 8,
      immunizations_done: 1, reflexes_normal: 1, sleeping_hours: 14, vaccination_status: 'recorded', symptoms: [],
      risk_level: 'routine monitoring', risk_reasons: [], risk_basis: 'demonstration thresholds and reported symptoms',
      model: { prediction: 'healthy', probability_at_risk: 0.02, explanation: { top_contributions: [{ feature: 'numeric__temperature_c', shap_value: -0.1 }], warning: 'Research only' } },
      prediction_status: 'generated', explanation_status: 'generated', prediction_error: null, explanation_error: null,
    },
    action: 'continue scheduled monitoring', warning: 'Prototype demonstration alert.',
  });
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ testID: 'manual-entry' }).props.onPress();
  });
  await fillForm(renderer!, label => label.includes('ID') ? 'infant-1' : label.includes('type') || label.includes('status') || label === 'Gender' ? 'recorded' : label.includes('Symptoms') ? '' : '1');
  await ReactTestRenderer.act(async () => {
    await renderer.root.findByProps({ testID: 'submit-reading' }).props.onPress();
  });
  expect(mockedSubmitReading).toHaveBeenCalledWith(expect.objectContaining({ infant_id: 'infant-1', simulated: false }));
  expect(renderer!.root.findAllByProps({ children: 'Explainable result' }).length).toBeGreaterThan(0);
  expect(renderer!.root.findByProps({ testID: 'shap-numeric__temperature_c' })).toBeTruthy();
});

test('renders a backend network error', async () => {
  mockedSubmitReading.mockRejectedValue(new Error('Backend unavailable'));
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ testID: 'manual-entry' }).props.onPress();
  });
  await fillForm(renderer!, label => label.includes('ID') ? 'infant-1' : '1');
  await ReactTestRenderer.act(async () => {
    await renderer.root.findByProps({ testID: 'submit-reading' }).props.onPress();
  });
  expect(renderer!.root.findAllByProps({ children: 'Backend unavailable' }).length).toBeGreaterThan(0);
});

test('loads monitoring history', async () => {
  mockedGetMonitoringHistory.mockResolvedValue({ infant_id: 'infant-1', count: 1, readings: [] });
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ testID: 'manual-entry' }).props.onPress();
  });
  await ReactTestRenderer.act(() => {
    renderer.root.findAllByType(TextInput)[0].props.onChangeText('infant-1');
  });
  await ReactTestRenderer.act(() => {
    renderer.root.findAllByType(Button)[0].props.onPress();
  });
  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ testID: 'history' }).props.onPress();
  });
  expect(mockedGetMonitoringHistory).toHaveBeenCalledWith('infant-1');
});

test('renders global feature importance', async () => {
  mockedGetGlobalExplanation.mockResolvedValue({ rows_explained: 600, global_feature_importance: [{ feature: 'numeric__temperature_c', mean_absolute_shap: 0.2 }], warning: 'Research only' });
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => { renderer = ReactTestRenderer.create(<App />); });
  await ReactTestRenderer.act(async () => { await renderer.root.findByProps({ testID: 'global-xai' }).props.onPress(); });
  expect(mockedGetGlobalExplanation).toHaveBeenCalled();
  expect(renderer!.root.findByProps({ children: 'Global feature importance' })).toBeTruthy();
  expect(renderer!.root.findByProps({ testID: 'global-numeric__temperature_c' })).toBeTruthy();
});

test('runs what-if analysis from the result screen', async () => {
  mockedSubmitReading.mockResolvedValue({ record: { id: 'reading-2', infant_id: 'infant-2', simulated: false, recorded_at: '2026-08-26T00:00:00Z', gender: 'Female', gestational_age_weeks: 39, birth_weight_kg: 3.2, birth_length_cm: 50, birth_head_circumference_cm: 32, age_days: 2, weight_kg: 3.2, length_cm: 50, head_circumference_cm: 32, temperature_c: 37, heart_rate_bpm: 150, respiratory_rate_bpm: 40, oxygen_saturation: 98, feeding_type: 'Formula', feeding_frequency_per_day: 8, urine_output_count: 6, stool_count: 2, jaundice_level_mg_dl: 4.2, apgar_score: 8, immunizations_done: 1, reflexes_normal: 1, sleeping_hours: 14, vaccination_status: 'recorded', symptoms: [], risk_level: 'routine monitoring', risk_reasons: [], risk_basis: 'demo', model: { prediction: 'healthy', probability_at_risk: 0.02, explanation: { top_contributions: [], warning: 'Research only' } }, prediction_status: 'generated', explanation_status: 'generated', prediction_error: null, explanation_error: null }, action: 'continue scheduled monitoring', warning: 'Prototype demonstration alert.' });
  mockedGetWhatIfExplanation.mockResolvedValue({ prediction: 'at risk', probability_at_risk: 0.8, what_if_changes: { temperature_c: 35.5 }, top_contributions: [{ feature: 'numeric__temperature_c', shap_value: 0.4 }], explanation: { top_contributions: [], warning: 'Research only' } });
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => { renderer = ReactTestRenderer.create(<App />); });
  await ReactTestRenderer.act(() => { renderer.root.findByProps({ testID: 'manual-entry' }).props.onPress(); });
  await fillForm(renderer!, label => label.includes('ID') ? 'infant-2' : label.includes('type') || label.includes('status') || label === 'Gender' ? 'recorded' : label.includes('Symptoms') ? '' : '1');
  await ReactTestRenderer.act(async () => { await renderer.root.findByProps({ testID: 'submit-reading' }).props.onPress(); });
  await ReactTestRenderer.act(() => { renderer.root.findByProps({ accessibilityLabel: 'What-if temperature' }).props.onChangeText('35.5'); });
  await ReactTestRenderer.act(async () => { await renderer.root.findByProps({ testID: 'run-what-if' }).props.onPress(); });
  expect(mockedGetWhatIfExplanation).toHaveBeenCalled();
  expect(renderer!.root.findByProps({ testID: 'what-if-prediction' })).toBeTruthy();
});
