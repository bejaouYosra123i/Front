import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { IRegisterDto } from '../../types/auth.types';
import InputField from '../../components/general/InputField';
import { yupResolver } from '@hookform/resolvers/yup';
import useAuth from '../../hooks/useAuth.hook';
import Button from '../../components/general/Button';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PATH_PUBLIC } from '../../routes/paths';

const RegisterPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { register } = useAuth();

  const registerSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    userName: Yup.string().required('User Name is required'),
    email: Yup.string().required('Email is required').email('Input text must be a valid email'),
    password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 character'),
    address: Yup.string().required('Address Is required'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IRegisterDto>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
      address: '',
    },
  });

  const onSubmitRegisterForm = async (data: IRegisterDto) => {
    if (emailError) return;
    try {
      setLoading(true);
      await register(data.firstName, data.lastName, data.userName, data.email, data.password, data.address);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      const err = error as { data: string; status: number };
      const { status, data } = err;
      if (status === 400 || status === 409) {
        if (typeof data === 'string' && data.toLowerCase().includes('email')) {
          toast.error(data);
        }
      } else {
        toast.error('An Error occurred. Please contact admins');
      }
    }
  };

  return (
    <div className='pageTemplate1'>
      {/* <div>Left</div> */}
      <div className='max-sm:hidden flex-1 min-h-[600px] h-4/5 bg-gradient-to-tr from-[#e60013] via-amber-400 to-[#AAC1F6] flex flex-col justify-center items-center rounded-l-2xl'>
        <div className='h-3/5 p-6 rounded-2xl flex flex-col gap-8 justify-center items-start bg-white bg-opacity-20 border border-[#ffffff55] relative'>
          <h1 className='text-6xl font-bold text-[#e60013]'>AssetSync</h1>
          <h1 className='text-3xl font-bold text-[#754eb490]'>Organize Your Assets</h1>
          <h4 className='text-3xl font-semibold text-white'>Manage with Ease</h4>
          <h4 className='text-2xl font-semibold text-white'>Version 1.0</h4>
          <div className='absolute -top-20 right-20 w-48 h-48 bg-gradient-to-br from-[#ef32d9]  to-[#89fffd] rounded-full blur-3xl'></div>
          <div className='absolute -bottom-20 right-20 w-32 h-32 bg-gradient-to-br from-[#cc2b5e] to-[#753a88] rounded-full blur-3xl'></div>
        </div>
      </div>
      {/* <div>Right</div> */}
      <form
        onSubmit={handleSubmit(onSubmitRegisterForm)}
        className='flex-1 min-h-[600px] h-4/5 bg-[#f0ecf7] flex flex-col justify-center items-center rounded-r-2xl'
      >
        <h1 className='text-4xl font-bold mb-2 text-[#754eb4]'>Register</h1>

        <InputField control={control} label='First Name' inputName='firstName' error={errors.firstName?.message} inputClassName='focus:ring-yazaki-red focus:border-yazaki-red' inputProps={{ autoComplete: 'off' }} />
        <InputField control={control} label='Last Name' inputName='lastName' error={errors.lastName?.message} inputClassName='focus:ring-yazaki-red focus:border-yazaki-red' inputProps={{ autoComplete: 'off' }} />
        <InputField control={control} label='User Name' inputName='userName' error={errors.userName?.message} inputClassName='focus:ring-yazaki-red focus:border-yazaki-red' inputProps={{ autoComplete: 'off' }} />
        <InputField control={control} label='Email' inputName='email' error={errors.email?.message || emailError} inputClassName={`focus:ring-yazaki-red focus:border-yazaki-red ${emailError ? 'border-red-500' : ''}`} inputProps={{ autoComplete: 'off' }} />
        {emailError && (
          <div className='w-full text-left text-red-600 text-sm font-semibold mb-2 px-1'>
            {emailError}
          </div>
        )}
        <InputField
          control={control}
          label='Password'
          inputName='password'
          inputType='password'
          error={errors.password?.message}
          inputClassName='focus:ring-yazaki-red focus:border-yazaki-red'
          inputProps={{ autoComplete: 'new-password' }}
        />
        <InputField control={control} label='Address' inputName='address' error={errors.address?.message} inputClassName='focus:ring-yazaki-red focus:border-yazaki-red' inputProps={{ autoComplete: 'off' }} />

        

        <div className='flex justify-center items-center gap-4 mt-6'>
          <Button variant='secondary' type='button' label='Reset' onClick={() => reset()} />
          <Button variant='primary' type='submit' label='Register' onClick={() => {}} loading={loading} />
        </div>
      </form>
    </div>
  );
};

const RegisterFormOnly = ({ existingEmails = [], onErrorEmailExists, onSuccessRegister }: { existingEmails?: string[], onErrorEmailExists?: () => void, onSuccessRegister?: () => void }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { register } = useAuth();
  const [emailError, setEmailError] = useState<string | null>(null);

  const registerSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    userName: Yup.string().required('User Name is required'),
    email: Yup.string().required('Email is required').email('Input text must be a valid email'),
    password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 character'),
    address: Yup.string().required('Address Is required'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<IRegisterDto>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
      address: '',
    },
  });

  // Vérification email déjà utilisé
  useEffect(() => {
    const email = watch('email');
    if (email && existingEmails.includes(email.trim().toLowerCase())) {
      setEmailError('This email is already used by another user');
    } else {
      setEmailError(null);
    }
  }, [watch('email'), existingEmails]);

  const onSubmitRegisterForm = async (data: IRegisterDto) => {
    if (emailError) {
      if (onErrorEmailExists) onErrorEmailExists();
      toast.error(emailError);
      return;
    }
    try {
      setLoading(true);
      await register(data.firstName, data.lastName, data.userName, data.email, data.password, data.address);
      setLoading(false);
      if (onSuccessRegister) onSuccessRegister();
    } catch (error) {
      setLoading(false);
      const err = error as { data: string; status: number };
      const { status, data } = err;
      if (status === 400 || status === 409) {
        if (typeof data === 'string' && data.toLowerCase().includes('email')) {
          toast.error(data);
          if (onErrorEmailExists) onErrorEmailExists();
        }
      } else {
        toast.error('An Error occurred. Please contact admins');
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitRegisterForm)}
      className='w-full max-w-lg mx-auto min-h-[600px] bg-white flex flex-col justify-center items-center rounded-2xl p-10 shadow-2xl border border-yazaki-red/20'
      autoComplete="off"
    >
      {/* Champs cachés pour tromper l'autofill navigateur */}
      <input type="text" name="fakeusernameremembered" autoComplete="username" style={{ display: 'none' }} />
      <input type="password" name="fakepasswordremembered" autoComplete="new-password" style={{ display: 'none' }} />
      <h1 className='text-4xl font-extrabold mb-6 text-yazaki-red tracking-tight'>Register</h1>
      <InputField control={control} label='First Name' inputName='firstName' error={errors.firstName?.message} inputClassName='focus:ring-yazaki-red focus:border-yazaki-red' inputProps={{ autoComplete: 'off' }} />
      <InputField control={control} label='Last Name' inputName='lastName' error={errors.lastName?.message} inputClassName='focus:ring-yazaki-red focus:border-yazaki-red' inputProps={{ autoComplete: 'off' }} />
      <InputField control={control} label='User Name' inputName='userName' error={errors.userName?.message} inputClassName='focus:ring-yazaki-red focus:border-yazaki-red' inputProps={{ autoComplete: 'off' }} />
      <InputField control={control} label='Email' inputName='email' error={errors.email?.message || emailError} inputClassName={`focus:ring-yazaki-red focus:border-yazaki-red ${emailError ? 'border-red-500' : ''}`} inputProps={{ autoComplete: 'off' }} />
      {emailError && (
        <div className='w-full text-left text-red-600 text-sm font-semibold mb-2 px-1'>
          {emailError}
        </div>
      )}
      <InputField
        control={control}
        label='Password'
        inputName='password'
        inputType='password'
        error={errors.password?.message}
        inputClassName='focus:ring-yazaki-red focus:border-yazaki-red'
        inputProps={{ autoComplete: 'new-password' }}
      />
      <InputField control={control} label='Address' inputName='address' error={errors.address?.message} inputClassName='focus:ring-yazaki-red focus:border-yazaki-red' inputProps={{ autoComplete: 'off' }} />
      <div className='flex justify-center items-center gap-4 mt-8 w-full'>
        <Button variant='secondary' type='button' label='Reset' onClick={() => reset()} customClasses='bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full px-6 py-2 text-base font-semibold' />
        <Button variant='primary' type='submit' label='Register' onClick={() => {}} loading={loading} customClasses='bg-yazaki-red hover:bg-yazaki-red/90 text-white rounded-full px-6 py-2 text-base font-bold shadow' disabled={!!emailError} />
      </div>
    </form>
  );
};

export default RegisterFormOnly;