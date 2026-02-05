'use client';

import { useEffect, useState } from 'react';
import { Card, Badge, ProgressBar } from '@/src/components/ui';
import { PageHeader } from '@/src/components/layout';
import { Department, Objective, KeyResult } from '@/src/types';
import { calculateProgress, formatValue } from '@/src/lib/utils';

interface DepartmentWithObjectives extends Department {
  objectives: (Objective & { key_results: KeyResult[] })[];
  topKR?: KeyResult & { objective: Objective };
}

export default function OKRDashboard() {
  const [departments, setDepartments] = useState<DepartmentWithObjectives[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const [deptsRes, objsRes] = await Promise.all([
          fetch('/api/departments'),
          fetch('/api/objectives'),
        ]);
        const [deptsData, objsData] = await Promise.all([
          deptsRes.json(),
          objsRes.json(),
        ]);

        const depts = deptsData.data || [];
        const objs = objsData.data || [];

        // Group objectives by department and find top KR for each department
        const deptsWithObjs = depts.map((dept: Department) => {
          const deptObjectives = objs.filter((o: Objective) => o.department_id === dept.id);

          // Find the top KR for this department
          let topKR: (KeyResult & { objective: Objective }) | undefined;
          for (const obj of deptObjectives) {
            const topKeyResult = obj.key_results?.find((kr: KeyResult) => kr.is_top_kr);
            if (topKeyResult) {
              topKR = { ...topKeyResult, objective: obj };
              break;
            }
          }

          return {
            ...dept,
            objectives: deptObjectives,
            topKR,
          };
        });

        setDepartments(deptsWithObjs);
        // Start with all departments collapsed
        setExpandedDepts(new Set());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const toggleDept = (deptId: number) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepts(newExpanded);
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="OKR Dashboard" description="Track objectives and key results" />
        <Card><div className="p-8 text-center text-[#6d6e6f]">Loading...</div></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="OKR Dashboard"
        description="Track objectives and key results"
      />

      {departments.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-[#6d6e6f]">
            No OKRs found. <a href="/admin/objectives" className="text-[#4573d2]">Create objectives</a> to get started.
          </div>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {departments.map((dept) => (
            <Card key={dept.id} padding="none" className="overflow-hidden">
              {/* Department Header */}
              <div
                className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 cursor-pointer hover:bg-[#f6f8f9] transition-colors"
                style={{ borderLeft: `4px solid ${dept.color}` }}
                onClick={() => toggleDept(dept.id)}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-[#6d6e6f] transition-transform flex-shrink-0 ${
                      expandedDepts.has(dept.id) ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <h2 className="text-base sm:text-lg font-semibold text-[#1e1f21] truncate">{dept.name}</h2>
                  <Badge className="flex-shrink-0">{dept.objectives.length}</Badge>
                </div>
              </div>

              {/* Top KR Preview (shown when collapsed) */}
              {!expandedDepts.has(dept.id) && dept.topKR && (
                <div
                  className="px-4 sm:px-6 py-3 bg-[#fff8e1] border-t border-[#f1bd6c] cursor-pointer hover:bg-[#fff3cd] transition-colors"
                  style={{ borderLeft: `4px solid ${dept.color}` }}
                  onClick={() => toggleDept(dept.id)}
                >
                  {/* Mobile layout - stacked */}
                  <div className="sm:hidden space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="warning" className="flex-shrink-0">Top KR</Badge>
                      <Badge color={dept.color} className="text-xs flex-shrink-0">{dept.topKR.code}</Badge>
                    </div>
                    <p className="text-sm text-[#1e1f21]">{dept.topKR.title}</p>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[#6d6e6f]">
                          {formatValue(dept.topKR.current_value, dept.topKR.unit_type, dept.topKR.current_label)}
                          <span className="text-[#9ca0a4]"> / </span>
                          {formatValue(dept.topKR.target_value, dept.topKR.unit_type, dept.topKR.target_label)}
                        </span>
                      </div>
                      <div className="w-24">
                        <ProgressBar value={calculateProgress(dept.topKR.current_value, dept.topKR.target_value, dept.topKR.baseline_value)} showLabel size="sm" />
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout - horizontal */}
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
                        <ProgressBar value={calculateProgress(dept.topKR.current_value, dept.topKR.target_value, dept.topKR.baseline_value)} showLabel size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* OKR Content - Expanded */}
              {expandedDepts.has(dept.id) && dept.objectives.length > 0 && (
                <div className="border-t border-[#e8ecee]">
                  {/* Desktop Table View */}
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
                            {/* Objective Row */}
                            <tr
                              key={`obj-${obj.id}`}
                              className="border-t border-[#edeef0] bg-white"
                            >
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

                            {/* Key Result Rows */}
                            {obj.key_results?.map((kr) => {
                              const progress = calculateProgress(kr.current_value, kr.target_value, kr.baseline_value);
                              return (
                                <tr key={`kr-${kr.id}`} className={`border-t border-[#edeef0] hover:bg-[#f6f8f9] ${kr.is_top_kr ? 'bg-[#fff8e1]' : 'bg-white'}`}>
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
                            })}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile/Tablet Card View */}
                  <div className="lg:hidden divide-y divide-[#e8ecee]">
                    {dept.objectives.map((obj) => (
                      <div key={obj.id} className="p-4">
                        {/* Objective */}
                        <div className="flex items-start gap-2 mb-3">
                          <Badge color={dept.color} className="flex-shrink-0 mt-0.5">{obj.code}</Badge>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-[#1e1f21]">{obj.title}</h3>
                            {obj.description && (
                              <p className="text-sm text-[#6d6e6f] mt-1">{obj.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Key Results */}
                        <div className="space-y-3 ml-0 sm:ml-4">
                          {obj.key_results?.map((kr) => {
                            const progress = calculateProgress(kr.current_value, kr.target_value, kr.baseline_value);
                            return (
                              <div
                                key={kr.id}
                                className={`p-3 rounded-lg ${kr.is_top_kr ? 'bg-[#fff8e1]' : 'bg-[#f6f8f9]'}`}
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  <Badge color={dept.color} className="text-xs flex-shrink-0">{kr.code}</Badge>
                                  {kr.is_top_kr && <Badge variant="warning" className="text-xs flex-shrink-0">Top KR</Badge>}
                                </div>
                                <p className="text-sm text-[#1e1f21] mb-3">{kr.title}</p>
                                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-2">
                                  <div>
                                    <div className="text-[#9ca0a4]">Baseline</div>
                                    <div className="font-medium text-[#6d6e6f]">
                                      {formatValue(kr.baseline_value, kr.unit_type, kr.baseline_label)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[#9ca0a4]">Current</div>
                                    <div className="font-semibold text-[#1e1f21]">
                                      {formatValue(kr.current_value, kr.unit_type, kr.current_label)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[#9ca0a4]">Target</div>
                                    <div className="font-medium text-[#1e1f21]">
                                      {formatValue(kr.target_value, kr.unit_type, kr.target_label)}
                                    </div>
                                  </div>
                                </div>
                                <ProgressBar value={progress} showLabel size="sm" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expandedDepts.has(dept.id) && dept.objectives.length === 0 && (
                <div className="border-t border-[#e8ecee] p-6 text-center text-[#6d6e6f]">
                  No objectives in this department yet.
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
