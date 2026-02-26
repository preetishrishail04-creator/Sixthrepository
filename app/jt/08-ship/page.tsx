"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../../components/design-system";

/**
 * Ship Lock Page (/jt/08-ship)
 * 
 * Locked until all 10 tests are checked.
 * Reads test status from localStorage.
 * Shows locked message if tests incomplete.
 */

const TEST_CHECKLIST_KEY = "jobTrackerTestStatus";

const TOTAL_TESTS = 10;

export default function ShipLockPage() {
  const [passedCount, setPassedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load test status from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(TEST_CHECKLIST_KEY);
    if (saved) {
      try {
        const checkedItems = JSON.parse(saved) as Record<string, boolean>;
        const count = Object.values(checkedItems).filter(Boolean).length;
        setPassedCount(count);
      } catch {
        setPassedCount(0);
      }
    }
    setIsLoading(false);
  }, []);

  const allTestsPassed = passedCount === TOTAL_TESTS;

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-[800px] mx-auto px-24 py-40">
        <div className="text-center">
          <p className="text-[#6B6B6B]">Loading...</p>
        </div>
      </div>
    );
  }

  // Locked state
  if (!allTestsPassed) {
    return (
      <div className="max-w-[800px] mx-auto px-24 py-40">
        <div className="bg-white border border-[#D4D2CC] rounded-[6px] p-40 text-center">
          {/* Lock Icon */}
          <div className="w-80 h-80 mx-auto mb-24 rounded-full bg-[#F7F6F3] flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="1.5">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 className="font-serif text-2xl text-[#111111] mb-16">
            Complete all tests before shipping.
          </h1>

          <p className="text-base text-[#6B6B6B] leading-relaxed mb-24">
            You have completed {passedCount} of {TOTAL_TESTS} tests.
            Return to the test checklist and verify all functionality.
          </p>

          <div className="flex flex-col sm:flex-row gap-16 justify-center">
            <Link href="/jt/07-test">
              <Button variant="primary">Go to Test Checklist</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Unlocked state - Ship Ready
  return (
    <div className="max-w-[800px] mx-auto px-24 py-40">
      <div className="bg-white border border-[#D4D2CC] rounded-[6px] p-40 text-center">
        {/* Success Icon */}
        <div className="w-80 h-80 mx-auto mb-24 rounded-full bg-[#5A7D5A] bg-opacity-15 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#5A7D5A" strokeWidth="2">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-serif text-2xl text-[#111111] mb-16">
          Ready to Ship
        </h1>

        <p className="text-base text-[#6B6B6B] leading-relaxed mb-24">
          All {TOTAL_TESTS} tests have been completed and verified.
          The application is ready for deployment.
        </p>

        <div className="bg-[#F7F6F3] border border-[#D4D2CC] rounded-[6px] p-24 mb-32">
          <h2 className="font-serif text-lg text-[#111111] mb-16">Ship Checklist</h2>
          <div className="text-left space-y-12">
            <div className="flex items-center gap-12">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A7D5A" strokeWidth="2">
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-[#6B6B6B]">All tests passed</span>
            </div>
            <div className="flex items-center gap-12">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A7D5A" strokeWidth="2">
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-[#6B6B6B]">localStorage persistence verified</span>
            </div>
            <div className="flex items-center gap-12">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A7D5A" strokeWidth="2">
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-[#6B6B6B]">Design system intact</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-16 justify-center">
          <Link href="/jt/07-test">
            <Button variant="secondary">Back to Tests</Button>
          </Link>
          <Button variant="primary" onClick={() => alert("Ship process initiated!")}>
            Ship Application
          </Button>
        </div>
      </div>
    </div>
  );
}
