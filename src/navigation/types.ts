export type HomeStackParamList = {
  Home: undefined;
};

export type MainTabsParamList = {
  HomeTab: undefined;
  ProfileTab: undefined;
};

export type AuthRedirect =
  | { redirect: "MainTabs" }
  | { redirect: "MyApplications" }
  | { redirect: "VacancyDetails"; params: { vacancyId: string } };

export type RootStackParamList = {
  MainTabs: undefined;
  VacancyDetails: { vacancyId: string };
  MyApplications: undefined;
  Login: AuthRedirect | undefined;
  Register: AuthRedirect | undefined;
};
