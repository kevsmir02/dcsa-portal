import { LucideIcon } from 'lucide-react';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    role_label: string;
    avatar?: string;
    [key: string]: unknown;
}

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface School {
    name: string;
    short_name: string;
    system_name: string;
    address?: string;
    contact_number?: string;
    email?: string;
    school_id?: string;
}

export interface Quarter {
    id: number;
    number: number;
    name: string;
    is_locked: boolean;
}

export interface ActiveSemester {
    id: number;
    name: string;
    term: number;
    school_year: { id: number; name: string };
    quarters: Quarter[];
}

export interface SharedData {
    name: string;
    school: School;
    activeSemester: ActiveSemester | null;
    auth: Auth;
    flash: { success: string | null; error: string | null };
    [key: string]: unknown;
}

/** A Laravel length-aware paginator, as Inertia serialises it. */
export interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

export interface ComponentWeights {
    written_work: number;
    performance_task: number;
    quarterly_assessment: number;
}

/** One row of the DepEd default weight table, as `ComponentWeights::depedDefaults()` sends it. */
export interface WeightPreset {
    label: string;
    ww: number;
    pt: number;
    qa: number;
}
