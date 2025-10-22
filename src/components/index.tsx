import { Info } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface InfoTooltipProps {
	title?: string;
	message: string;
}

export const InfoTooltip = ({ title, message }: InfoTooltipProps) => {
	const formatMessage = (msg: string) => {
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		return msg.split(urlRegex).map((part, index) =>
			urlRegex.test(part) ? (
				<a
					key={index}
					href={part}
					target='_blank'
					rel='noopener noreferrer'
					className='text-primary underline break-all'
				>
					{part}
				</a>
			) : (
				<span key={index}>{part}</span>
			)
		);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button type='button' className='ml-2 cursor-pointer hover:text-blue-500 text-[#141736]'>
					<Info className='w-4 h-4' />
				</button>
			</PopoverTrigger>
			<PopoverContent className='text-white bg-[#141736] max-w-[375px] w-full p-4 break-words whitespace-pre-line'>
				{title && <p className='font-semibold mb-1 text-md'>{title}</p>}
				<div className='space-y-1 text-sm font-light'>{formatMessage(message)}</div>
			</PopoverContent>
		</Popover>
	);
};
