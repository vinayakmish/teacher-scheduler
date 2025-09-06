const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
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

async function runTest() {
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
    console.log('Login response status:', loginResponse.status);
    console.log('Login data:', loginResponse.data);

    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.error);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token received');

    // Create a test schedule
    console.log('\n📚 Creating test schedule...');

    const scheduleData = {
      subject: 'Mathematics',
      date: '2025-09-10',
      startTime: '09:00',
      endTime: '10:30',
      notes: 'Introduction to Algebra - Test Schedule',
      summary: 'Basic algebraic concepts and equations',
      maxStudents: 25,
    };

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

    const scheduleResponse = await makeRequest(scheduleOptions, scheduleData);
    console.log('Schedule creation status:', scheduleResponse.status);
    console.log('Schedule creation data:', scheduleResponse.data);

    if (scheduleResponse.data.success) {
      console.log('✅ Schedule created successfully!');
      console.log('Schedule ID:', scheduleResponse.data.data._id);
    } else {
      console.error(
        '❌ Schedule creation failed:',
        scheduleResponse.data.error
      );
    }

    // Get all schedules
    console.log('\n📋 Fetching all schedules...');
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
    console.log('Schedules fetch status:', schedulesResponse.status);
    console.log(
      'Schedules count:',
      schedulesResponse.data.success
        ? schedulesResponse.data.data.length
        : 'Failed'
    );

    if (schedulesResponse.data.success) {
      console.log('✅ Schedules retrieved successfully');
      schedulesResponse.data.data.forEach((schedule, index) => {
        console.log(
          `  ${index + 1}. ${schedule.subject} - ${schedule.date} ${
            schedule.startTime
          }-${schedule.endTime}`
        );
      });
    }

    console.log('\n🎉 Test completed!');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

runTest();
