import * as Yup from 'yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '../../components/general/Button';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import InputField from '../../components/general/InputField';
import axiosInstance from '../../utils/axiosInstance';

interface IPasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UpdatePasswordPage = () => {
  const [loading, setLoading] = useState(false);

  const schema = Yup.object().shape({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Please confirm your new password'),
  }) as Yup.ObjectSchema<IPasswordForm>;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IPasswordForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit: SubmitHandler<IPasswordForm> = async (data) => {
    try {
      setLoading(true);
      const payload = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };
      Object.keys(payload).forEach(
        (key) => (payload[key] === undefined || payload[key] === null) && delete payload[key]
      );
      await axiosInstance.put('/Auth/update-password', payload);
      setLoading(false);
      toast.success('Password updated successfully');
      reset();
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data || 'An error occurred. Please contact admins');
    }
  };

  return (
    <div className="flex justify-center items-start min-h-[60vh] w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-xl bg-white rounded-xl shadow p-10 mt-4 border border-gray-100"
      >
        <h1 className="text-3xl font-bold mb-1 text-gray-900 text-center">Change Password</h1>
        <p className="text-gray-500 mb-8 text-center">Update your password for your account security.</p>
        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col">
            <label className="block font-semibold mb-1 text-gray-800">Current Password</label>
            <InputField control={control} inputName="currentPassword" inputType="password" error={errors.currentPassword?.message} />
          </div>
          <div className="flex flex-col">
            <label className="block font-semibold mb-1 text-gray-800">New Password</label>
            <InputField control={control} inputName="newPassword" inputType="password" error={errors.newPassword?.message} />
          </div>
          <div className="flex flex-col">
            <label className="block font-semibold mb-1 text-gray-800">Confirm New Password</label>
            <InputField control={control} inputName="confirmPassword" inputType="password" error={errors.confirmPassword?.message} />
          </div>
        </div>
        <div className="flex justify-end mt-8">
          <Button
            variant="primary"
            type="submit"
            label="Save Changes"
            loading={loading}
            className="px-8 py-2 rounded-lg text-base bg-[#e60012] hover:bg-[#b8000e] text-white font-semibold shadow"
          />
        </div>
      </form>
    </div>
  );
};

export default UpdatePasswordPage; 