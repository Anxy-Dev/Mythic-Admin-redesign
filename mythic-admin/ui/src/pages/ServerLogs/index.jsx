import React, { useEffect, useState } from 'react';
import {
	Grid,
	Card,
	CardContent,
	TextField,
	InputAdornment,
	IconButton,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Chip,
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Pagination,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';

import Nui from '../../util/Nui';
import { Loader } from '../../components';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		padding: '24px',
		height: '100%',
		overflowY: 'auto',
	},
	card: {
		marginBottom: 24,
	},
	filters: {
		marginBottom: 16,
	},
	logRow: {
		'&:hover': {
			backgroundColor: theme.palette.action.hover,
		},
	},
	logLevel: {
		fontWeight: 600,
	},
	logTime: {
		color: theme.palette.text.alt,
		fontSize: '0.875rem',
	},
}));

const logLevels = ['all', 'info', 'warn', 'error', 'debug'];
const logTypes = ['all', 'admin', 'player', 'system', 'punishment'];

export default () => {
	const classes = useStyles();
	const [logs, setLogs] = useState([]);
	const [filteredLogs, setFilteredLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [levelFilter, setLevelFilter] = useState('all');
	const [typeFilter, setTypeFilter] = useState('all');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const PER_PAGE = 25;

	useEffect(() => {
		fetchLogs();
		let interval = setInterval(() => fetchLogs(), 30 * 1000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		applyFilters();
	}, [logs, search, levelFilter, typeFilter]);

	useEffect(() => {
		setTotalPages(Math.ceil(filteredLogs.length / PER_PAGE));
		setPage(1);
	}, [filteredLogs]);

	const fetchLogs = async () => {
		setLoading(true);
		try {
			let res = await (await Nui.send('GetServerLogs', { limit: 500 })).json();
			if (res) {
				setLogs(res);
			}
		} catch (e) {
			setLogs([]);
		}
		setLoading(false);
	};

	const applyFilters = () => {
		let filtered = [...logs];

		if (search) {
			filtered = filtered.filter(
				(log) =>
					log.message?.toLowerCase().includes(search.toLowerCase()) ||
					log.staffName?.toLowerCase().includes(search.toLowerCase()) ||
					log.targetName?.toLowerCase().includes(search.toLowerCase())
			);
		}

		if (levelFilter !== 'all') {
			filtered = filtered.filter((log) => log.level === levelFilter);
		}

		if (typeFilter !== 'all') {
			filtered = filtered.filter((log) => log.type === typeFilter);
		}

		setFilteredLogs(filtered);
	};

	const getLevelColor = (level) => {
		switch (level) {
			case 'error':
				return '#ef4444';
			case 'warn':
				return '#f59e0b';
			case 'info':
				return '#3b82f6';
			case 'debug':
				return '#94a3b8';
			default:
				return '#94a3b8';
		}
	};

	return (
		<div className={classes.wrapper}>
			<Card className={classes.card}>
				<CardContent>
					<Typography variant="h5" style={{ marginBottom: 24 }}>
						Server Logs
					</Typography>

					<Grid container spacing={2} className={classes.filters}>
						<Grid item xs={12} md={4}>
							<TextField
								fullWidth
								variant="outlined"
								placeholder="Search logs..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<FontAwesomeIcon icon={['fas', 'search']} />
										</InputAdornment>
									),
									endAdornment: search && (
										<InputAdornment position="end">
											<IconButton size="small" onClick={() => setSearch('')}>
												<FontAwesomeIcon icon={['fas', 'xmark']} />
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
						</Grid>
						<Grid item xs={12} md={4}>
							<FormControl fullWidth variant="outlined">
								<InputLabel>Log Level</InputLabel>
								<Select
									value={levelFilter}
									onChange={(e) => setLevelFilter(e.target.value)}
									label="Log Level"
								>
									{logLevels.map((level) => (
										<MenuItem key={level} value={level}>
											{level.charAt(0).toUpperCase() + level.slice(1)}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={4}>
							<FormControl fullWidth variant="outlined">
								<InputLabel>Log Type</InputLabel>
								<Select
									value={typeFilter}
									onChange={(e) => setTypeFilter(e.target.value)}
									label="Log Type"
								>
									{logTypes.map((type) => (
										<MenuItem key={type} value={type}>
											{type.charAt(0).toUpperCase() + type.slice(1)}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
					</Grid>

					{loading ? (
						<Loader text="Loading logs..." />
					) : (
						<>
							<TableContainer component={Paper} variant="outlined">
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>Time</TableCell>
											<TableCell>Level</TableCell>
											<TableCell>Type</TableCell>
											<TableCell>Message</TableCell>
											<TableCell>Staff</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{filteredLogs
											.slice((page - 1) * PER_PAGE, page * PER_PAGE)
											.map((log, index) => (
												<TableRow key={index} className={classes.logRow}>
													<TableCell className={classes.logTime}>
														{moment(log.timestamp * 1000).format('MM/DD HH:mm:ss')}
													</TableCell>
													<TableCell>
														<Chip
															label={log.level || 'info'}
															size="small"
															style={{
																backgroundColor: getLevelColor(log.level),
																color: '#fff',
																fontWeight: 600,
															}}
														/>
													</TableCell>
													<TableCell>{log.type || 'system'}</TableCell>
													<TableCell>{log.message || 'N/A'}</TableCell>
													<TableCell>{log.staffName || 'System'}</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>
							</TableContainer>

							{totalPages > 1 && (
								<Box display="flex" justifyContent="center" mt={3}>
									<Pagination
										count={totalPages}
										page={page}
										onChange={(e, value) => setPage(value)}
										color="primary"
									/>
								</Box>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

