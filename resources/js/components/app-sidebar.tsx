import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData, type UserRole } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookMarked, ClipboardList, FileBarChart, GraduationCap, LayoutGrid, Library, Settings, UserCheck, Users } from 'lucide-react';
import AppLogo from './app-logo';

/** Each role sees only the parts of the portal it is responsible for. */
const navByRole: Record<UserRole, NavItem[]> = {
    admin: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        { title: 'Students', url: '/admin/students', icon: Users },
        { title: 'Teachers', url: '/admin/teachers', icon: UserCheck },
        { title: 'Subjects', url: '/admin/subjects', icon: Library },
        { title: 'Sections', url: '/admin/sections', icon: BookMarked },
        { title: 'Enrollment', url: '/admin/enrollment', icon: ClipboardList },
        { title: 'Grades', url: '/admin/grades', icon: GraduationCap },
        { title: 'Reports', url: '/reports', icon: FileBarChart },
        { title: 'Settings', url: '/admin/settings', icon: Settings },
    ],
    teacher: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        { title: 'My Classes', url: '/teacher/classes', icon: ClipboardList },
    ],
    student: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        { title: 'My Grades', url: '/student/grades', icon: GraduationCap },
    ],
};

export function AppSidebar() {
    const { auth, activeSemester } = usePage<SharedData>().props;
    const items = navByRole[auth.user?.role ?? 'student'];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={items} />
            </SidebarContent>

            <SidebarFooter>
                {activeSemester && (
                    <div className="text-muted-foreground border-sidebar-border mx-2 mb-1 rounded-md border border-dashed px-2.5 py-2 text-[11px] leading-tight group-data-[collapsible=icon]:hidden">
                        <div className="text-foreground font-semibold">{activeSemester.name}</div>
                        <div>S.Y. {activeSemester.school_year.name}</div>
                    </div>
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
