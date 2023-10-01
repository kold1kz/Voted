import classNames from 'classnames';
import { Field, FieldArray, Formik, validateYupSchema, yupToFormErrors } from 'formik';
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

interface Props {
  setIsProtocolSent: (res: boolean) => void;
}

const ProtocolInput: FC<Props> = ({ setIsProtocolSent }: Props) => {
  const { access_token } = useTypedSelector((state) => state.auth);
  const [candidates, setCandidates] = useState<
    {
      candidate_id: number;
      candidate: string;
    }[]
  >([]);

  const {
    time: { minutes, hours },
    isDevNextDaySet,
  } = useContext(TimeContext);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isSendingError, setIsSendingError] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSendingResults, setIsSendingResults] = useState(false);

  const [turnoutResults, setTurnoutResults] = useState({
    turnout: 0,
    maxPeople: 0,
  });

  const closePopup = (setSubmitting: (param: boolean) => void) => {
    setIsPopupOpen(false);
    setSubmitting(false);
  };

  const sendResults = async (
    data: {
      processed_bulletins: number;
      spoiled_bulletins: number;
      candidates: {
        candidate_id: number;
        count_votes: number;
      }[];
    },
    setSubmitting: (param: boolean) => void,
    resetForm: () => void,
  ) => {
    try {
      setIsSendingError(false);
      setIsSendingResults(true);
      await VotingService.sendResultsInfo(
        access_token!,
        data.processed_bulletins,
        data.spoiled_bulletins,
        data.candidates,
      );
      resetForm();
      setIsSendingResults(false);
      closePopup(setSubmitting);
      setIsProtocolSent(true);
    } catch (error) {
      setIsSendingResults(false);
      setIsSendingError(true);
      console.error(error);
    }
  };

  const fetchInfo = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const resultCandidates = (await VotingService.getCandidatesInfo(access_token!))
        .data;
      const resultTurnout = (await VotingService.getTurnoutInfo(access_token!)).data;

      setTurnoutResults({
        turnout: resultTurnout.va_data.reduce(
          (prev, current) => (prev < current.count_voters ? current.count_voters : prev),
          0,
        ),
        maxPeople: resultTurnout.max_people,
      });
      setCandidates(resultCandidates.candidates);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  };

  const getSurnameNP = (fullName: string) => {
    return (
      fullName.split(' ')[0] +
      ' ' +
      fullName.split(' ')[1][0] +
      '. ' +
      fullName.split(' ')[2][0] +
      '.'
    );
  };

  const getNameSurname = (fullName: string) => {
    return fullName.split(' ')[1] + ' ' + fullName.split(' ')[0];
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  useEffect(() => {
    if (isDevNextDaySet && (hours > 8 || (hours === 8 && minutes >= 46))) {
      setIsProtocolSent(false);
      history.push('/employee-page/final');
    }
  }, [minutes, hours, isDevNextDaySet]);

  const validationSchema = yup.object().shape({
    bulletinsCount: yup
      .number()
      .typeError('Должно быть числом')
      .min(0, 'Не может быть меньше 0')
      .max(
        turnoutResults.turnout,
        `Не может быть больше итоговой явки (${turnoutResults.turnout} чел)`,
      )
      .test(
        'testPassedCount',
        'Должно быть равно сумме испорченных + за всех кандидатов',
        function (value) {
          const candidatesVotesCount = this.options.context!.candidateVotes.reduce(
            (prev: number, current: { value: number }) => prev + current.value,
            0,
          );
          if (
            value! !==
            this.options.context!.spoiledBulletinsCount + candidatesVotesCount
          )
            return false;
          return true;
        },
      )
      .required('Обязательное поле'),
    spoiledBulletinsCount: yup
      .number()
      .typeError('Должно быть числом')
      .min(0, 'Не может быть меньше 0')
      .required('Обязательное поле')
      .test('testSpoiledCount', 'Должно быть не больше обработанных', function (value) {
        if (value! > this.options.context!.bulletinsCount) return false;
        return true;
      }),
    candidateVotes: yup
      .array()
      .of(
        yup.object().shape({
          value: yup
            .number()
            .typeError('Должно быть числом')
            .min(0, 'Не может быть меньше 0')
            .required('Обязательное поле')
            .test(
              'testVotesCount',
              'Должно быть не больше обработанных',
              function (value) {
                if (value! > this.options.context!.bulletinsCount) return false;
                return true;
              },
            ),
        }),
      )
      .required('Необходимо заполнить голоса'),
  });
  return (
    <div
      className={classNames(
        styles['protocol'],
        isError || isLoading ? styles['protocol_empty'] : null,
      )}>
      {isLoading ? (
        <LoadingSpinner className={styles['protocol__loader']} isPrimaryColor />
      ) : isError ? (
        <div className={styles['protocol__error']}>
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
        <Formik
          initialValues={{
            bulletinsCount: 0,
            spoiledBulletinsCount: 0,
            candidateVotes: [...candidates.map((item) => ({ ...item, value: 0 }))],
          }}
          validate={(values) => {
            try {
              validateYupSchema(values, validationSchema, true, values);
            } catch (err) {
              return yupToFormErrors(err);
            }
          }}
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
            <form
              onSubmit={handleSubmit}
              className={classNames(styles['protocol__form'], styles['protocol-form'])}>
              <div className={classNames(styles['protocol-form__wrapper'])}>
                <div
                  className={classNames(
                    styles['protocol-form__bulletins'],
                    styles['bulletins'],
                  )}>
                  <p className={styles['protocol-form__description']}>
                    Введите количество <br />{' '}
                    <span className={'bold-text'}>обработанных </span> бюллетеней
                  </p>
                  <FormInput
                    labelName="Явка"
                    id="bulletinsCount"
                    name="bulletinsCount"
                    type="number"
                    value={values.bulletinsCount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    errorMessage={errors.bulletinsCount || ''}
                    required
                    showError={!!(touched.bulletinsCount && errors.bulletinsCount)}
                    hideLabel
                    className={styles['bulletins__input']}
                    classNameForInput={styles['bulletins__input-block']}
                    classNameForError={styles['bulletins__input-error']}
                  />
                  <p className={styles['protocol-form__description']}>
                    Введите количество <br />{' '}
                    <span className={'bold-text'}>испорченных </span> бюллетеней
                  </p>
                  <FormInput
                    labelName="Явка"
                    id="spoiledBulletinsCount"
                    name="spoiledBulletinsCount"
                    type="number"
                    value={values.spoiledBulletinsCount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    errorMessage={errors.spoiledBulletinsCount || ''}
                    required={true}
                    showError={
                      !!(touched.spoiledBulletinsCount && errors.spoiledBulletinsCount)
                    }
                    hideLabel
                    className={styles['bulletins__input']}
                    classNameForInput={styles['bulletins__input-block']}
                    classNameForError={styles['bulletins__input-error']}
                  />
                </div>
                <div
                  className={classNames(styles['protocol-form__votes'], styles['votes'])}>
                  <p className={styles['protocol-form__description']}>
                    Введите <span className={'bold-text'}>количество</span> голосов по
                    кандидатам
                  </p>
                  <FieldArray
                    name="candidateVotes"
                    render={() => (
                      <div className={styles['votes__candidate-list']}>
                        {values.candidateVotes.map((item, index) => (
                          <div
                            key={index}
                            className={classNames(
                              styles['votes__input-block'],
                              errors.candidateVotes && errors.candidateVotes[index]
                                ? styles['votes__input-block_error']
                                : null,
                            )}>
                            <label
                              htmlFor={`candidateVotes[${index}]`}
                              className={styles['votes__label']}>
                              {getSurnameNP(item.candidate)}
                            </label>
                            <Field
                              type="number"
                              name={`candidateVotes[${index}].value`}
                              id={`candidateVotes[${index}]`}
                              required
                              className={styles['votes__input']}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </div>
              </div>

              <ErrorAlert
                header="Ошибка отправки"
                description="Проверьте данные и попробуйте ещё раз"
                className={classNames(
                  styles['protocol-form__main-error'],
                  styles['protocol-form__main-error_hidden'],
                )}
              />
              {/* <p
                className={classNames(
                  styles['protocol-form__time-left'],
                  styles['protocol-form__time-left_hidden'],
                )}>
                до конца ввода данных протокола <span className={'bold-text'}>18</span>{' '}
                минут{' '}
              </p> */}

              <FormButton
                type="submit"
                disabled={!isValid && isSubmitting}
                className={styles['protocol-form__submit-btn']}>
                Отправить
              </FormButton>

              <p
                className={classNames(
                  styles['protocol-form__time-left'],
                  isDevNextDaySet && hours === 8 && minutes >= 30
                    ? 45 - minutes <= 5
                      ? styles['protocol-form__time-left_alert']
                      : null
                    : null,
                )}>
                {isDevNextDaySet && hours === 8 && minutes >= 30 ? (
                  45 - minutes === 0 ? (
                    <span className={styles['time-count']}>
                      до окончания ввода менее минуты
                    </span>
                  ) : (
                    <>
                      до окончания ввода{' '}
                      <span className={styles['time-count']}>{45 - minutes}</span> минуты
                    </>
                  )
                ) : (
                  ' '
                )}
              </p>

              {isPopupOpen ? (
                <ConfirmPopup
                  isSubmitting={isSendingResults}
                  onClose={() => closePopup(setSubmitting)}
                  title={
                    <p className={styles['popup-title']}>
                      Вы ввели результаты обработки бюллетеней
                    </p>
                  }
                  onConfirm={() => {
                    const resultsObj = {
                      processed_bulletins: values.bulletinsCount,
                      spoiled_bulletins: values.spoiledBulletinsCount,
                      candidates: values.candidateVotes.map((item) => ({
                        candidate_id: item.candidate_id,
                        count_votes: item.value,
                      })),
                    };
                    sendResults(resultsObj, setSubmitting, resetForm);
                  }}>
                  <>
                    <div className={styles['popup-content']}>
                      <div className={styles['popup-content__votes-types']}>
                        <p className={styles['popup-content__type-result']}>
                          Обработанных: {values.bulletinsCount}
                        </p>
                        <p className={styles['popup-content__type-result']}>
                          Испорченных: {values.spoiledBulletinsCount}
                        </p>
                      </div>
                      <div className={styles['popup-content__candidates-list']}>
                        {values.candidateVotes.map((item) => {
                          return (
                            <p
                              key={item.candidate_id}
                              className={styles['popup-content__candidate-item']}>
                              {getNameSurname(
                                values.candidateVotes.find(
                                  (val) => val.candidate_id === item.candidate_id,
                                )?.candidate!,
                              ) +
                                ': ' +
                                item.value}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                    {isSendingError ? (
                      <ErrorAlert
                        header="Ошибка отправки"
                        description="Проверьте подключение к интернету"
                      />
                    ) : null}
                  </>
                </ConfirmPopup>
              ) : null}
            </form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default ProtocolInput;
