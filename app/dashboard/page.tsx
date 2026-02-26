"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { jobs, Job, getUniqueLocations, getUniqueModes, getUniqueExperiences, getUniqueSources } from "../data/jobs";
import { JobCard, JobModal, FilterBar, JobStatus } from "../components/jobs";
import { EmptyState, Button } from "../components/design-system";
import { calculateMatchScore, loadPreferences, hasPreferences, Preferences } from "../lib/matchScore";
import { loadJobStatuses, saveJobStatus } from "../lib/jobStatus";

/**
 * Dashboard Page
 * 
 * Displays job cards with filtering, search, and match scoring capabilities.
 * Saved jobs are stored in localStorage.
 * Match scores are calculated based on user preferences.
 * Job statuses are tracked: Not Applied, Applied, Rejected, Selected.
 */

const SAVED_JOBS_KEY = "jnt_saved_jobs";

interface Toast {
  id: string;
  message: string;
}

export default function DashboardPage() {
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    mode: "",
    experience: "",
    source: "",
    status: "" as JobStatus | "",
    sort: "latest",
  });

  // Load saved jobs, preferences, and job statuses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SAVED_JOBS_KEY);
    if (saved) {
      try {
        setSavedJobIds(JSON.parse(saved));
      } catch {
        setSavedJobIds([]);
      }
    }
    
    setPreferences(loadPreferences());
    setJobStatuses(loadJobStatuses());
  }, []);

  // Save to localStorage when savedJobIds changes
  useEffect(() => {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  const showToast = (message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message }]);
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveJob = (jobId: string) => {
    setSavedJobIds((prev) => {
      if (prev.includes(jobId)) {
        return prev.filter((id) => id !== jobId);
      }
      return [...prev, jobId];
    });
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleApply = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      saveJobStatus(jobId, newStatus, job.title, job.company);
      setJobStatuses(loadJobStatuses());
      showToast(`Status updated: ${newStatus}`);
    }
  };

  const userHasPreferences = hasPreferences();
  const minMatchScore = preferences?.minMatchScore ?? 40;

  // Calculate match scores for all jobs
  const jobsWithScores = useMemo(() => {
    if (!preferences) {
      return jobs.map((job) => ({ ...job, matchScore: undefined }));
    }
    return jobs.map((job) => ({
      ...job,
      matchScore: calculateMatchScore(job, preferences),
    }));
  }, [preferences]);

  const filteredJobs = useMemo(() => {
    let result = [...jobsWithScores];

    // Filter by match score threshold if toggle is on
    if (showOnlyMatches && preferences) {
      result = result.filter((job) => (job.matchScore ?? 0) >= minMatchScore);
    }

    // Keyword filter
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(keyword) ||
          job.company.toLowerCase().includes(keyword)
      );
    }

    // Location filter
    if (filters.location) {
      result = result.filter((job) => job.location === filters.location);
    }

    // Mode filter
    if (filters.mode) {
      result = result.filter((job) => job.mode === filters.mode);
    }

    // Experience filter
    if (filters.experience) {
      result = result.filter((job) => job.experience === filters.experience);
    }

    // Source filter
    if (filters.source) {
      result = result.filter((job) => job.source === filters.source);
    }

    // Status filter (AND logic with all other filters)
    if (filters.status) {
      result = result.filter((job) => {
        const jobStatus = jobStatuses[job.id] || "Not Applied";
        return jobStatus === filters.status;
      });
    }

    // Sort
    switch (filters.sort) {
      case "latest":
        result.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
        break;
      case "oldest":
        result.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
        break;
      case "match-score":
        result.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
        break;
      case "salary-high":
        // Simple sort by extracting first number from salary range
        result.sort((a, b) => {
          const getFirstNum = (s: string) => {
            const match = s.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };
          return getFirstNum(b.salaryRange) - getFirstNum(a.salaryRange);
        });
        break;
      case "salary-low":
        result.sort((a, b) => {
          const getFirstNum = (s: string) => {
            const match = s.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };
          return getFirstNum(a.salaryRange) - getFirstNum(b.salaryRange);
        });
        break;
    }

    return result;
  }, [filters, jobsWithScores, showOnlyMatches, minMatchScore, preferences]);

  return (
    <div className="max-w-[1200px] mx-auto px-24 py-40">
      <div className="mb-40">
        <h1 className="font-serif text-[2.5rem] leading-[1.2] text-[#111111] mb-16">
          Dashboard
        </h1>
        <p className="text-base text-[#6B6B6B] leading-relaxed max-w-[720px]">
          Browse and filter job opportunities. Save jobs to review later or apply directly.
        </p>
      </div>

      {/* Preferences Banner */}
      {!userHasPreferences && (
        <div className="bg-[#F7F6F3] border border-[#D4D2CC] rounded-[6px] p-24 mb-24">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-16">
            <p className="text-base text-[#6B6B6B]">
              Set your preferences to activate intelligent matching.
            </p>
            <Link href="/settings">
              <Button variant="primary" size="small">
                Set Preferences
              </Button>
            </Link>
          </div>
        </div>
      )}

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        locations={getUniqueLocations()}
        modes={getUniqueModes()}
        experiences={getUniqueExperiences()}
        sources={getUniqueSources()}
        showOnlyMatches={showOnlyMatches}
        onToggleMatches={() => setShowOnlyMatches(!showOnlyMatches)}
        hasPreferences={userHasPreferences}
      />

      {filteredJobs.length === 0 ? (
        <div className="text-center py-64">
          <EmptyState
            title="No roles match your criteria"
            description="Adjust filters or lower your match threshold to see more jobs."
          />
        </div>
      ) : (
        <>
          <div className="mb-24">
            <span className="text-sm text-[#6B6B6B]">
              Showing {filteredJobs.length} of {jobs.length} jobs
              {showOnlyMatches && userHasPreferences && ` (above ${minMatchScore}% match)`}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobIds.includes(job.id)}
                onView={handleViewJob}
                onSave={handleSaveJob}
                onApply={handleApply}
                matchScore={job.matchScore}
                status={jobStatuses[job.id] || "Not Applied"}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </>
      )}

      <JobModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveJob}
        onApply={handleApply}
        isSaved={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-24 right-24 z-50 flex flex-col gap-12">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-[#111111] text-white px-20 py-14 rounded-[6px] shadow-lg text-sm font-medium animate-in slide-in-from-bottom-2"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
