import {createReminder, getCareGuidance} from '../src/services/api';

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
});

test('loads care guidance for an infant', async () => {
  fetchMock.mockResolvedValue({ok: true, json: async () => ({infant_id: 'infant 1', guidance: []})});

  await getCareGuidance('infant 1');

  expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:8000/care/infant%201', undefined);
});

test('creates a validated care reminder through the existing endpoint', async () => {
  const reminder = {infant_id: 'infant-1', title: 'Feeding review', due_date: '2026-10-01', category: 'care'};
  fetchMock.mockResolvedValue({ok: true, json: async () => ({...reminder, id: 'reminder-1'})});

  await createReminder(reminder);

  expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:8000/care/reminders', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(reminder),
  });
});

test('reports care API failures to the caller', async () => {
  fetchMock.mockResolvedValue({ok: false, status: 422});

  await expect(getCareGuidance('infant-1')).rejects.toThrow('Backend request failed (422).');
});