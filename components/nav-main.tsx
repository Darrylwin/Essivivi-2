"use client"

import { type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  const pathname = usePathname() || "/"

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url + "/")

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={
                    "relative data-[active=true]:before:content-[''] data-[active=true]:before:absolute data-[active=true]:before:left-0 data-[active=true]:before:top-0 data-[active=true]:before:bottom-0 data-[active=true]:before:w-1.5 data-[active=true]:before:rounded-r-md data-[active=true]:before:bg-primary data-[active=true]:before:z-0"
                  }
                >
                  <a href={item.url} className="flex items-center gap-2 relative z-10">
                    {item.icon && <item.icon className="size-4" />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
