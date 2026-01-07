# 🏢 Leave Management System

ระบบจัดการการลาพนักงาน (Leave Management System) ที่สร้างด้วย **Next.js 14+** และใช้ **Google Sheets** เป็นฐานข้อมูล

## ✨ Features

### สำหรับพนักงาน (Employee)
- ✅ ลงทะเบียนและเข้าสู่ระบบ
- ✅ ดูโควตาการลาคงเหลือ (ลาพักร้อน, ลาป่วย, ลากิจ)
- ✅ ยื่นคำขอลา พร้อมคำนวณวันทำการอัตโนมัติ
- ✅ ดูประวัติการลาและสถานะ
- ✅ ปฏิทินแสดงวันลาของตัวเอง

### สำหรับผู้ดูแลระบบ (Admin/HR)
- ✅ เพิ่มพนักงานใหม่และกำหนดโควตา
- ✅ อนุมัติ/ปฏิเสธคำขอลา พร้อมระบุหมายเหตุ
- ✅ ดูสถิติและรายงานการลา
- ✅ จัดการวันหยุดประจำปี
- ✅ ตั้งค่านโยบายการลา

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Google Sheets API
- **Authentication**: NextAuth.js v5
- **Validation**: Zod
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📋 Prerequisites

1. **Node.js** 18+ และ **pnpm**
2. **Google Cloud Project** พร้อม Service Account
3. **Google Sheet** สำหรับเก็บข้อมูล

## 🚀 Quick Start

### 1. Clone และติดตั้ง Dependencies

```bash
git clone <repository-url>
cd leave-management-system
pnpm install
```

### 2. ตั้งค่า Google Cloud Service Account

#### 2.1 สร้าง Google Cloud Project
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่หรือเลือก Project ที่มีอยู่
3. เปิดใช้งาน **Google Sheets API**
   - ไปที่ **APIs & Services** > **Library**
   - ค้นหา "Google Sheets API"
   - คลิก **Enable**

#### 2.2 สร้าง Service Account
1. ไปที่ **APIs & Services** > **Credentials**
2. คลิก **Create Credentials** > **Service Account**
3. ตั้งชื่อ Service Account (เช่น "leave-system")
4. คลิก **Create and Continue**
5. ข้าม Grant Access (คลิก Continue)
6. คลิก **Done**

#### 2.3 สร้าง JSON Key
1. คลิกที่ Service Account ที่สร้างไว้
2. ไปที่แท็บ **Keys**
3. คลิก **Add Key** > **Create New Key**
4. เลือก **JSON** แล้วคลิก **Create**
5. ไฟล์ JSON จะถูกดาวน์โหลดอัตโนมัติ

### 3. สร้าง Google Sheet

1. ไปที่ [Google Sheets](https://sheets.google.com/)
2. สร้าง Spreadsheet ใหม่
3. คัดลอก **Sheet ID** จาก URL
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```
4. **แชร์ Sheet** กับ Service Account Email
   - คลิก **Share** ที่มุมขวาบน
   - วาง Service Account Email (จากไฟล์ JSON: `client_email`)
   - ตั้งสิทธิ์เป็น **Editor**
   - คลิก **Send**

### 4. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local`:

```bash
cp .env.example .env.local
```

แก้ไขค่าใน `.env.local`:

```env
# จากไฟล์ JSON ที่ดาวน์โหลด
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Sheet ID จาก URL
GOOGLE_SHEET_ID=your-google-sheet-id-here

# สร้าง Secret ด้วยคำสั่ง: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-here

# URL ของแอป
NEXTAUTH_URL=http://localhost:3000
```

**⚠️ สำคัญ**: 
- `GOOGLE_PRIVATE_KEY` ต้องมี `\n` (ตัวอักษร backslash-n) ไม่ใช่ขึ้นบรรทัดใหม่จริงๆ
- ใส่ค่าทั้งหมดในเครื่องหมาย `"..."`

### 5. รันโปรเจกต์

```bash
pnpm dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

### 6. เข้าสู่ระบบครั้งแรก

ระบบจะสร้าง Google Sheets และข้อมูลเริ่มต้นอัตโนมัติ

**ข้อมูลผู้ดูแลระบบเริ่มต้น:**
- รหัสพนักงาน: `ADMIN001`
- รหัสผ่าน: `admin123`

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (employee)/        # Employee pages
│   └── (admin)/           # Admin pages
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── features/         # Feature-specific components
│   └── layout/           # Layout components
├── lib/                   # Core libraries
│   ├── google-sheets.ts  # Google Sheets client
│   ├── auth.ts           # NextAuth configuration
│   ├── utils.ts          # Utility functions
│   └── constants.ts      # Constants
├── services/              # Business logic services
│   ├── user.service.ts
│   ├── leave.service.ts
│   └── sheets-setup.service.ts
├── actions/               # Server actions
├── types/                 # TypeScript types
└── middleware.ts          # Route protection
```

## 🗄️ Database Schema (Google Sheets)

### Sheet 1: Users
| empId | name | password | role | leaveQuota | sickLeaveQuota | personalLeaveQuota | isRegistered | createdAt |
|-------|------|----------|------|------------|----------------|-------------------|--------------|-----------|

### Sheet 2: Leaves
| id | empId | type | startDate | endDate | totalDays | reason | status | approverNote | createdAt | updatedAt |
|----|-------|------|-----------|---------|-----------|--------|--------|--------------|-----------|-----------|

### Sheet 3: Settings
| key | value | year |
|-----|-------|------|

### Sheet 4: Holidays
| date | name |
|------|------|

## 🔒 Security Notes

- ⚠️ **รหัสผ่านเก็บเป็น Plain Text** (ตามความต้องการ - ไม่แนะนำสำหรับ Production จริง)
- 🔐 ใช้ NextAuth.js สำหรับ Session Management
- 🛡️ Middleware ป้องกันการเข้าถึง Route ที่ไม่มีสิทธิ์
- 📝 Zod Validation สำหรับทุก Input

## 🚢 Deployment (Vercel)

1. Push โค้ดไปที่ GitHub
2. เชื่อมต่อ Repository กับ Vercel
3. เพิ่ม Environment Variables ใน Vercel Dashboard
4. Deploy!

**Environment Variables ที่ต้องเพิ่มใน Vercel:**
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (URL ของ Production)

## 📝 Usage Guide

### เพิ่มพนักงานใหม่ (Admin)
1. Login ด้วย ADMIN001
2. ไปที่ **จัดการพนักงาน**
3. คลิก **เพิ่มพนักงาน**
4. กรอกข้อมูล: รหัสพนักงาน, ชื่อ, โควตา
5. พนักงานจะได้รับรหัสพนักงานเพื่อไปลงทะเบียน

### ลงทะเบียนพนักงาน (Employee)
1. คลิก **ลงทะเบียนพนักงานใหม่**
2. กรอกรหัสพนักงานที่ HR มอบให้
3. ตั้งรหัสผ่าน
4. เข้าสู่ระบบได้ทันที

### ยื่นคำขอลา (Employee)
1. Login เข้าสู่ระบบ
2. คลิก **ยื่นคำขอลา**
3. เลือกประเภทการลา
4. เลือกวันที่เริ่ม-สิ้นสุด
5. ระบุเหตุผล
6. ส่งคำขอ

### อนุมัติการลา (Admin)
1. Login ด้วยบัญชี Admin
2. ไปที่ **คำขอที่รออนุมัติ**
3. คลิก **อนุมัติ** หรือ **ปฏิเสธ**
4. ระบุหมายเหตุ (ถ้าปฏิเสธ)
5. โควตาจะถูกหักอัตโนมัติเมื่ออนุมัติ

## 🐛 Troubleshooting

### ❌ Error: "Missing Google Sheets credentials"
- ตรวจสอบว่าไฟล์ `.env.local` มีค่าครบถ้วน
- ตรวจสอบว่า `GOOGLE_PRIVATE_KEY` มี `\n` ไม่ใช่ขึ้นบรรทัดใหม่จริง

### ❌ Error: "The caller does not have permission"
- ตรวจสอบว่าแชร์ Google Sheet กับ Service Account Email แล้ว
- ตรวจสอบว่าให้สิทธิ์ **Editor**

### ❌ Error: "Spreadsheet not found"
- ตรวจสอบ `GOOGLE_SHEET_ID` ว่าถูกต้อง
- ตรวจสอบว่า Service Account มีสิทธิ์เข้าถึง Sheet

### ❌ ระบบช้า / Rate Limit
- ระบบมี Retry Logic และ Caching อยู่แล้ว
- ถ้ายังช้า ลองเพิ่ม Cache Duration ใน `google-sheets.ts`

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 License

MIT License

## 👨‍💻 Development

```bash
# Development
pnpm dev

# Build
pnpm build

# Start production
pnpm start

# Lint
pnpm lint
```

## 🎯 Roadmap

- [ ] Email notifications
- [ ] Line Notify integration
- [ ] File upload for medical certificates
- [ ] Excel export
- [ ] Advanced analytics
- [ ] Multi-level approval workflow

---

**สร้างโดย**: AI Assistant
**วันที่**: 2026-01-07
**เวอร์ชัน**: 1.0.0
