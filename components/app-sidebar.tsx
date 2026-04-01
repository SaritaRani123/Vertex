import Link from "next/link"
import { LayoutDashboard, Building2, GraduationCap, BookOpen, CalendarDays, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/departments", label: "Departments", icon: Building2 },
  { href: "/programs", label: "Programs", icon: GraduationCap },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/semesters", label: "Semesters", icon: CalendarDays },
  { href: "/terms", label: "Terms", icon: Layers },
]

export function AppSidebar() {
  return (
    <aside className="flex h-full w-56 flex-col border-r bg-muted/30">
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-semibold">Programs Scheduling</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                "hover:bg-muted transition-colors"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
