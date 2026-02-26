"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { jobs, Job } from "../data/jobs";
import { Button, EmptyState } from "../components/design-system";
import { calculateMatchScore, loadPreferences, hasPreferences, Preferences, getMatchScoreColor } from "../lib/matchScore";
import { getRecentStatusUpdates, StatusHistoryEntry } from "../lib/jobStatus";

/**
 * Digest Page
 * 
 * Daily 9AM Digest with email-style layout.
 * - Top 10 jobs sorted by matchScore desc, postedDaysAgo asc
 * - Persists in localStorage per day
 * - Copy to clipboard and email draft actions
 * - Recent Status Updates section
 */

interface DigestJob extends Job {
  matchScore: number;
}

interface DigestData {
  date: string;
  jobs: DigestJob[];
  generatedAt: string;
}

function getTodayKey(): string {
  const today = new Date();
  return `jobTrackerDigest_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function getTodayDisplayDate(): string {
  const today = new Date();
  return today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function generateDigest(preferences: Preferences | null): DigestData {
  const today = new Date();
  
  // Calculate match scores for all jobs
  const jobsWithScores = jobs.map((job) => ({
    ...job,
    matchScore: preferences ? calculateMatchScore(job, preferences) : 0,
  }));

  // Sort: matchScore desc, then postedDaysAgo asc
  const sortedJobs = jobsWithScores.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.postedDaysAgo - b.postedDaysAgo;
  });

  // Take top 10
  const topJobs = sortedJobs.slice(0, 10);

  return {
    date: today.toISOString().split("T")[0],
    jobs: topJobs,
    generatedAt: today.toISOString(),
  };
}

function formatDigestAsText(digest: DigestData): string {
  const lines = [
    `Top 10 Jobs For You — 9AM Digest`,
    `Date: ${getTodayDisplayDate()}`,
    ``,
    `---`,
    ``,
  ];

  digest.jobs.forEach((job, index) => {
    lines.push(`${index + 1}. ${job.title}`);
    lines.push(`   Company: ${job.company}`);
    lines.push(`   Location: ${job.location}`);
    lines.push(`   Experience: ${job.experience} years`);
    lines.push(`   Match Score: ${job.matchScore}%`);
    lines.push(`   Apply: ${job.applyUrl}`);
    lines.push("");
  });

  lines.push("---");
  lines.push("");
  lines.push("This digest was generated based on your preferences.");

  return lines.join("\n");
}

function createMailtoLink(digest: DigestData): string {
  const subject = encodeURIComponent("My 9AM Job Digest");
  const body = encodeURIComponent(formatDigestAsText(digest));
  return `mailto:?subject=${subject}&body=${body}`;
}

const statusColors: Record<string, string> = {
  "Applied": "text-[#2563EB]",
  "Rejected": "text-[#DC2626]",
  "Selected": "text-[#5A7D5A]",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DigestPage() {
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [hasPrefs, setHasPrefs] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState<StatusHistoryEntry[]>([]);

  // Load preferences, existing digest, and recent status updates on mount
  useEffect(() => {
    const prefs = loadPreferences();
    setPreferences(prefs);
    setHasPrefs(hasPreferences());
    setRecentUpdates(getRecentStatusUpdates());

    // Check for existing digest today
    const todayKey = getTodayKey();
    const existingDigest = localStorage.getItem(todayKey);
    if (existingDigest) {
      try {
        setDigest(JSON.parse(existingDigest));
      } catch {
        setDigest(null);
      }
    }
  }, []);

  const handleGenerateDigest = () => {
    setIsGenerating(true);
    
    // Simulate processing delay
    setTimeout(() => {
      const newDigest = generateDigest(preferences);
      const todayKey = getTodayKey();
      localStorage.setItem(todayKey, JSON.stringify(newDigest));
      setDigest(newDigest);
      setIsGenerating(false);
    }, 500);
  };

  const handleCopyToClipboard = async () => {
    if (!digest) return;
    
    try {
      await navigator.clipboard.writeText(formatDigestAsText(digest));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  // Check if any jobs have matches
  const hasMatches = useMemo(() => {
    if (!digest) return false;
    return digest.jobs.some((job) => job.matchScore > 0);
  }, [digest]);

  // Blocking state: no preferences set
  if (!hasPrefs) {
    return (
      <div className="max-w-[1200px] mx-auto px-24 py-64">
        <div className="max-w-[720px]">
          <h1 className="font-serif text-[2.5rem] leading-[1.2] text-[#111111] mb-16">
            Daily Digest
          </h1>
          <div className="bg-white border border-[#D4D2CC] rounded-[6px] p-40 text-center">
            <div className="w-64 h-64 mx-auto mb-24 rounded-full bg-[#F7F6F3] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-[#111111] mb-12">
              Set preferences to generate a personalized digest.
            </h3>
            <p className="text-base text-[#6B6B6B] leading-relaxed mb-24">
              Configure your role keywords, preferred locations, and skills to get a tailored daily digest.
            </p>
            <Link href="/settings">
              <Button variant="primary">Go to Settings</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-24 py-40">
      <div className="max-w-[720px] mx-auto">
        {/* Header */}
        <div className="mb-40">
          <h1 className="font-serif text-[2.5rem] leading-[1.2] text-[#111111] mb-16">
            Daily Digest
          </h1>
          <p className="text-base text-[#6B6B6B] leading-relaxed">
            Your personalized 9AM job summary based on your preferences.
          </p>
        </div>

        {/* Demo Mode Note */}
        <div className="mb-24 px-16 py-12 bg-[#F7F6F3] border border-[#D4D2CC] rounded-[6px]">
          <p className="text-sm text-[#6B6B6B]">
            Demo Mode: Daily 9AM trigger simulated manually.
          </p>
        </div>

        {/* Generate Button */}
        {!digest && (
          <div className="mb-40 text-center">
            <Button
              variant="primary"
              onClick={handleGenerateDigest}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Today's 9AM Digest (Simulated)"}
            </Button>
          </div>
        )}

        {/* Digest Content */}
        {digest && (
          <div className="bg-white border border-[#D4D2CC] rounded-[6px] overflow-hidden">
            {/* Email Header */}
            <div className="bg-[#F7F6F3] border-b border-[#D4D2CC] px-32 py-24">
              <h2 className="font-serif text-2xl text-[#111111] mb-8">
                Top 10 Jobs For You — 9AM Digest
              </h2>
              <p className="text-sm text-[#6B6B6B]">{getTodayDisplayDate()}</p>
            </div>

            {/* Job List */}
            <div className="divide-y divide-[#E8E6E1]">
              {!hasMatches ? (
                <div className="px-32 py-40 text-center">
                  <p className="text-lg text-[#6B6B6B] mb-8">
                    No matching roles today.
                  </p>
                  <p className="text-sm text-[#6B6B6B]">
                    Check again tomorrow.
                  </p>
                </div>
              ) : (
                digest.jobs.map((job, index) => (
                  <div key={job.id} className="px-32 py-24">
                    <div className="flex items-start justify-between gap-16 mb-12">
                      <div className="flex-1">
                        <span className="text-sm text-[#8B0000] font-medium">
                          #{index + 1}
                        </span>
                        <h3 className="font-serif text-xl text-[#111111] mt-4">
                          {job.title}
                        </h3>
                        <p className="text-base text-[#6B6B6B] mt-4">
                          {job.company}
                        </p>
                      </div>
                      <span
                        className={`px-12 py-6 text-sm font-medium rounded-[6px] whitespace-nowrap ${getMatchScoreColor(
                          job.matchScore
                        )}`}
                      >
                        {job.matchScore}% match
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-16 text-sm text-[#6B6B6B] mb-16">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.experience} years exp</span>
                    </div>

                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => window.open(job.applyUrl, "_blank", "noopener,noreferrer")}
                    >
                      Apply
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#F7F6F3] border-t border-[#D4D2CC] px-32 py-24">
              <p className="text-sm text-[#6B6B6B] text-center">
                This digest was generated based on your preferences.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {digest && hasMatches && (
          <div className="mt-24 flex flex-col sm:flex-row gap-16 justify-center">
            <Button
              variant="secondary"
              onClick={handleCopyToClipboard}
            >
              {copied ? "Copied!" : "Copy Digest to Clipboard"}
            </Button>
            <a href={createMailtoLink(digest)}>
              <Button variant="primary">Create Email Draft</Button>
            </a>
          </div>
        )}

        {/* Recent Status Updates Section */}
        {recentUpdates.length > 0 && (
          <div className="mt-64">
            <h2 className="font-serif text-xl text-[#111111] mb-24">
              Recent Status Updates
            </h2>
            <div className="bg-white border border-[#D4D2CC] rounded-[6px] overflow-hidden">
              <div className="divide-y divide-[#E8E6E1]">
                {recentUpdates.map((update) => (
                  <div key={`${update.jobId}-${update.changedAt}`} className="px-24 py-16 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-medium text-[#111111] truncate">
                        {update.jobTitle}
                      </h4>
                      <p className="text-sm text-[#6B6B6B]">{update.company}</p>
                    </div>
                    <div className="flex items-center gap-16 ml-16">
                      <span className={`text-sm font-medium ${statusColors[update.status] || "text-[#6B6B6B]"}`}>
                        {update.status}
                      </span>
                      <span className="text-xs text-[#9B9B9B] whitespace-nowrap">
                        {formatDate(update.changedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
