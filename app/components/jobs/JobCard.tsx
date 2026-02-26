"use client";

import React, { useState, useRef, useEffect } from "react";
import { Job } from "@/app/data/jobs";
import { Button } from "../design-system";
import { cn } from "@/lib/utils";
import { getMatchScoreColor } from "@/app/lib/matchScore";

/**
 * Job Card Component
 * 
 * Displays job information with View, Save, and Apply buttons.
 * Shows match score badge when provided.
 * Includes status tracking: Not Applied, Applied, Rejected, Selected.
 * Follows design system: off-white background, deep red accent, subtle borders.
 */

export type JobStatus = "Not Applied" | "Applied" | "Rejected" | "Selected";

interface JobCardProps {
  job: Job;
  isSaved: boolean;
  onView: (job: Job) => void;
  onSave: (jobId: string) => void;
  onApply: (url: string) => void;
  matchScore?: number;
  status?: JobStatus;
  onStatusChange?: (jobId: string, status: JobStatus) => void;
}

const sourceColors = {
  LinkedIn: "bg-[#0077B5] bg-opacity-10 text-[#0077B5]",
  Naukri: "bg-[#FF6B6B] bg-opacity-10 text-[#FF6B6B]",
  Indeed: "bg-[#2557A7] bg-opacity-10 text-[#2557A7]",
};

const statusColors: Record<JobStatus, string> = {
  "Not Applied": "bg-[#E8E6E1] text-[#6B6B6B]",
  "Applied": "bg-[#2563EB] bg-opacity-10 text-[#2563EB]",
  "Rejected": "bg-[#DC2626] bg-opacity-10 text-[#DC2626]",
  "Selected": "bg-[#5A7D5A] bg-opacity-15 text-[#5A7D5A]",
};

const statusOptions: JobStatus[] = ["Not Applied", "Applied", "Rejected", "Selected"];

export function JobCard({ 
  job, 
  isSaved, 
  onView, 
  onSave, 
  onApply, 
  matchScore,
  status = "Not Applied",
  onStatusChange,
}: JobCardProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatPostedTime = (days: number) => {
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusSelect = (newStatus: JobStatus) => {
    if (onStatusChange && newStatus !== status) {
      onStatusChange(job.id, newStatus);
    }
    setShowStatusDropdown(false);
  };

  return (
    <div className="bg-white border border-[#D4D2CC] rounded-[6px] p-24 transition-all duration-150 hover:border-[#8B0000]">
      {/* Header: Title, Company & Match Score */}
      <div className="flex items-start justify-between gap-16 mb-16">
        <div className="flex-1">
          <h3 className="font-serif text-xl text-[#111111] mb-8">{job.title}</h3>
          <p className="text-base text-[#6B6B6B]">{job.company}</p>
        </div>
        {matchScore !== undefined && (
          <span className={cn("px-12 py-6 text-sm font-medium rounded-[6px] whitespace-nowrap", getMatchScoreColor(matchScore))}>
            {matchScore}% match
          </span>
        )}
      </div>

      {/* Job Details */}
      <div className="flex flex-wrap gap-16 mb-16">
        <span className="text-sm text-[#6B6B6B]">{job.location}</span>
        <span className="text-sm text-[#6B6B6B]">•</span>
        <span className="text-sm text-[#6B6B6B]">{job.mode}</span>
        <span className="text-sm text-[#6B6B6B]">•</span>
        <span className="text-sm text-[#6B6B6B]">{job.experience} years</span>
      </div>

      {/* Salary */}
      <div className="mb-16">
        <span className="text-sm font-medium text-[#111111]">{job.salaryRange}</span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-8 mb-24">
        {job.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="px-12 py-6 text-xs bg-[#F7F6F3] text-[#6B6B6B] rounded-[6px]"
          >
            {skill}
          </span>
        ))}
        {job.skills.length > 3 && (
          <span className="px-12 py-6 text-xs text-[#6B6B6B]">
            +{job.skills.length - 3} more
          </span>
        )}
      </div>

      {/* Status Selector */}
      <div className="mb-24" ref={dropdownRef}>
        <div className="relative inline-block">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className={cn(
              "flex items-center gap-8 px-16 py-10 text-sm font-medium rounded-[6px] transition-all duration-150",
              statusColors[status],
              "hover:opacity-80"
            )}
          >
            {status}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 4L6 8L10 4" />
            </svg>
          </button>

          {showStatusDropdown && (
            <div className="absolute top-full left-0 mt-8 bg-white border border-[#D4D2CC] rounded-[6px] shadow-sm z-10 min-w-[140px]">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleStatusSelect(option)}
                  className={cn(
                    "w-full text-left px-16 py-10 text-sm transition-colors duration-150",
                    option === status 
                      ? "bg-[#F7F6F3] font-medium" 
                      : "hover:bg-[#F7F6F3]",
                    "first:rounded-t-[6px] last:rounded-b-[6px]"
                  )}
                >
                  <span className={cn("inline-block w-8 h-8 rounded-full mr-8", statusColors[option].split(" ")[0])} />
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Source, Posted Time, Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-16 pt-16 border-t border-[#E8E6E1]">
        <div className="flex items-center gap-16">
          <span className={cn("px-12 py-6 text-xs font-medium rounded-[6px]", sourceColors[job.source])}>
            {job.source}
          </span>
          <span className="text-sm text-[#6B6B6B]">{formatPostedTime(job.postedDaysAgo)}</span>
        </div>

        <div className="flex items-center gap-12">
          <Button variant="secondary" size="small" onClick={() => onView(job)}>
            View
          </Button>
          <Button
            variant={isSaved ? "primary" : "secondary"}
            size="small"
            onClick={() => onSave(job.id)}
          >
            {isSaved ? "Saved" : "Save"}
          </Button>
          <Button variant="primary" size="small" onClick={() => onApply(job.applyUrl)}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
