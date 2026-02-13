export type ViewType = 'Dashboard' | 'Staff' | 'Students' | 'Courses' | 'E-Library' | 'Attendance' | 'Reports' | 'Leave' | 'Settings' | 'Scan QR' | 'Assignments' | 'Course Analytics' | 'Student Performance';

export enum Role {
  ADMINISTRATOR = 'Administrator',
  HR = 'HR',
  STUDENT = 'Student',
}

export enum Department {
  ADMINISTRATION = 'Administration',
  SCIENCE = 'Science',
  ARTS = 'Arts',
  MATHEMATICS = 'Mathematics',
  PHYSICAL_EDUCATION = 'Physical Education',
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: Department;
  position: string;
  role: Role;
  hireDate: string;
  status: 'Active' | 'On Leave' | 'Inactive';
}

export interface Course {
  id: string;
  name: string;
  department: Department;
  teacherId?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentDate: string;
  status: 'Enrolled' | 'Graduated' | 'Withdrawn';
  courses: Course[];
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LATE = 'Late',
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string; // YYYY-MM-DD format
  status: AttendanceStatus;
}

export enum ResourceType {
  BOOK = 'Book',
  JOURNAL = 'Journal',
}

export interface LibraryResource {
  id: string;
  title: string;
  author: string;
  type: ResourceType;
  coverImage: string;
  publicationYear: number;
  department: Department;
  description: string;
  isAvailable: boolean;
  borrowedBy?: string; // studentId
}

export enum LeaveType {
  ANNUAL = 'Annual Leave',
  SICK = 'Sick Leave',
  SPECIAL = 'Special Leave',
  MISSION = 'Mission',
}

export enum LeaveRequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: LeaveRequestStatus;
  requestDate: string; // YYYY-MM-DD
}


export enum AssignmentType {
  HOMEWORK = 'HOMEWORK',
  PROJECT = 'PROJECT',
  ESSAY = 'ESSAY',
  PRESENTATION = 'PRESENTATION',
  QUIZ = 'QUIZ',
  OTHER = 'OTHER',
}

export enum AssignmentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Assignment {
  id: string;
  courseId: string | null;
  groupId: string;
  teacherId: string;
  title: string;
  description: string | null;
  dueDate: string | null; // YYYY-MM-DD
  type: AssignmentType;
  status: AssignmentStatus;
  weight: number;
  maxPoints: number;
  attachmentUrls: string[];
  
  course?: { name: string; code: string };
  group?: { name: string };
  teacher?: { firstName: string; lastName: string };
  _count?: { submissions: number };
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  LATE = 'LATE',
  GRADED = 'GRADED',
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submissionDate: string | null; // YYYY-MM-DD or null if not submitted
  submittedAt?: string | null;
  status: SubmissionStatus;
  grade: number | null; // e.g., 85
  feedback: string | null;
  fileUrls: string[];
  isLate: boolean;
  student?: { id: string; firstName: string; lastName: string };
}

export enum ExamType {
  WRITTEN = 'WRITTEN',
  ORAL = 'ORAL',
  PRACTICAL = 'PRACTICAL',
  ONLINE_QUIZ = 'ONLINE_QUIZ',
  MIDTERM = 'MIDTERM',
  FINAL = 'FINAL',
}

export enum ExamStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  GRADED = 'GRADED',
  CANCELLED = 'CANCELLED',
}

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  type: ExamType;
  status: ExamStatus;
  maxScore: number;
  
  courseId: string | null;
  groupId: string;
  teacherId: string;

  course?: { name: string; code: string };
  group?: { name: string };
  teacher?: { firstName: string; lastName: string };
  _count?: { submissions: number };
}
