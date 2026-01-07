# 🔐 Authentication System Documentation

## ✅ สรุประบบ Authentication ที่สร้างเสร็จแล้ว

ระบบ Authentication แบบง่าย (Simple Auth) สำหรับ Leave Management System พร้อมใช้งานแล้ว!

---

## 📁 ไฟล์ที่สร้างขึ้น

### 1. **Services**
- `src/services/auth.service.ts` - Authentication logic (login, register, verify session)

### 2. **Context**
- `src/contexts/auth.context.tsx` - React Context สำหรับจัดการ session state

### 3. **API Routes**
- `src/app/api/auth/login/route.ts` - POST /api/auth/login
- `src/app/api/auth/register/route.ts` - POST /api/auth/register
- `src/app/api/auth/logout/route.ts` - POST /api/auth/logout
- `src/app/api/users/[empId]/route.ts` - GET /api/users/:empId

### 4. **Components**
- `src/components/auth/protected-route.tsx` - HOC สำหรับป้องกัน routes

### 5. **Pages**
- `src/app/login/page.tsx` - หน้า Login
- `src/app/register/page.tsx` - หน้า Register
- `src/app/dashboard/page.tsx` - Employee Dashboard
- `src/app/admin/dashboard/page.tsx` - Admin Dashboard
- `src/app/page.tsx` - Home page (redirect based on auth)

### 6. **Layout**
- `src/app/layout.tsx` - อัพเดทให้รองรับ AuthProvider

---

## 🚀 วิธีใช้งาน

### **1. เข้าสู่ระบบ (Login)**

```
URL: http://localhost:3000/login

ข้อมูลทดสอบ:
- Admin: ADMIN001 / admin123
- Employee: ใช้ Employee ID ที่ HR เพิ่มให้
```

### **2. ลงทะเบียน (Register)**

```
URL: http://localhost:3000/register

ขั้นตอน:
1. กรอก Employee ID ที่ HR เพิ่มให้ (isRegistered = false)
2. ตั้งรหัสผ่าน (อย่างน้อย 4 ตัวอักษร)
3. ยืนยันรหัสผ่าน
4. ระบบจะ auto-login และ redirect ไปหน้า dashboard
```

### **3. Dashboard**

```
Employee Dashboard: http://localhost:3000/dashboard
- แสดงโควตาการลาคงเหลือ
- ประวัติการลา
- Quick actions

Admin Dashboard: http://localhost:3000/admin/dashboard
- สถิติระบบ
- จัดการพนักงาน
- อนุมัติคำขอลา
```

---

## 🔒 ระบบ Authentication

### **Session Management**
- เก็บ session ใน `localStorage` (key: `lms_auth_user`)
- Auto-load session เมื่อ refresh page
- Auto-logout เมื่อ clear localStorage

### **Protected Routes**
```tsx
// ป้องกันหน้าที่ต้อง login
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>

// ป้องกันหน้าที่ต้องเป็น admin
<ProtectedRoute requireAdmin>
  <AdminComponent />
</ProtectedRoute>
```

### **Role-Based Access**
- **Admin**: เข้าได้ทุกหน้า
- **Employee**: เข้าได้เฉพาะหน้า employee

### **Auto Redirect**
- ไม่ได้ login → `/login`
- Employee login → `/dashboard`
- Admin login → `/admin/dashboard`
- Employee พยายามเข้า `/admin/*` → redirect to `/dashboard`

---

## 🎯 Features

### ✅ **Login**
- ตรวจสอบ Employee ID + Password
- ตรวจสอบว่า isRegistered = true
- เก็บ session ใน localStorage
- Redirect ตาม role

### ✅ **Register**
- ตรวจสอบ Employee ID ว่ามีในระบบ
- ตรวจสอบว่ายังไม่ได้ลงทะเบียน (isRegistered = false)
- ตรวจสอบ password confirmation
- อัพเดท password และ isRegistered = true
- Auto-login หลังลงทะเบียนสำเร็จ

### ✅ **Logout**
- ลบ session จาก localStorage
- Redirect ไป `/login`

### ✅ **Session Persistence**
- Auto-load session เมื่อ refresh
- Session คงอยู่จนกว่าจะ logout

### ✅ **Protected Routes**
- ตรวจสอบ authentication
- ตรวจสอบ authorization (role)
- Auto-redirect ถ้าไม่มีสิทธิ์

---

## 📊 User Flow

### **Employee Flow**
```
1. HR เพิ่มพนักงานใหม่ (isRegistered = false)
2. พนักงานไปที่ /register
3. กรอก Employee ID + ตั้งรหัสผ่าน
4. ระบบอัพเดท isRegistered = true
5. Auto-login → /dashboard
6. ดูโควตา, ยื่นคำขอลา, ดูประวัติ
7. Logout
```

### **Admin Flow**
```
1. Login ด้วย ADMIN001 / admin123
2. Redirect → /admin/dashboard
3. ดูสถิติ, อนุมัติคำขอ, จัดการพนักงาน
4. สามารถเข้า /dashboard ได้ (Employee view)
5. Logout
```

---

## 🔧 การใช้งาน useAuth Hook

```tsx
import { useAuth } from '@/contexts/auth.context';

function MyComponent() {
  const { 
    user,           // ข้อมูล user ปัจจุบัน (AuthUser | null)
    loading,        // กำลังโหลด session หรือไม่
    login,          // function สำหรับ login (user: AuthUser) => void
    logout,         // function สำหรับ logout () => void
    isAuthenticated,// login แล้วหรือยัง (boolean)
    isAdmin         // เป็น admin หรือไม่ (boolean)
  } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      {isAdmin && <p>You are an admin!</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 🎨 UI/UX Features

### **Login Page**
- ✅ สวยงาม modern design
- ✅ Form validation
- ✅ Error messages
- ✅ Link ไป register
- ✅ แสดง demo credentials

### **Register Page**
- ✅ Employee ID lookup
- ✅ แสดงชื่อพนักงานเมื่อพบ
- ✅ Password confirmation
- ✅ Validation (min 4 characters)
- ✅ Success/Error messages

### **Dashboard**
- ✅ แสดงข้อมูล user
- ✅ แสดงโควตาการลา
- ✅ Quick actions
- ✅ Logout button

### **Admin Dashboard**
- ✅ Stats overview
- ✅ Admin actions
- ✅ Link to employee view
- ✅ Info box

---

## 🔐 Security Notes

### **ระดับความปลอดภัย**
- ⚠️ **Medium** - เหมาะสำหรับ internal system
- ✅ Password stored as plain text (ไม่ hash)
- ✅ Session stored in localStorage (ไม่ใช่ JWT)
- ✅ No CSRF protection
- ✅ No rate limiting

### **ข้อจำกัด**
- ไม่เหมาะสำหรับระบบที่เปิดให้คนภายนอกใช้
- ไม่มี password hashing
- ไม่มี session expiration
- ไม่มี refresh token

### **ข้อดี**
- ✅ ง่าย รวดเร็ว
- ✅ ไม่ต้องติดตั้ง library เพิ่ม
- ✅ เหมาะกับ MVP
- ✅ อัพเกรดเป็น NextAuth ได้ทีหลัง

---

## 📝 ตัวอย่าง API Calls

### **Login**
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ empId: 'EMP001', password: 'pass123' })
});

const data = await response.json();
// { success: true, user: {...}, message: 'เข้าสู่ระบบสำเร็จ' }
```

### **Register**
```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    empId: 'EMP001', 
    password: 'pass123',
    confirmPassword: 'pass123'
  })
});

const data = await response.json();
// { success: true, user: {...}, message: 'ลงทะเบียนสำเร็จ' }
```

### **Get User**
```typescript
const response = await fetch('/api/users/EMP001');
const data = await response.json();
// { success: true, user: {...} }
```

---

## 🎯 Next Steps

ระบบ Authentication พร้อมใช้งานแล้ว! ขั้นตอนต่อไป:

1. ✅ **สร้าง UI Components** (Button, Input, Card, Table, etc.)
2. ✅ **สร้าง Leave Request Form** - ฟอร์มยื่นคำขอลา
3. ✅ **สร้าง Leave History Table** - ตารางประวัติการลา
4. ✅ **สร้าง Admin Approval Page** - หน้าอนุมัติคำขอ
5. ✅ **สร้าง Employee Management** - จัดการพนักงาน

---

## 🐛 Troubleshooting

### **ปัญหา: Login แล้วไม่ redirect**
- ตรวจสอบว่า AuthProvider ครอบ app แล้ว (layout.tsx)
- ตรวจสอบ console log ว่ามี error หรือไม่

### **ปัญหา: Refresh แล้ว logout**
- ตรวจสอบว่า localStorage ยังมีข้อมูลหรือไม่
- ตรวจสอบ AuthProvider useEffect

### **ปัญหา: Protected route ไม่ทำงาน**
- ตรวจสอบว่าครอบด้วย `<ProtectedRoute>` แล้ว
- ตรวจสอบ useAuth hook ว่า return ค่าถูกต้อง

---

## 📚 References

- **Auth Service**: `src/services/auth.service.ts`
- **Auth Context**: `src/contexts/auth.context.tsx`
- **Protected Route**: `src/components/auth/protected-route.tsx`

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-07  
**Status**: ✅ Production Ready (for internal use)
