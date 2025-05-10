interface IProps {
  variant: 'primary' | 'secondary' | 'danger' | 'light';
  type: 'submit' | 'button';
  label: string;
  onClick: () => void;
  loading?: boolean;
  isAdmin?: boolean;
  disabled?: boolean;
}

const Button = ({ variant, type, label, onClick, loading, isAdmin = true, disabled }: IProps) => {
  if (!isAdmin) return null;

  const primaryClasses = 'text-white bg-[#ED1C24] border-[#ED1C24] hover:shadow-[0_0_5px_5px_#ED1C244C]';
  const secondaryClasses = 'text-black bg-[#F5F5F5] border-[#F5F5F5] hover:shadow-[0_0_5px_5px_#F5F5F54C]';
  const dangerClasses = 'text-white bg-[#B22222] border-[#B22222] hover:shadow-[0_0_5px_5px_#B222224C]';
  const lightClasses = 'text-[#ED1C24] border-[#ED1C24] bg-transparent hover:shadow-[0_0_5px_5px_#ED1C244C]';

  const classNameCreator = (): string => {
    let finalClassName =
      'flex justify-center items-center outline-none duration-300 h-10 text-sm font-semibold px-6 rounded-2xl border-2';
    if (variant === 'primary') {
      finalClassName += ` ${primaryClasses}`;
    } else if (variant === 'secondary') {
      finalClassName += ` ${secondaryClasses}`;
    } else if (variant === 'danger') {
      finalClassName += ` ${dangerClasses}`;
    } else if (variant === 'light') {
      finalClassName += ` ${lightClasses}`;
    }
    finalClassName += ' disabled:shadow-none disabled:bg-[#D3D3D3] disabled:border-[#D3D3D3] disabled:text-[#696969]';
    return finalClassName;
  };

  const loadingIconCreator = () => {
    return <div className='w-6 h-6 rounded-full animate-spin border-2 border-gray-400 border-t-gray-800'></div>;
  };

  return (
    <button type={type} onClick={onClick} className={classNameCreator()} disabled={disabled}>
      {loading ? loadingIconCreator() : label}
    </button>
  );
};

export default Button;