import * as Yup from 'yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import useAuth from '../../hooks/useAuth.hook';
import Button from '../../components/general/Button';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PATH_DASHBOARD } from '../../routes/paths';
import InputField from '../../components/general/InputField';

interface IProfileForm {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  currentPassword: string;
}

const UpdateProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const { user, updateCredentials } = useAuth();

  const schema = Yup.object().shape({
    firstName: Yup.string().optional(),
    lastName: Yup.string().optional(),
    email: Yup.string().email('Input text must be a valid email').optional(),
    address: Yup.string().optional(),
    currentPassword: Yup.string().required('Current password is required'),
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
      currentPassword: '',
    },
  });

  const onSubmit: SubmitHandler<IProfileForm> = async (data) => {
    try {
      setLoading(true);
      await updateCredentials({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        address: data.address,
        currentPassword: data.currentPassword,
      });
      setLoading(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      setLoading(false);
      toast.error('An error occurred. Please contact admins');
    }
  };

  return (
    <div className="pageTemplate1">
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-h-[600px] h-4/5 bg-[#f0ecf7] flex flex-col justify-center items-center rounded-2xl">
        <h1 className="text-4xl font-bold mb-2 text-[#754eb4]">Update Profile</h1>
        <InputField control={control} label="First Name" inputName="firstName" error={errors.firstName?.message} />
        <InputField control={control} label="Last Name" inputName="lastName" error={errors.lastName?.message} />
        <InputField control={control} label="Email" inputName="email" error={errors.email?.message} />
        <InputField control={control} label="Address" inputName="address" error={errors.address?.message} />
        <InputField control={control} label="Current Password" inputName="currentPassword" inputType="password" error={errors.currentPassword?.message} />
        <div className="px-4 mt-2 mb-6 w-9/12 flex gap-2">
          <h1>Changed your mind?</h1>
          <Link to={PATH_DASHBOARD.dashboard} className="text-[#754eb4] border border-[#754eb4] hover:shadow-[0_0_5px_2px_#754eb44c] px-3 rounded-2xl duration-200">Go to Dashboard</Link>
        </div>
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button variant="secondary" type="button" label="Reset" onClick={() => reset()} />
          <Button variant="primary" type="submit" label="Update" loading={loading} />
        </div>
      </form>
    </div>
  );
};

export default UpdateProfilePage; 