const BASE_URL = 'http://localhost:3000/api';

async function testCompleteEnrollmentFlow() {
  console.log('=== Testing Complete Enrollment/Unenrollment Flow ===');

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
        subject: 'Complete Flow Test',
        date: tomorrow.toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:00',
        maxStudents: 5,
        notes: 'Testing complete enrollment flow',
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
    console.log('✓ Student logged in');

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

    // 5. Verify enrollment by fetching schedule
    console.log('5. Verifying enrollment...');
    const verifyResponse = await fetch(
      `${BASE_URL}/schedules/${scheduleData.data._id}`,
      {
        headers: { Authorization: `Bearer ${studentAuth.data.token}` },
      }
    );
    const verifyData = await verifyResponse.json();

    if (!verifyData.success) throw new Error('Failed to fetch schedule');
    const isEnrolled = verifyData.data.enrolledStudents.some((s) => {
      const studentId = typeof s === 'string' ? s : s._id;
      return studentId === studentAuth.data.user._id;
    });

    if (!isEnrolled) throw new Error('Student not found in enrolled list');
    console.log('✓ Enrollment verified');

    // 6. Unenroll from schedule
    console.log('6. Unenrolling from schedule...');
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
    if (!unenrollData.success)
      throw new Error('Unenrollment failed: ' + unenrollData.error);
    console.log('✓ Successfully unenrolled');
    console.log(
      '  Remaining enrolled students:',
      unenrollData.data.enrolledStudents.length
    );

    // 7. Verify unenrollment
    console.log('7. Verifying unenrollment...');
    const verify2Response = await fetch(
      `${BASE_URL}/schedules/${scheduleData.data._id}`,
      {
        headers: { Authorization: `Bearer ${studentAuth.data.token}` },
      }
    );
    const verify2Data = await verify2Response.json();

    if (!verify2Data.success) throw new Error('Failed to fetch schedule');
    const stillEnrolled = verify2Data.data.enrolledStudents.some((s) => {
      const studentId = typeof s === 'string' ? s : s._id;
      return studentId === studentAuth.data.user._id;
    });

    if (stillEnrolled)
      throw new Error(
        'Student still found in enrolled list after unenrollment'
      );
    console.log('✓ Unenrollment verified');

    // 8. Test re-enrollment
    console.log('8. Testing re-enrollment...');
    const reEnrollResponse = await fetch(
      `${BASE_URL}/schedules/${scheduleData.data._id}/enroll`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentAuth.data.token}`,
        },
      }
    );

    const reEnrollData = await reEnrollResponse.json();
    if (!reEnrollData.success)
      throw new Error('Re-enrollment failed: ' + reEnrollData.error);
    console.log('✓ Successfully re-enrolled');
    console.log(
      '  Enrolled students after re-enrollment:',
      reEnrollData.data.enrolledStudents.length
    );

    console.log(
      '\n🎉 ALL TESTS PASSED - Complete enrollment/unenrollment flow working!'
    );
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompleteEnrollmentFlow();
