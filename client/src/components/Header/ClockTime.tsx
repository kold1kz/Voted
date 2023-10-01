import { FC, useContext } from 'react';

import TimeContext from '../../context/timeContext';

const ClockTime: FC = () => {
  const { time } = useContext(TimeContext);
  return (
    <>
      {time.hours < 10 ? '0' + time.hours : time.hours}:
      {time.minutes < 10 ? '0' + time.minutes : time.minutes}
    </>
  );
};

export default ClockTime;
