import type { TaskCategory } from './types'

// The required-task checklist from the original one-pager, minus the two
// items that are already dedicated Project fields (Sold/Projected Install
// Date) rather than tasks. "Add standard checklist" creates whichever of
// these a project doesn't already have — so the required list can't be
// forgotten, even though a human still has to decide who owns each one.
export const TASK_TEMPLATES: { category: TaskCategory; title: string }[] = [
  { category: 'Pre Design', title: 'Site Audit Complete' },
  { category: 'Pre Design', title: 'Site Audit Report' },
  { category: 'Pre Design', title: 'Site Audit Photos Uploaded' },
  { category: 'Pre Design', title: 'Lodging Required (Yes/No)' },
  { category: 'Pre Design', title: 'Lodging Booked' },

  { category: 'Design', title: '50% Plan Complete' },
  { category: 'Design', title: '50% Plan Set Review' },
  { category: 'Design', title: 'Loading Plan Complete' },
  { category: 'Design', title: 'Structural Letter' },
  { category: 'Design', title: 'Electrical Review' },
  { category: 'Design', title: 'Design Checklist' },
  { category: 'Design', title: '100% Plan Set Review' },
  { category: 'Design', title: 'BOM Review' },
  { category: 'Design', title: 'BOM Approved' },
  { category: 'Design', title: 'BOM Takeoff Created' },
  { category: 'Design', title: 'Red Line Edits Completed' },
  { category: 'Design', title: 'Permit Submitted' },

  { category: 'Job Logistics', title: 'Safety Plan / JHA' },
  { category: 'Job Logistics', title: 'Gantt Chart of Project Timeline' },
  { category: 'Job Logistics', title: 'Communications and Monitoring' },
  { category: 'Job Logistics', title: 'Crane Scheduled' },
  { category: 'Job Logistics', title: 'Slip Sheet' },
  { category: 'Job Logistics', title: 'Raceway / Cable Tray' },
  { category: 'Job Logistics', title: 'Tugger Rental' },
  { category: 'Job Logistics', title: 'Screws and Length of Screws' },
  { category: 'Job Logistics', title: 'PV Wire and MC4' },
  { category: 'Job Logistics', title: 'Restroom Access' },
  { category: 'Job Logistics', title: 'Guardrail Rental' },
  { category: 'Job Logistics', title: 'Scope of Work' },

  { category: 'Material Logistics', title: 'Material Delivery Logistics' },
  { category: 'Material Logistics', title: 'Compare Packing Slip to BOM / Verify Materials' },

  { category: 'Construction', title: 'Daily Hours Breakout' },
  { category: 'Construction', title: 'Tool Box Talk / Safety Binder' },
  { category: 'Construction', title: 'Install Checklist' },
  { category: 'Construction', title: 'Install Daily Goals' },
  { category: 'Construction', title: 'Project Handoff Meeting with Crew Lead' },
  { category: 'Construction', title: 'Inspection Folder' },

  { category: 'Project Closeout', title: 'Close Out Labor Hours and Cost' },
  { category: 'Project Closeout', title: 'Close Out Material Costs' },
]
