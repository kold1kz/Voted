import { useEffect, useState } from 'react';

import VotingService from '../api/votingService';
import useInterval from './useInterval';

export const useDate = () => {
  const [date, setDate] = useState(new Date());
  const [votingDate, setVotingDate] = useState(new Date());
  const [devTime, setDevTime] = useState<
    { hours: number; minutes: number; realTimeInSeconds: number } | null | undefined
  >(undefined);
  const [isDevNextDaySet, setIsDevNextDaySet] = useState(false);

  const fetchVotingDate = async () => {
    try {
      const result = (await VotingService.getVotingDate()).data;
      setVotingDate(new Date(result.voting_date));
    } catch (e) {
      return;
    }
  };

  useEffect(() => {
    fetchVotingDate();
  }, []);

  const updateDevTime = (curTime?: Date) => {
    const currentTime = curTime || new Date();
    let passedSeconds =
      Math.floor(currentTime.getTime() / 1000) - devTime!.realTimeInSeconds;
    let passedHours = Math.floor(passedSeconds / 3600);
    let passedMinutes = Math.floor((passedSeconds - passedHours * 3600) / 60);
    setDate(
      new Date(
        currentTime.getFullYear(),
        currentTime.getMonth(),
        currentTime.getDay(),
        devTime!.hours + passedHours,
        devTime!.minutes + passedMinutes,
      ),
    );
  };

  useInterval(() => {
    const currentTime = new Date();
    if (devTime) {
      if (
        (Math.floor(currentTime.getTime() / 1000) - devTime.realTimeInSeconds) % 60 ===
          0 &&
        Math.floor(currentTime.getTime() / 1000) - devTime.realTimeInSeconds !== 0
      ) {
        updateDevTime(currentTime);
      }
    } else {
      if (currentTime.getSeconds() === 0) setDate(currentTime);
    }
  }, 1000);

  useEffect(() => {
    const time = new Date();
    if (!devTime) setDate(time);
    else updateDevTime(time);
  }, [devTime]);

  const setCustomTime = (
    hours: number,
    minutes: number,
    isNextDay?: boolean,
    realTimeInSeconds?: number,
  ) => {
    setDevTime({
      hours,
      minutes,
      realTimeInSeconds: realTimeInSeconds || Math.floor(new Date().getTime() / 1000),
    });
    setIsDevNextDaySet(!!isNextDay);
  };

  const clearCustomTime = () => {
    setDevTime(null);
    setIsDevNextDaySet(false);
  };

  return {
    isDevNextDaySet,
    votingDate,
    time: {
      hours: date.getHours(),
      minutes: date.getMinutes(),
    },
    setCustomTime,
    clearCustomTime,
  };
};
