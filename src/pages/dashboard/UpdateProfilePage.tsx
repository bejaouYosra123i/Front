import * as Yup from 'yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import useAuth from '../../hooks/useAuth.hook';
import Button from '../../components/general/Button';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import InputField from '../../components/general/InputField';
import axiosInstance from '../../utils/axiosInstance';

interface IProfileForm {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
}

const UpdateProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const schema = Yup.object().shape({
    firstName: Yup.string().optional(),
    lastName: Yup.string().optional(),
    email: Yup.string().email('Input text must be a valid email').optional(),
    address: Yup.string().optional(),
  }) as Yup.ObjectSchema<IProfileForm>;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IProfileForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      address: user?.address || '',
    },
  });

  const onSubmit: SubmitHandler<IProfileForm> = async (data) => {
    try {
      setLoading(true);
      const payload: Record<string, string | undefined> = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        address: data.address,
      };
      Object.keys(payload).forEach(
        (key) => (payload[key] === undefined || payload[key] === null) && delete payload[key]
      );
      toast.dismiss();
      await axiosInstance.put('/Auth/update-profile', payload);
      setLoading(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      setLoading(false);
      toast.dismiss();
      toast.error(error?.response?.data || 'An error occurred. Please contact admins');
    }
  };

  return (
    <div className="flex justify-center items-start min-h-[60vh] w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-xl bg-white rounded-xl shadow p-10 mt-4 border border-gray-100"
      >
        <h1 className="text-3xl font-bold mb-1 text-gray-900 text-center">Edit Profile</h1>
        <p className="text-gray-500 mb-8 text-center">Update your personal information and preferences.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="block font-semibold mb-1 text-gray-800">First Name</label>
            <InputField control={control} inputName="firstName" error={errors.firstName?.message} />
          </div>
          <div className="flex flex-col">
            <label className="block font-semibold mb-1 text-gray-800">Last Name</label>
            <InputField control={control} inputName="lastName" error={errors.lastName?.message} />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="block font-semibold mb-1 text-gray-800">Email</label>
            <InputField control={control} inputName="email" error={errors.email?.message} />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="block font-semibold mb-1 text-gray-800">Address</label>
            <InputField control={control} inputName="address" error={errors.address?.message} />
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

export default UpdateProfilePage; 