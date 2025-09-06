async function testBackendConnection() {
  try {
    console.log('Testing backend connection...');

    // Test basic connectivity
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john.doe@school.com',
        password: 'teacher123',
      }),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (data.success) {
      console.log('✅ Backend connection successful!');

      // Test schedule creation
      const token = data.data.token;
      const scheduleResponse = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: 'Test Mathematics',
          date: '2025-09-10',
          startTime: '09:00',
          endTime: '10:30',
          notes: 'Test schedule for debugging',
          summary: 'Testing schedule creation',
          maxStudents: 25,
        }),
      });

      const scheduleData = await scheduleResponse.json();
      console.log('Schedule creation response:', scheduleData);

      if (scheduleData.success) {
        console.log('✅ Schedule creation successful!');

        // Now fetch all schedules
        const allSchedulesResponse = await fetch('/api/schedules', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allSchedulesData = await allSchedulesResponse.json();
        console.log('All schedules:', allSchedulesData);

        if (allSchedulesData.success) {
          console.log(`✅ Found ${allSchedulesData.data.length} schedules`);
          return allSchedulesData.data;
        }
      }
    }
  } catch (error) {
    console.error('❌ Backend test failed:', error);
  }
}

// Run the test when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testBackendConnection);
} else {
  testBackendConnection();
}
