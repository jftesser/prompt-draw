import { FC, useContext } from 'react';
import './App.css';
import {
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import LoginPage from './Login';
import {ProtectedRoute, ProtectedRouteProps } from './firebase/firebaseSetup';
import Content from './Content';
import Host from './Host';
import Play from './Play';
import Demo from './Demo';
import { AuthContext } from './auth/AuthContext';

const App: FC = () => {
  const navigate = useNavigate();
  const onLogin = () => {
    navigate('/');
  }
  const onLocatedLogin = () => {
    
  }

  const authContext = useContext(AuthContext);

  const defaultProtectedRouteProps: Omit<ProtectedRouteProps, 'outlet'> = {
    isAuthenticated: !!authContext.user,
    redirect: (<LoginPage onLogin={onLocatedLogin} />),
  };
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<Content />} />} />
        <Route path='host/:gameid' element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<Host/>}/>}/>
        <Route path='play/:gameid' element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<Play/>}/>}/>
        <Route path='demo' element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<Demo/>}/>}/>

        <Route path='login' element={<LoginPage onLogin={onLogin} />}></Route>
      </Routes>
    </div>
  );
}

export default App;
