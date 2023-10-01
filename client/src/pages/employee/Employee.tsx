import { FC, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router';

import VotingService from '../../api/votingService';
import Header from '../../components/Header/Header';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import history from '../../utils/history';
import FinalScreen from './pages/finalScreen/FinalScreen';
import ProtocolInput from './pages/protocolInput/ProtocolInput';
import TurnoutInput from './pages/turnoutInput/TurnoutInput';
import styles from './styles.module.scss';

const Employee: FC = () => {
  const { access_token } = useTypedSelector((state) => state.auth);
  const [isProtocolSent, setIsProtocolSent] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkProtocol = async () => {
    setIsLoading(true);
    const result = (await VotingService.checkProtocolIsSent(access_token!)).data;
    if (result.protocolExists) {
      setIsProtocolSent(true);
      history.push('/employee-page/final');
    } else {
      history.push('/employee-page/turnout');
    }
    setIsLoading(false);
  };

  const changeProtocolSent = (result: boolean) => {
    setIsProtocolSent(result);
  };

  useEffect(() => {
    checkProtocol();
  }, []);

  useEffect(() => {
    if (isProtocolSent !== null) {
      history.push('/employee-page/final');
    }
  }, [isProtocolSent]);

  return (
    <div className={styles['employee-page']}>
      {isLoading ? null : (
        <>
          <Header />
          <Switch>
            <Route path="/employee-page/turnout" component={TurnoutInput} />
            <Route path="/employee-page/protocol">
              <ProtocolInput setIsProtocolSent={changeProtocolSent} />
            </Route>
            <Route path="/employee-page/final">
              <FinalScreen isProtocolSent={isProtocolSent} />
            </Route>
          </Switch>
        </>
      )}
    </div>
  );
};

export default Employee;
