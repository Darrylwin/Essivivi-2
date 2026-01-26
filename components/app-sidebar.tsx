"use client"

import * as React from "react"
import {
  Users,
  UserCircle,
  Truck,
  Package,
  ShoppingCart,
  Layers,
  Camera,
  FileText,
  Code,
  PackageCheck,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Just Him",
    email: "just@him.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Tableau de bord",
      url: "/dashboard/overvicatetableew",
      icon: Layers,
    },
    {
      title: "Agents",
      url: "/dashboard/agents",
      icon: Users,
    },
    {
      title: "Clients",
      url: "/dashboard/clients",
      icon: UserCircle,
    },
    {
      title: "Produits",
      url: "/dashboard/products",
      icon: Package,
    },
    {
      title: "Catégories",
      url: "/dashboard/categories",
      icon: Layers,
    },
    {
      title: "Commandes",
      url: "/dashboard/orders",
      icon: ShoppingCart,
    },
    {
      title: "Livraisons",
      url: "/dashboard/deliveries",
      icon: PackageCheck,
    },
    {
      title: "Tricycles",
      url: "/dashboard/tricycles",
      icon: Truck,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: Camera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Propositions actives",
          url: "#",
        },
        {
          title: "Archivées",
          url: "#",
        },
      ],
    },
    {
      title: "Propositions",
      icon: FileText,
      url: "#",
      items: [
        {
          title: "Propositions actives",
          url: "#",
        },
        {
          title: "Archivées",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: Code,
      url: "#",
      items: [
        {
          title: "Prompts actifs",
          url: "#",
        },
        {
          title: "Archivés",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [],
  documents: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard/overview">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <span className="text-base font-semibold">Essivivi Admin</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}