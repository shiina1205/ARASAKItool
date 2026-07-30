/** Pure authorization primitives for the v1.1 event/project model. */

export type EventRole = 'event_owner' | 'operations' | 'external_collaborator' | 'staff' | 'cast';
export type GlobalRole = 'global_admin';
export type ProjectPermission = 'canView' | 'canAddTask' | 'canComment' | 'canViewFiles';
export type TaskAudience = 'operations' | 'staff' | 'cast' | 'individual';

export interface EventMembership { uid: string; role: EventRole; active?: boolean }
export interface ProjectAccess {
  allowedRoles?: EventRole[];
  allowedUsers?: string[];
  members?: Record<string, Partial<Record<ProjectPermission, boolean>>>;
}
export interface AuthorizationUser { uid: string; globalRole?: GlobalRole; eventRole?: EventRole; active?: boolean }

const ROLE_ORDER: EventRole[] = ['cast', 'staff', 'external_collaborator', 'operations', 'event_owner'];

export function isGlobalAdmin(user?: AuthorizationUser | null): boolean {
  return user?.active !== false && user?.globalRole === 'global_admin';
}

export function hasEventRole(user: AuthorizationUser | null | undefined, roles: EventRole | EventRole[]): boolean {
  if (!user || user.active === false || !user.eventRole) return false;
  return (Array.isArray(roles) ? roles : [roles]).includes(user.eventRole);
}

/** Project access is an OR of role publication, individual publication and member grants. */
export function canViewProject(user: AuthorizationUser | null | undefined, access: ProjectAccess): boolean {
  if (isGlobalAdmin(user)) return true;
  if (!user || user.active === false) return false;
  if (access.allowedRoles?.includes(user.eventRole as EventRole)) return true;
  if (access.allowedUsers?.includes(user.uid)) return true;
  return access.members?.[user.uid]?.canView === true;
}

export function hasProjectPermission(
  user: AuthorizationUser | null | undefined,
  access: ProjectAccess,
  permission: ProjectPermission,
): boolean {
  if (isGlobalAdmin(user)) return true;
  if (!canViewProject(user, access) || !user) return false;
  // Event owners and operations retain their event-level capabilities. For
  // external collaborators, the per-project grant is authoritative.
  if (user.eventRole !== 'external_collaborator') return true;
  return access.members?.[user.uid]?.[permission] === true;
}

export function canViewTask(
  user: AuthorizationUser | null | undefined,
  project: ProjectAccess | null,
  audience: TaskAudience,
  individualUid?: string,
): boolean {
  if (isGlobalAdmin(user)) return true;
  if (!user || user.active === false) return false;
  if (project && !canViewProject(user, project)) return false;
  if (audience === 'individual') return individualUid === user.uid;
  if (user.eventRole === 'event_owner' || user.eventRole === 'operations') return true;
  if (user.eventRole === 'external_collaborator') return project !== null;
  if (user.eventRole === 'staff') return audience === 'staff' || audience === 'cast';
  return user.eventRole === audience;
}

export function canUsePersonalPage(user?: AuthorizationUser | null): boolean {
  return isGlobalAdmin(user) || hasEventRole(user, ['event_owner', 'operations', 'staff', 'cast']);
}

export function canAssignRole(actor: AuthorizationUser | null | undefined, target: EventRole): boolean {
  if (isGlobalAdmin(actor)) return true;
  if (!actor || actor.active === false) return false;
  if (actor.eventRole === 'event_owner') return target !== 'event_owner';
  if (actor.eventRole === 'operations') return ['external_collaborator', 'staff', 'cast'].includes(target);
  return false;
}

export function canRemoveRole(actor: AuthorizationUser | null | undefined, target: EventRole, remainingOwners: number): boolean {
  if (!canAssignRole(actor, target)) return false;
  return !(target === 'event_owner' && remainingOwners <= 1);
}

export function roleAtLeast(role: EventRole | undefined, minimum: EventRole): boolean {
  return role !== undefined && ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(minimum);
}

export type TaskState = 'inbox' | 'todo' | 'doing' | 'review' | 'waiting' | 'hold' | 'done' | 'cancelled' | 'archived';
export interface TaskOwnership { createdBy: string; assigneeUid?: string; status: TaskState; hasComments?: boolean; qualityCheckPending?: boolean }

export function canDeleteOwnTask(user: AuthorizationUser | null | undefined, task: TaskOwnership): boolean {
  if (isGlobalAdmin(user) || hasEventRole(user, ['event_owner', 'operations'])) return true;
  if (!user || user.uid !== task.createdBy || user.eventRole === 'cast') return false;
  return (task.status === 'inbox' || task.status === 'todo') &&
    (!task.assigneeUid || task.assigneeUid === user.uid) &&
    task.hasComments !== true && task.qualityCheckPending !== true;
}

export function requiresTaskDeleteRequest(user: AuthorizationUser | null | undefined, task: TaskOwnership): boolean {
  return !canDeleteOwnTask(user, task) && user?.uid === task.createdBy && user.eventRole !== 'cast';
}

export interface InviteRecord {
  kind: 'owner' | 'event' | 'external';
  eventId: string;
  projectId?: string;
  expiresAt: string | number;
  maxUses?: number;
  uses: number;
  active: boolean;
  approvalRequired: boolean;
}

export function isInviteUsable(invite: InviteRecord, now = Date.now()): boolean {
  const expiry = typeof invite.expiresAt === 'number' ? invite.expiresAt : Date.parse(invite.expiresAt);
  return invite.active && invite.approvalRequired && Number.isFinite(expiry) && expiry > now &&
    (invite.maxUses === undefined || invite.uses < invite.maxUses);
}

export function inviteScopeValid(invite: InviteRecord): boolean {
  return invite.kind !== 'external' || Boolean(invite.eventId && invite.projectId);
}

// Descriptive aliases used by UI adapters and Firebase-facing code.
export const canAccessProject = canViewProject;
export const canAccessTask = canViewTask;
export const canChangeRole = canAssignRole;

export interface SoftDeleteMetadata {
  deletedAt?: string;
  deletedBy?: string;
  deletedByName?: string;
  deleteReason?: string;
  previousStatus?: string;
}

export function softDeleteRecord<T extends Record<string, unknown>>(
  record: T,
  actor: { uid: string; displayName?: string },
  reason: string,
  now = new Date().toISOString(),
): T & SoftDeleteMetadata {
  return {
    ...record,
    deletedAt: now,
    deletedBy: actor.uid,
    deletedByName: actor.displayName ?? actor.uid,
    deleteReason: reason,
    previousStatus: typeof record.status === 'string' ? record.status : undefined,
  };
}

export function restoreRecord<T extends Record<string, unknown> & SoftDeleteMetadata>(record: T): T {
  const restored = { ...record };
  delete restored.deletedAt;
  delete restored.deletedBy;
  delete restored.deletedByName;
  delete restored.deleteReason;
  if (restored.previousStatus !== undefined) {
    (restored as Record<string, unknown>).status = restored.previousStatus;
    delete restored.previousStatus;
  }
  return restored;
}
