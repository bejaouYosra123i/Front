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

interface IPasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UpdatePasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const { updateCredentials } = useAuth();

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
      await updateCredentials({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setLoading(false);
      toast.success('Password updated successfully');
      reset();
    } catch (error) {
      setLoading(false);
      toast.error('An error occurred. Please contact admins');
    }
  };

  return (
    <div className="pageTemplate1">
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-h-[400px] h-4/5 bg-[#f0ecf7] flex flex-col justify-center items-center rounded-2xl">
        <h1 className="text-4xl font-bold mb-2 text-[#754eb4]">Change Password</h1>
        <InputField control={control} label="Current Password" inputName="currentPassword" inputType="password" error={errors.currentPassword?.message} />
        <InputField control={control} label="New Password" inputName="newPassword" inputType="password" error={errors.newPassword?.message} />
        <InputField control={control} label="Confirm New Password" inputName="confirmPassword" inputType="password" error={errors.confirmPassword?.message} />
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

export default UpdatePasswordPage; 