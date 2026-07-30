export type PlannerSurface = 'app' | 'owner' | 'global';

export const SURFACE_VIEW_ACCESS: Readonly<Record<PlannerSurface, readonly string[]>> = {
  app: [
    'home',
    'mypage',
    'calendar',
    'triage',
    'future',
    'yearly',
    'weekly',
    'daily',
    'tasksAssigned',
    'tasksOperations',
    'tasksStaff',
    'tasksCast',
    'events',
    'projects',
    'meetings',
    'schedulePolls',
    'notes',
    'settings',
  ],
  owner: [
    'adminEvent',
    'adminAudit',
    'adminInvites',
    'adminApplications',
    'adminLinks',
    'adminRoles',
    'permissions',
    'settings',
    'backup',
  ],
  global: [
    'globalEvents',
    'globalEventList',
    'globalEventDetails',
    'globalInvites',
    'globalApplications',
    'globalAudit',
    'globalTrash',
  ],
};

export function isViewAllowedOnSurface(surface: PlannerSurface, view: string): boolean {
  return SURFACE_VIEW_ACCESS[surface].includes(view);
}
