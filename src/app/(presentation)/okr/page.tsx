'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui';
import { PageHeader } from '@/src/components/layout';
import { fetchOKRData, DepartmentWithObjectives } from './lib/api';
import { DepartmentCard } from './components/DepartmentCard';

export default function OKRDashboard() {
  const [departments, setDepartments] = useState<DepartmentWithObjectives[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchOKRData();
        setDepartments(data);
        setExpandedDepts(new Set());
      } catch (error) {
        console.error('Error loading OKR data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleDept = (deptId: number) => {
    const next = new Set(expandedDepts);
    next.has(deptId) ? next.delete(deptId) : next.add(deptId);
    setExpandedDepts(next);
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="OKR Dashboard" description="Track objectives and key results" />
        <Card><div className="p-8 text-center text-[#A0A8C8]">Loading...</div></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="OKR Dashboard" description="Track objectives and key results" />

      {departments.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-[#A0A8C8]">
            No OKRs found. <a href="/admin/objectives" className="text-[#00C8FF]">Create objectives</a> to get started.
          </div>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {departments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              dept={dept}
              isExpanded={expandedDepts.has(dept.id)}
              onToggle={toggleDept}
            />
          ))}
        </div>
      )}
    </div>
  );
}
