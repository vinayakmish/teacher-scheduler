// Simple test to see current API status
const baseUrl = 'http://localhost:3000';

async function testAPI() {
  try {
    // Test 1: Login as teacher
    console.log('=== Testing Teacher Login ===');
    const teacherLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john.doe@school.com',
        password: 'teacher123',
      }),
    });
    const teacherData = await teacherLogin.json();
    console.log('Teacher login:', teacherData.success ? 'SUCCESS' : 'FAILED');

    if (!teacherData.success) return;
    const teacherToken = teacherData.token;

    // Test 2: Create a schedule as teacher
    console.log('\n=== Creating Schedule as Teacher ===');
    const createSchedule = await fetch(`${baseUrl}/api/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`,
      },
      body: JSON.stringify({
        subject: 'Mathematics - Algebra Basics',
        date: '2025-09-10',
        startTime: '10:00',
        endTime: '11:30',
        maxStudents: 25,
        summary: 'Introduction to algebraic concepts and problem solving',
        notes: 'Please bring calculator and notebook',
      }),
    });
    const scheduleData = await createSchedule.json();
    console.log(
      'Schedule creation:',
      scheduleData.success ? 'SUCCESS' : 'FAILED'
    );
    if (scheduleData.success) {
      console.log('Schedule ID:', scheduleData.data._id);
    }

    // Test 3: Login as student
    console.log('\n=== Testing Student Login ===');
    const studentLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice.johnson@student.com',
        password: 'student123',
      }),
    });
    const studentData = await studentLogin.json();
    console.log('Student login:', studentData.success ? 'SUCCESS' : 'FAILED');

    if (!studentData.success) return;
    const studentToken = studentData.token;

    // Test 4: Get schedules as student
    console.log('\n=== Getting Schedules as Student ===');
    const getSchedules = await fetch(`${baseUrl}/api/schedules`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const schedulesData = await getSchedules.json();
    console.log('Get schedules:', schedulesData.success ? 'SUCCESS' : 'FAILED');
    console.log('Number of schedules:', schedulesData.data?.length || 0);

    if (schedulesData.success && schedulesData.data?.length > 0) {
      const schedule = schedulesData.data[0];
      console.log('First schedule:', schedule.subject);

      // Test 5: Enroll in schedule
      console.log('\n=== Testing Enrollment ===');
      const enroll = await fetch(
        `${baseUrl}/api/schedules/${schedule._id}/enroll`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${studentToken}` },
        }
      );
      const enrollData = await enroll.json();
      console.log('Enrollment:', enrollData.success ? 'SUCCESS' : 'FAILED');
      if (!enrollData.success) {
        console.log('Enrollment error:', enrollData.error);
      }
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAPI();
