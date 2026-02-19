import { Announcement } from '@/src/types';
import { Card, Avatar } from '@/src/components/ui';

interface AnnouncementCardProps {
  announcement: Announcement;
  onDelete: (id: number) => void;
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('default', { month: 'short', day: 'numeric' });
}

export function AnnouncementCard({ announcement, onDelete }: AnnouncementCardProps) {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Avatar name={announcement.author_name} size="sm" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-medium text-[#1e1f21]">{announcement.author_name}</span>
                {announcement.department && (
                  <DeptChip name={announcement.department.name} color={announcement.department.color} />
                )}
                <span className="text-xs text-[#9ca0a4]">{timeAgo(announcement.created_at)}</span>
              </div>
              <p className="text-sm text-[#1e1f21] whitespace-pre-line">{announcement.description}</p>
            </div>
          </div>

          <button
            onClick={() => onDelete(announcement.id)}
            className="p-1.5 text-[#9ca0a4] hover:text-[#f06a6a] hover:bg-[#fff0f0] rounded transition-colors shrink-0"
            title="Delete announcement"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
}
