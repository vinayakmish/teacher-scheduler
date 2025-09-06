// Test script to verify schedule creation functionality
const fetch = require('node-fetch');

async function testScheduleCreation() {
  try {
    // First, login as a teacher to get the token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john.doe@school.com',
        password: 'teacher123',
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      console.error('Login failed:', loginData.error);
      return;
    }

    const token = loginData.token;

    // Now try to create a schedule
    const scheduleResponse = await fetch(
      'http://localhost:3000/api/schedules',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'Test Math Class',
          description: 'Introduction to Algebra',
          subject: 'Mathematics',
          date: '2024-12-22',
          startTime: '09:00',
          endTime: '10:30',
          location: 'Room 101',
          capacity: 30,
        }),
      }
    );

    const scheduleData = await scheduleResponse.json();
    console.log('Schedule creation response:', scheduleData);

    if (scheduleData.success) {
      console.log('✅ Schedule created successfully!');
      console.log('Schedule ID:', scheduleData.schedule._id);
    } else {
      console.error('❌ Schedule creation failed:', scheduleData.error);
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testScheduleCreation();
