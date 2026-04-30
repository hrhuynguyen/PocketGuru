import { useMutation, useQuery, useQueryClient, } from '@tanstack/react-query';
import { apiFetch, apiUpload } from './api';
const keys = {
    me: ['me'],
    documents: ['documents'],
    document: (id) => ['document', id],
    attempt: (id) => ['attempt', id],
};
export function useMe() {
    return useQuery({
        queryKey: keys.me,
        queryFn: () => apiFetch('/auth/me'),
        staleTime: 5 * 60_000,
    });
}
export function useLogout() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => apiFetch('/auth/logout', { method: 'POST' }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: keys.me });
            qc.invalidateQueries({ queryKey: keys.documents });
        },
    });
}
export function useDocumentList() {
    return useQuery({
        queryKey: keys.documents,
        queryFn: () => apiFetch('/documents'),
    });
}
export function useDocument(id) {
    return useQuery({
        queryKey: id ? keys.document(id) : ['document', 'none'],
        queryFn: () => apiFetch(`/documents/${id}`),
        enabled: Boolean(id) && id !== 'sample',
    });
}
export function useProcess() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ file, title, onUploadProgress }) => {
            const fd = new FormData();
            fd.append('file', file);
            if (title)
                fd.append('title', title);
            return apiUpload('/process', fd, onUploadProgress);
        },
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: keys.documents });
            qc.setQueryData(keys.document(data.document_id), data);
        },
    });
}
export function useRenameDocument() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, title }) => apiFetch(`/documents/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ title }),
            headers: { 'Content-Type': 'application/json' },
        }),
        onSuccess: (updated, { id }) => {
            qc.invalidateQueries({ queryKey: keys.documents });
            qc.invalidateQueries({ queryKey: keys.document(id) });
            qc.setQueryData(keys.documents, (prev) => prev
                ? {
                    ...prev,
                    items: prev.items.map((it) => it.id === updated.id ? { ...it, title: updated.title } : it),
                }
                : prev);
        },
    });
}
export function useDeleteDocument() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiFetch(`/documents/${id}`, { method: 'DELETE' }),
        onSuccess: (_data, id) => {
            qc.invalidateQueries({ queryKey: keys.documents });
            qc.removeQueries({ queryKey: keys.document(id) });
            qc.setQueryData(keys.documents, (prev) => prev ? { ...prev, items: prev.items.filter((it) => it.id !== id) } : prev);
        },
    });
}
export function useSubmitAttempt() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body) => apiFetch('/attempts', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: keys.documents });
        },
    });
}
export function useAttempt(id) {
    return useQuery({
        queryKey: id ? keys.attempt(id) : ['attempt', 'none'],
        queryFn: () => apiFetch(`/attempts/${id}`),
        enabled: Boolean(id) && id !== 'sample',
    });
}
