import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { ILoginDto } from '../../types/auth.types';
import InputField from '../../components/general/InputField';
import { yupResolver } from '@hookform/resolvers/yup';
import useAuth from '../../hooks/useAuth.hook';
import Button from '../../components/general/Button';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const LoginPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const loginSchema = Yup.object().shape({
    userName: Yup.string().required('User Name is required'),
    password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ILoginDto>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      userName: '',
      password: '',
    },
  });

  const onSubmitLoginForm = async (data: ILoginDto) => {
    try {
      setLoading(true);
      await login(data.userName, data.password);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      const err = error as { data: string; status: number };
      const { status } = err;
      if (status === 401) {
        toast.error('Invalid Username or Password');
      } else {
        toast.error('An Error occurred. Please contact admins');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error('Please enter your email or username');
      return;
    }
    setForgotLoading(true);
    try {
      const { data: adminUsernames } = await axiosInstance.get('/Auth/admin-usernames');
      if (!adminUsernames || adminUsernames.length === 0) {
        toast.error('No admin found. Please contact IT.');
        setForgotLoading(false);
        return;
      }
      await Promise.all(adminUsernames.map((admin: string) =>
        axiosInstance.post('/Messages/create', {
          receiverUserName: admin,
          text: `User with email/username: ${forgotEmail} requested a password reset. Please create a new password for this user and communicate it manually.`,
          type: 'RESET_PASSWORD_REQUEST',
          status: 'NEW'
        })
      ));
      toast.success('Your request has been sent to the admin(s).');
      setShowForgot(false);
      setForgotEmail('');
    } catch (err) {
      toast.error('Error sending request. Please contact admin.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col items-center p-8">
        <img src="images/yazakiLog.png" alt="Yazaki Logo" className="w-32 h-12 object-contain mb-4" />
        <h1 className="text-xl font-semibold text-gray-800 text-center">AssetSync</h1>
        <p className="text-sm font-medium text-gray-600 text-center mb-6">Manage Your Assets with Ease</p>
        <h1 className="text-lg font-semibold text-gray-800 text-center mb-4">Login</h1>
        <form onSubmit={handleSubmit(onSubmitLoginForm)} className="flex flex-col gap-3 w-full">
          <InputField
            control={control}
            label="User Name"
            inputName="userName"
            error={errors.userName?.message}
          />
          <InputField
            control={control}
            label="Password"
            inputName="password"
            inputType="password"
            error={errors.password?.message}
          />
          <div className="flex justify-between gap-3 mt-4">
            <Button
              variant="secondary"
              type="button"
              label="Reset"
              onClick={() => reset()}
              customClasses="bg-gray-500 hover:bg-gray-600 text-white rounded-full px-4 py-2 text-sm font-medium transition duration-200"
            />
            <Button
              variant="primary"
              type="submit"
              label="Login"
              loading={loading}
              customClasses="bg-red-600 hover:bg-red-700 text-white rounded-full px-4 py-2 text-sm font-medium transition duration-200"
            />
          </div>
        </form>
        <div className="mt-2 text-center w-full">
          <button
            type="button"
            className="text-red-600 hover:underline text-sm"
            onClick={() => setShowForgot(f => !f)}
          >
            Forgot password?
          </button>
        </div>
        {showForgot && (
          <div className="mt-4 flex flex-col gap-2 items-center w-full">
            <input
              type="text"
              placeholder="Enter your email or username"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-red-500"
            />
            <button
              type="button"
              className="bg-red-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-red-700 transition"
              onClick={handleForgotPassword}
              disabled={forgotLoading}
            >
              {forgotLoading ? 'Sending...' : 'Send request to admin'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;