import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ServicesPage } from "@/pages/ServicesPage";
import { ServiceDetailPage } from "@/pages/ServiceDetailPage";
import { ServiceManagementPage } from "@/pages/ServiceManagementPage";
import { ServiceExecutionPage } from "@/pages/ServiceExecutionPage";
import { AppShell } from "@/components/AppShell";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/services/:serviceId/execute",
    element: <ServiceExecutionPage />,
  },
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "services",
        element: <ServicesPage />,
      },
      {
        path: "services/:serviceId",
        element: <ServiceDetailPage />,
      },
      {
        path: "service-management",
        element: <ServiceManagementPage />,
      },
    ],
  },
]);