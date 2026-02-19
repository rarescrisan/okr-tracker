'use client';

import { Card, Badge, ProgressBar } from '@/src/components/ui';
import { Objective, KeyResult } from '@/src/types';
import { calculateProgress, formatValue } from '@/src/lib/utils';
import { DepartmentWithObjectives } from '../lib/api';

interface DepartmentCardProps {
  dept: DepartmentWithObjectives;
  isExpanded: boolean;
  onToggle: (deptId: number) => void;
}

function KRTableRow({ kr, dept }: { kr: KeyResult; dept: DepartmentWithObjectives }) {
  const progress = calculateProgress(kr.current_value, kr.target_value, kr.baseline_value, kr.direction || 'increase');
  return (
    <tr className={`border-t border-[#edeef0] hover:bg-[#f6f8f9] ${kr.is_top_kr ? 'bg-[#fff8e1]' : 'bg-white'}`}>
      <td className="px-6 py-3 pl-12">
        <div className="flex items-center gap-2">
          <Badge color={dept.color} className="text-xs">{kr.code}</Badge>
          <span className="text-sm text-[#1e1f21]">{kr.title}</span>
          {kr.is_top_kr && <Badge variant="warning" className="text-xs">Top KR</Badge>}
        </div>
      </td>
      <td className="px-4 py-3 text-right text-sm text-[#6d6e6f]">
        {formatValue(kr.baseline_value, kr.unit_type, kr.baseline_label)}
      </td>
      <td className="px-4 py-3 text-right text-sm font-medium text-[#1e1f21]">
        {formatValue(kr.target_value, kr.unit_type, kr.target_label)}
      </td>
      <td className="px-4 py-3 text-right text-sm font-semibold text-[#1e1f21]">
        {formatValue(kr.current_value, kr.unit_type, kr.current_label)}
      </td>
      <td className="px-4 py-3">
        <ProgressBar value={progress} showLabel size="md" />
      </td>
    </tr>
  );
}

function KRMobileCard({ kr, dept }: { kr: KeyResult; dept: DepartmentWithObjectives }) {
  const progress = calculateProgress(kr.current_value, kr.target_value, kr.baseline_value, kr.direction || 'increase');
  return (
    <div className={`p-3 rounded-lg ${kr.is_top_kr ? 'bg-[#fff8e1]' : 'bg-[#f6f8f9]'}`}>
      <div className="flex items-start gap-2 mb-2">
        <Badge color={dept.color} className="text-xs flex-shrink-0">{kr.code}</Badge>
        {kr.is_top_kr && <Badge variant="warning" className="text-xs flex-shrink-0">Top KR</Badge>}
      </div>
      <p className="text-sm text-[#1e1f21] mb-3">{kr.title}</p>
      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-2">
        <div>
          <div className="text-[#9ca0a4]">Baseline</div>
          <div className="font-medium text-[#6d6e6f]">{formatValue(kr.baseline_value, kr.unit_type, kr.baseline_label)}</div>
        </div>
        <div>
          <div className="text-[#9ca0a4]">Current</div>
          <div className="font-semibold text-[#1e1f21]">{formatValue(kr.current_value, kr.unit_type, kr.current_label)}</div>
        </div>
        <div>
          <div className="text-[#9ca0a4]">Target</div>
          <div className="font-medium text-[#1e1f21]">{formatValue(kr.target_value, kr.unit_type, kr.target_label)}</div>
        </div>
      </div>
      <ProgressBar value={progress} showLabel size="sm" />
    </div>
  );
}

export function DepartmentCard({ dept, isExpanded, onToggle }: DepartmentCardProps) {
  return (
    <Card padding="none" className="overflow-hidden">
      {/* Department Header */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 cursor-pointer hover:bg-[#f6f8f9] transition-colors"
        style={{ borderLeft: `4px solid ${dept.color}` }}
        onClick={() => onToggle(dept.id)}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <svg
            className={`w-4 h-4 sm:w-5 sm:h-5 text-[#6d6e6f] transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <h2 className="text-base sm:text-lg font-semibold text-[#1e1f21] truncate">{dept.name}</h2>
          <Badge className="flex-shrink-0">{dept.objectives.length}</Badge>
        </div>
      </div>

      {/* Top KR Preview (collapsed state) */}
      {!isExpanded && dept.topKR && (
        <div
          className="px-4 sm:px-6 py-3 bg-[#fff8e1] border-t border-[#f1bd6c] cursor-pointer hover:bg-[#fff3cd] transition-colors"
          style={{ borderLeft: `4px solid ${dept.color}` }}
          onClick={() => onToggle(dept.id)}
        >
          {/* Mobile */}
          <div className="sm:hidden space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="warning" className="flex-shrink-0">Top KR</Badge>
              <Badge color={dept.color} className="text-xs flex-shrink-0">{dept.topKR.code}</Badge>
            </div>
            <p className="text-sm text-[#1e1f21]">{dept.topKR.title}</p>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-[#6d6e6f]">
                {formatValue(dept.topKR.current_value, dept.topKR.unit_type, dept.topKR.current_label)}
                <span className="text-[#9ca0a4]"> / </span>
                {formatValue(dept.topKR.target_value, dept.topKR.unit_type, dept.topKR.target_label)}
              </span>
              <div className="w-24">
                <ProgressBar value={calculateProgress(dept.topKR.current_value, dept.topKR.target_value, dept.topKR.baseline_value, dept.topKR.direction || 'increase')} showLabel size="sm" />
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Badge variant="warning" className="flex-shrink-0">Top KR</Badge>
              <Badge color={dept.color} className="text-xs flex-shrink-0">{dept.topKR.code}</Badge>
              <span className="text-sm text-[#1e1f21] truncate">{dept.topKR.title}</span>
            </div>
            <div className="flex items-center gap-6 ml-4 flex-shrink-0">
              <div className="text-right">
                <div className="text-xs text-[#6d6e6f]">Current</div>
                <div className="text-sm font-semibold">{formatValue(dept.topKR.current_value, dept.topKR.unit_type, dept.topKR.current_label)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#6d6e6f]">Target</div>
                <div className="text-sm font-medium">{formatValue(dept.topKR.target_value, dept.topKR.unit_type, dept.topKR.target_label)}</div>
              </div>
              <div className="w-32">
                <ProgressBar value={calculateProgress(dept.topKR.current_value, dept.topKR.target_value, dept.topKR.baseline_value, dept.topKR.direction || 'increase')} showLabel size="sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded OKR Content */}
      {isExpanded && dept.objectives.length > 0 && (
        <div className="border-t border-[#e8ecee]">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f6f8f9] text-xs text-[#6d6e6f] uppercase">
                  <th className="text-left px-6 py-3 font-semibold">Objective / Key Result</th>
                  <th className="text-right px-4 py-3 font-semibold w-28">Baseline</th>
                  <th className="text-right px-4 py-3 font-semibold w-28">Target</th>
                  <th className="text-right px-4 py-3 font-semibold w-28">Current</th>
                  <th className="text-center px-4 py-3 font-semibold w-36">% of Target</th>
                </tr>
              </thead>
              <tbody>
                {dept.objectives.map((obj) => (
                  <>
                    <tr key={`obj-${obj.id}`} className="border-t border-[#edeef0] bg-white">
                      <td className="px-6 py-4" colSpan={5}>
                        <div className="flex items-center gap-3">
                          <Badge color={dept.color}>{obj.code}</Badge>
                          <span className="font-semibold text-[#1e1f21]">{obj.title}</span>
                        </div>
                        {obj.description && (
                          <p className="mt-1 text-sm text-[#6d6e6f] ml-16">{obj.description}</p>
                        )}
                      </td>
                    </tr>
                    {obj.key_results?.map((kr) => (
                      <KRTableRow key={`kr-${kr.id}`} kr={kr} dept={dept} />
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-[#e8ecee]">
            {dept.objectives.map((obj) => (
              <div key={obj.id} className="p-4">
                <div className="flex items-start gap-2 mb-3">
                  <Badge color={dept.color} className="flex-shrink-0 mt-0.5">{obj.code}</Badge>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#1e1f21]">{obj.title}</h3>
                    {obj.description && <p className="text-sm text-[#6d6e6f] mt-1">{obj.description}</p>}
                  </div>
                </div>
                <div className="space-y-3 ml-0 sm:ml-4">
                  {obj.key_results?.map((kr) => <KRMobileCard key={kr.id} kr={kr} dept={dept} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isExpanded && dept.objectives.length === 0 && (
        <div className="border-t border-[#e8ecee] p-6 text-center text-[#6d6e6f]">
          No objectives in this department yet.
        </div>
      )}
    </Card>
  );
}
