import type { ElementType, ReactNode } from 'react';

import classNames from 'classnames';

import type { TColor, TFontSize } from '@/types';

interface IProps {
	/**
     * Orientação do texto podendo ser: `center`, `left`, `right`
     * 
     * @default left
     */
	align?: 'center' | 'left' | 'right'
	/**
     * Variante do tipo de texto. Cada tipo corresponde a um estilo diferente de tamanho de fonte, font-family ou peso.
     */
	variant?: TFontSize
	/**
     * Cor do texto. Podendo ser `black`, `white`, `gray-100`, `gray-200`, `gray-300`, `gray-400`, `gray-500`, `gray-600`, `gray-700`, `gray-800`, `gray-900`, `primary`, `secondary-l`, `primary`, `secondary-m`, `primary`, `secondary-d`, `background-l`, `background`
     */
	color?: TColor
	/**
     * Texto que será envolvido pelo Componente.
     */
	children: ReactNode
	/**
     * className personalizada do componente
     */
	className?: string
	/**
     * Tag do texto que será renderizado
     * 
     * @default p
     */
	tag?: ElementType
	/**
     * Props para adicionar classe de text-overflow ao texto
     */
	overflow?: boolean
}

const Typography = (props: IProps) => {
	const {
		align = 'left',
		variant = 'body-md',
		tag: Tag = 'p',
		className,
		color = 'black',
		children,
		overflow
	} = props;

	const styles = {
		variants: {
			'h1': 'text-h1 font-bold',
			'h2': 'text-h2 font-bold',
			'h3': 'text-h3 font-bold',
			'h4': 'text-h4 font-bold',
			'h5': 'text-h5 font-bold',
			'h6': 'text-h6 font-bold',
			'subtitle': 'text-subtitle font-bold',
			'label-lg': 'text-label-lg font-medium',
			'label-md': 'text-label-md font-medium',
			'label-sm': 'text-label-sm font-medium',
			'body-lg': 'text-body-lg',
			'body-md': 'text-body-md',
			'body-sm': 'text-body-sm',
			'caption': 'text-caption'
		},
		color: {
			'black': 'text-black',
			'white': 'text-white',
			'background': 'text-background',
			'background-l': 'text-background-l',
			'gray-100': 'text-gray-100',
			'gray-200': 'text-gray-200',
			'gray-300': 'text-gray-300',
			'gray-400': 'text-gray-400',
			'gray-500': 'text-gray-500',
			'gray-600': 'text-gray-600',
			'gray-700': 'text-gray-700',
			'gray-800': 'text-gray-800',
			'gray-900': 'text-gray-900',
			'primary': 'text-primary',
			'secondary-l': 'text-secondary-l',
			'secondary-m': 'text-secondary-m',
			'secondary-d': 'text-secondary-d',
			'error-l': 'text-error-l',
			'error-m': 'text-error-m',
			'success-l': 'text-success-l',
			'success-m': 'text-success-m',
			'warning-l': 'text-warning-l',
			'warning-m': 'text-warning-m',
			'info': 'text-info'
		},
		align: {
			'left': 'text-left',
			'center': 'text-center',
			'right': 'text-right',
		},
		overflow: 'text-ellipsis overflow-hidden whitespace-nowrap',
	};

	return (
		<Tag
			className={classNames(
				styles.align[align],
				styles.color[color],
				styles.variants[variant],
				{ [styles.overflow]: overflow },
				className,
			)}
		>
			{children}
		</Tag>
	);
};

export default Typography;