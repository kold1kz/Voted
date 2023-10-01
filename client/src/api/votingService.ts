import axios, { AxiosError, AxiosResponse } from 'axios';

import { ICandidate, ICandidateName, ICandidateResult } from '../models/ICandidate';
import { store } from '../store';
import { AuthActionCreators } from '../store/reducers/authReducer/action-creators';
const { dispatch } = store;

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export enum API_URLS {
  REFRESH_TOKENS = '/auth/refresh-tokens',
  LOGIN = '/auth/login',
  LOGOUT = '/auth/logout',
  CANDIDATES_AND_AREAS_INFO = '/candidate-va-info',
  DISTRICTS_TURNOUT = '/districts-turnout',
  RESULTS_INFO = '/results',
  TURNOUT_INFO = '/user-turnout',
  CANDIDATES_INFO = '/user-results',
  GET_VOTING_DATE = '/voting-date',
  CHECK_PROTOCOL = '/check-protocol',
}

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  if (!error.response) {
    return new Promise((_, reject) => {
      reject(error);
    });
  }

  if (error.response.status === 403) {
    if (error.response.config.url === API_URLS.LOGIN) {
      return new Promise((_, reject) => {
        reject(error);
      });
    } else if (error.response.config.url === API_URLS.REFRESH_TOKENS) {
      dispatch(AuthActionCreators.clearAuthState());
      return new Promise((_, reject) => {
        reject(error);
      });
    } else {
      try {
        const res = await VotingService.refreshTokens();
        dispatch(AuthActionCreators.saveNewToken(res.data.access_token));
        error.config.headers.Authorization = `Bearer ${res.data.access_token}`;
        return api.request(error.config);
      } catch (_) {
        return new Promise((_, reject) => {
          reject(error);
        });
      }
    }
  } else {
    return new Promise((_, reject) => {
      reject(error);
    });
  }
});

export default class VotingService {
  static async refreshTokens(): Promise<AxiosResponse<{ access_token: string }>> {
    return api.get<{ access_token: string }>(API_URLS.REFRESH_TOKENS);
  }
  static async login(
    login: string,
    password: string,
  ): Promise<AxiosResponse<{ access_token: string }>> {
    return api.post<{ access_token: string }>(API_URLS.LOGIN, {
      login,
      password,
    });
  }

  static async getUserInfo(access_token: string): Promise<AxiosResponse<any>> {
    return api.get<any>('/user-info', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  }

  static async getTurnoutInfo(access_token: string): Promise<
    AxiosResponse<{
      voting_area_id: number;
      va_data: [
        {
          time: string;
          count_voters: number;
          client_add_time: 'morning' | 'day' | 'evening' | 'result';
        },
      ];
      max_people: number;
    }>
  > {
    return api.get<{
      voting_area_id: number;
      va_data: [
        {
          time: string;
          count_voters: number;
          client_add_time: 'morning' | 'day' | 'evening' | 'result';
        },
      ];
      max_people: number;
    }>(API_URLS.TURNOUT_INFO, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  }

  static async sendTurnoutInfo(
    access_token: string,
    turnout: number,
    client_add_time: 'morning' | 'day' | 'evening' | 'result',
  ): Promise<AxiosResponse<any>> {
    return api.post<any>(
      API_URLS.TURNOUT_INFO,
      {
        turnout,
        client_add_time,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );
  }

  static async sendResultsInfo(
    access_token: string,
    processed_bulletins: number,
    spoiled_bulletins: number,
    candidates: {
      candidate_id: number;
      count_votes: number;
    }[],
  ): Promise<AxiosResponse<any>> {
    return api.post<any>(
      API_URLS.CANDIDATES_INFO,
      {
        processed_bulletins,
        spoiled_bulletins,
        candidates,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );
  }

  static async getCandidatesInfo(access_token: string): Promise<
    AxiosResponse<{
      candidates: Array<ICandidateName>;
    }>
  > {
    return api.get<{
      candidates: Array<ICandidateName>;
    }>(API_URLS.CANDIDATES_INFO, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  }

  static async checkProtocolIsSent(access_token: string): Promise<
    AxiosResponse<{
      protocolExists: boolean;
    }>
  > {
    return api.get<{
      protocolExists: boolean;
    }>(API_URLS.CHECK_PROTOCOL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  }

  static async getCandidatesAndAreasInfo(): Promise<
    AxiosResponse<{
      info: Array<ICandidate>;
      count_opened: number;
      count_people: number;
    }>
  > {
    return api.get<{
      info: Array<ICandidate>;
      count_opened: number;
      count_people: number;
    }>(API_URLS.CANDIDATES_AND_AREAS_INFO);
  }

  static async getVotingDate(): Promise<
    AxiosResponse<{
      voting_date: string;
    }>
  > {
    return api.get<{
      voting_date: string;
    }>(API_URLS.GET_VOTING_DATE);
  }

  static async getDistrictsTurnout(): Promise<AxiosResponse<any>> {
    return api.get<{
      districts_turnout: Array<{
        district: string;
        turnout: number;
      }>;
    }>(API_URLS.DISTRICTS_TURNOUT);
  }

  static async getResultsInfo(): Promise<
    AxiosResponse<{
      candidate_results: Array<ICandidateResult>;
      turnout: number;
      checked_bulletins_percentage: number;
    }>
  > {
    return api.get<{
      candidate_results: Array<ICandidateResult>;
      turnout: number;
      checked_bulletins_percentage: number;
    }>(API_URLS.RESULTS_INFO);
  }

  static async logout(): Promise<AxiosResponse<{ message: string }>> {
    return api.get<{ message: string }>(API_URLS.LOGOUT);
  }
}
