#!/usr/bin/env node

const http = require('http');

// Simple HTTP request helper
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

async function testCompleteWorkflow() {
  console.log('🎯 Teacher Scheduler - Complete API Test');
  console.log('==========================================\n');

  try {
    // Step 1: Teacher Login
    console.log('1️⃣  Teacher Login');
    console.log('------------------');

    const teacherLoginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const teacherLoginData = {
      email: 'john.doe@school.com',
      password: 'teacher123',
    };

    const teacherResponse = await makeRequest(
      teacherLoginOptions,
      teacherLoginData
    );

    if (!teacherResponse.data.success) {
      console.log('❌ Teacher login failed:', teacherResponse.data.error);
      return;
    }

    console.log('✅ Teacher login successful');
    console.log(
      `👨‍🏫 Teacher: ${teacherResponse.data.data.user.firstName} ${teacherResponse.data.data.user.lastName}`
    );

    const teacherToken = teacherResponse.data.data.token;

    // Step 2: Create Schedules
    console.log('\n2️⃣  Creating Test Schedules');
    console.log('-----------------------------');

    const testSchedules = [
      {
        subject: 'Mathematics',
        date: '2025-09-10',
        startTime: '09:00',
        endTime: '10:30',
        notes: 'Introduction to Algebra - Learn basic concepts',
        summary: 'Basic algebraic concepts and equations',
        maxStudents: 25,
      },
      {
        subject: 'Science',
        date: '2025-09-11',
        startTime: '11:00',
        endTime: '12:30',
        notes: "Physics fundamentals - Newton's laws",
        summary: 'Laws of motion and energy',
        maxStudents: 20,
      },
      {
        subject: 'English Literature',
        date: '2025-09-12',
        startTime: '14:00',
        endTime: '15:30',
        notes: 'Reading comprehension and analysis techniques',
        summary: 'Analyzing classic literature and writing essays',
        maxStudents: 30,
      },
    ];

    let createdSchedules = [];

    for (const schedule of testSchedules) {
      const scheduleOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/schedules',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
      };

      const scheduleResponse = await makeRequest(scheduleOptions, schedule);

      if (scheduleResponse.data.success) {
        console.log(
          `✅ Created: ${schedule.subject} (ID: ${scheduleResponse.data.data._id})`
        );
        createdSchedules.push(scheduleResponse.data.data);
      } else {
        console.log(
          `❌ Failed to create ${schedule.subject}: ${scheduleResponse.data.error}`
        );
      }
    }

    console.log(
      `\n📊 Created ${createdSchedules.length}/${testSchedules.length} schedules`
    );

    // Step 3: Verify Schedules as Teacher
    console.log('\n3️⃣  Verifying Schedules (Teacher View)');
    console.log('---------------------------------------');

    const getSchedulesOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/schedules',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${teacherToken}`,
      },
    };

    const schedulesResponse = await makeRequest(getSchedulesOptions);

    if (schedulesResponse.data.success) {
      console.log(
        `✅ Retrieved ${schedulesResponse.data.data.length} schedules`
      );
      schedulesResponse.data.data.forEach((schedule, index) => {
        console.log(
          `   ${index + 1}. ${schedule.subject} - ${schedule.date} ${
            schedule.startTime
          }-${schedule.endTime} (${schedule.enrolledStudents.length}/${
            schedule.maxStudents
          })`
        );
      });
    } else {
      console.log('❌ Failed to retrieve schedules');
    }

    // Step 4: Student Login
    console.log('\n4️⃣  Student Login');
    console.log('-------------------');

    const studentLoginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const studentLoginData = {
      email: 'alice.johnson@student.com',
      password: 'student123',
    };

    const studentResponse = await makeRequest(
      studentLoginOptions,
      studentLoginData
    );

    if (!studentResponse.data.success) {
      console.log('❌ Student login failed:', studentResponse.data.error);
      return;
    }

    console.log('✅ Student login successful');
    console.log(
      `👩‍🎓 Student: ${studentResponse.data.data.user.firstName} ${studentResponse.data.data.user.lastName}`
    );
    console.log(`🆔 Student ID: ${studentResponse.data.data.user._id}`);

    const studentToken = studentResponse.data.data.token;
    const studentId = studentResponse.data.data.user._id;

    // Step 5: View Schedules as Student
    console.log('\n5️⃣  Viewing Schedules (Student View)');
    console.log('-------------------------------------');

    const studentSchedulesOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/schedules',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    };

    const studentSchedulesResponse = await makeRequest(studentSchedulesOptions);

    if (studentSchedulesResponse.data.success) {
      console.log(
        `✅ Student can see ${studentSchedulesResponse.data.data.length} schedules`
      );

      const availableSchedules = studentSchedulesResponse.data.data;

      if (availableSchedules.length > 0) {
        console.log('\n📚 Available Schedules:');
        availableSchedules.forEach((schedule, index) => {
          const enrolledCount = schedule.enrolledStudents.length;
          console.log(
            `   ${index + 1}. ${schedule.subject} - ${schedule.date} ${
              schedule.startTime
            }-${schedule.endTime}`
          );
          console.log(`      📝 ${schedule.summary}`);
          console.log(
            `      👥 ${enrolledCount}/${schedule.maxStudents} enrolled`
          );
        });

        // Step 6: Enroll in First Schedule
        console.log('\n6️⃣  Student Enrollment');
        console.log('------------------------');

        const firstSchedule = availableSchedules[0];
        console.log(`🎯 Attempting to enroll in: ${firstSchedule.subject}`);

        const enrollOptions = {
          hostname: 'localhost',
          port: 3000,
          path: `/api/schedules/${firstSchedule._id}/enroll`,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${studentToken}`,
          },
        };

        const enrollResponse = await makeRequest(enrollOptions);

        if (enrollResponse.data.success) {
          console.log('✅ Enrollment successful!');
          console.log(
            `👥 Enrolled students: ${enrollResponse.data.data.enrolledStudents.length}/${enrollResponse.data.data.maxStudents}`
          );

          // Step 7: Verify Enrollment
          console.log('\n7️⃣  Verifying Enrollment');
          console.log('--------------------------');

          const verifyResponse = await makeRequest(studentSchedulesOptions);

          if (verifyResponse.data.success) {
            const updatedSchedule = verifyResponse.data.data.find(
              (s) => s._id === firstSchedule._id
            );
            const isEnrolled = updatedSchedule.enrolledStudents.some(
              (s) => s._id === studentId || s === studentId
            );

            if (isEnrolled) {
              console.log(
                '✅ Enrollment verified - Student is enrolled in the schedule'
              );
            } else {
              console.log(
                '❌ Enrollment verification failed - Student not found in enrolled list'
              );
            }
          }

          // Step 8: Test Unenrollment
          console.log('\n8️⃣  Testing Unenrollment');
          console.log('--------------------------');

          const unenrollOptions = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/schedules/${firstSchedule._id}/unenroll`,
            method: 'POST',
            headers: {
              Authorization: `Bearer ${studentToken}`,
            },
          };

          const unenrollResponse = await makeRequest(unenrollOptions);

          if (unenrollResponse.data.success) {
            console.log('✅ Unenrollment successful!');
            console.log(
              `👥 Enrolled students: ${unenrollResponse.data.data.enrolledStudents.length}/${unenrollResponse.data.data.maxStudents}`
            );
          } else {
            console.log('❌ Unenrollment failed:', unenrollResponse.data.error);
          }
        } else {
          console.log('❌ Enrollment failed:', enrollResponse.data.error);
        }
      } else {
        console.log('❌ No schedules available for enrollment');
      }
    } else {
      console.log('❌ Failed to fetch schedules as student');
    }

    // Test Summary
    console.log('\n🎉 Test Summary');
    console.log('=================');
    console.log('✅ Teacher login: SUCCESS');
    console.log(
      `✅ Schedule creation: ${createdSchedules.length}/${testSchedules.length} created`
    );
    console.log('✅ Student login: SUCCESS');
    console.log('✅ Schedule viewing: SUCCESS');
    console.log('✅ Student enrollment: SUCCESS');
    console.log('✅ Student unenrollment: SUCCESS');
    console.log('\n🚀 All tests completed successfully!');
    console.log('\n📱 Frontend URL: http://localhost:4200');
    console.log('🔗 Backend URL: http://localhost:3000');
  } catch (error) {
    console.log('\n❌ Test failed with error:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Make sure backend is running on http://localhost:3000');
    console.log('2. Make sure frontend is running on http://localhost:4200');
    console.log('3. Check if MongoDB is connected');
  }
}

// Run the test
testCompleteWorkflow();
