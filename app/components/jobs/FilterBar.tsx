"use client";

import React from "react";
import { cn } from "@/lib/utils";

import { JobStatus } from "./JobCard";

/**
 * Filter Bar Component
 * 
 * Includes:
 * - Keyword search (title/company)
 * - Location dropdown
 * - Mode dropdown
 * - Experience dropdown
 * - Source dropdown
 * - Status dropdown (Not Applied, Applied, Rejected, Selected)
 * - Sort dropdown (Latest default, Match Score)
 * - Show only matches toggle
 */

interface FilterBarProps {
  filters: {
    keyword: string;
    location: string;
    mode: string;
    experience: string;
    source: string;
    status: JobStatus | "";
    sort: string;
  };
  onFilterChange: (key: string, value: string) => void;
  locations: string[];
  modes: string[];
  experiences: string[];
  sources: string[];
  showOnlyMatches?: boolean;
  onToggleMatches?: () => void;
  hasPreferences?: boolean;
}

export function FilterBar({
  filters,
  onFilterChange,
  locations,
  modes,
  experiences,
  sources,
  showOnlyMatches,
  onToggleMatches,
  hasPreferences,
}: FilterBarProps) {
  const selectClassName = cn(
    "px-16 py-12 bg-white border border-[#D4D2CC] rounded-[6px] text-sm text-[#111111]",
    "focus:outline-none focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000] focus:ring-opacity-20",
    "transition-all duration-150 ease-in-out"
  );

  return (
    <div className="bg-white border border-[#D4D2CC] rounded-[6px] p-24 mb-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-16">
        {/* Keyword Search */}
        <div className="sm:col-span-2 lg:col-span-1 xl:col-span-1">
          <label className="block text-xs text-[#6B6B6B] uppercase tracking-wide mb-8">
            Search
          </label>
          <input
            type="text"
            placeholder="Title or company..."
            value={filters.keyword}
            onChange={(e) => onFilterChange("keyword", e.target.value)}
            className={cn(selectClassName, "w-full")}
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs text-[#6B6B6B] uppercase tracking-wide mb-8">
            Location
          </label>
          <select
            value={filters.location}
            onChange={(e) => onFilterChange("location", e.target.value)}
            className={cn(selectClassName, "w-full")}
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Mode */}
        <div>
          <label className="block text-xs text-[#6B6B6B] uppercase tracking-wide mb-8">
            Mode
          </label>
          <select
            value={filters.mode}
            onChange={(e) => onFilterChange("mode", e.target.value)}
            className={cn(selectClassName, "w-full")}
          >
            <option value="">All Modes</option>
            {modes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-xs text-[#6B6B6B] uppercase tracking-wide mb-8">
            Experience
          </label>
          <select
            value={filters.experience}
            onChange={(e) => onFilterChange("experience", e.target.value)}
            className={cn(selectClassName, "w-full")}
          >
            <option value="">All Levels</option>
            {experiences.map((exp) => (
              <option key={exp} value={exp}>
                {exp} years
              </option>
            ))}
          </select>
        </div>

        {/* Source */}
        <div>
          <label className="block text-xs text-[#6B6B6B] uppercase tracking-wide mb-8">
            Source
          </label>
          <select
            value={filters.source}
            onChange={(e) => onFilterChange("source", e.target.value)}
            className={cn(selectClassName, "w-full")}
          >
            <option value="">All Sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs text-[#6B6B6B] uppercase tracking-wide mb-8">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className={cn(selectClassName, "w-full")}
          >
            <option value="">All Statuses</option>
            <option value="Not Applied">Not Applied</option>
            <option value="Applied">Applied</option>
            <option value="Rejected">Rejected</option>
            <option value="Selected">Selected</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-xs text-[#6B6B6B] uppercase tracking-wide mb-8">
            Sort By
          </label>
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange("sort", e.target.value)}
            className={cn(selectClassName, "w-full")}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="match-score">Match Score</option>
            <option value="salary-high">Salary: High to Low</option>
            <option value="salary-low">Salary: Low to High</option>
          </select>
        </div>
      </div>

      {/* Show Only Matches Toggle */}
      {hasPreferences && onToggleMatches && (
        <div className="mt-24 pt-24 border-t border-[#E8E6E1]">
          <label className="flex items-center gap-12 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyMatches}
              onChange={onToggleMatches}
              className="w-20 h-20 accent-[#8B0000] cursor-pointer"
            />
            <span className="text-sm text-[#111111]">
              Show only jobs above my threshold
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
