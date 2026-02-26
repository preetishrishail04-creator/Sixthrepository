"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../../components/design-system";

/**
 * Test Checklist Page (/jt/07-test)
 * 
 * Built-in test checklist system with 10 verification items.
 * - Persists checklist state in localStorage
 * - Shows live test result summary
 * - Reset functionality
 */

const TEST_CHECKLIST_KEY = "jobTrackerTestStatus";

interface TestItem {
  id: string;
  label: string;
  tooltip: string;
}

const testItems: TestItem[] = [
  {
    id: "preferences-persist",
    label: "Preferences persist after refresh",
    tooltip: "Set preferences in Settings, refresh the page, and verify they are still there.",
  },
  {
    id: "match-score",
    label: "Match score calculates correctly",
    tooltip: "Set role keywords and skills, then check that jobs show appropriate match scores.",
  },
  {
    id: "show-matches",
    label: '"Show only matches" toggle works',
    tooltip: "Enable the toggle on dashboard and verify only jobs above threshold are shown.",
  },
  {
    id: "save-persist",
    label: "Save job persists after refresh",
    tooltip: "Save a job, refresh the page, and verify it appears in Saved Jobs.",
  },
  {
    id: "apply-tab",
    label: "Apply opens in new tab",
    tooltip: "Click Apply on any job card and verify it opens in a new tab.",
  },
  {
    id: "status-persist",
    label: "Status update persists after refresh",
    tooltip: "Change a job status, refresh, and verify the status is maintained.",
  },
  {
    id: "status-filter",
    label: "Status filter works correctly",
    tooltip: "Use the Status filter dropdown and verify only matching jobs are shown.",
  },
  {
    id: "digest-generate",
    label: "Digest generates top 10 by score",
    tooltip: "Generate a digest and verify it shows top 10 jobs sorted by match score.",
  },
  {
    id: "digest-persist",
    label: "Digest persists for the day",
    tooltip: "Generate a digest, refresh the page, and verify it loads automatically.",
  },
  {
    id: "no-console-errors",
    label: "No console errors on main pages",
    tooltip: "Open browser console and verify no errors on Dashboard, Saved, Settings, and Digest pages.",
  },
];

export default function TestChecklistPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Load checklist state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(TEST_CHECKLIST_KEY);
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch {
        setCheckedItems({});
      }
    }
  }, []);

  // Save to localStorage when checklist changes
  useEffect(() => {
    localStorage.setItem(TEST_CHECKLIST_KEY, JSON.stringify(checkedItems));
  }, [checkedItems]);

  const handleToggle = (id: string) => {
    setCheckedItems((prev: Record<string, boolean>) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReset = () => {
    setCheckedItems({});
  };

  const passedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = testItems.length;
  const allPassed = passedCount === totalCount;

  return (
    <div className="max-w-[800px] mx-auto px-24 py-40">
      {/* Header */}
      <div className="mb-40">
        <h1 className="font-serif text-[2.5rem] leading-[1.2] text-[#111111] mb-16">
          Test Checklist
        </h1>
        <p className="text-base text-[#6B6B6B] leading-relaxed">
          Verify all functionality before shipping. Check each item after testing.
        </p>
      </div>

      {/* Test Result Summary */}
      <div className="bg-white border border-[#D4D2CC] rounded-[6px] p-24 mb-32">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-[#6B6B6B] uppercase tracking-wide">
              Tests Passed
            </span>
            <div className="mt-8">
              <span className="font-serif text-3xl text-[#111111]">
                {passedCount}
              </span>
              <span className="text-xl text-[#6B6B6B]"> / {totalCount}</span>
            </div>
          </div>
          <div className="text-right">
            {!allPassed && (
              <div className="flex items-center gap-8 text-[#B8860B]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium">
                  Resolve all issues before shipping.
                </span>
              </div>
            )}
            {allPassed && (
              <div className="flex items-center gap-8 text-[#5A7D5A]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">
                  All tests passed!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white border border-[#D4D2CC] rounded-[6px] overflow-hidden mb-32">
        <div className="divide-y divide-[#E8E6E1]">
          {testItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-start gap-16 px-24 py-20 hover:bg-[#F7F6F3] transition-colors duration-150"
            >
              <div className="flex items-center gap-16 flex-1">
                <span className="text-sm text-[#8B0000] font-medium w-24">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <label className="flex items-center gap-16 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={checkedItems[item.id] || false}
                    onChange={() => handleToggle(item.id)}
                    className="w-20 h-20 accent-[#8B0000] cursor-pointer flex-shrink-0"
                  />
                  <span
                    className={`text-base ${
                      checkedItems[item.id]
                        ? "text-[#6B6B6B] line-through"
                        : "text-[#111111]"
                    }`}
                  >
                    {item.label}
                  </span>
                </label>
              </div>
              <div className="relative">
                <button
                  onMouseEnter={() => setShowTooltip(item.id)}
                  onMouseLeave={() => setShowTooltip(null)}
                  onClick={() => setShowTooltip(showTooltip === item.id ? null : item.id)}
                  className="text-xs text-[#6B6B6B] hover:text-[#8B0000] underline decoration-dotted"
                >
                  How to test
                </button>
                {showTooltip === item.id && (
                  <div className="absolute right-0 top-full mt-8 w-64 p-16 bg-[#111111] text-white text-sm rounded-[6px] z-10 shadow-lg">
                    {item.tooltip}
                    <div className="absolute -top-6 right-16 w-12 h-12 bg-[#111111] rotate-45" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-16 justify-between items-center">
        <Button variant="secondary" onClick={handleReset}>
          Reset Test Status
        </Button>
        <Link href="/jt/08-ship">
          <Button variant={allPassed ? "primary" : "secondary"}>
            Proceed to Ship
          </Button>
        </Link>
      </div>
    </div>
  );
}
