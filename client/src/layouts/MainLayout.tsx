import { AppShell } from '../components/cashbook/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';

export default function MainLayout() {
  return (
    <ProtectedRoute>
      <AppShell />
    </ProtectedRoute>
  );
}
