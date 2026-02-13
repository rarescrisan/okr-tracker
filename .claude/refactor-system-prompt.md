# Refactoring System Prompt

This document provides guidelines for refactoring and maintaining code quality in the novo-dri-tracker project. Follow these principles when writing or refactoring code.

## 1. Error Handling

**Always use try-catch blocks with proper error handling for side effects.**

### Good Example
```typescript
async function fetchUserData(userId: number) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new Error('Unable to load user data. Please try again.');
  }
}
```

### Bad Example
```typescript
async function fetchUserData(userId: number) {
  const response = await fetch(`/api/users/${userId}`);
  return await response.json();
}
```

### Guidelines
- Always wrap async operations in try-catch blocks
- Provide meaningful error messages for debugging
- Re-throw errors with user-friendly messages when appropriate
- Log errors for monitoring and debugging
- Handle specific error types when possible

## 2. Separation of Concerns

**Keep side effects and API calls in separate lib folders.**

### Structure
```
src/
├── app/
│   └── admin/
│       └── users/
│           ├── page.tsx              # UI component only
│           └── lib/
│               └── api.ts            # API calls isolated here
```

### Good Example
```typescript
// src/app/admin/users/lib/api.ts
export async function fetchUsers() {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// src/app/admin/users/page.tsx
import { fetchUsers } from './lib/api';

export default async function UsersPage() {
  const users = await fetchUsers();
  return <UserList users={users} />;
}
```

### Bad Example
```typescript
// src/app/admin/users/page.tsx
export default async function UsersPage() {
  const response = await fetch('/api/users');  // API call directly in component
  const users = await response.json();
  return <UserList users={users} />;
}
```

## 3. Function Length and Complexity

**Break up long functions into utilities.**

### Guidelines
- Functions should ideally be under 50 lines
- If a function does multiple things, split it into smaller functions
- Extract complex logic into utility functions
- Place utilities in a `utils` folder at the appropriate level

### Good Example
```typescript
// src/app/admin/projects/utils/calculations.ts
export function calculateProjectProgress(tasks: Task[]): number {
  const completedTasks = tasks.filter(task => task.status === 'completed');
  return (completedTasks.length / tasks.length) * 100;
}

export function calculateTimeRemaining(endDate: Date): number {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// src/app/admin/projects/page.tsx
import { calculateProjectProgress, calculateTimeRemaining } from './utils/calculations';

function ProjectCard({ project, tasks }: Props) {
  const progress = calculateProjectProgress(tasks);
  const daysRemaining = calculateTimeRemaining(new Date(project.end_date));

  return (
    <Card>
      <ProgressBar value={progress} />
      <p>{daysRemaining} days remaining</p>
    </Card>
  );
}
```

## 4. Component Size and Composition

**Keep components short and focused. Break them into smaller, importable components.**

### Guidelines
- Components should ideally be under 150 lines
- If a component has multiple sections, extract them into separate components
- Create a `components` folder at the appropriate level for local components
- Keep JSX readable by extracting complex rendering logic

### Good Example
```typescript
// src/app/admin/projects/components/ProjectCard.tsx
export function ProjectCard({ project }: Props) {
  return (
    <Card>
      <ProjectHeader project={project} />
      <ProjectMetrics project={project} />
      <ProjectActions project={project} />
    </Card>
  );
}

// src/app/admin/projects/components/ProjectHeader.tsx
export function ProjectHeader({ project }: Props) {
  return (
    <div className="flex items-center justify-between">
      <h3>{project.name}</h3>
      <Badge status={project.status} />
    </div>
  );
}

// src/app/admin/projects/components/ProjectMetrics.tsx
export function ProjectMetrics({ project }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Metric label="Progress" value={`${project.progress_percentage}%`} />
      <Metric label="Priority" value={project.priority} />
    </div>
  );
}

// src/app/admin/projects/components/ProjectActions.tsx
export function ProjectActions({ project }: Props) {
  return (
    <div className="flex gap-2">
      <Button variant="outline">Edit</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  );
}
```

### Bad Example
```typescript
// src/app/admin/projects/page.tsx - 300+ line component with everything inline
export function ProjectsPage() {
  return (
    <div>
      {/* 50 lines of header code */}
      {/* 100 lines of table code */}
      {/* 50 lines of modal code */}
      {/* 100 lines of form code */}
    </div>
  );
}
```

## 5. Locality of Behavior

**Keep code near the point of execution. Code should live at the deepest level possible in the directory structure.**

### Principle
The level of a piece of code (lib, util, component, state, etc.) indicates its scope of usage:
- Code at a given level should only be used by code at that level or below
- Code used by multiple siblings should be moved up one directory level
- This helps engineers understand the impact radius when making changes

### Next.js-Specific File Placement

This project uses **Next.js 16 with App Router**. Understanding where different types of files belong is crucial for maintainability.

#### Server vs Client Components
```typescript
// ✅ Server Component (default in App Router) - NO 'use client' directive
// src/app/admin/projects/page.tsx
import { fetchProjects } from './lib/api';

export default async function ProjectsPage() {
  const projects = await fetchProjects(); // Server-side data fetching
  return <ProjectList projects={projects} />;
}

// ✅ Client Component - HAS 'use client' directive
// src/app/admin/projects/components/ProjectFilters.tsx
'use client';

import { useState } from 'react';

export function ProjectFilters() {
  const [status, setStatus] = useState('all');
  // Client-side interactivity, hooks, event handlers
  return <FilterUI status={status} onChange={setStatus} />;
}
```

#### Route Organization
```
src/app/
├── api/                           # API Route Handlers
│   └── projects/
│       ├── route.ts              # GET, POST /api/projects
│       └── [id]/route.ts         # GET, PUT, DELETE /api/projects/:id
├── admin/                         # Admin pages (Server Components by default)
│   └── projects/
│       ├── page.tsx              # Server Component - data fetching
│       ├── loading.tsx           # Loading UI
│       ├── error.tsx             # Error boundary
│       ├── components/           # Feature-specific components
│       │   ├── ProjectFilters.tsx    # Client Component
│       │   └── ProjectTable.tsx      # Could be Server or Client
│       ├── lib/
│       │   └── api.ts            # Server-side API calls
│       └── [id]/
│           └── page.tsx          # Nested route
└── (presentation)/                # Public routes
    └── okr/
        └── page.tsx
```

### Component Folder vs UI Kit

Understanding the distinction between feature components and UI kit components is essential:

#### UI Kit (`src/components/ui/`)
**Purpose**: Reusable, design-system primitives with **zero business logic**

```
src/components/ui/
├── Button.tsx          # Generic button with variants
├── Input.tsx           # Generic input field
├── Card.tsx            # Generic card container
├── Modal.tsx           # Generic modal wrapper
├── Select.tsx          # Generic select/dropdown
├── Badge.tsx           # Generic badge
├── ProgressBar.tsx     # Generic progress bar
└── index.ts            # Barrel export
```

**Characteristics**:
- Pure presentational components
- Accept generic props (variant, size, color, onClick, etc.)
- No API calls, no business logic, no domain knowledge
- Highly reusable across the entire application
- Think of these as your "design system building blocks"

**Example**:
```typescript
// ✅ GOOD - Generic UI component
// src/components/ui/Button.tsx
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick
}: ButtonProps) {
  return (
    <button
      className={buttonStyles[variant][size]}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// ❌ BAD - Business logic in UI kit
// src/components/ui/SaveProjectButton.tsx
export function SaveProjectButton({ project }: Props) {
  const handleSave = async () => {
    await saveProject(project); // ❌ Business logic!
  };
  return <button onClick={handleSave}>Save Project</button>;
}
```

#### Feature Components (`src/app/[route]/components/`)
**Purpose**: Business logic, domain-specific components

```
src/app/admin/projects/
├── components/
│   ├── ProjectCard.tsx          # Uses project domain logic
│   ├── ProjectFilters.tsx       # Project-specific filtering
│   ├── ProjectForm.tsx          # Project creation/editing
│   └── DeleteProjectButton.tsx  # Project-specific action
```

**Characteristics**:
- Contains business/domain logic
- May fetch data or make API calls
- Uses UI kit components as building blocks
- Specific to a feature or route
- Not intended for reuse outside the feature (unless moved up)

**Example**:
```typescript
// ✅ GOOD - Feature component using UI kit
// src/app/admin/projects/components/ProjectCard.tsx
import { Card, Badge, ProgressBar, Button } from '@/src/components/ui';

export function ProjectCard({ project }: Props) {
  const handleDelete = async () => {
    await deleteProject(project.id); // ✅ Business logic OK here
  };

  return (
    <Card>
      <h3>{project.name}</h3>
      <Badge status={project.status} />
      <ProgressBar value={project.progress_percentage} />
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </Card>
  );
}
```

#### Decision: UI Kit vs Feature Component

```
Is this component generic and reusable with NO business logic?
  └─ YES → Put it in src/components/ui/
  └─ NO → Is it specific to one feature/route?
           └─ YES → Put it in that feature's components/ folder
           └─ NO → Is it shared by multiple features?
                    └─ YES → Put it in shared/components/ at the appropriate level
```

### State Management and Locality

State should follow the same locality principle as components:

#### 1. Local Component State
**Scope**: Single component
**Tool**: `useState`, `useReducer`
**Location**: Directly in the component file

```typescript
// ✅ Local state stays in component
// src/app/admin/projects/components/ProjectFilters.tsx
'use client';

import { useState } from 'react';

export function ProjectFilters() {
  const [status, setStatus] = useState('all');    // ✅ Only this component needs it
  const [priority, setPriority] = useState('P1'); // ✅ Stays local

  return <FilterUI status={status} priority={priority} />;
}
```

#### 2. Shared State Within a Feature
**Scope**: Multiple components in the same feature
**Tool**: Custom hooks, React Context
**Location**: `hooks/` or `context/` folder within the feature

```
src/app/admin/projects/
├── page.tsx
├── components/
│   ├── ProjectList.tsx           # Uses useProjectFilters
│   ├── ProjectFilters.tsx        # Uses useProjectFilters
│   └── ProjectToolbar.tsx        # Uses useProjectFilters
├── hooks/
│   └── useProjectFilters.ts      # ✅ Shared state for projects feature only
└── context/
    └── ProjectContext.tsx        # ✅ Alternative: Context provider
```

**Custom Hook Example**:
```typescript
// ✅ GOOD - Feature-scoped hook
// src/app/admin/projects/hooks/useProjectFilters.ts
'use client';

import { useState, useCallback } from 'react';

export function useProjectFilters() {
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [search, setSearch] = useState('');

  const resetFilters = useCallback(() => {
    setStatus('all');
    setPriority('all');
    setSearch('');
  }, []);

  return {
    status,
    priority,
    search,
    setStatus,
    setPriority,
    setSearch,
    resetFilters,
  };
}

// Used in multiple components within projects/
// src/app/admin/projects/components/ProjectList.tsx
import { useProjectFilters } from '../hooks/useProjectFilters';

export function ProjectList() {
  const { status, priority, search } = useProjectFilters();
  // Filter projects based on state
}
```

**Context Example**:
```typescript
// ✅ GOOD - Feature-scoped context
// src/app/admin/projects/context/ProjectContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <ProjectContext.Provider value={{
      selectedProjects,
      setSelectedProjects,
      viewMode,
      setViewMode
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjectContext = () => useContext(ProjectContext);

// src/app/admin/projects/layout.tsx
import { ProjectProvider } from './context/ProjectContext';

export default function ProjectsLayout({ children }) {
  return <ProjectProvider>{children}</ProjectProvider>;
}
```

#### 3. Shared State Across Features (Same Section)
**Scope**: Multiple features within a section (e.g., all admin pages)
**Tool**: Custom hooks, React Context
**Location**: `shared/hooks/` or `shared/context/` within that section

```
src/app/admin/
├── projects/
│   └── page.tsx                  # Uses useAdminAuth
├── users/
│   └── page.tsx                  # Uses useAdminAuth
├── objectives/
│   └── page.tsx                  # Uses useAdminAuth
└── shared/
    ├── hooks/
    │   └── useAdminAuth.ts       # ✅ Shared across all admin pages
    └── context/
        └── AdminContext.tsx      # ✅ Admin-wide state
```

#### 4. Global Application State
**Scope**: Used across the entire application (admin + presentation routes)
**Tool**: Zustand, Redux, Jotai, or global Context
**Location**: `src/store/` or `src/state/` at the root level

```
src/
├── app/
│   ├── admin/                    # Uses global state
│   └── (presentation)/           # Uses global state
├── components/
└── store/                        # ✅ Global state management
    ├── userStore.ts              # User/auth state (used everywhere)
    ├── themeStore.ts             # Theme state (used everywhere)
    └── index.ts
```

**Zustand Example**:
```typescript
// ✅ GOOD - Global user store
// src/store/userStore.ts
import { create } from 'zustand';

interface UserStore {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  setCurrentUser: (user) => set({
    currentUser: user,
    isAuthenticated: !!user
  }),
}));

// Used anywhere in the app
// src/app/admin/projects/page.tsx
import { useUserStore } from '@/src/store/userStore';

export function ProjectsPage() {
  const currentUser = useUserStore(state => state.currentUser);
  // ...
}
```

**Redux Example**:
```typescript
// ✅ GOOD - Global Redux store
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    theme: themeReducer,
  },
});

// src/store/userSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: { currentUser: null },
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
});
```

#### State Management Decision Tree

```
Where is this state used?

└─ Single component?
   └─ YES → useState/useReducer in component ✅

└─ Multiple components in same feature?
   └─ YES → Custom hook or Context in feature/hooks/ or feature/context/ ✅

└─ Multiple features in same section (e.g., admin)?
   └─ YES → Custom hook or Context in section/shared/hooks/ ✅

└─ Across entire app (admin + presentation)?
   └─ YES → Zustand/Redux/Global Context in src/store/ ✅
```

#### State Management Anti-Patterns

❌ **Global State for Feature-Specific Data**
```typescript
// ❌ BAD - Project filters don't need to be global
// src/store/projectFiltersStore.ts
export const useProjectFiltersStore = create((set) => ({
  status: 'all',
  priority: 'all',
  // Only used in admin/projects/ - should be local!
}));
```

✅ **Feature-Local State**
```typescript
// ✅ GOOD - Keep it local
// src/app/admin/projects/hooks/useProjectFilters.ts
export function useProjectFilters() {
  const [status, setStatus] = useState('all');
  // Only used in this feature - stays here
}
```

❌ **Context Provider Too High in Tree**
```typescript
// ❌ BAD - ProjectContext wrapping entire app
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <ProjectContext.Provider>  {/* ❌ Too high! */}
      {children}
    </ProjectContext.Provider>
  );
}
```

✅ **Context Provider at Appropriate Level**
```typescript
// ✅ GOOD - ProjectContext wrapping only projects section
// src/app/admin/projects/layout.tsx
export default function ProjectsLayout({ children }) {
  return (
    <ProjectProvider>  {/* ✅ Right level! */}
      {children}
    </ProjectProvider>
  );
}
```

❌ **Premature Global State**
```typescript
// ❌ BAD - Creating global store before knowing it's needed elsewhere
// src/store/taskStore.ts - Only used in projects/[id]/
export const useTaskStore = create(...);
```

✅ **Start Local, Promote When Needed**
```typescript
// ✅ GOOD - Start in feature, promote only when reused
// src/app/admin/projects/[id]/hooks/useTasks.ts
export function useTasks() { ... }

// Later, if tasks are needed in multiple features:
// Move to: src/app/admin/shared/hooks/useTasks.ts

// Later still, if needed across admin + presentation:
// Move to: src/store/taskStore.ts
```

### Directory Structure Example
```
src/app/admin/
├── projects/
│   ├── page.tsx
│   ├── components/
│   │   ├── ProjectCard.tsx        # Only used in projects/
│   │   └── ProjectFilters.tsx     # Only used in projects/
│   ├── hooks/
│   │   └── useProjectFilters.ts   # State shared within projects/
│   ├── lib/
│   │   └── api.ts                 # Project-specific API calls
│   ├── utils/
│   │   └── calculations.ts        # Project-specific calculations
│   └── [id]/
│       ├── page.tsx
│       ├── components/
│       │   └── TaskList.tsx       # Only used in projects/[id]/
│       ├── hooks/
│       │   └── useTasks.ts        # State for project detail page
│       └── utils/
│           └── taskHelpers.ts     # Only used in projects/[id]/
├── users/
│   ├── page.tsx
│   ├── components/
│   │   └── UserCard.tsx           # Only used in users/
│   └── lib/
│       └── api.ts                 # User-specific API calls
└── shared/                         # Used by multiple admin pages
    ├── components/
    │   └── AdminTable.tsx         # Shared by projects/ and users/
    ├── hooks/
    │   └── useAdminAuth.ts        # Shared state for admin section
    └── utils/
        └── formatters.ts          # Shared utilities

src/
├── components/
│   └── ui/                        # Global UI kit
│       ├── Button.tsx
│       ├── Card.tsx
│       └── index.ts
└── store/                         # Global application state
    ├── userStore.ts               # Used across entire app
    └── themeStore.ts              # Used across entire app
```

### Decision Tree for Code Placement

```
Is the code used by only ONE component/page?
  └─ YES → Place it in the same directory as that component
  └─ NO → Is it used by multiple components in the same feature?
           └─ YES → Place it in a shared folder within that feature
           └─ NO → Is it used across multiple features in the same section (e.g., admin)?
                    └─ YES → Place it in a shared folder at that section level
                    └─ NO → Place it in the global src/lib/ or src/components/
```

### Examples

#### Example 1: Component Only Used in One Place
```
src/app/admin/projects/[id]/
├── page.tsx
└── components/
    └── TaskProgressChart.tsx  # Only projects/[id]/page.tsx uses this
```

#### Example 2: Component Used by Siblings
```
src/app/admin/projects/
├── page.tsx                   # Uses ProjectStatusBadge
├── [id]/
│   └── page.tsx              # Uses ProjectStatusBadge
└── components/
    └── ProjectStatusBadge.tsx # Moved up because both siblings use it
```

#### Example 3: Utility Used Across Admin Section
```
src/app/admin/
├── projects/
│   └── page.tsx              # Uses formatDate
├── users/
│   └── page.tsx              # Uses formatDate
└── shared/
    └── utils/
        └── formatters.ts     # Moved to admin/shared/ because used by multiple admin pages
```

#### Example 4: Global Utilities
```
src/
├── lib/
│   └── constants.ts          # Used across entire app (admin + presentation)
└── components/
    └── ui/                   # Used across entire app
        └── Button.tsx
```

### Benefits of Locality

1. **Reduced Cognitive Load**: Engineers know that code in `projects/utils/` only affects the projects feature
2. **Easier Refactoring**: Moving or deleting a feature is safe - just delete the folder
3. **Better Collaboration**: Team members can work on different features without conflicts
4. **Clear Impact Radius**: When editing `projects/[id]/utils/taskHelpers.ts`, you know it only affects the project detail page
5. **Prevents Over-Abstraction**: Code is only moved up when actually needed by multiple consumers

### Anti-Patterns to Avoid

❌ **Premature Abstraction**
```
src/lib/projectHelpers.ts  # Created "just in case" but only used in one place
```

✅ **Start Local, Move Up When Needed**
```
src/app/admin/projects/utils/helpers.ts  # Start here, move up only when reused
```

❌ **Flat Structure**
```
src/components/
├── ProjectCard.tsx
├── ProjectHeader.tsx
├── ProjectMetrics.tsx
├── ProjectActions.tsx
├── UserCard.tsx
├── UserAvatar.tsx
└── ... (100 more files)
```

✅ **Hierarchical Structure**
```
src/app/admin/
├── projects/
│   └── components/
│       ├── ProjectCard.tsx
│       ├── ProjectHeader.tsx
│       └── ...
└── users/
    └── components/
        ├── UserCard.tsx
        └── UserAvatar.tsx
```

## Summary Checklist

When writing or refactoring code, ask yourself:

### Error Handling & Side Effects
- [ ] Are all side effects wrapped in try-catch blocks?
- [ ] Are API calls isolated in lib folders?
- [ ] Do error messages provide useful debugging information?

### Code Organization
- [ ] Are functions under 50 lines? If not, can they be broken down?
- [ ] Are components under 150 lines? If not, can sections be extracted?
- [ ] Is this code at the deepest possible level in the directory structure?
- [ ] If I delete the parent folder, would this code be orphaned or is it truly local to this feature?
- [ ] Am I creating abstractions because I need them now, or "just in case"?

### Next.js Specific
- [ ] Is this a Server Component by default, or does it need 'use client'?
- [ ] Are data fetching operations in Server Components or lib/api.ts?
- [ ] Are interactive features (onClick, useState, etc.) in Client Components?

### Component Classification
- [ ] Is this a generic UI primitive (→ src/components/ui/) or feature-specific (→ feature/components/)?
- [ ] Does this UI component have zero business logic?
- [ ] Am I using UI kit components as building blocks in feature components?

### State Management
- [ ] Is this state used by only one component (→ useState in component)?
- [ ] Is this state shared within a feature (→ custom hook or context in feature/hooks/)?
- [ ] Is this state shared across a section (→ section/shared/hooks/)?
- [ ] Is this state truly global across the app (→ src/store/)?
- [ ] Am I placing my Context Provider at the right level in the component tree?
- [ ] Am I creating global state prematurely before it's proven to be needed elsewhere?

## Applying These Rules

### When Refactoring Existing Code
1. Start with the deepest components first
2. Extract long functions into utils at the same level
3. Break large components into smaller ones in a local components folder
4. Move API calls to lib folders
5. Extract shared state into hooks/context at the appropriate level
6. Only move code up the tree when you see it's used by siblings
7. Add try-catch blocks to all side effects
8. Identify if components should be Server or Client Components
9. Move generic UI components to src/components/ui/ if they have no business logic

### When Writing New Code
1. Start by placing code in the most specific location possible
2. Default to Server Components unless you need interactivity
3. Use 'use client' only when necessary (hooks, event handlers, browser APIs)
4. Keep state local to components initially (useState)
5. Only promote state to hooks/context when multiple components need it
6. Only use global state (Zustand/Redux) when truly needed across the app
7. Only generalize components to UI kit when reused without business logic
8. Follow the decision trees for code placement, component classification, and state management
9. Keep the summary checklist in mind

### Refactoring Decision Priority
When you encounter a large, complex component, refactor in this order:
1. **Error handling** - Add try-catch blocks first
2. **Extract API calls** - Move to lib/api.ts
3. **Extract utilities** - Move complex logic to utils/
4. **Break down component** - Split into smaller components
5. **Extract state** - Create hooks/context if state is shared
6. **Classify components** - Separate UI primitives from feature components
7. **Apply locality** - Ensure everything is at the right level in the directory tree
