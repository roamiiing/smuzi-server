export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
};

export type AlreadyExistsError = {
  __typename?: 'AlreadyExistsError';
  message: Scalars['String']['output'];
};

export enum ArtistType {
  Character = 'Character',
  Choir = 'Choir',
  Group = 'Group',
  Orchestra = 'Orchestra',
  Other = 'Other',
  Person = 'Person'
}

export type GetMeResult = GetMeResultSuccess | UnauthenticatedError;

export type GetMeResultSuccess = {
  __typename?: 'GetMeResultSuccess';
  me: Me;
};

export type Me = {
  __typename?: 'Me';
  id: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Sign up a new user */
  signUpByPassword: SignUpByPasswordResult;
};


export type MutationSignUpByPasswordArgs = {
  input: SignUpByPasswordInput;
};

export type PlayRecordingInput = {
  recordingId: Scalars['String']['input'];
};

export type PlayRecordingResult = {
  __typename?: 'PlayRecordingResult';
  /** The actual length of the stream in milliseconds */
  durationMs: Scalars['Int']['output'];
  /** The recording that was played */
  recording: Recording;
  /** The URL of the stream that was played */
  streamUrl: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Get the current user */
  getMe?: Maybe<GetMeResult>;
  /** Retrieve a URL to stream a recording */
  playRecording: PlayRecordingResult;
  /** Search for recordings */
  searchRecordings: SearchRecordingsResult;
};


export type QueryPlayRecordingArgs = {
  input: PlayRecordingInput;
};


export type QuerySearchRecordingsArgs = {
  input: SearchRecordingsInput;
};

export type Recording = {
  __typename?: 'Recording';
  artists: Array<RecordingArtistCredit>;
  /**
   * Url template for the cover image. Add `-250`, `-500` or `-1500`
   * to the end of the url to get a specific size.
   */
  coverUrl?: Maybe<Scalars['String']['output']>;
  durationMs: Scalars['Int']['output'];
  firstReleaseDate?: Maybe<Scalars['Date']['output']>;
  id: Scalars['String']['output'];
  releases: Array<RecordingRelease>;
  title: Scalars['String']['output'];
};

export type RecordingArtist = {
  __typename?: 'RecordingArtist';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  sortName: Scalars['String']['output'];
};

export type RecordingArtistCredit = {
  __typename?: 'RecordingArtistCredit';
  artist: RecordingArtist;
  joinOn?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type RecordingRelease = {
  __typename?: 'RecordingRelease';
  artists: Array<RecordingReleaseArtistCredit>;
  coverUrl: Scalars['String']['output'];
  date?: Maybe<Scalars['Date']['output']>;
  id: Scalars['String']['output'];
  status: ReleaseStatus;
  title: Scalars['String']['output'];
};

export type RecordingReleaseArtist = {
  __typename?: 'RecordingReleaseArtist';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  sortName: Scalars['String']['output'];
};

export type RecordingReleaseArtistCredit = {
  __typename?: 'RecordingReleaseArtistCredit';
  artist: RecordingReleaseArtist;
  joinOn?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export enum ReleaseStatus {
  Bootleg = 'Bootleg',
  Cancelled = 'Cancelled',
  Official = 'Official',
  Promotion = 'Promotion',
  PseudoRelease = 'PseudoRelease',
  Unknown = 'Unknown',
  Withdrawn = 'Withdrawn'
}

export type SearchRecordingsInput = {
  query: Scalars['String']['input'];
};

export type SearchRecordingsResult = {
  __typename?: 'SearchRecordingsResult';
  recordings: Array<Recording>;
};

export type SignUpByPasswordInput = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type SignUpByPasswordResult = AlreadyExistsError | SignUpByPasswordResultSuccess | ValidationErrors;

export type SignUpByPasswordResultSuccess = {
  __typename?: 'SignUpByPasswordResultSuccess';
  me: Me;
};

export type UnauthenticatedError = {
  __typename?: 'UnauthenticatedError';
  message: Scalars['String']['output'];
};

export type ValidationError = {
  __typename?: 'ValidationError';
  field: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type ValidationErrors = {
  __typename?: 'ValidationErrors';
  errors: Array<ValidationError>;
};
