import {React} from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import NotificationPage from './pages/NotificationPage';
import NewPasswordPage from './pages/NewPasswordPage';
import NavBar from './components/NavBar';

const App = () => {

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/home" element={<NotificationPage />} />
        <Route path="/new-password" element={<NewPasswordPage />} />
        {/* ログインページ */}
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </Router>
  );
};

export default App;
