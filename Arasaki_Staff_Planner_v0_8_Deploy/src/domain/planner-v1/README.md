# Planner v1 domain integration notes

This directory is deliberately independent from the legacy runtime. It gives
`AppBootstrap.tsx` one module to expose as `window.ARASAKI_PLANNER_DOMAIN`,
without making the 2,700-line `app-v0.8.js` the source of truth for new IDs.

## State and Firebase shape

The browser state shape used by the bridge is:

```ts
{
  categoryMaster: Category[];
  projectTemplates: ProjectTemplate[];
  categoryMigrationVersion: 1;
}
```

Use `createInitialPlannerDomainState()` to make mutable seed arrays. Keep
categories/templates as arrays in browser state for compatibility, but sync
their Firebase children by stable ID. A category/template edit should create
one ID-level update, not replace the whole workspace.

Recommended workspace children:

```text
workspace/
  catalog/categories/{categoryId}
  templates/{templateId}
  tasks/{visibility}/{taskId}
  projects/{visibility}/{projectId}
  meta/categoryMigrationVersion
```

The existing rules reject unknown workspace children, so rules must be updated
before writing catalog or template data. The current flat `projects` read rule
also cannot enforce per-project visibility: Realtime Database parent reads are
not row filters. Visibility buckets (or separate visibility indexes) are
required before confidential projects are stored.

For a transition period, task `visibility` is the source of truth and the
legacy `audience` field should mirror `operations | staff | cast`. `owner`
cannot be represented by the current audience paths; owner-only tasks require
an owner bucket rather than mapping them to operations.

## Rollout order

1. Add the new state keys and ID-level Firebase sync/listeners.
2. Seed the category/template masters only when the remote master is absent.
3. Run `migrateLegacyPlannerState()` before exposing organization records.
4. Persist both the workspace migration version and each record's
   `categoryMigrationVersion`. The latter makes interrupted migrations safe.
5. Keep legacy `category` and store it as `legacyCategory` until classification
   review is complete.
6. Switch forms to IDs and use `getCategoryChildren()` plus
   `reconcileCategorySelection()` for linked selects.
7. Instantiate templates with `instantiateProjectTemplate()` and persist its
   snapshot and initial value map on the project.
8. Generate real task IDs from the returned task definitions and save each task
   individually.

Records whose `workspaceId === "personal"` are intentionally not migrated.
Organization records with unknown/old personal-looking categories go to
`CAT-UNC` and receive `classificationStatus: "needs-classification"`.

Inactive categories are excluded from new choices, while
`getCategoryChildren({ selectedIds: [...] })` still returns a selected inactive
category for existing records. `CAT-UNC` is a system category and is omitted
from normal new-record choices.

## Progress and filtering

`calculateProjectProgress()` counts:

- required, completion-enabled template fields;
- non-archived/non-cancelled project tasks;
- required quality checks except `notApplicable`.

Optional template fields and optional QA checks can be included through
options. Do not pass the current role-filtered `visibleTasks()` result: that
would show different percentages to different roles. Compute from the complete
authorized project task set or store a trusted aggregate.

`matchesPlannerFilter()` supports both new plural UID fields and the current
singular `assigneeUid`/`reviewerUid`, plus `dueDate`/legacy `due`. The
`needsClassification` filter uses the explicit status and validates the
category parent chain.

## Deliberate initial decisions

- `契約・許諾` and its children have reserved IDs but are inactive because the
  specification lists them as a decision candidate.
- `TPL-EVENT-001` starts at `planning`; converting an old `当日運営` record
  defaults to `preparation` unless the caller requests `execution`.
- Template field/section IDs avoid characters forbidden in Firebase keys.
- The template contains all 51 requested fields and eight initial task
  definitions. Existing projects always use their stored template snapshot.

Run-time validation is available through `validatePlannerDomain()`. It checks
parent chains, duplicate/Firebase-safe IDs, phase references, rich-list column
definitions, and template task references.
