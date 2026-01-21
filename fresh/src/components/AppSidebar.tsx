import { LayoutDashboard, Package, Users, ShoppingBag, Calendar, MapPin, FileText, Leaf, Megaphone } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const allMenuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["Admin", "Vendor","PathalogyVendor"] },
  { title: "Categories", url: "/categories", icon: Leaf, roles: ["Admin"] },
  // { title: "Service Offerings", url: "/service-offerings", icon: FileText, roles: ["Admin"] },
  { title: "Products", url: "/products", icon: Package, roles: ["Admin", "Vendor","PathalogyVendor"] },
  { title: "Vendors", url: "/vendors", icon: ShoppingBag, roles: ["Admin"] },
  { title: "Users", url: "/users", icon: Users, roles: ["Admin"] },
  { title: "Subscriptions", url: "/subscriptions", icon: Calendar, roles: ["Admin", "Vendor","PathalogyVendor"] },
  { title: "Communities", url: "/communities", icon: MapPin, roles: ["Admin",] },
  { title: "Reports", url: "/reports", icon: FileText, roles: ["Admin"] },
  { title: "Pathology", url: "/pathology-order-report", icon: FileText, roles: ["PathalogyVendor"] },
  { title: "Order Report", url: "/order-report", icon: FileText, roles: ["Admin", "Vendor"] },
  { title: "Marketing", url: "/marketing", icon: Megaphone, roles: ["Admin", "Vendor","PathalogyVendor"] },
];


export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const role = localStorage.getItem("role");
  const menuItems = allMenuItems.filter(item =>
    role ? item.roles.includes(role) : false
  );
  const isActive = (path: string) => currentPath === path;

  return (
    <>
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border py-4">
        <div className="flex flex-col items-center gap-2 px-4">
          <div className="flex items-center justify-center">
            {/* <Leaf className="h-5 w-5 text-primary-foreground" /> */}
            <img src="/public/images/logo.png" alt="logo" />
          </div>
          {!open && (
            <div className="flex flex-col items-center gap-2 px-4">
              <img src="/public/images/mini_logo.png" alt="logo" />
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    </>
  );
}
