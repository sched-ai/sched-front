import type { Meta, StoryObj } from '@storybook/react';

import Icon, { svg_object } from './index';

const meta = {
	title: 'Atoms/Icon',
	component: Icon,
	parameters: {
		layout: 'centered',
	},
	tags: [ 'autodocs' ]
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Icons= () => (
	<div className='flex items-center justify-center'>
		<div className='flex items-center flex-wrap w-1/2 gap-6'>
			{Object.keys(svg_object).map((icon: any, index) => (
				<Icon key={index} name={icon} />
			))}
		</div>
	</div>
);

export const Example: Story = {
	args: {
		name: 'arrowBack',
	},
};