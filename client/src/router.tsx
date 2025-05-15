import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { InvestmentProvider } from "./context/InvestmentContext";
import InvestorDashboard from "./pages/investor/Dashboard";
import InvestorHome from "./pages/investor/Home";
import Transaction from "./pages/transactions";

const SignIn = lazy(() => import("./pages/auth/Sign-in"));
const SignUp = lazy(() => import("./pages/auth/Sign-up"));
const Home = lazy(() => import("./pages/index"));

const router = createBrowserRouter([
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/investor",
    element: (
      <InvestmentProvider>
        <ProtectedRoute>
          <InvestorHome />
        </ProtectedRoute>
      </InvestmentProvider>
    ),
  },
  {
    path: "/investor/dashboard",
    element: (
      <InvestmentProvider>
        <InvestorDashboard />
      </InvestmentProvider>
    ),

  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/transactions",
    element: (
      <ProtectedRoute>
        <Transaction />
      </ProtectedRoute>
    ),
  },
]);

export default router;
