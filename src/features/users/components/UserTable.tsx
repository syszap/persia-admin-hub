import { memo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { User } from '../types';

const roleColors: Record<string, string> = {
  admin: 'bg-primary/10 text-primary border-primary/20',
  moderator: 'bg-warning/10 text-warning border-warning/20',
  user: 'bg-muted text-muted-foreground border-border',
};
const roleLabel: Record<string, string> = { admin: 'مدیر', moderator: 'ناظر', user: 'کاربر' };

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

const UserTable = memo(({ users, onEdit, onDelete }: UserTableProps) => (
  <Table>
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className="text-xs font-medium text-muted-foreground">نام</TableHead>
        <TableHead className="text-xs font-medium text-muted-foreground">ایمیل</TableHead>
        <TableHead className="text-xs font-medium text-muted-foreground">نقش</TableHead>
        <TableHead className="w-24 text-xs font-medium text-muted-foreground">عملیات</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {users.map((user) => (
        <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
          <TableCell className="font-medium text-sm">{user.name}</TableCell>
          <TableCell dir="ltr" className="text-right text-sm text-muted-foreground">
            {user.email}
          </TableCell>
          <TableCell>
            <Badge variant="outline" className={`${roleColors[user.role] ?? ''} text-xs font-medium`}>
              {roleLabel[user.role] ?? user.role}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => onEdit(user)}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-destructive"
                onClick={() => onDelete(user.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
));
UserTable.displayName = 'UserTable';

export default UserTable;
