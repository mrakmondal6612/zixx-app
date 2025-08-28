
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './hooks/AuthProvider';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GlobalLoadingProvider } from './hooks/GlobalLoading';

const router = createBrowserRouter([
  {
    path: '/*',
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
  },
]);

createRoot(document.getElementById('root')!).render(
  <GlobalLoadingProvider>
    <RouterProvider
      router={router}
      future={{ v7_startTransition: true }}
    />
  </GlobalLoadingProvider>
);
