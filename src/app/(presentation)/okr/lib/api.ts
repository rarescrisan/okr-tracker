import { Department, Objective, KeyResult } from '@/src/types';

export interface DepartmentWithObjectives extends Department {
  objectives: (Objective & { key_results: KeyResult[] })[];
  topKR?: KeyResult & { objective: Objective };
}

export async function fetchOKRData(): Promise<DepartmentWithObjectives[]> {
  try {
    const [deptsRes, objsRes] = await Promise.all([
      fetch('/api/departments'),
      fetch('/api/objectives'),
    ]);
    const [deptsData, objsData] = await Promise.all([deptsRes.json(), objsRes.json()]);

    const depts = deptsData.data || [];
    const objs = objsData.data || [];

    return depts.map((dept: Department) => {
      const deptObjectives = objs.filter((o: Objective) => o.department_id === dept.id);

      let topKR: (KeyResult & { objective: Objective }) | undefined;
      for (const obj of deptObjectives) {
        const topKeyResult = obj.key_results?.find((kr: KeyResult) => kr.is_top_kr);
        if (topKeyResult) {
          topKR = { ...topKeyResult, objective: obj };
          break;
        }
      }

      return { ...dept, objectives: deptObjectives, topKR };
    });
  } catch (error) {
    console.error('Error fetching OKR data:', error);
    throw new Error('Failed to load OKR data');
  }
}
