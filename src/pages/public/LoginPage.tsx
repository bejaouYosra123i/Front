import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { ILoginDto } from '../../types/auth.types';
import InputField from '../../components/general/InputField';
import { yupResolver } from '@hookform/resolvers/yup';
import useAuth from '../../hooks/useAuth.hook';
import Button from '../../components/general/Button';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

const LoginPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();

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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full mx-auto bg-gray-100 border-2 border-gray-600 rounded-xl flex flex-col lg:flex-row overflow-hidden">
        {/* Left Section (Branding) */}
        <div className="lg:flex-1 flex flex-col items-center justify-center p-8">
          <img src="images/yazakiLog.png" alt="Yazaki Logo" className="w-40 h-14 object-contain mb-6" />
          <h1 className="text-xl font-semibold text-gray-800 text-center">AssetSync</h1>
          <p className="text-sm font-medium text-gray-600 text-center mt-2">Manage Your Assets with Ease</p>
        </div>

        {/* Right Section (Form) */}
        <div className="lg:flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-xs mx-auto bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
            <h1 className="text-lg font-semibold text-gray-800 text-center">Login</h1>
            <form onSubmit={handleSubmit(onSubmitLoginForm)} className="flex flex-col gap-3">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;