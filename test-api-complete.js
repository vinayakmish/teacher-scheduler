const fetch = globalThis.fetch || require('node-fetch');

async function testAPI() {
  const BASE_URL = 'http://localhost:3000/api';

  try {
    console.log('🔐 Testing login...');

    // Login as teacher
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
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
    console.log('Login response status:', loginResponse.status);
    console.log('Login data:', loginData);

    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.error);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login successful');

    // Create test schedules
    const testSchedules = [
      {
        subject: 'Mathematics',
        date: '2025-09-10',
        startTime: '09:00',
        endTime: '10:30',
        notes: 'Introduction to Algebra',
        summary: 'Basic algebraic concepts and equations',
        maxStudents: 25,
      },
      {
        subject: 'Science',
        date: '2025-09-11',
        startTime: '11:00',
        endTime: '12:30',
        notes: 'Physics fundamentals',
        summary: 'Laws of motion and energy',
        maxStudents: 20,
      },
      {
        subject: 'English',
        date: '2025-09-12',
        startTime: '14:00',
        endTime: '15:30',
        notes: 'Literature analysis',
        summary: 'Reading comprehension and essay writing',
        maxStudents: 30,
      },
    ];

    console.log('\n📚 Creating test schedules...');

    for (const schedule of testSchedules) {
      const scheduleResponse = await fetch(`${BASE_URL}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(schedule),
      });

      const scheduleData = await scheduleResponse.json();

      if (scheduleData.success) {
        console.log(
          `✅ Created ${schedule.subject} schedule (ID: ${scheduleData.data._id})`
        );
      } else {
        console.error(
          `❌ Failed to create ${schedule.subject} schedule:`,
          scheduleData.error
        );
      }
    }

    // Get all schedules
    console.log('\n📋 Fetching all schedules...');
    const schedulesResponse = await fetch(`${BASE_URL}/schedules`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const schedulesData = await schedulesResponse.json();

    if (schedulesData.success) {
      console.log(`✅ Retrieved ${schedulesData.data.length} schedules`);
      schedulesData.data.forEach((schedule, index) => {
        console.log(
          `  ${index + 1}. ${schedule.subject} - ${schedule.date} ${
            schedule.startTime
          }-${schedule.endTime} (${schedule.enrolledStudents.length}/${
            schedule.maxStudents
          } enrolled)`
        );
      });
    } else {
      console.error('❌ Failed to fetch schedules:', schedulesData.error);
    }

    // Test student enrollment
    console.log('\n👨‍🎓 Testing student enrollment...');

    // Login as student
    const studentLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'alice.johnson@student.com',
        password: 'student123',
      }),
    });

    const studentLoginData = await studentLoginResponse.json();

    if (!studentLoginData.success) {
      console.error('❌ Student login failed:', studentLoginData.error);
      return;
    }

    const studentToken = studentLoginData.data.token;
    console.log('✅ Student login successful');

    // Get schedules as student
    const studentSchedulesResponse = await fetch(`${BASE_URL}/schedules`, {
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    const studentSchedulesData = await studentSchedulesResponse.json();

    if (studentSchedulesData.success && studentSchedulesData.data.length > 0) {
      const firstSchedule = studentSchedulesData.data[0];
      console.log(`📝 Attempting to enroll in: ${firstSchedule.subject}`);

      // Enroll in first schedule
      const enrollResponse = await fetch(
        `${BASE_URL}/schedules/${firstSchedule._id}/enroll`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${studentToken}`,
          },
        }
      );

      const enrollData = await enrollResponse.json();

      if (enrollData.success) {
        console.log('✅ Successfully enrolled in schedule');
        console.log(
          `   Enrolled students: ${enrollData.data.enrolledStudents.length}/${enrollData.data.maxStudents}`
        );
      } else {
        console.error('❌ Failed to enroll:', enrollData.error);
      }
    }

    console.log('\n🎉 API test completed!');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Check if we're in Node.js environment and don't have fetch
if (typeof globalThis.fetch === 'undefined') {
  // Try to use dynamic import for node-fetch
  (async () => {
    try {
      const { default: fetch } = await import('node-fetch');
      globalThis.fetch = fetch;
      await testAPI();
    } catch (error) {
      console.log('node-fetch not available, trying with http module...');
      console.log('Please install node-fetch: npm install node-fetch');
      process.exit(1);
    }
  })();
} else {
  testAPI();
}
