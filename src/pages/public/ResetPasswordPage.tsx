import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import InputField from '../../components/general/InputField';
import Button from '../../components/general/Button';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';

interface IResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId');
  const token = queryParams.get('token');

  const resetPasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required('New Password is required')
      .min(8, 'New Password must be at least 8 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IResetPasswordForm>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmitResetPasswordForm = async (data: IResetPasswordForm) => {
    if (!userId || !token) {
      toast.error('Invalid password reset link.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/Auth/reset-password-with-token', {
        userId: userId,
        token: token,
        newPassword: data.newPassword,
      });
      toast.success('Your password has been reset successfully.');
      navigate('/login'); // Redirect to login page on success
    } catch (err) {
      toast.error('Failed to reset password. Please try again or request a new link.');
    } finally {
      setLoading(false);
    }
  };

  if (!userId || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-red-600 font-semibold">Invalid password reset link.</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col items-center p-8">
        <h1 className="text-xl font-semibold text-gray-800 text-center mb-4">Reset Password</h1>
        <form onSubmit={handleSubmit(onSubmitResetPasswordForm)} className="flex flex-col gap-3 w-full">
          <InputField
            control={control}
            label="New Password"
            inputName="newPassword"
            inputType="password"
            error={errors.newPassword?.message}
          />
          <InputField
            control={control}
            label="Confirm New Password"
            inputName="confirmPassword"
            inputType="password"
            error={errors.confirmPassword?.message}
          />
          <div className="flex justify-center mt-4">
            <Button
              variant="primary"
              type="submit"
              label="Reset Password"
              loading={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 