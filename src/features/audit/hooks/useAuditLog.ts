import { useCallback } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { auditService } from '../services/audit.service';
import type { AuditLogInput } from '../types';

/**
 * Returns a `log` function that stamps the current actor's identity onto every
 * audit entry before handing it off to the batching service.
 *
 * Usage inside a mutation:
 *
 *   const { log } = useAuditLog();
 *   const deleteUser = useMutation({
 *     mutationFn: async (id) => {
 *       const before = queryClient.getQueryData(queryKeys.users.detail(id));
 *       await usersService.remove(id);
 *       log({ action: 'user.deleted', resource: 'user', resourceId: id, before });
 *     },
 *   });
 */
export const useAuditLog = () => {
  const user = useAuthStore((s) => s.user);

  const log = useCallback(
    (input: AuditLogInput): void => {
      if (!user) return;

      auditService.enqueue({
        id: crypto.randomUUID(),
        actorId: user.id,
        actorUsername: user.username,
        timestamp: new Date().toISOString(),
        ...input,
      });
    },
    [user],
  );

  return { log };
};
