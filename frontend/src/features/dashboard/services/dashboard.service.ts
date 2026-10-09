import { api } from "@/lib/api";

import type {
    ResumoDashboard,
} from '@/features/dashboard/types/dashboard';

export function obterResumoDashboard() {
    return api.get<ResumoDashboard>(
        '/dashboard',
    );
}