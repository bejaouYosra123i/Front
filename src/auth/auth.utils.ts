import { IAuthUser, RolesEnum } from '../types/auth.types';
import axiosInstance from '../utils/axiosInstance';

export const setSession = (accessToken: string | null) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem('accessToken');
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

export const getSession = () => {
  return localStorage.getItem('accessToken');
};

export const allAccessRoles = [RolesEnum.ADMIN, RolesEnum.MANAGER, RolesEnum.USER, RolesEnum.IT_MANAGER, RolesEnum.RH_MANAGER, RolesEnum.PLANT_MANAGER];
export const managerAccessRoles = [ RolesEnum.ADMIN, RolesEnum.MANAGER, RolesEnum.IT_MANAGER, RolesEnum.RH_MANAGER, RolesEnum.PLANT_MANAGER];
export const adminAccessRoles = [ RolesEnum.ADMIN];


// We need to specify which Roles can be updated by Logged-in user
export const allowedRolesForUpdateArray = (loggedInUser?: IAuthUser): string[] => {
  return loggedInUser?.roles.includes(RolesEnum.ADMIN)
    ? [ RolesEnum.MANAGER, RolesEnum.USER, RolesEnum.ADMIN, RolesEnum.IT_MANAGER, RolesEnum.RH_MANAGER, RolesEnum.PLANT_MANAGER]
    : [];
};

// Also, Admin cannot change  admin role
export const isAuthorizedForUpdateRole = (currentUserRole: string, targetUserRole: string): boolean => {
  if (currentUserRole === RolesEnum.ADMIN) return true;
  if (currentUserRole === RolesEnum.MANAGER && targetUserRole === RolesEnum.USER) return true;
  return false;
};

export const isAuthorizedForDelete = (currentUserRole: string, targetUserRole: string): boolean => {
  // Même logique que pour la mise à jour des rôles
  return isAuthorizedForUpdateRole(currentUserRole, targetUserRole);
};