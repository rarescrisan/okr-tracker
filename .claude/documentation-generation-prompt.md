# Repository Documentation Generation Prompt

**Purpose**: Use this prompt in any repository to generate comprehensive technical documentation placed in a  `/docs` folder.

**How to use**: Copy this entire prompt and paste it into Claude Code (or any AI assistant) at the root of your target repository.

---

# Generate Complete Technical Documentation

I need you to analyze this codebase and generate comprehensive technical documentation in a `/docs` folder. Follow the structure and style guidelines below to create professional, maintainable documentation.

## Document Suite Overview

**Flexibility**: Not all documents are needed for every repository. Use the guidance below to determine which documents to create based on your repository type and characteristics.

### Document Selection Guide

| Document | Repository Types | Create When... |
|----------|-----------------|----------------|
| **README.md** | All | Always - serves as documentation hub |
| **00-Glossary-and-Terms.md** | Domain-specific apps | System has specialized terminology, acronyms, or industry-specific concepts |
| **01-System-Architecture-Overview.md** | All applications | Always - every system needs architecture docs |
| **02-Database-Architecture.md** | Apps with databases | Repository uses databases (SQL, NoSQL, ORM models exist) |
| **03-API-Specifications.md** | APIs, backends | System exposes APIs (REST, GraphQL, gRPC, etc.) |
| **04-Business-Workflows.md** | Business applications | System implements multi-step business processes |
| **05-Automated-Processes.md** | Systems with crons | System has scheduled jobs, background tasks, or automation |
| **06-User-Journeys.md** | Customer-facing apps | System has end-user interactions and UX flows |
| **07-External-Integrations.md** | Systems with deps | System integrates with third-party services or APIs |
| **08-Feature-Set-and-Capabilities.md** | All applications | System has features to catalog (skip for simple libraries) |

### Quick Decision Tree

```
Does the repo have specialized terminology?
  → Yes: Create 00-Glossary-and-Terms.md

Does the repo have database models?
  → Yes: Create 02-Database-Architecture.md
  → No: Skip

Does the repo expose APIs?
  → Yes: Create 03-API-Specifications.md
  → No: Skip (unless it's a library - then create API Reference)

Does the repo have multi-step workflows?
  → Yes: Create 04-Business-Workflows.md
  → No: Skip

Does the repo have cron jobs or scheduled tasks?
  → Yes: Create 05-Automated-Processes.md
  → No: Skip or create minimal doc stating "No automated processes"

Does the repo have customer-facing UX?
  → Yes: Create 06-User-Journeys.md
  → No: Skip

Does the repo integrate with external services?
  → Yes: Create 07-External-Integrations.md
  → No: Skip or create minimal doc stating "No external dependencies"
```

---

## Document Templates

Create the following documents in the `/docs` folder based on the selection guide above:

### 📋 README.md - Documentation Hub
**Required for**: All repositories
**Purpose**: Central navigation and quick reference guide

**Required sections**:
1. **Header**: Title, last updated date, version, purpose
2. **Table of Contents**: Links to all documents with one-line descriptions
3. **Quick Navigation by Role**:
   - For Product/Business: Which docs help understand features and workflows
   - For Engineering: Which docs help understand technical architecture
   - For Operations: Which docs help with daily operations
   - For Security/Compliance: Which docs cover security and compliance
4. **Quick Answers Section**: Common questions with direct links to relevant sections
5. **System Statistics**: Scale metrics, technology versions, key numbers
6. **System Components**: High-level diagram of main services/modules
7. **Key Data Flows**: Brief overview of 2-3 most important workflows
8. **Core Database Tables**: Quick reference table (if applicable)
9. **External Service Dependencies**: List with criticality levels
10. **Critical Daily Operations**: Timeline of automated processes (if applicable)
11. **Learning Path**: Recommended reading order for new team members
12. **Known Limitations & Future Work**: Current gaps and roadmap
13. **Getting Help**: How to use the docs and get support
14. **Document History**: Version history table
15. **Completeness Checklist**: What's documented vs what's not

### 📖 00-Glossary-and-Terms.md
**Required for**: Domain-specific applications with specialized terminology
**Optional for**: Simple applications, generic libraries

**Purpose**: Define all specialized terms, acronyms, and domain concepts

**Required sections**:
1. **Domain/Industry Terms**: Terminology specific to the domain (e.g., lending, healthcare, e-commerce)
2. **Product-Specific Terms**: Terms unique to this product/system
3. **System Components**: Names and purposes of major components
4. **Technical Terms**: Technical patterns and concepts used
5. **Business Workflow Terms**: Process-related terminology
6. **External Services**: Third-party services and their purposes
7. **Common Acronyms**: Acronym reference table
8. **Usage Examples**: Example sentences showing terms in context
9. **Document Conventions**: Naming patterns, formats, standards

**Discovery strategy**:
- Find enums and constants (often contain domain terminology)
- Look for README or docs with domain explanations
- Check model/entity names for domain concepts
- Look for comments explaining business terms
- Find configuration with service names
- Check for industry-specific calculations or logic

**When to skip**: Simple CRUD apps, generic utilities, or repos with self-explanatory terminology

---

### 🏗️ 01-System-Architecture-Overview.md
**Required for**: All applications
**Purpose**: High-level technical architecture and design decisions

**Required sections**:
1. **System Overview**: What the system does, scale, and purpose
2. **Service Architecture**: High-level service map with ASCII diagram showing:
   - Client layer
   - API/application layer
   - Data layer
   - Background processes
   - External integrations
3. **Component Diagram**: Detailed breakdown of core components and their responsibilities
4. **Data Flow Architecture**:
   - Request-response flow (synchronous)
   - Event-driven flow (asynchronous, if applicable)
5. **Integration Map**: ASCII diagram showing all external services and their purposes
6. **Technology Layers**: Layered architecture diagram showing:
   - Presentation layer (API, REST, GraphQL, etc.)
   - Application layer (business logic, auth)
   - Integration layer (external service adapters)
   - Data layer (database, cache, message queue)
7. **Deployment Architecture**: Infrastructure diagram (cloud provider, containers, etc.)
8. **Key Architectural Decisions**: For each major decision:
   - What was decided
   - Why it was chosen
   - Benefits and trade-offs
   - Example use cases
9. **System Boundaries**: What's in scope vs out of scope
10. **Performance Characteristics**: Response times, throughput, SLAs
11. **Summary**: Key highlights and design principles

**Discovery strategy**:
- Find main entry point files (server.js, main.py, cmd/main.go, etc.)
- Locate package.json, requirements.txt, go.mod, pom.xml for dependencies
- Check docker-compose.yml, Dockerfile, kubernetes configs
- Find configuration files (config/, .env.example)
- Identify framework and version
- Map imports to understand service dependencies
- Look for message queue usage (Kafka, RabbitMQ, SQS, etc.)
- Find cache usage (Redis, Memcached)
- Identify deployment artifacts

### 🗄️ 02-Database-Architecture.md
**Required for**: Applications with databases
**Optional for**: Stateless services, static sites, pure libraries
**Purpose**: Complete data model and database design

**Required sections**:
1. **Database Overview**: Type (SQL/NoSQL), version, scale
2. **Complete Entity Relationship Diagram**: ASCII or Mermaid diagram showing:
   - All tables/collections
   - Relationships (one-to-many, many-to-many)
   - Cardinality
3. **Table Schemas**: For each table/collection:
   - Table name and purpose
   - All columns with types
   - Primary keys
   - Foreign keys
   - Indexes
   - Constraints
   - Example data
4. **Key Relationships**: Explanation of important entity relationships
5. **Indexing Strategy**: What's indexed and why
6. **Data Migration Patterns**: How schema changes are managed
7. **Query Patterns**: Common queries and their performance considerations
8. **Data Lifecycle**: How data is created, updated, and archived/deleted

**Discovery strategy**:
- Find ORM/ODM models (TypeORM, Sequelize, Mongoose, SQLAlchemy, Django models, GORM, etc.)
- Locate migration files (migrations/, db/migrate/, alembic/)
- Check schema definition files (schema.prisma, schema.sql)
- Find database config (database.yml, ormconfig.js)
- Look for seed data or fixtures
- Identify database query files (repositories, DAOs)

### 🔌 03-API-Specifications.md
**Required for**: Backend APIs, web services, GraphQL/REST endpoints
**Optional for**: Frontend-only apps, CLI tools (create "Command Reference" instead)
**Purpose**: Complete API reference with examples

**Required sections**:
1. **API Overview**:
   - Endpoint URL
   - Protocol (REST, GraphQL, gRPC)
   - Content types
   - API variants (client, admin, internal)
2. **Authentication**:
   - Auth mechanism (JWT, OAuth, API keys)
   - Token format and validation flow
   - Example headers
3. **API Operations**: Group by category, for each endpoint document:
   - **Endpoint name and description**
   - **HTTP method and path** (or GraphQL query/mutation)
   - **Request format**: Headers, parameters, body with example JSON
   - **Response format**: Success response with example JSON
   - **Authorization requirements**: What roles/permissions needed
   - **Validation rules**: Input constraints
   - **Error responses**: Possible error codes and examples
4. **Common Types**: Shared data types, enums, interfaces
5. **Error Responses**: Standard error format and common error codes
6. **Rate Limits**: Limits per endpoint and time window
7. **Pagination**: How pagination works (if applicable)
8. **Webhooks**: Incoming webhooks if any
9. **Summary**: API characteristics and key operations

**Discovery strategy**:
- Find route definitions (routes/, controllers/, resolvers/)
- Locate GraphQL schema files (schema.graphql, *.graphql)
- Find REST controller files (@Controller, @RestController, router.get, etc.)
- Check for OpenAPI/Swagger definitions (swagger.json, openapi.yaml)
- Locate middleware for auth and validation
- Find request/response DTOs or types
- Check for rate limiting configuration
- Look for API versioning strategy

### 📊 04-Business-Workflows.md
**Required for**: Business applications with multi-step processes
**Optional for**: Simple CRUD apps, libraries, utilities
**Purpose**: End-to-end process flows with sequence diagrams

**Required sections**:
1. **Overview**: List of key workflows with frequency and criticality
2. **For Each Major Workflow**:
   - **Title and description**
   - **Timeline**: How long it takes
   - **Actors**: Who/what is involved (users, services, external systems)
   - **Sequence Diagram**: ASCII diagram showing step-by-step flow between actors
   - **Step-by-Step Breakdown**: Detailed explanation of each step:
     - Who performs the action
     - What happens
     - Duration
     - What data is involved
     - Database changes
     - External API calls
     - Events emitted
     - Error handling
   - **Example scenarios**: Happy path and edge cases
3. **State Transitions**: How entities move through different states
4. **Critical Path**: What must succeed for workflow to complete
5. **Summary**: Workflow timing table and key characteristics

**Discovery strategy**:
- Find service orchestration code (services/, use-cases/, handlers/)
- Locate state machine implementations
- Check for saga/workflow patterns
- Find event emitters and consumers
- Look for status/state enums
- Identify transaction boundaries
- Map multi-step processes in controllers/services
- Find webhook handlers

### ⏰ 05-Automated-Processes.md
**Required for**: Systems with scheduled jobs, cron tasks, background workers
**Optional for**: Request-only systems with no automation
**Purpose**: Scheduled jobs, cron tasks, and background processes

**Required sections**:
1. **Overview**: Total number of jobs, schedules, monitoring approach
2. **Daily Schedule**: Timeline view of when jobs run
3. **For Each Automated Job**:
   - **Job name and ID**
   - **Schedule**: Cron expression or frequency
   - **Purpose**: What it does and why
   - **Duration**: Expected runtime
   - **Dependencies**: What it depends on (other jobs, external services)
   - **Process flow**: Step-by-step breakdown
   - **Monitoring**: How it's monitored
   - **Failure handling**: What happens on failure, retry logic
   - **Impact**: What breaks if this fails
4. **Job Dependencies**: Graph showing which jobs depend on others
5. **Monitoring and Alerting**: How jobs are monitored
6. **Troubleshooting**: Common issues and solutions

**Discovery strategy**:
- Find cron job definitions (crontab, kubernetes CronJob)
- Locate scheduled task files (node-cron, APScheduler, celery beat)
- Check for background job processors (Bull, Sidekiq, Celery)
- Find queue configurations
- Look for task/job definitions
- Check monitoring/logging setup
- Identify job scheduling configuration

**Note**: If the repository has no scheduled jobs, create a minimal document stating "This system does not currently use scheduled/automated processes. All operations are triggered by user actions or external events."

---

### 👤 06-User-Journeys.md
**Required for**: Customer-facing applications with UX flows
**Optional for**: Backend-only APIs, libraries, internal tools

**Purpose**: End-to-end customer experience from their perspective

**Required sections**:
1. **Overview**: List of key user journeys and their purposes
2. **Journey Map Overview**: Visual diagram showing how journeys connect
3. **For Each Major Journey**:
   - **Journey title and description**
   - **Persona**: Who is this user (new customer, admin, repeat user)
   - **Goal**: What they're trying to accomplish
   - **Entry point**: How they start this journey
   - **Journey map**: Step-by-step with touchpoints:
     - Stage name
     - User actions
     - System responses
     - Channels (web, mobile, email, SMS)
     - User emotions/thoughts
     - Pain points
     - Opportunities for improvement
   - **Success criteria**: What does success look like
   - **Time to complete**: Expected duration
   - **Visual flow diagram**: ASCII or Mermaid diagram
4. **Touchpoint Summary**: All system touchpoints across journeys
5. **User Feedback**: Common issues or requests (if available)
6. **Journey Analytics**: Key metrics (completion rates, drop-off points)

**Discovery strategy**:
- Find frontend routes and pages
- Locate form components and validation
- Check authentication/signup flows
- Find email templates (user communications)
- Look for analytics event tracking
- Check notification/messaging code
- Find user state management
- Look for onboarding flows
- Check help/support documentation

**When to skip**: Backend-only services, internal tools with no end-user UX, pure APIs

---

### 🔗 07-External-Integrations.md
**Required for**: Systems with external service dependencies
**Optional for**: Self-contained applications
**Purpose**: Third-party services and external dependencies

**Required sections**:
1. **Overview**: Total count, service dependency map
2. **Service Dependency Map**: ASCII diagram showing all external services
3. **For Each Integration**:
   - **Service name and purpose**
   - **Integration type**: REST API, SDK, webhook, etc.
   - **Authentication method**: API key, OAuth, etc.
   - **Key operations**: What we do with this service
   - **API calls**: Examples of requests/responses
   - **Webhooks**: Incoming webhooks we handle
   - **Data flow**: What data goes in/out
   - **Failure modes**: What happens when it's down
   - **Fallback strategy**: How we handle failures
   - **Cost implications**: Pricing model if known
   - **Rate limits**: Any known limits
   - **Environment**: Sandbox vs production
4. **Criticality Matrix**: Table showing which services are critical vs optional
5. **Cost Summary**: Overall integration costs if known
6. **Security Considerations**: How API keys are managed, data encryption

**Discovery strategy**:
- Find HTTP client instantiation (axios, fetch, requests, http packages)
- Locate environment variables for API keys (.env.example)
- Check for third-party SDK imports
- Find webhook route handlers
- Look for external service client classes
- Check configuration files for external URLs
- Identify OAuth flow implementations
- Find API credential management

**Note**: If there are no external integrations, create a minimal document stating "This system is self-contained with no external service dependencies beyond standard infrastructure (database, cache)."

---

### ✨ 08-Feature-Set-and-Capabilities.md
**Required for**: All applications
**Optional for**: Very simple libraries (create "Capabilities" doc instead)
**Purpose**: Complete catalog of what the system can do

**Required sections**:
1. **Overview**: Total feature count by category
2. **Feature Categories**: Organize features into logical groups:
   - User-facing features
   - Admin/operations features
   - Automated system capabilities
   - Security and compliance features
   - Integration features
3. **For Each Feature**:
   - **Feature name**
   - **Description**: What it does
   - **User type**: Who can use it (end user, admin, system)
   - **Implementation status**: Live, beta, planned
   - **Related endpoints**: API endpoints that power it
   - **Related workflows**: Which workflows use it
4. **Feature Availability Matrix**: Table showing which features are available to which user types
5. **Feature Dependencies**: Which features depend on others
6. **Current Backlog**: Planned features with timeline if known
7. **Deprecated Features**: Features being phased out

**Discovery strategy**:
- Map all API endpoints to features
- Find UI routes and pages (if full-stack)
- Locate feature flags (LaunchDarkly, custom flags)
- Check permission/authorization systems
- Find user role definitions
- Look for admin vs user separation
- Identify CRUD operations
- Check documentation in code comments

**Note**: If this is a library or framework, focus on capabilities and exported functions rather than "features."

## Documentation Style Guidelines

### Writing Standards
- ✅ **Be comprehensive**: Don't summarize, provide full details
- ✅ **Use examples**: Include code samples, JSON payloads, actual data
- ✅ **Create diagrams**: ASCII art for architecture, sequences, and flows
- ✅ **Think audience**: Write for different roles (engineers, product, ops)
- ✅ **Link extensively**: Cross-reference between documents
- ✅ **Be specific**: Use actual file paths, class names, function names
- ❌ **No assumptions**: Don't assume reader knows the domain
- ❌ **No placeholders**: Don't use "TODO" or "FIXME" - if uncertain, research more

### Formatting Standards

**Document header** (every document):
```markdown
# Document Title

**Last Updated**: YYYY-MM-DD
**Purpose**: One-line description of what this document covers

---
```

**Table of contents** (every document):
```markdown
## Table of Contents

1. [Section One](#section-one)
2. [Section Two](#section-two)
   - [Subsection](#subsection)
```

**ASCII diagrams**: Use for architecture, sequences, and flows
```
┌─────────────┐
│   Service   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Database   │
└─────────────┘
```

**Tables**: For comparisons and lists
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
```

**Code blocks**: Always specify language
```markdown
```json
{
  "example": "data"
}
```
```

**Document footer** (every document):
```markdown
---

**Document Status**: ✅ Complete / ⚠️ Partial / 🔄 In Progress
**For Questions**: [Guidance on where to find more info]
```

### Content Depth Guidelines

**Architecture docs**:
- Multiple diagrams showing different views
- Component interactions with arrows and labels
- Actual technology names and versions
- Deployment details with resource sizing
- Decision rationale for major choices

**API docs**:
- Full request/response examples with realistic data
- All possible error cases with error codes
- Authentication flow step-by-step
- Example curl commands or GraphQL queries
- Rate limits and quotas

**Workflow docs**:
- Sequence diagrams with all actors
- Step-by-step breakdowns with timing
- Database changes at each step
- Error handling paths
- Real-world examples

**Integration docs**:
- Purpose and usage patterns
- Authentication examples
- Sample API calls with responses
- Webhook payload examples
- Failure modes and fallbacks

## Execution Process

### Phase 1: Repository Analysis (Comprehensive Exploration)

**Use the Explore agent or systematic search to:**

1. **Identify repository type and technology**:
   - Primary language(s)
   - Framework(s) and versions
   - Architecture style (monolith, microservices, serverless, library)
   - Find: package.json, requirements.txt, go.mod, pom.xml, Cargo.toml, etc.

2. **Map file structure**:
   - Source code directory (src/, lib/, app/)
   - Configuration directory (config/, .env.example)
   - Database directory (migrations/, models/, entities/)
   - Test directory (test/, __tests__, spec/)
   - Documentation (if any existing docs)

3. **Find entry points**:
   - Main server file (server.js, main.py, main.go, Application.java)
   - Bootstrap/initialization files
   - Route/endpoint definitions

4. **Database layer**:
   - ORM/ODM files and models
   - Migration files
   - Database configuration
   - Seed data

5. **API layer**:
   - Route definitions
   - Controllers or resolvers
   - Request/response types
   - Middleware (auth, validation, rate limiting)
   - OpenAPI/Swagger specs if available

6. **Business logic**:
   - Service layer files
   - Use case implementations
   - Domain models
   - State machines or workflows

7. **Background processes**:
   - Cron job definitions
   - Queue processors
   - Scheduled task files
   - Worker processes

8. **External integrations**:
   - HTTP client instantiations
   - Third-party SDK usage
   - Webhook handlers
   - Environment variable usage

9. **Infrastructure**:
   - Docker files
   - Kubernetes configs
   - CI/CD pipeline files
   - Cloud provider configs (terraform, cloudformation)

### Phase 2: Document Generation

**For each document**:

1. **Create the file** in `/docs` folder
2. **Add header** with metadata (title, last updated, purpose)
3. **Add table of contents**
4. **Write comprehensive sections** based on discoveries:
   - Use actual code examples when relevant
   - Reference specific files and line numbers
   - Create diagrams based on actual architecture
   - Include real data examples
5. **Cross-reference** other documents where relevant
6. **Add summary section** at the end
7. **Add status footer**

**Generation order** (recommended):
1. Start with 00-Glossary-and-Terms.md (if needed - terminology foundation)
2. Then 01-System-Architecture-Overview.md (architecture foundation)
3. Then 02-Database-Architecture.md (if applicable - data model)
4. Then 03-API-Specifications.md (if applicable - interface)
5. Then 04-Business-Workflows.md (if applicable - processes)
6. Then 05-Automated-Processes.md (if applicable - automation)
7. Then 06-User-Journeys.md (if applicable - UX flows)
8. Then 07-External-Integrations.md (if applicable - dependencies)
9. Then 08-Feature-Set-and-Capabilities.md (feature catalog)
10. Finally README.md (navigation hub with links to everything)

### Phase 3: Quality Assurance

**Review checklist**:
- ✅ All files created in `/docs` folder
- ✅ Every document has header, TOC, and footer
- ✅ All cross-references work (links are valid)
- ✅ Diagrams are clear and accurate
- ✅ Examples use real data from the codebase
- ✅ No TODOs or placeholders
- ✅ README.md provides comprehensive navigation
- ✅ Style is consistent across all documents
- ✅ Code snippets have language specified
- ✅ Tables are properly formatted
- ✅ Document status is set appropriately

## Handling Different Repository Types

### Backend API Service
- Focus heavily on 03-API-Specifications.md
- Include detailed 04-Business-Workflows.md
- May have extensive 05-Automated-Processes.md
- Likely has 07-External-Integrations.md

### Frontend Application
- Lighten 02-Database-Architecture.md (might not have one)
- 03-API-Specifications.md covers consumed APIs
- 04-Business-Workflows.md focuses on user journeys
- Add UI component architecture to 01-System-Architecture-Overview.md
- 08-Feature-Set-and-Capabilities.md focuses on UI features

### Full-Stack Application
- All documents are relevant
- Show how frontend and backend connect
- Include both client and server architecture
- Document both UI features and API operations

### Library/Package
- 01-System-Architecture-Overview.md focuses on library design
- Skip or minimize 04-Business-Workflows.md
- 03-API-Specifications.md becomes "API Reference" for exported functions
- 08-Feature-Set-and-Capabilities.md focuses on library capabilities
- May skip 02-Database-Architecture.md if not applicable

### CLI Tool
- 01-System-Architecture-Overview.md focuses on command structure
- 03-API-Specifications.md becomes "Command Reference"
- 04-Business-Workflows.md shows command execution flows
- 08-Feature-Set-and-Capabilities.md lists all commands and options

## Special Instructions

### When Information is Missing or Unclear
- **Document what exists**: Focus on what you can find and verify
- **Flag uncertainties**: If you can't determine something, note it as "[TO VERIFY: reason]"
- **Make reasonable inferences**: Based on patterns in the code, but note these as inferences
- **Skip inapplicable sections**: If a section doesn't apply (e.g., no database), state this clearly

### For Large Codebases
- **Prioritize breadth first**: Cover all major areas before deep-diving
- **Use sampling**: Document representative examples rather than every single endpoint
- **Summarize patterns**: If there are 50 similar endpoints, document the pattern and a few examples
- **Link to code**: Use file references so readers can explore more

### For Small Codebases
- **Be thorough**: Document everything since the codebase is manageable
- **Include more examples**: Show actual code snippets liberally
- **Explain context**: Provide more background since the system is simpler

### For Legacy Codebases
- **Document what's there**: Don't focus on what should be refactored
- **Explain quirks**: If there are unusual patterns, explain why they exist
- **Show the current state**: Document the system as-is, not as you wish it were

## Success Criteria

Your documentation is successful if:

✅ **A new engineer** can read it and understand the system architecture in 1-2 hours
✅ **A product manager** can understand what features exist and how workflows operate
✅ **An SRE/DevOps engineer** can understand deployment, monitoring, and automated processes
✅ **A security auditor** can understand data flows, integrations, and authentication
✅ **The team** can use it as the single source of truth for system documentation
✅ **Anyone** can navigate to their question quickly using README.md navigation

## Adaptive Documentation Strategy

### Start with Repository Assessment

Before generating documents, answer these questions:

1. **What type of repository is this?**
   - Backend API, Frontend app, Full-stack, Library, CLI tool, Microservice

2. **What are the core characteristics?**
   - Has database? (→ Create 02-Database-Architecture.md)
   - Exposes APIs? (→ Create 03-API-Specifications.md)
   - Has workflows? (→ Create 04-Business-Workflows.md)
   - Has automation? (→ Create 05-Automated-Processes.md)
   - Customer-facing? (→ Create 06-User-Journeys.md)
   - External deps? (→ Create 07-External-Integrations.md)
   - Domain-specific? (→ Create 00-Glossary-and-Terms.md)

3. **What's the complexity level?**
   - Simple: Focus on essential docs (README, Architecture, API)
   - Medium: Add workflows, integrations, features
   - Complex: Create full suite including glossary, journeys, processes

### Example Document Sets by Repository Type

**Backend API Service**:
- ✅ README.md
- ✅ 00-Glossary-and-Terms.md (if domain-specific)
- ✅ 01-System-Architecture-Overview.md
- ✅ 02-Database-Architecture.md
- ✅ 03-API-Specifications.md
- ✅ 04-Business-Workflows.md
- ✅ 05-Automated-Processes.md
- ⚠️ 06-User-Journeys.md (skip - no direct user interaction)
- ✅ 07-External-Integrations.md
- ✅ 08-Feature-Set-and-Capabilities.md

**Frontend Application**:
- ✅ README.md
- ⚠️ 00-Glossary-and-Terms.md (if needed)
- ✅ 01-System-Architecture-Overview.md
- ⚠️ 02-Database-Architecture.md (skip or minimal - shows consumed APIs)
- ✅ 03-API-Specifications.md (documents APIs consumed)
- ✅ 04-Business-Workflows.md (user flows)
- ⚠️ 05-Automated-Processes.md (skip unless has frontend jobs)
- ✅ 06-User-Journeys.md (critical for frontend)
- ✅ 07-External-Integrations.md
- ✅ 08-Feature-Set-and-Capabilities.md

**Library/Package**:
- ✅ README.md
- ⚠️ 00-Glossary-and-Terms.md (if domain-specific)
- ✅ 01-System-Architecture-Overview.md (library design)
- ⚠️ 02-Database-Architecture.md (skip)
- ✅ 03-API-Specifications.md (exported functions/classes)
- ⚠️ 04-Business-Workflows.md (skip)
- ⚠️ 05-Automated-Processes.md (skip)
- ⚠️ 06-User-Journeys.md (skip)
- ⚠️ 07-External-Integrations.md (dependencies if any)
- ✅ 08-Feature-Set-and-Capabilities.md (library capabilities)

**CLI Tool**:
- ✅ README.md
- ⚠️ 00-Glossary-and-Terms.md (if needed)
- ✅ 01-System-Architecture-Overview.md (command architecture)
- ⚠️ 02-Database-Architecture.md (if has local DB)
- ✅ 03-API-Specifications.md → "Command Reference"
- ⚠️ 04-Business-Workflows.md (command execution flows)
- ⚠️ 05-Automated-Processes.md (skip)
- ⚠️ 06-User-Journeys.md (skip or minimal)
- ⚠️ 07-External-Integrations.md (if calls external APIs)
- ✅ 08-Feature-Set-and-Capabilities.md

---

## Final Notes

### Documentation Principles

- **Accuracy > Speed**: Take time to understand the codebase correctly
- **Examples > Descriptions**: Show don't tell - include real examples
- **Diagrams > Text**: Visualize architecture, flows, and relationships
- **Links > Repetition**: Cross-reference rather than duplicating information
- **Specific > Generic**: Use actual class names, file paths, and values
- **Complete > Perfect**: Cover everything even if some sections need future updates
- **Adapt > Force**: Create only the documents that make sense for this repository

### Quality Indicators

✅ **Good documentation**:
- Answers questions a new team member would have
- Includes concrete examples from the codebase
- Has clear navigation and cross-references
- Covers both technical and business perspectives
- Uses visual aids (diagrams, tables)
- Is accurate to the actual code

❌ **Poor documentation**:
- Generic descriptions that could apply to any system
- No code examples or specifics
- Forces a structure that doesn't fit
- Misses key aspects of the system
- Duplicates information without cross-referencing

---

**This prompt template was created by analyzing high-quality documentation at**: `/Users/rarescrisan/workbench/novo/lending/docs/`

**Includes patterns from**: 10 comprehensive documentation files including glossaries, architecture docs, API specs, workflows, user journeys, automated processes, integrations, and feature catalogs.

**Version**: 2.0
**Last Updated**: 2026-02-06
