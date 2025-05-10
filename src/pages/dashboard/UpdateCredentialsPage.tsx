import * as Yup from 'yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { IUpdateCredentialsDto } from '../../types/auth.types';
import InputField from '../../components/general/InputField';
import { yupResolver } from '@hookform/resolvers/yup';
import useAuth from '../../hooks/useAuth.hook';
import Button from '../../components/general/Button';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PATH_DASHBOARD, PATH_PUBLIC } from '../../routes/paths';

const UpdateCredentialsPage = () => {
const [loading, setLoading] = useState<boolean>(false);
const { updateCredentials, user } = useAuth();

const updateCredentialsSchema = Yup.object().shape({
currentPassword: Yup.string().required('Current Password is required'),
firstName: Yup.string().optional(),
lastName: Yup.string().optional(),
email: Yup.string().email('Input text must be a valid email').optional(),
newPassword: Yup.string().min(8, 'Password must be at least 8 characters').optional(),
address: Yup.string().optional(),
}) as Yup.ObjectSchema<IUpdateCredentialsDto>;

const {
control,
handleSubmit,
formState: { errors },
reset,
} = useForm<IUpdateCredentialsDto>({
resolver: yupResolver(updateCredentialsSchema),
defaultValues: {
currentPassword: '',
firstName: user?.firstName || undefined,
lastName: user?.lastName || undefined,
email: user?.email || undefined,
newPassword: undefined,
address: user?.address || undefined,
},
});

const onSubmitUpdateCredentials: SubmitHandler<IUpdateCredentialsDto> = async (data) => {
    try {
        console.log('Starting credentials update with data:', data);
        setLoading(true);
        await updateCredentials(data);
        console.log('Credentials update successful');
        setLoading(false);
        toast.success('Credentials updated successfully');
    } catch (error) {
        console.error('Error in onSubmitUpdateCredentials:', error);
        setLoading(false);
        const err = error as any;
        console.log('Error object:', err);
        
        // Handle different error formats
        let errorMessage = 'An Error occurred. Please contact admins';
        
        if (err.response?.data) {
            // Handle API error response
            const errorData = err.response.data;
            if (typeof errorData === 'string') {
                errorMessage = errorData;
            } else if (errorData.message) {
                errorMessage = errorData.message;
            } else if (errorData.title) {
                errorMessage = errorData.title;
            }
        } else if (err.message) {
            errorMessage = err.message;
        }
        
        toast.error(errorMessage);
    }
};

return (

<div className="pageTemplate1">
     <div className="max-sm:hidden flex-1 min-h-[600px] h-4/5 bg-gradient-to-tr from-[#e60013] via-amber-400 to-[#AAC1F6] flex flex-col justify-center items-center rounded-l-2xl"> 
     <div className="h-3/5 p-6 rounded-2xl flex flex-col gap-8 justify-center items-start bg-white bg-opacity-20 border border-[#ffffff55] relative"> 
     <h1 className="text-6xl font-bold text-[#e60013]">AssetSync</h1>
      <h1 className="text-3xl font-bold text-[#754eb490]">Update Your Profile</h1>
       <h4 className="text-3xl font-semibold text-white">Manage Your Details</h4> 
       <h4 className="text-2xl font-semibold text-white">Version 1.0</h4> 
       <div className="absolute -top-20 right-20 w-48 h-48 bg-gradient-to-br from-[#ef32d9] to-[#89fffd] rounded-full blur-3xl"></div> 
       <div className="absolute -bottom-20 right-20 w-32 h-32 bg-gradient-to-br from-[#cc2b5e] to-[#753a88] rounded-full blur-3xl"></div> </div> </div>
 <form onSubmit={handleSubmit(onSubmitUpdateCredentials)} 
 className="flex-1 min-h-[600px] h-4/5 bg-[#f0ecf7] flex flex-col justify-center items-center rounded-r-2xl" > <h1 className="text-4xl font-bold mb-2 text-[#754eb4]">Update Credentials</h1>
<InputField
control={control}
label="Current Password"
inputName="currentPassword"
inputType="password"
error={errors.currentPassword?.message}

/>
<InputField
control={control}
label="First Name"
inputName="firstName"
error={errors.firstName?.message}
/>
<InputField
control={control}
label="Last Name"
inputName="lastName"
error={errors.lastName?.message}
/>
<InputField
control={control}
label="Email"
inputName="email"
error={errors.email?.message}
/>
<InputField
control={control}
label="New Password"
inputName="newPassword"
inputType="password"
error={errors.newPassword?.message}
/>
<InputField
control={control}
label="Address"
inputName="address"
error={errors.address?.message}
/>

<div className="px-4 mt-2 mb-6 w-9/12 flex gap-2">
 <h1>changed your mind?</h1> <Link to={PATH_DASHBOARD.dashboard} className="text-[#754eb4] border border-[#754eb4] hover:shadow-[0_0_5px_2px_#754eb44c] px-3 rounded-2xl duration-200" > Go to Dashboard </Link> </div>
  <div className="flex justify-center items-center gap-4 mt-6"> 
    <Button variant="secondary" type="button" label="Reset" onClick={() => reset()} /> 
    <Button variant="primary" type="submit" label="Update" onClick={() => {}} loading={loading} /> 
        </div> 
  </form> </div> ); };
export default UpdateCredentialsPage;