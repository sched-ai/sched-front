import type { TypeOptions } from 'react-toastify';

import Typography from '@/components/Typography';
import type { IToastProps } from '@/types';

const CustomToast: React.FC<IToastProps> = (props: Pick<IToastProps, 'label' | 'message' | 'type'>) => {
  const {
    label,
    message,
    type,
  } = props;

  const textColorStyles: { [key in TypeOptions]: string } = {
    success: '!text-success-darker',
    error: '!text-error-dark',
    info: '!text-blue-900',
    warning: '!text-yellow-900',
    default: '!text-gray-900',
  };

  return (
    <div className='pr-2'>
      <Typography
        tag='p'
        variant='subtitle'
        className={textColorStyles[type]}
      >
        {label}
      </Typography>
      <Typography
        tag='p'
        className={textColorStyles[type]}
        variant='body-lg'
      >
        {message}
      </Typography>
    </div>
  );
};

export default CustomToast;