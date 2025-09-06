// Simple test to verify the complete student enrollment workflow
const fetch = require('node-fetch');

console.log('Testing Student Enrollment Workflow...\n');

async function testWorkflow() {
  const BASE_URL = 'http://localhost:3000';

  try {
    // Step 1: Login as teacher and create a schedule
    console.log('1. Logging in as teacher...');
    const teacherLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john.doe@school.com',
        password: 'teacher123',
      }),
    });

    const teacherData = await teacherLogin.json();
    if (!teacherData.success) {
      console.error('Teacher login failed:', teacherData.error);
      return;
    }
    console.log('✓ Teacher logged in successfully');

    // Step 2: Create a schedule as teacher
    console.log('\n2. Creating schedule as teacher...');
    const createResponse = await fetch(`${BASE_URL}/api/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherData.data.token}`,
      },
      body: JSON.stringify({
        subject: 'Test Mathematics Class',
        date: '2025-12-15',
        startTime: '10:00',
        endTime: '11:30',
        maxStudents: 20,
        summary: 'Basic mathematics for testing enrollment',
        notes: 'Bring calculator',
      }),
    });

    const scheduleData = await createResponse.json();
    if (!scheduleData.success) {
      console.error('Schedule creation failed:', scheduleData.error);
      return;
    }
    console.log('✓ Schedule created successfully, ID:', scheduleData.data._id);

    // Step 3: Login as student
    console.log('\n3. Logging in as student...');
    const studentLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice.johnson@student.com',
        password: 'student123',
      }),
    });

    const studentData = await studentLogin.json();
    if (!studentData.success) {
      console.error('Student login failed:', studentData.error);
      return;
    }
    console.log('✓ Student logged in successfully');
    console.log('  Student ID:', studentData.data.user._id);

    // Step 4: Get schedules as student
    console.log('\n4. Fetching schedules as student...');
    const getSchedules = await fetch(`${BASE_URL}/api/schedules`, {
      headers: {
        Authorization: `Bearer ${studentData.data.token}`,
      },
    });

    const schedulesData = await getSchedules.json();
    if (!schedulesData.success) {
      console.error('Failed to get schedules:', schedulesData.error);
      return;
    }
    console.log('✓ Schedules fetched successfully');
    console.log('  Number of schedules:', schedulesData.data.length);

    if (schedulesData.data.length > 0) {
      const schedule = schedulesData.data[0];
      console.log('  First schedule:', schedule.subject);
      console.log('  Enrolled students:', schedule.enrolledStudents.length);

      // Step 5: Enroll in the schedule
      console.log('\n5. Enrolling student in schedule...');
      const enrollResponse = await fetch(
        `${BASE_URL}/api/schedules/${schedule._id}/enroll`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${studentData.data.token}`,
          },
        }
      );

      const enrollData = await enrollResponse.json();
      if (enrollData.success) {
        console.log('✓ Successfully enrolled in schedule');
        console.log(
          '  Enrolled students now:',
          enrollData.data.enrolledStudents.length
        );
      } else {
        console.error('✗ Enrollment failed:', enrollData.error);
      }
    } else {
      console.log('No schedules available for enrollment');
    }

    console.log('\n=== Test Complete ===');
  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
}

testWorkflow();
