'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Modal, Input, Textarea, Select, Checkbox, Badge, ProgressBar } from '@/src/components/ui';
import { PageHeader } from '@/src/components/layout';
import { Department, Objective, KeyResult } from '@/src/types';
import { UNIT_TYPE_OPTIONS, DIRECTION_OPTIONS } from '@/src/lib/constants';
import { calculateProgress, formatValue, formatInputDate } from '@/src/lib/utils';

export default function ObjectivesPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');

  // Objective modal
  const [objModalOpen, setObjModalOpen] = useState(false);
  const [editingObj, setEditingObj] = useState<Objective | null>(null);
  const [objForm, setObjForm] = useState({
    department_id: '',
    code: '',
    title: '',
    description: '',
    is_top_objective: false,
  });

  // KR modal
  const [krModalOpen, setKrModalOpen] = useState(false);
  const [editingKr, setEditingKr] = useState<KeyResult | null>(null);
  const [krObjectiveId, setKrObjectiveId] = useState<number | null>(null);
  const [krForm, setKrForm] = useState({
    code: '',
    title: '',
    description: '',
    baseline_value: '',
    baseline_label: '',
    target_value: '',
    target_label: '',
    current_value: '',
    current_label: '',
    unit_type: 'number' as 'number' | 'currency' | 'percentage',
    direction: 'increase' as 'increase' | 'decrease',
    target_date: '',
    is_top_kr: false,
  });

  const [saving, setSaving] = useState(false);
  const [expandedObjs, setExpandedObjs] = useState<Set<number>>(new Set());

  const fetchData = async () => {
    try {
      const [deptsRes, objsRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/objectives'),
      ]);
      const [depts, objs] = await Promise.all([deptsRes.json(), objsRes.json()]);
      setDepartments(depts.data || []);
      setObjectives(objs.data || []);
      // Expand all by default
      setExpandedObjs(new Set((objs.data || []).map((o: Objective) => o.id)));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredObjectives = selectedDeptId === 'all'
    ? objectives
    : objectives.filter(o => o.department_id === parseInt(selectedDeptId));

  // Group objectives by department
  const objectivesByDept = filteredObjectives.reduce((acc, obj) => {
    const deptId = obj.department_id;
    if (!acc[deptId]) acc[deptId] = [];
    acc[deptId].push(obj);
    return acc;
  }, {} as Record<number, Objective[]>);

  const toggleExpand = (objId: number) => {
    const newExpanded = new Set(expandedObjs);
    if (newExpanded.has(objId)) {
      newExpanded.delete(objId);
    } else {
      newExpanded.add(objId);
    }
    setExpandedObjs(newExpanded);
  };

  // Objective CRUD
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
      setObjForm({
        department_id: deptId?.toString() || '',
        code: '',
        title: '',
        description: '',
        is_top_objective: false,
      });
    }
    setObjModalOpen(true);
  };

  const handleObjSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objForm.department_id || !objForm.code || !objForm.title) return;

    setSaving(true);
    try {
      const url = editingObj ? `/api/objectives/${editingObj.id}` : '/api/objectives';
      const method = editingObj ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...objForm,
          department_id: parseInt(objForm.department_id),
        }),
      });

      await fetchData();
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
      await fetch(`/api/objectives/${obj.id}`, { method: 'DELETE' });
      await fetchData();
    } catch (error) {
      console.error('Error deleting objective:', error);
    }
  };

  // KR CRUD
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
      setKrForm({
        code: '',
        title: '',
        description: '',
        baseline_value: '',
        baseline_label: '',
        target_value: '',
        target_label: '',
        current_value: '0',
        current_label: '',
        unit_type: 'number',
        direction: 'increase',
        target_date: '',
        is_top_kr: false,
      });
    }
    setKrModalOpen(true);
  };

  const handleKrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!krForm.code || !krForm.title || !krForm.target_value) return;

    setSaving(true);
    try {
      const url = editingKr ? `/api/key-results/${editingKr.id}` : '/api/key-results';
      const method = editingKr ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...krForm,
          objective_id: krObjectiveId,
          baseline_value: krForm.baseline_value ? parseFloat(krForm.baseline_value) : null,
          target_value: parseFloat(krForm.target_value),
          current_value: parseFloat(krForm.current_value) || 0,
          target_date: krForm.target_date || null,
          is_top_kr: krForm.is_top_kr,
        }),
      });

      await fetchData();
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
      await fetch(`/api/key-results/${kr.id}`, { method: 'DELETE' });
      await fetchData();
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
                            className={`w-4 h-4 text-[#6d6e6f] transition-transform ${
                              expandedObjs.has(obj.id) ? 'rotate-90' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
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

      {/* Objective Modal */}
      <Modal
        isOpen={objModalOpen}
        onClose={() => setObjModalOpen(false)}
        title={editingObj ? 'Edit Objective' : 'Add Objective'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setObjModalOpen(false)}>Cancel</Button>
            <Button onClick={handleObjSubmit} loading={saving}>
              {editingObj ? 'Save Changes' : 'Add Objective'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleObjSubmit} className="space-y-4">
          <Select
            label="Department"
            options={departments.map(d => ({ value: d.id.toString(), label: d.name }))}
            value={objForm.department_id}
            onChange={(e) => setObjForm({ ...objForm, department_id: e.target.value })}
            placeholder="Select department"
            required
          />
          <Input
            label="Code"
            value={objForm.code}
            onChange={(e) => setObjForm({ ...objForm, code: e.target.value })}
            placeholder="e.g., E-O1"
            required
          />
          <Input
            label="Title"
            value={objForm.title}
            onChange={(e) => setObjForm({ ...objForm, title: e.target.value })}
            placeholder="Objective title"
            required
          />
          <Textarea
            label="Description"
            value={objForm.description}
            onChange={(e) => setObjForm({ ...objForm, description: e.target.value })}
            placeholder="Optional description"
          />
        </form>
      </Modal>

      {/* Key Result Modal */}
      <Modal
        isOpen={krModalOpen}
        onClose={() => setKrModalOpen(false)}
        title={editingKr ? 'Edit Key Result' : 'Add Key Result'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setKrModalOpen(false)}>Cancel</Button>
            <Button onClick={handleKrSubmit} loading={saving}>
              {editingKr ? 'Save Changes' : 'Add Key Result'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleKrSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Code"
              value={krForm.code}
              onChange={(e) => setKrForm({ ...krForm, code: e.target.value })}
              placeholder="e.g., KR1.1"
              required
            />
            <Select
              label="Unit Type"
              options={UNIT_TYPE_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
              value={krForm.unit_type}
              onChange={(e) => setKrForm({ ...krForm, unit_type: e.target.value as 'number' | 'currency' | 'percentage' })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1e1f21] mb-1">Direction</label>
            <div className="flex rounded-lg border border-[#e8ecee] overflow-hidden">
              {DIRECTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setKrForm({ ...krForm, direction: opt.value as 'increase' | 'decrease' })}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    krForm.direction === opt.value
                      ? 'bg-[#4573d2] text-white'
                      : 'bg-white text-[#6d6e6f] hover:bg-[#f6f8f9]'
                  }`}
                >
                  {opt.value === 'increase' ? '↑ ' : '↓ '}{opt.label}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Title"
            value={krForm.title}
            onChange={(e) => setKrForm({ ...krForm, title: e.target.value })}
            placeholder="Key result title"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Baseline Value"
              type="number"
              step="any"
              value={krForm.baseline_value}
              onChange={(e) => setKrForm({ ...krForm, baseline_value: e.target.value })}
              placeholder="Starting value"
            />
            <Input
              label="Baseline Label"
              value={krForm.baseline_label}
              onChange={(e) => setKrForm({ ...krForm, baseline_label: e.target.value })}
              placeholder="e.g., per month"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Value"
              type="number"
              step="any"
              value={krForm.target_value}
              onChange={(e) => setKrForm({ ...krForm, target_value: e.target.value })}
              placeholder="Target value"
              required
            />
            <Input
              label="Target Label"
              value={krForm.target_label}
              onChange={(e) => setKrForm({ ...krForm, target_label: e.target.value })}
              placeholder="e.g., per month"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Value"
              type="number"
              step="any"
              value={krForm.current_value}
              onChange={(e) => setKrForm({ ...krForm, current_value: e.target.value })}
              placeholder="Current progress"
            />
            <Input
              label="Target Date"
              type="date"
              value={krForm.target_date}
              onChange={(e) => setKrForm({ ...krForm, target_date: e.target.value })}
            />
          </div>
          <Checkbox
            label="Mark as Top KR (one per department, shown prominently)"
            checked={krForm.is_top_kr}
            onChange={(e) => setKrForm({ ...krForm, is_top_kr: e.target.checked })}
          />
        </form>
      </Modal>
    </div>
  );
}
