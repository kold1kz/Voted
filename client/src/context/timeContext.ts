import { createContext } from 'react';

interface ITimeContext {
  isDevNextDaySet: boolean;
  votingDate: Date;
  time: { hours: number; minutes: number };
  clearCustomTime: () => void;
  setCustomTime: (
    hours: number,
    minutes: number,
    isNextDay?: boolean,
    realTimeInSeconds?: number,
  ) => void;
}

const TimeContext = createContext({} as ITimeContext);

TimeContext.displayName = 'timeContext';

export default TimeContext;
