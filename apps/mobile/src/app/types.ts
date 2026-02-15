export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type MainTabsParamList = {
  Dashboard: undefined;
  Bankroll: undefined;
  Hands: undefined;
  Profile: undefined;
};

export type DashboardStackParamList = {
  TodayDashboard: undefined;
  AddSession: undefined;
  SessionDetail: { sessionId: string };
};

export type HandsStackParamList = {
  HandFeed: undefined;
  HandPostDetail: { postId: string };
  CreateHandPost: undefined;
};
