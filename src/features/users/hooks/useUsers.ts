import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import type { CreateUserPayload } from '../types';

const KEY = ['users'];

export const useUsers = () =>
  useQuery({ queryKey: KEY, queryFn: usersService.getAll });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateUserPayload> }) =>
      usersService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
