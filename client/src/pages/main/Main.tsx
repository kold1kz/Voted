import { FC, useContext, useEffect } from 'react';
import { Route, Switch } from 'react-router';

import Header from '../../components/Header/Header';
import TimeContext from '../../context/timeContext';
import history from '../../utils/history';
import CandidatesList from './pages/candidatesList/CandidatesList';
import Results from './pages/results/Results';
import Turnout from './pages/turnout/Turnout';
import styles from './styles.module.scss';

const Main: FC = () => {
  const {
    time: { minutes, hours },
    isDevNextDaySet,
    votingDate,
  } = useContext(TimeContext);

  useEffect(() => {
    if (isDevNextDaySet || votingDate.getDay() < new Date().getDay()) {
      history.push('/main/results');
    } else {
      if (hours < 12 && history.location.pathname !== '/main/candidates-list') {
        history.push('/main/candidates-list');
      }
      if (
        (hours === 12 && minutes === 0) ||
        (hours >= 12 && hours < 21 && history.location.pathname !== '/main/turnout')
      ) {
        history.push('/main/turnout');
      }
      if (
        (hours === 21 && minutes === 0) ||
        (hours >= 21 && history.location.pathname !== '/main/results')
      ) {
        history.push('/main/results');
      }
    }
  }, [minutes, hours, isDevNextDaySet]);

  return (
    <div className={styles['main']}>
      <Header className={styles['main__header']} />
      <Switch>
        <Route path="/main/candidates-list" component={CandidatesList} />
        <Route path="/main/turnout" component={Turnout} />
        <Route path="/main/results" component={Results} />
      </Switch>
    </div>
  );
};

export default Main;
