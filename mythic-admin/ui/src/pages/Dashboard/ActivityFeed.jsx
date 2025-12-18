import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, List, ListItem, ListItemText, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';

import Nui from '../../util/Nui';
import { Loader } from '../../components';

const useStyles = makeStyles((theme) => ({
	card: {
		height: '100%',
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	title: {
		fontSize: '1.25rem',
		fontWeight: 600,
		color: theme.palette.text.main,
	},
	activityList: {
		maxHeight: 500,
		overflowY: 'auto',
	},
	activityItem: {
		padding: '12px 0',
		'&:not(:last-child)': {
			borderBottom: `1px solid ${theme.palette.border.divider}`,
		},
	},
	activityIcon: {
		fontSize: 16,
		marginRight: 12,
		color: theme.palette.primary.main,
	},
	activityText: {
		fontSize: '0.875rem',
		color: theme.palette.text.main,
		marginBottom: 4,
	},
	activityTime: {
		fontSize: '0.75rem',
		color: theme.palette.text.alt,
	},
	empty: {
		textAlign: 'center',
		padding: 32,
		color: theme.palette.text.alt,
	},
}));

export default () => {
	const classes = useStyles();
	const [activities, setActivities] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchActivities();
		let interval = setInterval(() => fetchActivities(), 10 * 1000);
		return () => clearInterval(interval);
	}, []);

	const fetchActivities = async () => {
		try {
			let res = await (await Nui.send('GetRecentActivity', { limit: 10 })).json();
			if (res) {
				setActivities(res);
			}
		} catch (e) {
			// Fallback to empty array
			setActivities([]);
		}
		setLoading(false);
	};

	const getActivityIcon = (type) => {
		switch (type) {
			case 'ban':
				return ['fas', 'ban'];
			case 'kick':
				return ['fas', 'door-open'];
			case 'warn':
				return ['fas', 'exclamation-triangle'];
			case 'teleport':
				return ['fas', 'location-arrow'];
			case 'heal':
				return ['fas', 'heart'];
			default:
				return ['fas', 'circle'];
		}
	};

	return (
		<Card className={classes.card}>
			<CardContent>
				<Box className={classes.header}>
					<Typography className={classes.title}>Recent Activity</Typography>
					<FontAwesomeIcon icon={['fas', 'clock']} style={{ color: '#94a3b8' }} />
				</Box>
				{loading ? (
					<Loader text="Loading activity..." />
				) : activities.length === 0 ? (
					<Box className={classes.empty}>
						<FontAwesomeIcon icon={['fas', 'inbox']} size="2x" style={{ marginBottom: 16, opacity: 0.5 }} />
						<Typography>No recent activity</Typography>
					</Box>
				) : (
					<List className={classes.activityList}>
						{activities.map((activity, index) => (
							<ListItem key={index} className={classes.activityItem} disableGutters>
								<FontAwesomeIcon
									icon={getActivityIcon(activity.type)}
									className={classes.activityIcon}
								/>
								<ListItemText
									primary={
										<Typography className={classes.activityText}>
											{activity.message || `${activity.staffName} performed ${activity.type} on ${activity.targetName}`}
										</Typography>
									}
									secondary={
										<Typography className={classes.activityTime}>
											{moment(activity.timestamp * 1000).fromNow()}
										</Typography>
									}
								/>
							</ListItem>
						))}
					</List>
				)}
			</CardContent>
		</Card>
	);
};

