// Automated test: verifies active schedules visibility and enrollment flow
// Polyfill fetch if needed
if (typeof fetch === 'undefined') {
  global.fetch = (...args) =>
    import('node-fetch').then(({ default: f }) => f(...args));
}
// Usage: node test-active-schedules-enrollment.js (ensure servers running)

const BASE_URL = 'http://localhost:3000'; // backend explicit port

async function json(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function log(step, msg) {
  console.log(`[${step}] ${msg}`);
}

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await json(res);
  if (!data.success)
    throw new Error(`Login failed for ${email}: ${data.error}`);
  return data.data;
}

async function createSchedule(token, overrides = {}) {
  const futureDate = new Date(Date.now() + 86400000); // +1 day
  const payload = {
    subject: 'Automated Test Subject',
    date: futureDate.toISOString().substring(0, 10),
    startTime: '09:00',
    endTime: '10:00',
    maxStudents: 5,
    summary: 'Test summary',
    notes: 'Test notes',
    ...overrides,
  };
  const res = await fetch(`${BASE_URL}/api/schedules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await json(res);
  if (!data.success) throw new Error(`Create schedule failed: ${data.error}`);
  return data.data;
}

async function getSchedules(token) {
  const res = await fetch(`${BASE_URL}/api/schedules`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await json(res);
  if (!data.success) throw new Error(`Fetch schedules failed: ${data.error}`);
  return data.data;
}

async function enroll(token, id) {
  const res = await fetch(`${BASE_URL}/api/schedules/${id}/enroll`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await json(res);
  if (!data.success) throw new Error(`Enroll failed: ${data.error}`);
  return data.data;
}

(async () => {
  try {
    log('INIT', 'Starting Active Schedules + Enrollment test');

    const teacher = await login('john.doe@school.com', 'teacher123');
    log('AUTH', 'Teacher logged in');

    const schedule = await createSchedule(teacher.token);
    log('CREATE', `Schedule created id=${schedule._id} date=${schedule.date}`);

    const student = await login('alice.johnson@student.com', 'student123');
    log('AUTH', 'Student logged in');

    const schedules = await getSchedules(student.token);
    const found = schedules.find((s) => s._id === schedule._id);
    if (!found)
      throw new Error('Created active schedule not visible to student');
    log('VISIBILITY', 'Student can see the active schedule');

    const beforeCount = found.enrolledStudents.length;
    const enrolled = await enroll(student.token, schedule._id);
    const afterCount = enrolled.enrolledStudents.length;
    if (afterCount !== beforeCount + 1)
      throw new Error('Enrollment count did not increment');
    log('ENROLL', 'Student enrollment succeeded');

    console.log(
      '\nSUCCESS: Active schedule visibility and enrollment flow passed.'
    );
  } catch (err) {
    console.error('\nFAIL:', err.message);
    process.exit(1);
  }
})();
