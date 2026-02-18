import { XRequest } from '@/src/types';
import { Card, Badge, Avatar } from '@/src/components/ui';
import { X_REQUEST_STATUS_OPTIONS } from '@/src/lib/constants';

interface RequestCardProps {
  request: XRequest;
  onStatusChange: (id: number, status: XRequest['status']) => void;
  onDelete: (id: number) => void;
}

function statusOption(status: XRequest['status']) {
  return X_REQUEST_STATUS_OPTIONS.find(o => o.value === status) ?? X_REQUEST_STATUS_OPTIONS[0];
}

function ArrowIcon() {
  return (
    <svg className="w-4 h-4 text-[#9ca0a4] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

function DeptChip({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}

export function RequestCard({ request, onStatusChange, onDelete }: RequestCardProps) {
  const opt = statusOption(request.status);
  const nextStatuses = X_REQUEST_STATUS_OPTIONS.filter(o => o.value !== request.status);

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Desktop */}
      <div className="hidden md:flex items-start gap-4 px-5 py-4">
        {/* From → To */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <div className="flex flex-col gap-1">
            {request.requesting_department && (
              <DeptChip name={request.requesting_department.name} color={request.requesting_department.color} />
            )}
            {request.requesting_user && (
              <div className="flex items-center gap-1 pl-1">
                <Avatar
                  src={request.requesting_user.avatar_url}
                  name={request.requesting_user.name}
                  size="xs"
                />
                <span className="text-xs text-[#6d6e6f]">{request.requesting_user.name}</span>
              </div>
            )}
            {request.requesting_project && (
              <span className="text-xs text-[#9ca0a4] pl-1 truncate max-w-[140px]">
                {request.requesting_project.name}
              </span>
            )}
          </div>

          <ArrowIcon />

          <div className="flex flex-col gap-1">
            {request.target_department && (
              <DeptChip name={request.target_department.name} color={request.target_department.color} />
            )}
            {request.target_user && (
              <div className="flex items-center gap-1 pl-1">
                <Avatar
                  src={request.target_user.avatar_url}
                  name={request.target_user.name}
                  size="xs"
                />
                <span className="text-xs text-[#6d6e6f]">{request.target_user.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="flex-1 text-sm text-[#1e1f21] line-clamp-3 min-w-0">{request.description}</p>

        {/* Status + actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative group">
            <Badge dot color={opt.color}>{opt.label}</Badge>
            <div className="absolute right-0 top-full mt-1 z-10 hidden group-hover:block bg-white rounded-md shadow-lg border border-[#e8ecee] py-1 min-w-[130px]">
              {nextStatuses.map(s => (
                <button
                  key={s.value}
                  onClick={() => onStatusChange(request.id, s.value as XRequest['status'])}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#1e1f21] hover:bg-[#f6f8f9] flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => onDelete(request.id)}
            className="p-1.5 text-[#9ca0a4] hover:text-[#f06a6a] hover:bg-[#fff0f0] rounded transition-colors"
            title="Delete request"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {request.requesting_department && (
              <DeptChip name={request.requesting_department.name} color={request.requesting_department.color} />
            )}
            <ArrowIcon />
            {request.target_department && (
              <DeptChip name={request.target_department.name} color={request.target_department.color} />
            )}
          </div>
          <button
            onClick={() => onDelete(request.id)}
            className="p-1.5 text-[#9ca0a4] hover:text-[#f06a6a] hover:bg-[#fff0f0] rounded transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {(request.requesting_user || request.target_user) && (
          <div className="flex items-center gap-3 text-xs text-[#6d6e6f]">
            {request.requesting_user && (
              <div className="flex items-center gap-1">
                <Avatar src={request.requesting_user.avatar_url} name={request.requesting_user.name} size="xs" />
                <span>{request.requesting_user.name}</span>
              </div>
            )}
            {request.requesting_user && request.target_user && <ArrowIcon />}
            {request.target_user && (
              <div className="flex items-center gap-1">
                <Avatar src={request.target_user.avatar_url} name={request.target_user.name} size="xs" />
                <span>{request.target_user.name}</span>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-[#1e1f21]">{request.description}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge dot color={opt.color}>{opt.label}</Badge>
          {nextStatuses.map(s => (
            <button
              key={s.value}
              onClick={() => onStatusChange(request.id, s.value as XRequest['status'])}
              className="text-xs text-[#4573d2] hover:underline"
            >
              → {s.label}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
