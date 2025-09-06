const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing Teacher Scheduler API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check:', health.data);

    // Test 2: Login as Admin
    console.log('\n2. Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@admin.com',
      password: 'admin',
    });
    const adminToken = loginResponse.data.data.token;
    console.log('✅ Admin login successful');

    // Test 3: Get All Users (Admin only)
    console.log('\n3. Testing get all users...');
    const usersResponse = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✅ Users retrieved:', usersResponse.data.data.length, 'users');

    // Test 4: Get Teachers
    console.log('\n4. Testing get teachers...');
    const teachersResponse = await axios.get(`${API_BASE}/users/teachers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(
      '✅ Teachers retrieved:',
      teachersResponse.data.data.length,
      'teachers'
    );

    // Test 5: Get Students
    console.log('\n5. Testing get students...');
    const studentsResponse = await axios.get(`${API_BASE}/users/students`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(
      '✅ Students retrieved:',
      studentsResponse.data.data.length,
      'students'
    );

    // Test 6: Login as Teacher
    console.log('\n6. Testing teacher login...');
    const teacherLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'john.doe@school.com',
      password: 'teacher123',
    });
    const teacherToken = teacherLoginResponse.data.data.token;
    console.log('✅ Teacher login successful');

    // Test 7: Get Schedules
    console.log('\n7. Testing get schedules...');
    const schedulesResponse = await axios.get(`${API_BASE}/schedules`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    console.log(
      '✅ Schedules retrieved:',
      schedulesResponse.data.data.length,
      'schedules'
    );

    // Test 8: Create Schedule
    console.log('\n8. Testing create schedule...');
    const newSchedule = {
      subject: 'Test Mathematics',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      startTime: '09:00',
      endTime: '10:00',
      notes: 'Test schedule for API testing',
      summary: 'API Test Schedule',
      maxStudents: 20,
    };
    const createScheduleResponse = await axios.post(
      `${API_BASE}/schedules`,
      newSchedule,
      {
        headers: { Authorization: `Bearer ${teacherToken}` },
      }
    );
    const scheduleId = createScheduleResponse.data.data._id;
    console.log('✅ Schedule created with ID:', scheduleId);

    // Test 9: Login as Student
    console.log('\n9. Testing student login...');
    const studentLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'alice.johnson@student.com',
      password: 'student123',
    });
    const studentToken = studentLoginResponse.data.data.token;
    console.log('✅ Student login successful');

    // Test 10: Enroll in Schedule
    console.log('\n10. Testing schedule enrollment...');
    const enrollResponse = await axios.post(
      `${API_BASE}/schedules/${scheduleId}/enroll`,
      {},
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );
    console.log('✅ Student enrolled in schedule');

    // Test 11: Get User Profile
    console.log('\n11. Testing get user profile...');
    const profileResponse = await axios.get(`${API_BASE}/users/profile`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log(
      '✅ User profile retrieved:',
      profileResponse.data.data.firstName,
      profileResponse.data.data.lastName
    );

    console.log('\n🎉 All API tests passed successfully!');
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAPI();
