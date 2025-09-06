// Test script to create schedules for testing
const https = require('https');
const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http;

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function createTestSchedules() {
  try {
    console.log('🔐 Logging in as teacher...');

    // Login as teacher
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const loginData = {
      email: 'john.doe@school.com',
      password: 'teacher123',
    };

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log('Login response:', loginResponse);

    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.error);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token received');

    // Create test schedules
    const testSchedules = [
      {
        subject: 'Mathematics',
        date: '2025-09-10', // Future date
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

    for (let i = 0; i < testSchedules.length; i++) {
      const schedule = testSchedules[i];

      const scheduleOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/schedules',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const scheduleResponse = await makeRequest(scheduleOptions, schedule);

      if (scheduleResponse.data.success) {
        console.log(`✅ Created ${schedule.subject} schedule`);
      } else {
        console.error(
          `❌ Failed to create ${schedule.subject} schedule:`,
          scheduleResponse.data.error
        );
      }
    }

    console.log('\n🎉 Test schedules creation completed!');

    // Test getting all schedules
    console.log('\n📋 Testing schedule retrieval...');
    const getSchedulesOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/schedules',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const schedulesResponse = await makeRequest(getSchedulesOptions);
    console.log('Schedules response:', schedulesResponse.data);

    if (schedulesResponse.data.success) {
      console.log(
        `✅ Retrieved ${schedulesResponse.data.data.length} schedules`
      );
      schedulesResponse.data.data.forEach((schedule, index) => {
        console.log(
          `  ${index + 1}. ${schedule.subject} - ${schedule.date} ${
            schedule.startTime
          }-${schedule.endTime}`
        );
      });
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

createTestSchedules();
