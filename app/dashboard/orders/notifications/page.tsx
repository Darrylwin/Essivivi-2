/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useOrders } from "@/lib/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BellIcon,
  CheckIcon,
  ExternalLinkIcon,
  FilterIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  MailIcon,
  PackageIcon,
  TruckIcon,
  AlertCircleIcon,
  RefreshCwIcon,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadNotificationsCount,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isNotificationsLoading,
  } = useOrders();

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.lue;
    if (filter === "read") return notification.lue;
    return true;
  });

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du marquage comme lu");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'nouvelle_commande':
        return <PackageIcon className="h-5 w-5 text-blue-600" />;
      case 'livraison_assignee':
        return <TruckIcon className="h-5 w-5 text-indigo-600" />;
      case 'livraison_terminee':
        return <CheckIcon className="h-5 w-5 text-green-600" />;
      case 'commande_annulee':
        return <AlertCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <MailIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'nouvelle_commande':
        return "bg-blue-50 text-blue-700";
      case 'livraison_assignee':
        return "bg-indigo-50 text-indigo-700";
      case 'livraison_terminee':
        return "bg-green-50 text-green-700";
      case 'commande_annulee':
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Gérez vos notifications système ({notifications.length} total, {unreadNotificationsCount} non lues)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadNotificationsCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllNotificationsAsRead}
                disabled={isNotificationsLoading}
              >
                {isNotificationsLoading ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckIcon className="mr-2 h-4 w-4" />
                )}
                Tout marquer lu
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadNotifications()}
              disabled={isNotificationsLoading}
            >
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-1">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              Toutes
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
            >
              <EyeOffIcon className="mr-2 h-3 w-3" />
              Non lues
            </Button>
            <Button
              variant={filter === "read" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("read")}
            >
              <EyeIcon className="mr-2 h-3 w-3" />
              Lues
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        {isNotificationsLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <BellIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "Vous n'avez pas encore de notifications."
                  : filter === "unread"
                  ? "Vous n'avez pas de notifications non lues."
                  : "Vous n'avez pas de notifications lues."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all ${!notification.lue ? "border-blue-200 bg-blue-50/30" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getNotificationColor(notification.type)}`}
                          >
                            {notification.type.replace('_', ' ')}
                          </Badge>
                          {!notification.lue && (
                            <Badge variant="default" className="text-xs">
                              Nouveau
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(notification.created_at)}
                        </div>
                      </div>
                      
                      <h4 className="font-semibold">{notification.titre}</h4>
                      
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      
                      {notification.commande_id && (
                        <div className="flex items-center gap-2 text-sm">
                          <ExternalLinkIcon className="h-3 w-3" />
                          <Button
                            variant="link"
                            className="h-auto p-0"
                            onClick={() => router.push(`/orders/${notification.commande_id}`)}
                          >
                            Voir la commande #{notification.commande_id}
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 pt-2">
                        {!notification.lue && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <CheckIcon className="mr-2 h-3 w-3" />
                            Marquer comme lu
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}