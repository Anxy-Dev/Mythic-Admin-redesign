import React from 'react';
import { Card, CardContent, Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const useStyles = makeStyles((theme) => ({
	card: {
		height: '100%',
		background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.dark}05 100%)`,
		border: `1px solid ${theme.palette.border.divider}`,
		transition: 'all 0.3s ease',
		'&:hover': {
			transform: 'translateY(-4px)',
			boxShadow: `0 10px 20px ${theme.palette.primary.main}20`,
		},
	},
	icon: {
		fontSize: 32,
		color: theme.palette.primary.main,
		marginBottom: 8,
	},
	value: {
		fontSize: '2rem',
		fontWeight: 700,
		color: theme.palette.text.main,
		marginBottom: 4,
	},
	label: {
		fontSize: '0.875rem',
		color: theme.palette.text.alt,
		textTransform: 'uppercase',
		letterSpacing: '0.5px',
	},
	change: {
		fontSize: '0.75rem',
		marginTop: 8,
		display: 'flex',
		alignItems: 'center',
		gap: 4,
	},
}));

export default ({ icon, value, label, change, changeType = 'neutral' }) => {
	const classes = useStyles();

	const getChangeColor = () => {
		switch (changeType) {
			case 'positive':
				return '#10b981';
			case 'negative':
				return '#ef4444';
			default:
				return '#94a3b8';
		}
	};

	return (
		<Card className={classes.card}>
			<CardContent>
				<Box display="flex" flexDirection="column">
					<FontAwesomeIcon icon={icon} className={classes.icon} />
					<Typography className={classes.value}>{value}</Typography>
					<Typography className={classes.label}>{label}</Typography>
					{change !== undefined && (
						<Typography
							className={classes.change}
							style={{ color: getChangeColor() }}
						>
							{changeType === 'positive' && (
								<FontAwesomeIcon icon={['fas', 'arrow-up']} size="xs" />
							)}
							{changeType === 'negative' && (
								<FontAwesomeIcon icon={['fas', 'arrow-down']} size="xs" />
							)}
							{change}
						</Typography>
					)}
				</Box>
			</CardContent>
		</Card>
	);
};

