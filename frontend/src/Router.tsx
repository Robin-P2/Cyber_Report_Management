import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import FileUpload from "./pages/FileUpload";
import ManageUsers from "./pages/ManageUsers";
import ManageCompanies from "./pages/ManageCompanies";
import SelfEvaluation from "./pages/SelfEvaluation";
const Router = [
    {
        path: "/login",
        element: <Login />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <Dashboard />,
            },
            {
                path: "/upload",
                element: <FileUpload />,
            },
            {
                path: "/manage-users",
                element: <ManageUsers/>
            },
            {
                path: "/manage-companies",
                element: <ManageCompanies />
            },
            {
                path: "/self-evaluation",
                element: <SelfEvaluation />
            },
        ],
    },
];

export default Router;
