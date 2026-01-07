Create a complete Leave Management System as a single React artifact using Claude's persistent storage API (window.storage). This must work entirely in the browser without external dependencies.

## 🎯 CORE REQUIREMENTS

### Technical Stack
- React 18+ (functional components with hooks)
- TypeScript
- Tailwind CSS (core utilities only)
- Lucide React icons
- Claude Persistent Storage API (window.storage)

### Storage Strategy
Use `window.storage` with these keys:
```typescript
// Users: window.storage.set('users', JSON.stringify(users))
// Leaves: window.storage.set('leaves', JSON.stringify(leaves))
// Settings: window.storage.set('settings', JSON.stringify(settings))
// Current User Session: window.storage.set('session', JSON.stringify(session))
```

---

## 📊 DATA MODELS

### User Interface
```typescript
interface User {
  empId: string;           // "EMP001"
  name: string;            // "สมชาย ใจดี"
  password: string;        // Plain text
  role: 'admin' | 'employee';
  leaveQuota: {
    annual: number;        // วันลาพักร้อน
    sick: number;          // วันลาป่วย
    personal: number;      // วันลากิจ
  };
  isRegistered: boolean;   // HR adds with false, employee sets to true
  createdAt: string;       // ISO date
}
```

### Leave Request Interface
```typescript
interface LeaveRequest {
  id: string;              // UUID
  empId: string;
  type: 'annual' | 'sick' | 'personal';
  startDate: string;       // YYYY-MM-DD
  endDate: string;         // YYYY-MM-DD
  totalDays: number;       // Calculated business days
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverNote?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Session Interface
```typescript
interface Session {
  empId: string;
  name: string;
  role: 'admin' | 'employee';
}
```

---

## 🎨 UI STRUCTURE

The app should have these main views:

### 1. Login Screen (Default View)
- Input: Employee ID
- Input: Password
- Button: "เข้าสู่ระบบ"
- Link: "ลงทะเบียนพนักงานใหม่"
- Error message display

### 2. Registration Screen
- Input: Employee ID (check if exists and not registered)
- Input: Full Name (display from existing data)
- Input: Set Password
- Input: Confirm Password
- Button: "ลงทะเบียน"

### 3. Employee Dashboard
- Header with: User name, Logout button
- Leave Quota Cards:
```
  [วันลาพักร้อน] [วันลาป่วย] [วันลากิจ]
     8/10 วัน      25/30 วัน     3/5 วัน
```
- Recent Leave Requests Table (last 5)
- Button: "ยื่นคำขอลา"

### 4. Leave Request Form (Modal/Separate View)
- Select: Leave Type (dropdown)
- Date: Start Date (date picker)
- Date: End Date (date picker)
- Display: Total Days (auto-calculated)
- Textarea: Reason
- Buttons: "ส่งคำขอ", "ยกเลิก"
- Validation: Check quota availability

### 5. Leave History (Employee)
- Table with columns:
  - ประเภท | วันที่เริ่ม | วันที่สิ้นสุด | จำนวนวัน | สถานะ | หมายเหตุ
- Filter: All / Pending / Approved / Rejected
- Status badges with colors:
  - Pending: Yellow
  - Approved: Green
  - Rejected: Red

### 6. Admin Dashboard
- Statistics Cards:
```
  [พนักงานทั้งหมด] [รออนุมัติ] [อนุมัติเดือนนี้]
       15 คน          3 คำขอ      12 คำขอ
```
- Tabs:
  - "คำขอที่รออนุมัติ" (Pending Requests)
  - "จัดการพนักงาน" (Manage Employees)
  - "ประวัติการลา" (All Leave History)

### 7. Pending Approvals (Admin)
- Table showing pending leave requests:
  - รหัสพนักงาน | ชื่อ | ประเภท | วันที่ | จำนวนวัน | เหตุผล | การดำเนินการ
- Action buttons for each row:
  - "อนุมัติ" (green button)
  - "ปฏิเสธ" (red button)
- Modal for rejection: Input field for "หมายเหตุ"

### 8. Manage Employees (Admin)
- Button: "+ เพิ่มพนักงาน"
- Table showing all employees:
  - รหัส | ชื่อ | สถานะ | โควตา | การจัดการ
- Add Employee Form:
  - Input: Employee ID
  - Input: Full Name
  - Select: Role (admin/employee)
  - Number inputs for quotas
  - Button: "บันทึก"

---

## ⚙️ CORE FUNCTIONALITIES

### Initial Setup (useEffect on mount)
```typescript
// On first load, check if 'users' key exists
// If not, create default admin:
const defaultAdmin: User = {
  empId: 'ADMIN001',
  name: 'ผู้ดูแลระบบ',
  password: 'admin123',
  role: 'admin',
  leaveQuota: { annual: 0, sick: 0, personal: 0 },
  isRegistered: true,
  createdAt: new Date().toISOString()
};
```

### Authentication Logic
```typescript
// Login:
// 1. Get users from window.storage.get('users')
// 2. Find user by empId and password
// 3. If found, save session: window.storage.set('session', user)
// 4. Redirect to dashboard

// Logout:
// 1. Delete session: window.storage.delete('session')
// 2. Redirect to login

// Check Auth (useEffect):
// 1. Try to get session from window.storage.get('session')
// 2. If exists, set current user state
// 3. If not, show login screen
```

### Registration Logic
```typescript
// 1. Get users from storage
// 2. Find user by empId where isRegistered === false
// 3. If found, update:
//    - password = userInput
//    - isRegistered = true
// 4. Save back to storage
// 5. Auto-login user
```

### Leave Request Submission
```typescript
// 1. Calculate business days (exclude weekends)
// 2. Check if quota is sufficient
// 3. If yes, create new leave request (status: 'pending')
// 4. Save to 'leaves' storage
// 5. Show success message
```

### Leave Approval (Admin)
```typescript
// Approve:
// 1. Update leave status to 'approved'
// 2. Deduct quota from user's leaveQuota
// 3. Update both 'leaves' and 'users' storage
// 4. Show success toast

// Reject:
// 1. Update leave status to 'rejected'
// 2. Add approverNote
// 3. Update 'leaves' storage
// 4. No quota deduction
```

### Business Day Calculation
```typescript
function calculateBusinessDays(start: string, end: string): number {
  // Convert to Date objects
  // Loop through dates
  // Exclude Saturday (6) and Sunday (0)
  // Return count
}
```

---

## 🎨 DESIGN SPECIFICATIONS

### Color Palette (Tailwind)
- Primary: `blue-600` (buttons, links)
- Success: `green-600` (approved status)
- Warning: `yellow-500` (pending status)
- Danger: `red-600` (rejected status, delete actions)
- Background: `gray-50` (page background)
- Card: `white` with `shadow-md`

### Typography
- Headings: `text-2xl font-bold text-gray-900`
- Body: `text-base text-gray-700`
- Labels: `text-sm font-medium text-gray-700`

### Layout
- Max width: `max-w-7xl mx-auto px-4`
- Spacing: Use `space-y-4`, `gap-4` consistently
- Cards: `bg-white rounded-lg shadow-md p-6`

### Components to Build
1. **StatCard** - Reusable stat display
2. **LeaveQuotaCard** - Shows quota with progress bar
3. **LeaveRequestCard** - Display single leave request
4. **DataTable** - Reusable table component
5. **Modal** - For forms and confirmations
6. **Toast** - Success/error notifications
7. **DateInput** - Date picker input
8. **StatusBadge** - Colored status indicator

---

## 🔄 STATE MANAGEMENT

Use React hooks for state:
```typescript
const [currentUser, setCurrentUser] = useState<Session | null>(null);
const [users, setUsers] = useState<User[]>([]);
const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'admin'>('login');
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

---

## ✅ ERROR HANDLING

### Storage Operations
```typescript
try {
  const result = await window.storage.get('users');
  if (!result) {
    // Initialize with empty array
  }
} catch (error) {
  console.error('Storage error:', error);
  setError('ไม่สามารถโหลดข้อมูลได้ กรุณารีเฟรชหน้าเว็บ');
}
```

### Form Validation
- Employee ID: Required, must exist (for registration)
- Password: Min 4 characters
- Dates: Start date must be <= end date
- Quota: Must have sufficient days

---

## 🎯 USER EXPERIENCE FEATURES

1. **Loading States**: Show spinner when fetching from storage
2. **Success Messages**: Toast notification after actions
3. **Confirmation Dialogs**: Before reject/delete actions
4. **Empty States**: When no data exists
5. **Responsive Design**: Mobile-friendly (Tailwind breakpoints)
6. **Thai Language**: All UI text in Thai
7. **Auto-refresh**: Reload data after mutations

---

## 📱 RESPONSIVE BREAKPOINTS

- Mobile: Default (< 640px)
- Tablet: `sm:` (≥ 640px)
- Desktop: `lg:` (≥ 1024px)

Tables should stack vertically on mobile.

---

## 🚀 IMPLEMENTATION CHECKLIST

Generate a complete, working artifact with:

✅ All data models (TypeScript interfaces)
✅ Storage helper functions (get, set, update)
✅ Authentication flow (login, register, logout)
✅ Employee dashboard with quota display
✅ Leave request form with validation
✅ Admin dashboard with statistics
✅ Approval workflow with notes
✅ Employee management (add, list)
✅ Responsive UI with Tailwind
✅ Error handling and loading states
✅ Thai language throughout
✅ Business day calculation
✅ Status badges and notifications

---

## 🎨 EXAMPLE COMPONENT STRUCTURE
```typescript
export default function LeaveManagementSystem() {
  // State declarations
  // Storage helper functions
  // useEffect for initialization
  
  // Render login if not authenticated
  if (!currentUser) return <LoginScreen />;
  
  // Render based on role
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {currentUser.role === 'admin' ? (
        <AdminDashboard />
      ) : (
        <EmployeeDashboard />
      )}
    </div>
  );
}
```

---

START GENERATING THE COMPLETE SINGLE-FILE REACT COMPONENT NOW! 🚀

The artifact should be fully functional, use Thai language, and work entirely with window.storage API.
```

---

## 🎯 วิธีใช้งาน

1. **Copy Prompt ด้านบน**
2. **วางใน Claude Chat** (claude.ai)
3. **Claude จะสร้าง Artifact** (กล่องสีน้ำเงินด้านขวา)
4. **ทดสอบได้ทันที**:
   - Login ด้วย `ADMIN001` / `admin123`
   - เพิ่มพนักงาน
   - ลงทะเบียนพนักงาน
   - ยื่นคำขอลา
   - อนุมัติคำขอ

---

## ⚡ ข้อดีของการใช้ Artifacts

✅ **ไม่ต้อง Setup Environment** - ใช้งานได้ทันที  
✅ **ไม่ต้องติดตั้ง Dependencies** - ทุกอย่างรวมอยู่ในไฟล์เดียว  
✅ **มี Persistent Storage** - ข้อมูลไม่หายเมื่อรีเฟรช  
✅ **แชร์ได้ง่าย** - ส่ง Link ให้คนอื่นทดสอบได้เลย  
✅ **แก้ไขง่าย** - บอก Claude ให้ปรับแก้ใน Chat ได้ทันที

---

## 🔄 ถ้าต้องการปรับแก้

หลังจาก Claude สร้าง Artifact แล้ว คุณสามารถพิมพ์ขอเพิ่มเติมได้เลย เช่น:
```
- เพิ่มปุ่ม Export เป็น Excel
- แสดงปฏิทินแบบ Monthly View
- เพิ่มระบบ Notification Badge
- เปลี่ยนสีธีมเป็นโทนเขียว