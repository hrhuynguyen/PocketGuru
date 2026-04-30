import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { apiFetch, apiUpload } from './api';
import type { components } from './api-types';

export type DocumentList = components['schemas']['DocumentList'];
export type DocumentSummary = components['schemas']['DocumentSummary'];
export type ProcessResponse = components['schemas']['ProcessResponse'];
export type AttemptCreate = components['schemas']['AttemptCreate'];
export type AttemptResult = components['schemas']['AttemptResult'];
export type AttemptDetail = components['schemas']['AttemptDetail'];
export type MeResponse =
  | { anonymous: true }
  | {
      anonymous: false;
      email: string;
      name?: string | null;
      picture?: string | null;
    };
export type ProcessUpload = {
  file: File;
  title?: string;
  onUploadProgress?: (progress: number) => void;
};

const keys = {
  me: ['me'] as const,
  documents: ['documents'] as const,
  document: (id: string) => ['document', id] as const,
  attempt: (id: string) => ['attempt', id] as const,
};

export function useMe(): UseQueryResult<MeResponse, Error> {
  return useQuery({
    queryKey: keys.me,
    queryFn: () => apiFetch<MeResponse>('/auth/me'),
    staleTime: 5 * 60_000,
  });
}

export function useLogout(): UseMutationResult<void, Error, void> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.me });
      qc.invalidateQueries({ queryKey: keys.documents });
    },
  });
}

export function useDocumentList(): UseQueryResult<DocumentList, Error> {
  return useQuery({
    queryKey: keys.documents,
    queryFn: () => apiFetch<DocumentList>('/documents'),
  });
}

export function useDocument(
  id: string | undefined,
): UseQueryResult<ProcessResponse, Error> {
  return useQuery({
    queryKey: id ? keys.document(id) : ['document', 'none'],
    queryFn: () => apiFetch<ProcessResponse>(`/documents/${id}`),
    enabled: Boolean(id) && id !== 'sample',
  });
}

export function useProcess(): UseMutationResult<
  ProcessResponse,
  Error,
  ProcessUpload
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, title, onUploadProgress }) => {
      const fd = new FormData();
      fd.append('file', file);
      if (title) fd.append('title', title);
      return apiUpload<ProcessResponse>('/process', fd, onUploadProgress);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: keys.documents });
      qc.setQueryData(keys.document(data.document_id), data);
    },
  });
}

export function useRenameDocument(): UseMutationResult<
  DocumentSummary,
  Error,
  { id: string; title: string }
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }) =>
      apiFetch<DocumentSummary>(`/documents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: (updated, { id }) => {
      qc.invalidateQueries({ queryKey: keys.documents });
      qc.invalidateQueries({ queryKey: keys.document(id) });
      qc.setQueryData<DocumentList>(keys.documents, (prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((it) =>
                it.id === updated.id ? { ...it, title: updated.title } : it,
              ),
            }
          : prev,
      );
    },
  });
}

export function useDeleteDocument(): UseMutationResult<void, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiFetch<void>(`/documents/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: keys.documents });
      qc.removeQueries({ queryKey: keys.document(id) });
      qc.setQueryData<DocumentList>(keys.documents, (prev) =>
        prev ? { ...prev, items: prev.items.filter((it) => it.id !== id) } : prev,
      );
    },
  });
}

export function useSubmitAttempt(): UseMutationResult<
  AttemptResult,
  Error,
  AttemptCreate
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      apiFetch<AttemptResult>('/attempts', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.documents });
    },
  });
}

export function useAttempt(
  id: string | undefined,
): UseQueryResult<AttemptDetail, Error> {
  return useQuery({
    queryKey: id ? keys.attempt(id) : ['attempt', 'none'],
    queryFn: () => apiFetch<AttemptDetail>(`/attempts/${id}`),
    enabled: Boolean(id) && id !== 'sample',
  });
}
