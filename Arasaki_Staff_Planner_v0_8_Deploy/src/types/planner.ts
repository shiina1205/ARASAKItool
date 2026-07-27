export type StaffRole = 'owner' | 'operations' | 'staff' | 'cast';
export type TaskStatus = 'inbox' | 'todo' | 'doing' | 'waiting' | 'done';
export type Priority = 'high' | 'medium' | 'low';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatRule {
  type: RepeatType;
  interval: number;
  until?: string;
  weekdays?: number[];
}

export interface PlannerTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  completed: boolean;
  category: string;
  due?: string;
  repeat?: RepeatRule;
}

export interface PlannerEvent {
  id: string;
  title: string;
  date: string;
  category: string;
  allDay: boolean;
  time?: string;
  note?: string;
  repeat?: RepeatRule;
}

export interface PlannerPreferences {
  weekStartsOn: 'monday' | 'sunday';
  showJapaneseHolidays: boolean;
}

export interface PlannerState {
  tasks: PlannerTask[];
  events: PlannerEvent[];
  preferences: PlannerPreferences;
}

export interface StaffUser {
  uid: string;
  displayName: string;
  role: StaffRole;
}
