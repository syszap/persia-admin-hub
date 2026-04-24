import { memo } from 'react';
import { Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PERMISSION_COLUMNS, type Role } from '../types';

interface RoleTableProps {
  roles: Role[];
  onToggle: (roleId: string, permKey: string) => void;
  onDelete: (roleId: string) => void;
}

const RoleTable = memo(({ roles, onToggle, onDelete }: RoleTableProps) => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="min-w-[120px] text-xs font-medium text-muted-foreground">نقش</TableHead>
          {PERMISSION_COLUMNS.map((col) => (
            <TableHead key={col.key} className="text-center min-w-[100px] text-xs font-medium text-muted-foreground">
              {col.label}
            </TableHead>
          ))}
          <TableHead className="w-16 text-xs font-medium text-muted-foreground">حذف</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id} className="hover:bg-muted/30 transition-colors">
            <TableCell className="font-medium text-sm">{role.name}</TableCell>
            {PERMISSION_COLUMNS.map((col) => (
              <TableCell key={col.key} className="text-center">
                <Checkbox
                  checked={role.permissions[col.key]}
                  onCheckedChange={() => onToggle(role.id, col.key)}
                />
              </TableCell>
            ))}
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-destructive"
                onClick={() => onDelete(role.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
));
RoleTable.displayName = 'RoleTable';

export default RoleTable;
