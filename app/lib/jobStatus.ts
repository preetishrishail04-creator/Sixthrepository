import { JobStatus } from "../components/jobs/JobCard";

const STATUS_KEY = "jobTrackerStatus";
const STATUS_HISTORY_KEY = "jobTrackerStatusHistory";

export interface StatusHistoryEntry {
  jobId: string;
  jobTitle: string;
  company: string;
  status: JobStatus;
  changedAt: string;
}

/**
 * Load all job statuses from localStorage
 * Returns empty object if none exists
 */
export function loadJobStatuses(): Record<string, JobStatus> {
  if (typeof window === "undefined") return {};
  
  const saved = localStorage.getItem(STATUS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Get status for a specific job
 * Returns "Not Applied" if no status exists
 */
export function getJobStatus(jobId: string): JobStatus {
  const statuses = loadJobStatuses();
  return statuses[jobId] || "Not Applied";
}

/**
 * Save status for a specific job
 * Also records to history for digest page
 */
export function saveJobStatus(
  jobId: string, 
  status: JobStatus, 
  jobTitle: string, 
  company: string
): void {
  if (typeof window === "undefined") return;
  
  // Load current statuses
  const statuses = loadJobStatuses();
  
  // Only update if status changed
  if (statuses[jobId] === status) return;
  
  // Update status
  statuses[jobId] = status;
  localStorage.setItem(STATUS_KEY, JSON.stringify(statuses));
  
  // Record to history (only for non-default statuses)
  if (status !== "Not Applied") {
    recordStatusHistory(jobId, jobTitle, company, status);
  }
}

/**
 * Record status change to history
 */
function recordStatusHistory(
  jobId: string,
  jobTitle: string,
  company: string,
  status: JobStatus
): void {
  if (typeof window === "undefined") return;
  
  const history = loadStatusHistory();
  
  // Add new entry
  const newEntry: StatusHistoryEntry = {
    jobId,
    jobTitle,
    company,
    status,
    changedAt: new Date().toISOString(),
  };
  
  // Keep only last 20 entries
  const updatedHistory = [newEntry, ...history].slice(0, 20);
  
  localStorage.setItem(STATUS_HISTORY_KEY, JSON.stringify(updatedHistory));
}

/**
 * Load status history
 */
export function loadStatusHistory(): StatusHistoryEntry[] {
  if (typeof window === "undefined") return [];
  
  const saved = localStorage.getItem(STATUS_HISTORY_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Get recent status updates (last 7 days)
 */
export function getRecentStatusUpdates(days: number = 7): StatusHistoryEntry[] {
  const history = loadStatusHistory();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return history.filter((entry) => new Date(entry.changedAt) >= cutoff);
}

/**
 * Clear all job statuses (for testing)
 */
export function clearJobStatuses(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STATUS_KEY);
}
