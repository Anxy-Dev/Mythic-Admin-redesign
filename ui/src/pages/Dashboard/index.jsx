import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import PlayerCountHistory from './PlayerCountHistory';
import PlayerCount from './PlayerCount';
import StatsCard from './StatsCard';
import ActivityFeed from './ActivityFeed';

import Nui from '../../util/Nui';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		padding: '24px',
		height: '100%',
		overflowY: 'auto',
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: '1.25rem',
		fontWeight: 600,
		marginBottom: 16,
		color: theme.palette.text.main,
	},
	quickActions: {
		display: 'flex',
		gap: 12,
		flexWrap: 'wrap',
	},
}));

export default () => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const [serverStats, setServerStats] = useState({
		totalBans: 0,
		activeReports: 0,
		staffOnline: 0,
	});

	const pData = useSelector(state => state.data.data.playerHistory);
	const user = useSelector(state => state.app.user);

	useEffect(() => {
		fetch();
		let interval = setInterval(() => fetch(), 60 * 1000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	useEffect(() => {
		fetchServerStats();
		let statsInterval = setInterval(() => fetchServerStats(), 30 * 1000);
		return () => clearInterval(statsInterval);
	}, []);

	const fetch = async () => {
		try {
			let res = await (await Nui.send('GetPlayerHistory', {})).json();
			if (res) {
				dispatch({
					type: 'SET_DATA',
					payload: {
						type: 'playerHistory',
						data: res,
					}
				});
			}
		} catch (e) {
			console.error(e);
		}
	};

	const fetchServerStats = async () => {
		try {
			let res = await (await Nui.send('GetServerStats', {})).json();
			if (res) {
				setServerStats(res);
			}
		} catch (e) {
			// Fallback stats
			setServerStats({
				totalBans: 0,
				activeReports: 0,
				staffOnline: 0,
			});
		}
	};

	return (
		<div className={classes.wrapper}>
			<Grid container spacing={3}>
				{/* Stats Cards */}
				<Grid item xs={12}>
					<Grid container spacing={3}>
						<Grid item xs={12} sm={6} md={3}>
							<StatsCard
								icon={['fas', 'users']}
								value={pData?.current ?? 0}
								label="Online Players"
								change={`Max: ${pData?.max ?? 0}`}
								changeType="neutral"
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<StatsCard
								icon={['fas', 'clock']}
								value={pData?.queue ?? 0}
								label="Queue"
								changeType="neutral"
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<StatsCard
								icon={['fas', 'shield-halved']}
								value={serverStats.staffOnline}
								label="Staff Online"
								changeType="neutral"
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<StatsCard
								icon={['fas', 'ban']}
								value={serverStats.totalBans}
								label="Total Bans"
								changeType="neutral"
							/>
						</Grid>
					</Grid>
				</Grid>

				{/* Player Count Card */}
				<Grid item xs={12} md={8}>
					<Card>
						<CardContent>
							<Typography variant="h6" className={classes.sectionTitle}>
								Player Count
							</Typography>
							<Box mb={2}>
								<PlayerCount
									players={pData?.current ?? 0}
									max={pData?.max ?? 0}
									queue={pData?.queue ?? 0}
								/>
							</Box>
							<Divider style={{ margin: '16px 0' }} />
							<Box style={{ height: 300 }}>
								<PlayerCountHistory
									current={pData?.current ?? 0}
									history={pData?.history}
								/>
							</Box>
						</CardContent>
					</Card>
				</Grid>

				{/* Activity Feed */}
				<Grid item xs={12} md={4}>
					<ActivityFeed />
				</Grid>
			</Grid>
		</div>
	);
};