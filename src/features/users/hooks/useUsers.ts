import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import { queryKeys } from '@/lib/queryKeys';
import { STALE } from '@/app/providers';
import type { CreateUserPayload, User } from '../types';

const KEY = queryKeys.users.all();

export const useUsers = () =>
  useQuery({
    queryKey: KEY,
    queryFn: usersService.getAll,
    staleTime: STALE.medium, // user list is reference data — 5 min cache
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersService.create,
    // Optimistic insert — append a placeholder so the UI responds instantly
    onMutate: async (payload: CreateUserPayload) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<User[]>(KEY);

      qc.setQueryData<User[]>(KEY, (old = []) => [
        ...old,
        { id: '__optimistic__', createdAt: new Date().toISOString(), ...payload },
      ]);

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateUserPayload> }) =>
      usersService.update(id, payload),
    // Optimistic patch — merge changed fields into existing cache entry
    onMutate: async ({ id, payload }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<User[]>(KEY);

      qc.setQueryData<User[]>(KEY, (old = []) =>
        old.map((u) => (u.id === id ? { ...u, ...payload } : u)),
      );

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersService.remove,
    // Optimistic remove — immediately hide the row
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<User[]>(KEY);

      qc.setQueryData<User[]>(KEY, (old = []) => old.filter((u) => u.id !== id));

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
