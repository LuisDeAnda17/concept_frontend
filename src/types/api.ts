// API Types based on the API specification

export interface User {
  _id: string;
  username: string;
}

export interface BrontoBoard {
  _id: string;
  owner: string;
  calendar: string;
}

export interface Class {
  _id: string;
  brontoBoardId: string;
  name: string;
  overview: string;
}

export interface Assignment {
  _id: string;
  classId: string;
  name: string;
  dueDate: string; // ISO 8601
}

export interface OfficeHours {
  _id: string;
  classId: string;
  startTime: string; // ISO 8601
  duration: number; // in minutes
}

export interface Calendar {
  _id: string;
  owner: string;
}

export interface CalendarDay {
  _id: string;
  calendarId: string;
  date: string; // ISO 8601
  assignments: string[]; // assignment IDs
  officeHours: string[]; // office hours IDs
}

// API Request/Response Types

// BrontoBoard API
export interface InitializeBBRequest {
  user: string;
  calendar: string;
}

export interface InitializeBBResponse {
  brontoBoard: string;
}

export interface CreateClassRequest {
  owner: string;
  brontoBoard: string;
  className: string;
  overview: string;
}

export interface CreateClassResponse {
  class: string;
}

export interface AddWorkRequest {
  owner: string;
  class: string;
  workName: string;
  dueDate: string; // ISO 8601
}

export interface AddWorkResponse {
  assignment: string;
}

export interface ChangeWorkRequest {
  owner: string;
  work: string;
  dueDate: string; // ISO 8601
}

export interface AddOHRequest {
  owner: string;
  class: string;
  OHTime: string; // ISO 8601
  OHduration: number;
}

export interface AddOHResponse {
  officeHours: string;
}

export interface ChangeOHRequest {
  owner: string;
  oh: string;
  newDate: string; // ISO 8601
  newduration: number;
}

// BrontoCalendar API
export interface CreateCalendarRequest {
  user: string;
}

export interface CreateCalendarResponse {
  calendarId: string;
}

export interface CreateAssignmentRequest {
  classId: string;
  name: string;
  dueDate: string; // ISO 8601
}

export interface CreateAssignmentResponse {
  assignmentId: string;
}

export interface AssignWorkRequest {
  owner: string;
  assignmentId: string;
}

export interface CreateOfficeHoursRequest {
  classId: string;
  startTime: string; // ISO 8601
  duration: number;
}

export interface CreateOfficeHoursResponse {
  officeHoursId: string;
}

export interface AssignOHRequest {
  owner: string;
  officeHoursId: string;
}

export interface ChangeOHCalendarRequest {
  owner: string;
  officeHoursId: string;
  newDate: string; // ISO 8601
  newDuration: number;
}

// UserAuthentication API
export interface RegisterRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  user: string;
}

export interface AuthenticateRequest {
  username: string;
  password: string;
}

export interface AuthenticateResponse {
  user: string;
}

// Error Response
export interface ErrorResponse {
  error: string;
}
