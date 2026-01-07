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
===
# 🎯 MISSION: Create a Complete Leave Management System

You are a Senior Full-stack Developer. Build a production-ready Leave Management System using Next.js 14.2+ (App Router) with Google Sheets as the database. This system must be deployable and functional immediately after generation.

---

## 📋 TECHNICAL STACK

### Core Framework
- **Next.js**: 14.2+ (App Router, Server Actions)
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS 3.4+
- **Icons**: lucide-react
- **Font**: THSarabunNew (via next/font/google)

### Authentication & Validation
- **Auth**: NextAuth.js v5 (Credentials Provider)
- **Validation**: Zod (all forms and API inputs)
- **Password**: Plain text storage (as requested)

### Database & External Services
- **Database**: Google Sheets (via googleapis)
- **Method**: Service Account Authentication
- **Rate Limiting**: Implement exponential backoff

---

## 🗂️ PROJECT STRUCTURE
```
leave-management-system/
├── .env.example                    # Template for environment variables
├── .env.local                      # Actual credentials (gitignored)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with Thai font
│   │   ├── page.tsx                # Landing/redirect page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx      # Login form
│   │   │   └── register/page.tsx   # Employee registration
│   │   ├── (employee)/
│   │   │   ├── dashboard/page.tsx  # Employee dashboard
│   │   │   ├── leave/
│   │   │   │   ├── request/page.tsx
│   │   │   │   └── history/page.tsx
│   │   │   └── calendar/page.tsx
│   │   └── (admin)/
│   │       ├── admin/
│   │       │   ├── dashboard/page.tsx
│   │       │   ├── employees/page.tsx
│   │       │   ├── leaves/page.tsx  # Approve/reject
│   │       │   └── settings/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                     # Shadcn-style base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── badge.tsx
│   │   │   └── toast.tsx
│   │   ├── features/
│   │   │   ├── leave-request-form.tsx
│   │   │   ├── leave-approval-card.tsx
│   │   │   ├── team-calendar.tsx
│   │   │   ├── leave-quota-display.tsx
│   │   │   └── employee-form.tsx
│   │   └── layout/
│   │       ├── navbar.tsx
│   │       ├── sidebar.tsx
│   │       └── footer.tsx
│   │
│   ├── lib/
│   │   ├── auth.ts                 # NextAuth configuration
│   │   ├── google-sheets.ts        # Google Sheets client
│   │   ├── utils.ts                # Utility functions
│   │   └── constants.ts            # Leave types, statuses
│   │
│   ├── services/
│   │   ├── user.service.ts         # User CRUD operations
│   │   ├── leave.service.ts        # Leave CRUD operations
│   │   ├── settings.service.ts     # Settings management
│   │   └── sheets-setup.service.ts # Auto-create sheets
│   │
│   ├── actions/
│   │   ├── auth.actions.ts         # Register, login logic
│   │   ├── leave.actions.ts        # Submit, approve, reject
│   │   ├── employee.actions.ts     # Add, update employees
│   │   └── settings.actions.ts     # Update policies
│   │
│   ├── types/
│   │   ├── user.types.ts           # User, Role enums
│   │   ├── leave.types.ts          # Leave, LeaveStatus enums
│   │   └── index.ts                # Barrel exports
│   │
│   ├── middleware.ts               # Route protection (RBAC)
│   └── providers.tsx               # SessionProvider wrapper
│
└── public/
    └── fonts/                      # Fallback fonts if needed
```

---

## 📊 DATABASE SCHEMA (Google Sheets)

### Sheet 1: "Users"
| Column | Type | Validation | Description |
|--------|------|------------|-------------|
| empId | string | Required, Unique | Employee ID (Primary Key) |
| name | string | Required | Full name (Thai/English) |
| password | string | Required | Plain text password |
| role | enum | 'admin' \| 'employee' | User role |
| leaveQuota | number | Default: 10 | Annual leave days |
| sickLeaveQuota | number | Default: 30 | Sick leave days |
| isRegistered | boolean | Default: false | Registration status |
| createdAt | datetime | Auto | ISO 8601 format |

### Sheet 2: "Leaves"
| Column | Type | Validation | Description |
|--------|------|------------|-------------|
| id | string | Auto (UUID) | Leave request ID |
| empId | string | Foreign Key | References Users.empId |
| type | enum | 'annual' \| 'sick' \| 'personal' | Leave type |
| startDate | date | Required | YYYY-MM-DD format |
| endDate | date | Required | YYYY-MM-DD format |
| totalDays | number | Calculated | Business days only |
| reason | string | Required | Leave reason |
| status | enum | 'pending' \| 'approved' \| 'rejected' | Default: 'pending' |
| approverNote | string | Optional | Admin's comment |
| createdAt | datetime | Auto | Submission timestamp |
| updatedAt | datetime | Auto | Last modified timestamp |

### Sheet 3: "Settings"
| Column | Type | Description |
|--------|------|-------------|
| key | string | Config key (e.g., 'annualLeaveMax') |
| value | string | Config value |
| year | number | Fiscal year (e.g., 2025) |

### Sheet 4: "Holidays" (Optional)
| Column | Type | Description |
|--------|------|-------------|
| date | date | YYYY-MM-DD |
| name | string | Holiday name (Thai) |

---

## 🔐 ENVIRONMENT VARIABLES

Create `.env.example`:
```env
# Google Sheets Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id-here

# NextAuth Configuration
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Optional: Timezone
TZ=Asia/Bangkok
```

**Setup Instructions to Include:**
1. How to create Google Cloud Service Account
2. How to enable Google Sheets API
3. How to share Sheet with Service Account email
4. How to generate NEXTAUTH_SECRET

---

## 🎨 UI/UX REQUIREMENTS

### Design System
- **Colors**: Use Tailwind's slate palette for professional look
- **Typography**: THSarabunNew for Thai text, Inter for English
- **Components**: Build Shadcn-inspired components (no external UI library)
- **Responsive**: Mobile-first design (Tailwind breakpoints)

### Key Pages to Build

#### 1. **Login Page** (`/login`)
- Email/EmployeeID input
- Password input
- "Register" link for new employees
- Error handling for invalid credentials

#### 2. **Registration Page** (`/register`)
- Check if empId exists in Users sheet
- Verify `isRegistered === false`
- Set password (plain text)
- Update `isRegistered = true`

#### 3. **Employee Dashboard** (`/dashboard`)
- Leave quota cards (Annual, Sick, Personal)
- Recent leave requests table
- Quick "Request Leave" button
- Calendar view of approved leaves

#### 4. **Leave Request Form** (`/leave/request`)
- Leave type dropdown
- Date range picker (exclude weekends & holidays)
- Auto-calculate total days
- Reason textarea
- Validation: Check if quota available

#### 5. **Admin Dashboard** (`/admin/dashboard`)
- Statistics cards:
  - Total employees
  - Pending approvals
  - Leaves this month
  - Approval rate
- Pending requests table with approve/reject actions

#### 6. **Admin: Manage Employees** (`/admin/employees`)
- Add new employee (empId, name, initial quotas)
- View all employees table
- Edit quotas
- Reset passwords

#### 7. **Admin: Leave Approvals** (`/admin/leaves`)
- Filter by status (pending, approved, rejected)
- Action buttons with modal for approver notes
- Bulk approve feature

#### 8. **Team Calendar** (`/admin/calendar` or `/calendar`)
- Monthly view showing who's on leave
- Color-coded by leave type
- Click date to see details

---

## ⚙️ CORE FUNCTIONALITIES

### 1. **Auto-Setup Service** (`sheets-setup.service.ts`)
```typescript
// On first run, check if sheets exist:
// - If not, create "Users", "Leaves", "Settings", "Holidays"
// - Add headers
// - Insert default admin user (empId: "ADMIN001", password: "admin123")
```

### 2. **Authentication Flow** (`auth.actions.ts`)
```typescript
// Register:
// 1. Verify empId exists and isRegistered=false
// 2. Save plain text password
// 3. Set isRegistered=true

// Login:
// 1. Find user by empId
// 2. Compare password (plain text)
// 3. Return session with { empId, name, role }
```

### 3. **Leave Calculation** (`leave.service.ts`)
```typescript
// Calculate business days between dates
// Exclude weekends (Saturday, Sunday)
// Exclude public holidays from "Holidays" sheet
// Return total days
```

### 4. **Quota Management**
```typescript
// When leave approved:
// - Deduct from appropriate quota (annual/sick/personal)
// - Update Users sheet

// When leave rejected:
// - No quota change

// Reset quotas:
// - Admin can manually reset or use cron job
```

### 5. **Middleware Protection** (`middleware.ts`)
```typescript
// Public routes: /login, /register
// Employee routes: /dashboard, /leave/*
// Admin routes: /admin/*
// Redirect based on role
```

---

## 🚨 ERROR HANDLING

### Google Sheets Rate Limits
- Implement exponential backoff (100ms → 200ms → 400ms)
- Cache read operations for 30 seconds
- Show user-friendly error messages

### Form Validation
- Use Zod schemas for all forms
- Display inline error messages
- Prevent submission if validation fails

### Global Error Boundary
- Catch unhandled errors
- Show generic error page with "Report Issue" button

---

## 🧪 TESTING CHECKLIST

Generate a `TESTING.md` file with:
- [ ] Admin can add employee (empId: "EMP001")
- [ ] Employee registers with EMP001
- [ ] Employee submits leave request
- [ ] Admin sees pending request
- [ ] Admin approves request
- [ ] Employee sees approved status
- [ ] Quota is deducted correctly
- [ ] Cannot submit leave without quota
- [ ] Middleware blocks unauthorized access

---

## 📦 DELIVERABLES

Please generate:

1. **Complete file structure** (all files listed above)
2. **Core services** with full implementation:
   - `google-sheets.ts` (connection setup)
   - `sheets-setup.service.ts` (auto-create sheets)
   - `user.service.ts` (CRUD)
   - `leave.service.ts` (CRUD + calculations)
3. **All server actions** in `/actions`
4. **Complete UI components** with Tailwind styling
5. **Middleware** for route protection
6. **Environment setup guide** (README.md)
7. **Package.json** with all dependencies

---

## 🎯 SUCCESS CRITERIA

The generated app must:
✅ Run with `npm install && npm run dev` after setting up `.env.local`
✅ Auto-create Google Sheets on first run
✅ Allow HR to add employees
✅ Allow employees to register and login
✅ Allow employees to request leaves
✅ Allow admins to approve/reject leaves
✅ Update quotas correctly
✅ Display Thai fonts properly
✅ Be mobile-responsive
✅ Handle errors gracefully

---

## 📝 ADDITIONAL NOTES

- Use `'use server'` directive for all server actions
- Use `'use client'` only when necessary (forms, interactive components)
- All dates must use Thai timezone (Asia/Bangkok)
- Include JSDoc comments for complex functions
- Use meaningful commit messages if generating git history
- Optimize for Vercel deployment

---

1. ฟังก์ชันสำหรับพนักงาน (Employee Portal)
ส่วนนี้เน้นความง่ายในการใช้งานและเข้าถึงข้อมูลส่วนตัว

แดชบอร์ดส่วนตัว (Dashboard): แสดงโควตาการลาที่เหลือ (ลาป่วย, ลากิจ, ลาพักร้อน) และสถานะคำขอที่ผ่านมา

ระบบยื่นคำขอลา (Leave Request): แบบฟอร์มระบุประเภทการลา, วันที่ลา, และเหตุผล พร้อมช่องทางอัปโหลดเอกสารประกอบ (เช่น ใบรับรองแพทย์)

ปฏิทินการลา (Personal Calendar): ดูวันลาของตัวเองที่ได้รับอนุมัติแล้ว

ระบบแจ้งเตือน (Notifications): รับการแจ้งเตือนเมื่อคำขอถูกอนุมัติ หรือถูกปฏิเสธผ่าน Email หรือ Line Notify

2. ฟังก์ชันสำหรับหัวหน้างาน (Manager/Approver)
ส่วนนี้เน้นการตัดสินใจและการบริหารจัดการทีม

ระบบอนุมัติการลา (Approval Workflow): รายการคำขอลาที่รอการตัดสินใจ สามารถกด "อนุมัติ" หรือ "ปฏิเสธ" พร้อมระบุหมายเหตุ

ปฏิทินทีม (Team Calendar): ดูว่าในวันนั้นๆ มีใครในทีมลาบ้าง เพื่อป้องกันการลาพร้อมกันจนกระทบงาน

ประวัติการลาของลูกน้อง: ตรวจสอบสถิติการลาย้อนหลังของพนักงานในทีม

3. ฟังก์ชันสำหรับฝ่ายบุคคล (HR Administrator)
ส่วนนี้เน้นการตั้งค่ากฎระเบียบและสรุปภาพรวมขององค์กร

จัดการนโยบายการลา (Leave Policy Settings): * กำหนดจำนวนวันลาของแต่ละประเภท

ตั้งค่าการทบยอดวันลาไปปีถัดไป

กำหนดเงื่อนไขการลา (เช่น ต้องลาล่วงหน้ากี่วัน)

จัดการข้อมูลพนักงาน (Employee Management): เพิ่ม/ลด รายชื่อพนักงาน และกำหนดสายการบังคับบัญชา (ใครเป็นคนอนุมัติใคร)

การจัดการวันหยุด (Public Holiday Management): กำหนดวันหยุดประจำปีของบริษัท

ระบบรายงานและสถิติ (Reports & Analytics): Export ข้อมูลเป็น Excel/PDF เพื่อนำไปคำนวณเงินเดือน หรือวิเคราะห์อัตราการลา (Absenteeism Rate)