import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Transaction from "./pages/transactions";
import { ProtectedRoute } from "./components/ProtectedRoute";

const SignIn = lazy(() => import("./pages/auth/Sign-in"));
const SignUp = lazy(() => import("./pages/auth/Sign-up"));
const Home = lazy(() => import("./pages/index"));
const Budgets = lazy(() => import("./pages/budgets"));
const Goals = lazy(() => import("./pages/goals"));

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
  {
    path: "/budgets",
    element: (
      <ProtectedRoute>
        <Budgets />
      </ProtectedRoute>
    ),
  },
  {
    path: "/goals",
    element: (
      <ProtectedRoute>
        <Goals />
      </ProtectedRoute>
    ),
  },
]);

export default router;
