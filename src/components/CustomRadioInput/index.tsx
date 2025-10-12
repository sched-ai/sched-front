import type { ForwardRefExoticComponent, RefAttributes, ChangeEventHandler, MouseEventHandler } from 'react';

import { type LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';


export interface CustomRadioInputProps {
	label: string;
	htmlFor: string;
	image?: string;
	Icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
	onChange?: ChangeEventHandler<HTMLInputElement>;
	checked?: boolean;
	name: string;
	omit_radio?: boolean;
	value?: string;
	onClick?: MouseEventHandler<HTMLLabelElement>;
}

const CustomRadioInput = (props: CustomRadioInputProps) => {
	const {
		label,
		htmlFor,
		image,
		Icon,
		checked,
		name,
		omit_radio,
		value,
		onChange,
		onClick
	} = props;

	return (
		<label
			onClick={onClick}
			htmlFor={htmlFor}
			className={
				cn(
					'p-4 border-2 custom-2md:h-[81px] m-auto sm:m-0 w-full border-[#E1E1E1] rounded-md cursor-pointer flex items-center relative hover:shadow-[3px_4px_35px_#1417362B] transition-all group',
					{
						'border-[#141736]': checked,
					}
				)
			}
		>
			<div className='flex items-center gap-x-4'>
				{Icon && <Icon className='w-6 h-6' color='#141736' />}
				{image && <img src={image} className='sm:w-9 w-6' />}
				<p
					className={
						cn(
							'text-[16px]',
							{
								'text-[#141736]': checked,
							}
						)
					}>
					{label}
				</p>
			</div>
			<input
				type='radio'
				name={name}
				id={htmlFor}
				className='hidden peer'
				onChange={onChange}
				checked={checked}
				value={value}
			/>
			{!omit_radio && (
				<div className='flex items-center justify-center absolute top-4 right-4 h-6 w-6 rounded-full bg-[#F9F9F9] border-2 border-gray-200  peer-checked:bg-primary group-hover:bg-primary transition-all'>
					<div className='bg-[#F9F9F9] flex h-2 w-2 rounded-full'/>
				</div>
			)}
		</label>
	);
};

export default CustomRadioInput;