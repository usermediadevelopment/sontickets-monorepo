import { Company, Location } from '~/core/types';

type UserName = {
  firstName: string;
  lastName: string;
};

type Role = {
  id: string;
  name: string;
};

export interface User {
  uid: string;
  name?: UserName;
  username: string;
  userRole: Role;
  email: string;
  token: string;
  notificationToken: string;
  password: string;
  role: string;
  imageProfile?: string;
  company: Company;
  locations: Location[];
}
