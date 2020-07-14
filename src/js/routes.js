
import HomePage from '../pages/home.jsx';
import LoginPage from '../pages/login.jsx';
import SettingsPage from '../pages/settings.jsx';

var loginData = window.localStorage.getItem('loginData');

var routes = [
  {
    path: '/',
    component: loginData ? HomePage : LoginPage,
  },
  {
    path: '/Settings',
    component: SettingsPage,
  },
];

export default routes;
