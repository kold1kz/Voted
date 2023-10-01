export interface ICandidate {
  candidate_id: number;
  candidate: string;
  consigment: string;
  photo?: string;
}

export interface ICandidateName extends Omit<ICandidate, 'photo' | 'consigment'> {}

export interface ICandidateResult extends Omit<ICandidate, 'consigment'> {
  result: number;
}
