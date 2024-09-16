/* eslint-disable prettier/prettier */
export interface PersonalProfileView {
  accountName: string;
  id: string;
  name: string;
  fullName: string;
  email: string;
  contribute: string;
  totalWork: string;
  workId: number;
  userType: string;
  default: boolean;
  position: string;
  imageId: string;
  urlAvatar: string;
  projectId: number | null;
  userCreate: boolean;
  enableEmail: boolean;
  enableNotification: boolean;
}
