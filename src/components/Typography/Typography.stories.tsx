import { Meta } from '@storybook/react';

import Typography from './index';

const meta = {
	title: 'Atoms/Typography',
	component: Typography,
	parameters: {
		layout: 'centered',
	},
	tags: [ 'autodocs' ]
} satisfies Meta<typeof Typography>;

export default meta;

export const Headers = () => (
	<div className='flex flex-col gap-1'>
		<Typography variant='h1'>H1</Typography>
		<Typography variant='h2'>H2</Typography>
		<Typography variant='h3'>H3</Typography>
		<Typography variant='h4'>H4</Typography>
		<Typography variant='h5'>H5</Typography>
		<Typography variant='h6'>H6</Typography>
		<Typography variant='subtitle'>Subtitle</Typography>
	</div>
);

export const Labels = () => (
	<div className='flex flex-col gap-1'>
		<Typography variant='label-lg'>Label Large</Typography>
		<Typography variant='label-md'>Label Medium</Typography>
		<Typography variant='label-sm'>Label Small</Typography>
	</div>
);

export const Paragraphs = () => (
	<div className='flex flex-col gap-1'>
		<Typography variant='body-lg'>Body Large</Typography>
		<Typography variant='body-md'>Body Medium</Typography>
		<Typography variant='body-sm'>Body Small</Typography>
		<Typography variant='caption'>Caption</Typography>
	</div>
);