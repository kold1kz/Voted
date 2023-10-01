import classNames from 'classnames';
import { Formik } from 'formik';
import { FC } from 'react';
import * as yup from 'yup';

import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';
import FormButton from '../../components/FormButton/FormButton';
import FormInput from '../../components/FormInput/FormInput';
import Header from '../../components/Header/Header';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useActions } from '../../hooks/useActions';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import EyeSvg from '../../img/eye-label.svg';
import LogoSvg from '../../img/login-page-logo.svg';
import styles from './styles.module.scss';

const Login: FC = () => {
  const { fetchLogin } = useActions();
  const { errorLogin, isTryingToLogin } = useTypedSelector((state) => state.auth);
  const validationSchema = yup.object().shape({
    login: yup
      .string()
      .typeError('Должно быть строкой')
      .trim()
      .required('Обязательное поле'),
    password: yup.string().typeError('Должно быть строкой').required('Обязательное поле'),
  });
  return (
    <div className={styles['login-page']}>
      <Header className={styles['login-page__header']} />
      <div className={styles['login-page__picture']}>
        <img src={LogoSvg} alt="Лого выборов мэра Москвы 2" />
      </div>
      <div className={styles['login-page__content-container']}>
        <div className={styles['content']}>
          <Formik
            initialValues={{ login: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              fetchLogin(values.login, values.password);
            }}>
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isValid,
            }) => (
              <form onSubmit={handleSubmit} className={styles['login-form']}>
                <ErrorAlert
                  header="Неверный логин или пароль"
                  description="Проверьте вводимые данные"
                  className={classNames(
                    styles['login-form__main-error'],
                    errorLogin ? styles['login-form__main-error_showing'] : null,
                  )}
                />
                <p className={styles['login-form__description']}>
                  Введите логин и пароль
                </p>

                <FormInput
                  labelName="Логин"
                  id="login"
                  name="login"
                  type="text"
                  value={values.login}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  errorMessage={errors.login || ''}
                  required={true}
                  showError={!!(touched.login && errors.login)}
                />

                <FormInput
                  labelName="Пароль"
                  id="password"
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  errorMessage={errors.password || ''}
                  required={true}
                  showError={!!(touched.password && errors.password)}
                  hasIcon
                  iconUrl={EyeSvg}
                />
                <FormButton type="submit" disabled={isTryingToLogin && !isValid}>
                  {isTryingToLogin ? <LoadingSpinner /> : 'Войти'}
                </FormButton>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Login;
