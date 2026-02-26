"use client";

import React, { useState, useEffect } from "react";
import { jobs, Job } from "../data/jobs";
import { JobCard, JobModal, JobStatus } from "../components/jobs";
import { EmptyState } from "../components/design-system";
import { loadJobStatuses, saveJobStatus } from "../lib/jobStatus";

/**
 * Saved Page
 * 
 * Displays saved jobs from localStorage.
 * Jobs persist after page reload.
 * Job statuses are tracked and persisted.
 */

const SAVED_JOBS_KEY = "jnt_saved_jobs";

interface Toast {
  id: string;
  message: string;
}

export default function SavedPage() {
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load saved jobs and job statuses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SAVED_JOBS_KEY);
    if (saved) {
      try {
        setSavedJobIds(JSON.parse(saved));
      } catch {
        setSavedJobIds([]);
      }
    }
    setJobStatuses(loadJobStatuses());
  }, []);

  // Save to localStorage when savedJobIds changes
  useEffect(() => {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  const showToast = (message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const savedJobs = jobs.filter((job) => savedJobIds.includes(job.id));

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

  return (
    <div className="max-w-[1200px] mx-auto px-24 py-40">
      <div className="mb-40">
        <h1 className="font-serif text-[2.5rem] leading-[1.2] text-[#111111] mb-16">
          Saved Jobs
        </h1>
        <p className="text-base text-[#6B6B6B] leading-relaxed max-w-[720px]">
          Jobs you have saved for quick access. These persist even after you close the browser.
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <EmptyState
          title="No saved jobs yet"
          description="Jobs you save will appear here for quick access. Browse the dashboard to find and save jobs."
        />
      ) : (
        <>
          <div className="mb-24">
            <span className="text-sm text-[#6B6B6B]">
              {savedJobs.length} saved job{savedJobs.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            {savedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={true}
                onView={handleViewJob}
                onSave={handleSaveJob}
                onApply={handleApply}
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
