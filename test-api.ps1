# PowerShell script to test the API and create schedules

$baseUrl = "http://localhost:3000/api"

Write-Host "Testing Teacher Scheduler API" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Function to make HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json
        }
        
        $response = Invoke-RestMethod @params
        return $response
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Step 1: Login as teacher
Write-Host "`n1. Logging in as teacher..." -ForegroundColor Yellow
$teacherLogin = @{
    email = "john.doe@school.com"
    password = "teacher123"
}

$teacherResponse = Invoke-ApiRequest -Method "POST" -Url "$baseUrl/auth/login" -Body $teacherLogin

if ($teacherResponse -and $teacherResponse.success) {
    Write-Host "✓ Teacher login successful" -ForegroundColor Green
    $teacherToken = $teacherResponse.data.token
} else {
    Write-Host "✗ Teacher login failed" -ForegroundColor Red
    exit
}

# Step 2: Create test schedules
Write-Host "`n2. Creating test schedules..." -ForegroundColor Yellow

$testSchedules = @(
    @{
        subject = "Mathematics"
        date = "2025-09-10"
        startTime = "09:00"
        endTime = "10:30"
        notes = "Introduction to Algebra"
        summary = "Basic algebraic concepts and equations"
        maxStudents = 25
    },
    @{
        subject = "Science"
        date = "2025-09-11"
        startTime = "11:00"
        endTime = "12:30"
        notes = "Physics fundamentals"
        summary = "Laws of motion and energy"
        maxStudents = 20
    },
    @{
        subject = "English"
        date = "2025-09-12"
        startTime = "14:00"
        endTime = "15:30"
        notes = "Literature analysis"
        summary = "Reading comprehension and essay writing"
        maxStudents = 30
    }
)

$scheduleHeaders = @{
    Authorization = "Bearer $teacherToken"
}

foreach ($schedule in $testSchedules) {
    $response = Invoke-ApiRequest -Method "POST" -Url "$baseUrl/schedules" -Headers $scheduleHeaders -Body $schedule
    
    if ($response -and $response.success) {
        Write-Host "✓ Created $($schedule.subject) schedule (ID: $($response.data._id))" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create $($schedule.subject) schedule" -ForegroundColor Red
    }
}

# Step 3: Get all schedules
Write-Host "`n3. Fetching all schedules..." -ForegroundColor Yellow
$schedulesResponse = Invoke-ApiRequest -Method "GET" -Url "$baseUrl/schedules" -Headers $scheduleHeaders

if ($schedulesResponse -and $schedulesResponse.success) {
    Write-Host "✓ Retrieved $($schedulesResponse.data.Count) schedules" -ForegroundColor Green
    
    foreach ($schedule in $schedulesResponse.data) {
        Write-Host "  - $($schedule.subject) - $($schedule.date) $($schedule.startTime)-$($schedule.endTime) ($($schedule.enrolledStudents.Count)/$($schedule.maxStudents) enrolled)" -ForegroundColor Cyan
    }
} else {
    Write-Host "✗ Failed to fetch schedules" -ForegroundColor Red
}

# Step 4: Login as student
Write-Host "`n4. Logging in as student..." -ForegroundColor Yellow
$studentLogin = @{
    email = "alice.johnson@student.com"
    password = "student123"
}

$studentResponse = Invoke-ApiRequest -Method "POST" -Url "$baseUrl/auth/login" -Body $studentLogin

if ($studentResponse -and $studentResponse.success) {
    Write-Host "✓ Student login successful" -ForegroundColor Green
    $studentToken = $studentResponse.data.token
    Write-Host "  Student ID: $($studentResponse.data.user._id)" -ForegroundColor Cyan
} else {
    Write-Host "✗ Student login failed" -ForegroundColor Red
    exit
}

# Step 5: Get schedules as student
Write-Host "`n5. Fetching schedules as student..." -ForegroundColor Yellow
$studentHeaders = @{
    Authorization = "Bearer $studentToken"
}

$studentSchedulesResponse = Invoke-ApiRequest -Method "GET" -Url "$baseUrl/schedules" -Headers $studentHeaders

if ($studentSchedulesResponse -and $studentSchedulesResponse.success) {
    Write-Host "✓ Student can see $($studentSchedulesResponse.data.Count) schedules" -ForegroundColor Green
    
    if ($studentSchedulesResponse.data.Count -gt 0) {
        $firstSchedule = $studentSchedulesResponse.data[0]
        
        # Step 6: Enroll in first schedule
        Write-Host "`n6. Enrolling student in first schedule..." -ForegroundColor Yellow
        $enrollResponse = Invoke-ApiRequest -Method "POST" -Url "$baseUrl/schedules/$($firstSchedule._id)/enroll" -Headers $studentHeaders
        
        if ($enrollResponse -and $enrollResponse.success) {
            Write-Host "✓ Successfully enrolled in $($firstSchedule.subject)" -ForegroundColor Green
            Write-Host "  Enrolled students: $($enrollResponse.data.enrolledStudents.Count)/$($enrollResponse.data.maxStudents)" -ForegroundColor Cyan
        } else {
            Write-Host "✗ Failed to enroll in schedule" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✗ Failed to fetch schedules as student" -ForegroundColor Red
}

Write-Host "`n=============================" -ForegroundColor Green
Write-Host "Test completed!" -ForegroundColor Green
