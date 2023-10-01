import classNames from 'classnames';
import { Formik } from 'formik';
import { FC, useContext, useEffect, useState } from 'react';
import * as yup from 'yup';

import VotingService from '../../../../api/votingService';
import ConfirmPopup from '../../../../components/ConfirmPopup/ConfirmPopup';
import ErrorAlert from '../../../../components/ErrorAlert/ErrorAlert';
import FormButton from '../../../../components/FormButton/FormButton';
import FormInput from '../../../../components/FormInput/FormInput';
import LoadingSpinner from '../../../../components/LoadingSpinner/LoadingSpinner';
import TimeContext from '../../../../context/timeContext';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import history from '../../../../utils/history';
import styles from './styles.module.scss';
import { timePeriods } from './timePeriods';

const TurnoutInput: FC = () => {
  const {
    time: { minutes, hours },
    isDevNextDaySet,
  } = useContext(TimeContext);

  const { access_token } = useTypedSelector((state) => state.auth);

  const [info, setInfo] = useState<{
    votingAreaId: number;
    max_people: number;
  }>({
    votingAreaId: 0,
    max_people: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isSendingError, setIsSendingError] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSendingTurnout, setIsSendingTurnout] = useState(false);
  const [timePeriodsInfo, setTimePeriodsInfo] = useState(timePeriods);

  const getCurrentPeriod = (hours: number, minutes: number, isNextDay: boolean) => {
    return timePeriodsInfo.find((item) => {
      if (
        (isNextDay || (hours === 17 && minutes >= 46) || hours > 17) &&
        item.partOfDay === 'result'
      ) {
        return true;
      }
      if (
        (hours < 11 || (hours === 11 && minutes <= 45)) &&
        item.partOfDay === 'morning' &&
        !isNextDay
      )
        return true;
      if (
        (hours < 14 || (hours === 14 && minutes <= 45)) &&
        item.partOfDay === 'day' &&
        !isNextDay
      )
        return true;
      if (
        (hours < 17 || (hours === 17 && minutes <= 45)) &&
        item.partOfDay === 'evening' &&
        !isNextDay
      )
        return true;
    });
  };

  const [currentPeriodInfo, setCurrentPeriodInfo] = useState(
    getCurrentPeriod(hours, minutes, isDevNextDaySet),
  );

  const closePopup = (setSubmitting: (param: boolean) => void) => {
    setIsPopupOpen(false);
    setSubmitting(false);
  };

  const sendTurnout = async (
    votersCount: number,
    setSubmitting: (param: boolean) => void,
    resetForm: () => void,
  ) => {
    try {
      setIsSendingError(false);
      setIsSendingTurnout(true);
      await VotingService.sendTurnoutInfo(
        access_token!,
        votersCount,
        hours === 11
          ? 'morning'
          : hours === 14
          ? 'day'
          : hours === 17
          ? 'evening'
          : 'result',
      );
      await fetchInfoSilent();
      resetForm();
      setIsSendingTurnout(false);
      closePopup(setSubmitting);
    } catch (error) {
      setIsSendingTurnout(false);
      setIsSendingError(true);
      console.error(error);
    }
  };

  const refreshTimePeriodsInfo = (
    fetched?: {
      time: string;
      count_voters?: number;
      client_add_time: 'morning' | 'day' | 'evening' | 'result';
    }[],
  ) => {
    const updatedFetchedInfo =
      fetched &&
      fetched.map((obj) => ({
        count: obj.count_voters!,
        partOfDay: obj.client_add_time,
      }));

    const newPeriods = timePeriodsInfo.map((item) => {
      const oldInfo =
        updatedFetchedInfo && updatedFetchedInfo.length
          ? updatedFetchedInfo.find((obj) => obj.partOfDay === item.partOfDay)
          : timePeriodsInfo.find((obj) => obj.partOfDay === item.partOfDay);

      if (oldInfo && oldInfo.count !== null) {
        item.count = oldInfo.count;
        item.status = 'success';
        return item;
      } else {
        if (
          ((hours < 11 || (hours === 11 && minutes <= 45)) &&
            item.partOfDay === 'morning' &&
            !isDevNextDaySet) ||
          ((hours < 14 || (hours === 14 && minutes <= 45)) &&
            item.partOfDay === 'day' &&
            !isDevNextDaySet) ||
          ((hours < 17 || (hours === 17 && minutes <= 45)) &&
            item.partOfDay === 'evening' &&
            !isDevNextDaySet) ||
          item.partOfDay === 'result' ||
          (isDevNextDaySet && ((hours === 8 && minutes <= 45) || hours < 8))
        ) {
          return item;
        } else {
          item.status = 'fail';
          return item;
        }
      }
    });

    setTimePeriodsInfo(newPeriods);
  };

  const fetchInfo = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const result = (await VotingService.getTurnoutInfo(access_token!)).data;
      if (result.va_data.find((item) => item.client_add_time === 'result')) {
        history.push('/employee-page/protocol');
      } else {
        refreshTimePeriodsInfo(result.va_data);
        setInfo({
          max_people: result.max_people,
          votingAreaId: result.voting_area_id,
        });
        setIsLoading(false);
      }
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  };

  const fetchInfoSilent = async () => {
    try {
      const result = (await VotingService.getTurnoutInfo(access_token!)).data;
      if (result.va_data.find((item) => item.client_add_time === 'result')) {
        history.push('/employee-page/protocol');
      } else {
        refreshTimePeriodsInfo(result.va_data);
        setInfo({
          max_people: result.max_people,
          votingAreaId: result.voting_area_id,
        });
      }
    } catch (error) {
      setIsError(true);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  useEffect(() => {
    refreshTimePeriodsInfo();
  }, [hours, minutes, isDevNextDaySet]);

  useEffect(() => {
    setCurrentPeriodInfo(getCurrentPeriod(hours, minutes, isDevNextDaySet));
  }, [timePeriodsInfo]);

  useEffect(() => {
    if (
      currentPeriodInfo?.partOfDay === 'result' &&
      (currentPeriodInfo.status === 'success' || currentPeriodInfo.status === 'fail')
    ) {
      history.push('/employee-page/protocol');
    }
  }, [currentPeriodInfo]);

  const minVotersCount = () => {
    let maxValue = 0;
    timePeriodsInfo.forEach((item) => {
      if (item.count && item.count > maxValue) {
        maxValue = item.count;
      }
    });
    return maxValue;
  };

  const validationSchema = yup.object().shape({
    votersCount: yup
      .number()
      .typeError('Должно быть числом')
      .min(
        minVotersCount() > 0 ? minVotersCount() : 0,
        minVotersCount() > 0
          ? `Не может быть меньше уже введенной явки (${minVotersCount()} чел.)`
          : 'Не может быть меньше 0',
      )
      .max(
        info.max_people,
        `Не может быть больше кол-ва людей приписанного к участку (${info.max_people} чел)`,
      )
      .required('Обязательное поле'),
  });

  const isInputAccessibleByTime = () => {
    return (
      currentPeriodInfo?.status === 'waiting' &&
      ((hours === currentPeriodInfo.available.from.hours &&
        minutes >= currentPeriodInfo.available.from.minutes &&
        minutes <= currentPeriodInfo.available.to.minutes) ||
        (currentPeriodInfo.partOfDay === 'result' &&
          ((isDevNextDaySet && (hours < 8 || (hours === 8 && minutes <= 45))) ||
            hours >= 20)))
    );
  };

  const showAccessTimeForInput = () => {
    if (currentPeriodInfo?.partOfDay === 'result') {
      if (hours >= 17 && hours < 20) {
        return 'c 20:00';
      } else {
        return 'до 8:45';
      }
    } else {
      return `с ${currentPeriodInfo?.available.from.hours}:${currentPeriodInfo?.available.from.minutes} до ${currentPeriodInfo?.available.to.hours}:${currentPeriodInfo?.available.to.minutes}`;
    }
  };

  return (
    <div
      className={classNames(
        styles['voters'],
        isError || isLoading ? styles['voters_empty'] : null,
      )}>
      {isLoading ? (
        <LoadingSpinner className={styles['voters__loader']} isPrimaryColor />
      ) : isError ? (
        <div className={styles['voters__error']}>
          <span className={styles['error-text']}>
            Произошла ошибка. Проверьте соединение с интернетом
          </span>
          <FormButton
            type="button"
            disabled={false}
            className={styles['error-btn']}
            onClick={fetchInfo}>
            Перезагрузить данные
          </FormButton>
        </div>
      ) : (
        <>
          <div className={styles['voters__results']}>
            <table className={styles['resluts-table']}>
              <caption className={styles['resluts-table__header']}>
                Участок №{info.votingAreaId}
              </caption>
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Явка, чел.</th>
                </tr>
              </thead>
              <tbody>
                {timePeriodsInfo
                  .filter((item) => item.partOfDay !== 'result')
                  .map((item) => {
                    return (
                      <tr key={item.partOfDay}>
                        <td>{item.tableTime}</td>
                        <td
                          className={
                            item.status === 'fail'
                              ? styles['turnout-error']
                              : item.status === 'success'
                              ? styles['turnout-success']
                              : undefined
                          }>
                          {item.status === 'waiting'
                            ? 'Ожидается ввод'
                            : item.status === 'fail'
                            ? 'Не предоставлено'
                            : item.count}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <div className={styles['voters__content-container']}>
            <div className={styles['content']}>
              <Formik
                initialValues={{ votersCount: 0 }}
                validationSchema={validationSchema}
                onSubmit={() => {
                  setIsPopupOpen(true);
                }}>
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting,
                  isValid,
                  setSubmitting,
                  resetForm,
                }) => (
                  <form onSubmit={handleSubmit} className={styles['voters-form']}>
                    <ErrorAlert
                      header="Ошибка отправки"
                      description="Проверьте данные и попробуйте ещё раз"
                      className={classNames(styles['voters-form__main-error'])}
                    />
                    <p className={styles['voters-form__description']}>
                      Введите{' '}
                      {currentPeriodInfo && currentPeriodInfo.partOfDay === 'result'
                        ? 'общее'
                        : null}{' '}
                      <span className={'bold-text'}>количество</span> избирателей,
                      явившихся на участок
                      {currentPeriodInfo && currentPeriodInfo.partOfDay !== 'result' ? (
                        <>
                          {' '}
                          к{' '}
                          <span className={'bold-text'}>
                            {currentPeriodInfo.tableTime}
                          </span>
                        </>
                      ) : null}
                    </p>
                    <p className={styles['voters-form__time-left']} style={{ margin: 0 }}>
                      Поле ввода доступно {showAccessTimeForInput()}
                    </p>
                    <FormInput
                      labelName="Явка"
                      id="votersCount"
                      name="votersCount"
                      type="number"
                      value={values.votersCount}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      errorMessage={errors.votersCount || ''}
                      required={true}
                      showError={!!(touched.votersCount && errors.votersCount)}
                      hideLabel
                      useErrorDisplay
                      disabled={!isInputAccessibleByTime()}
                    />
                    {isInputAccessibleByTime() ? (
                      <p
                        className={classNames(
                          styles['voters-form__time-left'],
                          (currentPeriodInfo?.partOfDay === 'result' &&
                            hours === 8 &&
                            minutes >= 30) ||
                            currentPeriodInfo?.partOfDay !== 'result'
                            ? 45 - minutes <= 5
                              ? styles['voters-form__time-left_alert']
                              : null
                            : null,
                        )}>
                        {(currentPeriodInfo?.partOfDay === 'result' &&
                          hours === 8 &&
                          minutes >= 30) ||
                        currentPeriodInfo?.partOfDay !== 'result' ? (
                          45 - minutes === 0 ? (
                            <span className={styles['time-count']}>
                              до конца ввода явки менее минуты
                            </span>
                          ) : (
                            <>
                              до конца ввода явки{' '}
                              <span className={styles['time-count']}>{45 - minutes}</span>{' '}
                              минут
                            </>
                          )
                        ) : null}
                      </p>
                    ) : (
                      <p className={styles['voters-form__time-left']} />
                    )}

                    <FormButton
                      type="submit"
                      disabled={!isValid || isSubmitting || !isInputAccessibleByTime()}>
                      Отправить
                    </FormButton>
                    {isPopupOpen ? (
                      <ConfirmPopup
                        isSubmitting={isSendingTurnout}
                        onClose={() => closePopup(setSubmitting)}
                        title={
                          <p className={styles['popup-title']}>
                            Вы ввели общее количество избирателей{' '}
                            {currentPeriodInfo &&
                            currentPeriodInfo.partOfDay !== 'result' ? (
                              <>
                                {' '}
                                к{' '}
                                <span className={'bold-text'}>
                                  {currentPeriodInfo.tableTime}
                                </span>
                              </>
                            ) : null}{' '}
                            <br />
                            <span className={styles['popup-title__people-count']}>
                              {values.votersCount}
                            </span>{' '}
                            человек
                          </p>
                        }
                        onConfirm={() =>
                          sendTurnout(values.votersCount, setSubmitting, resetForm)
                        }>
                        {isSendingError ? (
                          <ErrorAlert
                            header="Ошибка отправки"
                            description="Проверьте подключение к интернету"
                          />
                        ) : null}
                      </ConfirmPopup>
                    ) : null}
                  </form>
                )}
              </Formik>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TurnoutInput;
