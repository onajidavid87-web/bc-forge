import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import VestingScheduleView from './pages/VestingScheduleView';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/vesting" replace />} />
        <Route path="/vesting" element={<VestingScheduleView />} />
      </Route>
    </Routes>
  );
}
