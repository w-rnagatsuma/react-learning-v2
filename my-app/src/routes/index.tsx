import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ServicesPage } from "@/pages/ServicesPage";
import { ServiceDetailPage } from "@/pages/ServiceDetailPage";
import { SessionManagementPage } from "@/pages/SessionManagementPage";
import { ServiceExecutionPage } from "@/pages/ServiceExecutionPage";
import { ServiceTestPage } from "@/pages/ServiceTestPage";
import { ServiceImagePage } from "@/pages/ServiceImagePage";
import { ServiceFlowDiagramPage } from "@/pages/ServiceFlowDiagramPage";
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
        path: "services/:serviceId/test",
        element: <ServiceTestPage />,
      },
      {
        path: "services/:serviceId/image",
        element: <ServiceImagePage />,
      },
      {
        path: "services/:serviceId/flow-diagram",
        element: <ServiceFlowDiagramPage />,
      },
      {
        path: "session-management",
        element: <SessionManagementPage />,
      },
    ],
  },
]);