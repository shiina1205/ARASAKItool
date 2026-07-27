import type { StaffUser } from './types/planner';

declare global {
  interface Window {
    __ARASAKI_APP_READY__?: boolean;
    __ARASAKI_STAFF_PLANNER_BUILD__?: string;
    currentStaffUser?: StaffUser;
  }
}

export {};
