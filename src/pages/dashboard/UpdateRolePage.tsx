import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '../../components/general/Spinner';
import { IAuthUser, IUpdateRoleDto } from '../../types/auth.types';
import axiosInstance from '../../utils/axiosInstance';
import { UPDATE_ROLE_URL, USERS_LIST_URL } from '../../utils/globalConfig';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth.hook';
import { allowedRolesForUpdateArray, isAuthorizedForUpdateRole } from '../../auth/auth.utils';
import Button from '../../components/general/Button';

const UpdateRolePage = () => {
  const { user: loggedInUser } = useAuth();
  const { userName } = useParams();
  const [user, setUser] = useState<IAuthUser>();
  const [role, setRole] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const getUserByUserName = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<IAuthUser>(`${USERS_LIST_URL}/${userName}`);
      const { data } = response;
      if (!isAuthorizedForUpdateRole(loggedInUser!.roles[0], data.roles[0])) {
        setLoading(false);
        toast.error('You are not authorized to update this user’s role.');
        navigate('/dashboard/users-management');
      } else {
        setUser(data);
        setRole(data?.roles[0]);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      const err = error as { data: string; status: number };
      const { status } = err;
      if (status === 404) {
        toast.error('User not found.');
      } else {
        toast.error('An error occurred. Please contact support.');
      }
      navigate('/dashboard/users-management');
    }
  };

  const updateRole = async () => {
    try {
      if (!role || !userName) return;
      setPostLoading(true);
      const updateData: IUpdateRoleDto = {
        newRole: role,
        userName,
      };
      await axiosInstance.post(UPDATE_ROLE_URL, updateData);
      setPostLoading(false);
      toast.success('Role updated successfully.');
      navigate('/dashboard/users-management');
    } catch (error) {
      setPostLoading(false);
      const err = error as { data: string; status: number };
      const { status } = err;
      if (status === 403) {
        toast.error('You are not authorized to update this user’s role.');
      } else {
        toast.error('An error occurred. Please contact support.');
      }
      navigate('/dashboard/users-management');
    }
  };

  useEffect(() => {
    getUserByUserName();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 bg-gray-50">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6 flex flex-col gap-5">
        <h1 className="text-xl font-semibold text-gray-800 text-center tracking-tight">Update User Role</h1>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-100">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Username</span>
              <span className="text-sm font-semibold text-red-600">{userName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Current Role</span>
              <span className="text-sm font-semibold text-red-600">{user?.roles[0]}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">New Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 hover:border-red-300"
            style={{ borderColor: '#E60012' }}
          >
            {allowedRolesForUpdateArray(loggedInUser).map((item) => (
              <option key={item} value={item} className="text-gray-700">
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            label="Cancel"
            onClick={() => navigate('/dashboard/users-management')}
            type="button"
            variant="secondary"
            customClasses="bg-gray-500 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition duration-200"
          />
          <Button
            label="Update"
            onClick={updateRole}
            type="button"
            variant="primary"
            loading={postLoading}
            customClasses="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export default UpdateRolePage;