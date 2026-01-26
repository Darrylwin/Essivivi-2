/**
 * =====================================================
 * API - Index
 * =====================================================
 * Export centralisé de tous les clients API
 *
 * @module lib/api
 * @version 1.0
 */

// Client principal
export * from "./client";

// Clients API par catégorie
export { authApi, AuthApi } from "./auth.api";
export { agentsApi, AgentsApi, tricyclesApi, TricyclesApi } from "./agents-tricycles.api";
export { clientsApi, ClientsApi } from "./clients.api";
export { ordersApi, OrdersApi } from "./orders.api";
export { productsApi, ProductsApi } from "./products.api";
export { categoriesApi, CategoriesApi } from "./categories.api";
export { toursApi, ToursApi, deliveriesApi, DeliveriesApi } from "./tours-deliveries.api";
export { trackingApi, TrackingApi, dashboardApi, DashboardApi } from "./tracking-dashboard.api";