'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Select, Badge, ProgressBar } from '@/src/components/ui';
import { PageHeader } from '@/src/components/layout';
import { Department, Objective, KeyResult } from '@/src/types';
import { calculateProgress, formatValue, formatInputDate } from '@/src/lib/utils';
import { fetchObjectivesPageData, saveObjective, deleteObjective, saveKeyResult, deleteKeyResult } from './lib/api';
import { ObjectiveModal } from './components/ObjectiveModal';
import { KeyResultModal } from './components/KeyResultModal';

interface ObjForm {
  department_id: string;
  code: string;
  title: string;
  description: string;
  is_top_objective: boolean;
}

interface KrForm {
  code: string;
  title: string;
  description: string;
  baseline_value: string;
  baseline_label: string;
  target_value: string;
  target_label: string;
  current_value: string;
  current_label: string;
  unit_type: 'number' | 'currency' | 'percentage';
  direction: 'increase' | 'decrease';
  target_date: string;
  is_top_kr: boolean;
}

const defaultObjForm: ObjForm = { department_id: '', code: '', title: '', description: '', is_top_objective: false };
const defaultKrForm: KrForm = {
  code: '', title: '', description: '', baseline_value: '', baseline_label: '',
  target_value: '', target_label: '', current_value: '0', current_label: '',
  unit_type: 'number', direction: 'increase', target_date: '', is_top_kr: false,
};

export default function ObjectivesPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [expandedObjs, setExpandedObjs] = useState<Set<number>>(new Set());

  const [objModalOpen, setObjModalOpen] = useState(false);
  const [editingObj, setEditingObj] = useState<Objective | null>(null);
  const [objForm, setObjForm] = useState<ObjForm>(defaultObjForm);

  const [krModalOpen, setKrModalOpen] = useState(false);
  const [editingKr, setEditingKr] = useState<KeyResult | null>(null);
  const [krObjectiveId, setKrObjectiveId] = useState<number | null>(null);
  const [krForm, setKrForm] = useState<KrForm>(defaultKrForm);

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchObjectivesPageData();
      setDepartments(data.departments);
      setObjectives(data.objectives);
      setExpandedObjs(new Set(data.objectives.map((o: Objective) => o.id)));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredObjectives = selectedDeptId === 'all'
    ? objectives
    : objectives.filter(o => o.department_id === parseInt(selectedDeptId));

  const objectivesByDept = filteredObjectives.reduce((acc, obj) => {
    const deptId = obj.department_id;
    if (!acc[deptId]) acc[deptId] = [];
    acc[deptId].push(obj);
    return acc;
  }, {} as Record<number, Objective[]>);

  const toggleExpand = (objId: number) => {
    const next = new Set(expandedObjs);
    next.has(objId) ? next.delete(objId) : next.add(objId);
    setExpandedObjs(next);
  };

  const openObjModal = (obj?: Objective, deptId?: number) => {
    if (obj) {
      setEditingObj(obj);
      setObjForm({
        department_id: obj.department_id.toString(),
        code: obj.code,
        title: obj.title,
        description: obj.description || '',
        is_top_objective: obj.is_top_objective,
      });
    } else {
      setEditingObj(null);
      setObjForm({ ...defaultObjForm, department_id: deptId?.toString() || '' });
    }
    setObjModalOpen(true);
  };

  const handleObjSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objForm.department_id || !objForm.code || !objForm.title) return;
    setSaving(true);
    try {
      await saveObjective(objForm, editingObj?.id);
      await loadData();
      setObjModalOpen(false);
    } catch (error) {
      console.error('Error saving objective:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleObjDelete = async (obj: Objective) => {
    if (!confirm(`Delete "${obj.title}"? This will also delete all associated key results.`)) return;
    try {
      await deleteObjective(obj.id);
      await loadData();
    } catch (error) {
      console.error('Error deleting objective:', error);
    }
  };

  const openKrModal = (objectiveId: number, kr?: KeyResult) => {
    setKrObjectiveId(objectiveId);
    if (kr) {
      setEditingKr(kr);
      setKrForm({
        code: kr.code,
        title: kr.title,
        description: kr.description || '',
        baseline_value: kr.baseline_value?.toString() || '',
        baseline_label: kr.baseline_label || '',
        target_value: kr.target_value.toString(),
        target_label: kr.target_label || '',
        current_value: kr.current_value.toString(),
        current_label: kr.current_label || '',
        unit_type: kr.unit_type,
        direction: kr.direction || 'increase',
        target_date: formatInputDate(kr.target_date),
        is_top_kr: kr.is_top_kr || false,
      });
    } else {
      setEditingKr(null);
      setKrForm(defaultKrForm);
    }
    setKrModalOpen(true);
  };

  const handleKrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!krForm.code || !krForm.title || !krForm.target_value || !krObjectiveId) return;
    setSaving(true);
    try {
      await saveKeyResult(krForm, krObjectiveId, editingKr?.id);
      await loadData();
      setKrModalOpen(false);
    } catch (error) {
      console.error('Error saving key result:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKrDelete = async (kr: KeyResult) => {
    if (!confirm(`Delete "${kr.title}"?`)) return;
    try {
      await deleteKeyResult(kr.id);
      await loadData();
    } catch (error) {
      console.error('Error deleting key result:', error);
    }
  };

  return (
    <div>
      <PageHeader
        title="Objectives & Key Results"
        description="Define OKRs for your organization"
        actions={
          <Button onClick={() => openObjModal()} disabled={departments.length === 0}>
            Add Objective
          </Button>
        }
      />

      <div className="mb-4">
        <Select
          options={[
            { value: 'all', label: 'All Departments' },
            ...departments.map(d => ({ value: d.id.toString(), label: d.name })),
          ]}
          value={selectedDeptId}
          onChange={(e) => setSelectedDeptId(e.target.value)}
          className="w-48"
        />
      </div>

      {loading ? (
        <Card><div className="p-8 text-center text-[#6d6e6f]">Loading...</div></Card>
      ) : departments.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-[#6d6e6f]">
            No departments found. <a href="/admin/departments" className="text-[#4573d2]">Create a department</a> first.
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(objectivesByDept).map(([deptId, deptObjectives]) => {
            const dept = departments.find(d => d.id === parseInt(deptId));
            if (!dept) return null;
            return (
              <Card key={deptId} padding="none">
                <div
                  className="flex items-center justify-between px-4 py-3 border-b border-[#e8ecee]"
                  style={{ borderLeftWidth: 4, borderLeftColor: dept.color }}
                >
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-[#1e1f21]">{dept.name}</h3>
                    <Badge>{deptObjectives.length} objectives</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openObjModal(undefined, dept.id)}>
                    + Add Objective
                  </Button>
                </div>

                <div className="divide-y divide-[#edeef0]">
                  {deptObjectives.map((obj) => (
                    <div key={obj.id}>
                      <div
                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#f6f8f9]"
                        onClick={() => toggleExpand(obj.id)}
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className={`w-4 h-4 text-[#6d6e6f] transition-transform ${expandedObjs.has(obj.id) ? 'rotate-90' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <Badge color={dept.color}>{obj.code}</Badge>
                          <span className="font-medium">{obj.title}</span>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openKrModal(obj.id)}
                            className="px-3 py-1 text-xs font-medium text-[#4573d2] bg-[#e8f0fe] hover:bg-[#d2e3fc] rounded-full transition-colors"
                          >
                            + KR
                          </button>
                          <button
                            onClick={() => openObjModal(obj)}
                            className="px-3 py-1 text-xs font-medium text-[#6d6e6f] bg-[#f1f3f4] hover:bg-[#e8ecee] rounded-full transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleObjDelete(obj)}
                            className="px-3 py-1 text-xs font-medium text-[#d93025] bg-[#fce8e6] hover:bg-[#f8d7da] rounded-full transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {expandedObjs.has(obj.id) && obj.key_results && obj.key_results.length > 0 && (
                        <div className="bg-[#f6f8f9] px-4 py-2">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-[#6d6e6f] text-xs uppercase">
                                <th className="text-left py-2 font-medium">Key Result</th>
                                <th className="text-right py-2 font-medium w-32 px-3">Baseline</th>
                                <th className="text-right py-2 font-medium w-32 px-3">Target</th>
                                <th className="text-right py-2 font-medium w-32 px-3">Current</th>
                                <th className="text-center py-2 font-medium w-32 px-3">Progress</th>
                                <th className="w-24"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {obj.key_results.map((kr) => {
                                const progress = calculateProgress(kr.current_value, kr.target_value, kr.baseline_value, kr.direction || 'increase');
                                return (
                                  <tr key={kr.id} className={`border-t border-[#e8ecee] ${kr.is_top_kr ? 'bg-[#fff8e1]' : ''}`}>
                                    <td className="py-2">
                                      <Badge color={dept.color} className="mr-2">{kr.code}</Badge>
                                      {kr.title}
                                      {kr.is_top_kr && <Badge variant="warning" className="ml-2">Top KR</Badge>}
                                    </td>
                                    <td className="text-right py-2 px-3 text-[#6d6e6f]">
                                      {formatValue(kr.baseline_value, kr.unit_type, kr.baseline_label)}
                                    </td>
                                    <td className="text-right py-2 px-3">
                                      {formatValue(kr.target_value, kr.unit_type, kr.target_label)}
                                    </td>
                                    <td className="text-right py-2 px-3 font-medium">
                                      {formatValue(kr.current_value, kr.unit_type, kr.current_label)}
                                    </td>
                                    <td className="py-2 px-3">
                                      <ProgressBar value={progress} showLabel size="sm" />
                                    </td>
                                    <td className="py-2 text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => openKrModal(obj.id, kr)} title="Edit">
                                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                          </svg>
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleKrDelete(kr)} title="Delete">
                                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ObjectiveModal
        isOpen={objModalOpen}
        onClose={() => setObjModalOpen(false)}
        editingObj={editingObj}
        form={objForm}
        setForm={setObjForm}
        departments={departments}
        onSubmit={handleObjSubmit}
        saving={saving}
      />

      <KeyResultModal
        isOpen={krModalOpen}
        onClose={() => setKrModalOpen(false)}
        editingKr={editingKr}
        form={krForm}
        setForm={setKrForm}
        onSubmit={handleKrSubmit}
        saving={saving}
      />
    </div>
  );
}
