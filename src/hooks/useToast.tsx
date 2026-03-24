import { type TypeOptions, toast } from 'react-toastify';
import classNames from 'classnames';

import CustomToast from '@/components/CustomToast';
import type { IToastProps } from '@/types';

interface IToastStyles {
  before: string;
  after: string;
  background: { [key in TypeOptions]: string };
  progressClass: { [key in TypeOptions]: string };
}

const useToast = () => {
  const showToast = (props: IToastProps) => {
    const {
      toastId,
      type = 'default',
      autoClose,
    } = props;

    const styles: IToastStyles = {
      background: {
        success: 'after:bg-success-main/[.30]',
        default: 'after:bg-gray-800/[.30]',
        error: 'after:bg-red-500/[.30]',
        info: 'after:bg-blue-800/[.30]',
        warning: 'after:bg-yellow-500/[.30]',
      },
      progressClass: {
        success: 'toast-progress-success',
        default: 'toast-progress-default',
        error: 'toast-progress-error',
        info: 'toast-progress-info',
        warning: 'toast-progress-warning',
      },
      before: 'before:content[""] before:bg-white before:h-full before:w-full before:absolute before:top-0 before:left-0 before:z-[-2]',
      after: 'after:content[""] after:h-full after:w-full after:absolute after:top-0 after:left-0 after:z-[-1]',
    };

    toast(<CustomToast {...props} />, {
      toastId,
      type,
      autoClose,
      icon: false,
      progressClassName: styles.progressClass[type],
      className: classNames(
        '!rounded-lg',
        styles.background[type],
        styles.before,
        styles.after,
      ),
    });
  };

  return {
    showToast,
  };
};

export default useToast;
