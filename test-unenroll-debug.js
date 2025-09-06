const BASE_URL = 'http://localhost:3000/api';

async function testUnenrollIssue() {
  console.log('=== Testing Unenroll Issue ===');

  try {
    // 1. Login as teacher
    console.log('1. Logging in as teacher...');
    const teacherLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john.doe@school.com',
        password: 'teacher123',
      }),
    });

    const teacherAuth = await teacherLogin.json();
    if (!teacherAuth.success) throw new Error('Teacher login failed');
    console.log('✓ Teacher logged in');
    const teacherToken = teacherAuth.data.token;

    // 2. Create a schedule
    console.log('2. Creating schedule...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const scheduleResponse = await fetch(`${BASE_URL}/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherAuth.data.token}`,
      },
      body: JSON.stringify({
        subject: 'Test Unenroll Subject',
        date: tomorrow.toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        maxStudents: 5,
        notes: 'Test schedule for unenroll issue',
      }),
    });

    const scheduleData = await scheduleResponse.json();
    if (!scheduleData.success)
      throw new Error('Failed to create schedule: ' + scheduleData.error);
    console.log('✓ Schedule created, ID:', scheduleData.data._id);

    // 3. Login as student
    console.log('3. Logging in as student...');
    const studentLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice.johnson@student.com',
        password: 'student123',
      }),
    });

    const studentAuth = await studentLogin.json();
    if (!studentAuth.success) throw new Error('Student login failed');
    console.log('✓ Student logged in, ID:', studentAuth.data.user._id);

    // 4. Enroll in schedule
    console.log('4. Enrolling in schedule...');
    const enrollResponse = await fetch(
      `${BASE_URL}/schedules/${scheduleData.data._id}/enroll`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentAuth.data.token}`,
        },
      }
    );

    const enrollData = await enrollResponse.json();
    if (!enrollData.success)
      throw new Error('Enrollment failed: ' + enrollData.error);
    console.log('✓ Successfully enrolled');
    console.log(
      '  Enrolled students:',
      enrollData.data.enrolledStudents.length
    );
    console.log(
      '  Student IDs in schedule:',
      enrollData.data.enrolledStudents.map((s) =>
        typeof s === 'string' ? s : s._id
      )
    );
    console.log('  Current user ID:', studentAuth.data.user._id);

    // 5. Try to unenroll
    console.log('5. Attempting to unenroll...');
    const unenrollResponse = await fetch(
      `${BASE_URL}/schedules/${scheduleData.data._id}/unenroll`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentAuth.data.token}`,
        },
      }
    );

    const unenrollData = await unenrollResponse.json();
    console.log('Unenroll response status:', unenrollResponse.status);
    console.log('Unenroll response:', unenrollData);

    if (!unenrollData.success) {
      console.log('❌ Unenroll failed:', unenrollData.error);

      // Debug: Let's check the schedule state
      console.log('\n=== DEBUG INFO ===');
      const debugSchedule = await fetch(
        `${BASE_URL}/schedules/${scheduleData.data._id}`,
        {
          headers: { Authorization: `Bearer ${studentAuth.data.token}` },
        }
      );
      const debugData = await debugSchedule.json();

      if (debugData.success) {
        console.log('Current schedule state:');
        console.log(
          '  Enrolled students count:',
          debugData.data.enrolledStudents.length
        );
        console.log(
          '  Enrolled student IDs:',
          debugData.data.enrolledStudents.map((s) => {
            if (typeof s === 'string') return s;
            return s._id;
          })
        );
        console.log(
          "  Student ID we're looking for:",
          studentAuth.data.user._id
        );

        // Check if the IDs match
        const isEnrolled = debugData.data.enrolledStudents.some((s) => {
          const studentId = typeof s === 'string' ? s : s._id;
          return studentId === studentAuth.data.user._id;
        });
        console.log('  Is student actually enrolled?', isEnrolled);
      }
    } else {
      console.log('✓ Successfully unenrolled');
      console.log(
        '  Remaining enrolled students:',
        unenrollData.data.enrolledStudents.length
      );
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testUnenrollIssue();
