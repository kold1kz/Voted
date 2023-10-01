import './App.css';

import { FC, useEffect } from 'react';

import AppRouter from './components/AppRouter';
import DevTimeInput from './components/DevTimeInput/DevTimeInput';
import TimeContext from './context/timeContext';
import { useActions } from './hooks/useActions';
import { useDate } from './hooks/useDate';
import { useTypedSelector } from './hooks/useTypedSelector';
import { RouteNames } from './routes';
import history from './utils/history';

const App: FC = () => {
  const { fetchRefreshTokens } = useActions();
  const { access_token, isFirstRefreshDone } = useTypedSelector((state) => state.auth);
  const { time, isDevNextDaySet, votingDate, setCustomTime, clearCustomTime } = useDate();

  useEffect(() => {
    fetchRefreshTokens();
  }, []);

  useEffect(() => {
    if (isFirstRefreshDone) {
      if (history.location.pathname === RouteNames.LOGIN_PAGE) {
        if (access_token) history.push(RouteNames.EMPLOYEE_PAGE);
      }
      if (history.location.pathname.includes(RouteNames.EMPLOYEE_PAGE)) {
        if (!access_token) history.push(RouteNames.LOGIN_PAGE);
      }
    }
  }, [access_token, history.location.pathname, isFirstRefreshDone]);
  return (
    <TimeContext.Provider
      value={{ time, votingDate, isDevNextDaySet, setCustomTime, clearCustomTime }}>
      <div className="wrapper">
        <DevTimeInput />
        {!isFirstRefreshDone ? <span>Загрузка</span> : <AppRouter />}
      </div>
    </TimeContext.Provider>
  );
};

export default App;
