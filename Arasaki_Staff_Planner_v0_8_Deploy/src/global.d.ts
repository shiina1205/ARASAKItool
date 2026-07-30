import type { StaffUser } from './types/planner';
import type * as PlannerDomain from './domain/planner-v1/index.ts';

declare global {
  interface Window {
    __ARASAKI_APP_READY__?: boolean;
    __ARASAKI_STAFF_PLANNER_BUILD__?: string;
    ARASAKI_PLANNER_DOMAIN: typeof PlannerDomain;
    currentStaffUser?: StaffUser;
  }
}

export {};
