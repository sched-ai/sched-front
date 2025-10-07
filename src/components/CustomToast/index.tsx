import type { TypeOptions } from 'react-toastify';


import Icon from '@/components/Icon';
import Typography from '@/components/Typography';
import type { IToastProps, TIconName } from '@/types';

interface IToastIconOptions {
	styles: { [key in TypeOptions]: string };
	names: { [key in TypeOptions]: TIconName };
}

const CustomToast: React.FC<IToastProps> = (props: Pick<IToastProps, 'label' | 'message' | 'type'>) => {
	const { 
		label,
		message, 
		type,
	} = props;
	
	const text_color_styles = {
		success: '!text-success-darker',
		error: '!text-error-dark',
		info: '!text-blue-900',
		warning: '!text-yellow-900',
		default: '!text-gray-900',
	};

	const icon_options: IToastIconOptions = {
		styles: {
			success: 'fill-success-main',
			error: 'fill-error-m',
			info: 'fill-blue-800',
			warning: 'fill-yellow-800',
			default: 'fill-gray-800'
		},
		names: {
			success: 'fill_check',
			default: 'fill_info',
			error: 'fill_error',
			info: 'fill_info',
			warning: 'fill_warning',
		}
	};

	return (
		<div className='flex gap-3'>
			<div>
				<Icon 
					name={icon_options.names[type]} 
					size={24}
					className={icon_options.styles[type]}
				/>
			</div>
			<div className='ml-2'>
				<Typography 
					tag='p' 
					variant='subtitle' 
					className={text_color_styles[type]}
				>
					{label}
				</Typography>
				<Typography 
					tag='p' 
					className={text_color_styles[type]} 
					variant='body-lg'>
					{message}
				</Typography>
			</div>
		</div>
	);
};

export default CustomToast;