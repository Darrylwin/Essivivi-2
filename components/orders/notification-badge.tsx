"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BellIcon, CheckIcon, ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useOrders } from "@/lib/hooks/useOrders";
import { useRouter } from "next/navigation";
import type { Notification } from "@/lib/types";

export function NotificationBadge() {
  const router = useRouter();
  const {
    notifications,
    unreadNotificationsCount,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isNotificationsLoading,
  } = useOrders();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notification: Notification) => {
    await markNotificationAsRead(notification.id);
  };

  const handleViewNotification = (notification: Notification) => {
    handleMarkAsRead(notification);
    
    if (notification.commande_id) {
      router.push(`/orders/${notification.commande_id}`);
    } else if (notification.type === 'nouvelle_commande') {
      router.push('/orders');
    }
    
    setOpen(false);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM HH:mm", { locale: fr });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'nouvelle_commande':
        return '🛒';
      case 'livraison_assignee':
        return '🚚';
      case 'livraison_terminee':
        return '✅';
      case 'commande_annulee':
        return '❌';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'nouvelle_commande':
        return "text-blue-600 bg-blue-50";
      case 'livraison_assignee':
        return "text-indigo-600 bg-indigo-50";
      case 'livraison_terminee':
        return "text-green-600 bg-green-50";
      case 'commande_annulee':
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadNotificationsCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
              variant="destructive"
            >
              {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Notifications</h4>
            {unreadNotificationsCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllNotificationsAsRead}
                disabled={isNotificationsLoading}
              >
                {isNotificationsLoading ? (
                  <Loader2Icon className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <CheckIcon className="h-3 w-3 mr-1" />
                )}
                Tout marquer lu
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {unreadNotificationsCount} non lue(s)
          </div>
        </div>
        
        <Separator />
        
        <ScrollArea className="h-72">
          {isNotificationsLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <BellIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Aucune notification</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors hover:bg-muted ${!notification.lue ? "bg-muted/50" : ""}`}
                  onClick={() => handleViewNotification(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className={`text-xs font-medium px-2 py-1 rounded-full ${getNotificationColor(notification.type)}`}>
                          {notification.type.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(notification.created_at)}
                        </div>
                      </div>
                      <p className="text-sm font-medium">{notification.titre}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.commande_id && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <ExternalLinkIcon className="h-3 w-3" />
                          Voir la commande #{notification.commande_id}
                        </div>
                      )}
                    </div>
                    {!notification.lue && (
                      <div className="h-2 w-2 rounded-full bg-blue-600 mt-1"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => router.push('/orders/notifications')}
              >
                Voir toutes les notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}