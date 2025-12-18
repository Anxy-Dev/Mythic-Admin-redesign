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
	Badge,
	Tooltip,
	Button,
	Switch,
	FormControlLabel,
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
	chatRow: {
		'&:hover': {
			backgroundColor: theme.palette.action.hover,
		},
	},
	flaggedRow: {
		backgroundColor: theme.palette.error.main + '15',
		'&:hover': {
			backgroundColor: theme.palette.error.main + '25',
		},
	},
	chatMessage: {
		maxWidth: '500px',
		wordBreak: 'break-word',
	},
	chatTime: {
		color: theme.palette.text.alt,
		fontSize: '0.875rem',
	},
	playerName: {
		fontWeight: 600,
		color: theme.palette.primary.main,
	},
	flaggedBadge: {
		marginLeft: 8,
	},
}));

const chatTypes = ['all', 'ooc', 'ic', 'me', 'do', 'advert', 'whisper', 'yell'];

export default () => {
	const classes = useStyles();
	const [chats, setChats] = useState([]);
	const [filteredChats, setFilteredChats] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [typeFilter, setTypeFilter] = useState('all');
	const [flaggedOnly, setFlaggedOnly] = useState(false);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [wordFilter, setWordFilter] = useState('');
	const PER_PAGE = 25;

	useEffect(() => {
		fetchChats();
		let interval = setInterval(() => fetchChats(), 5 * 1000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		applyFilters();
	}, [chats, search, typeFilter, flaggedOnly, wordFilter]);

	useEffect(() => {
		setTotalPages(Math.ceil(filteredChats.length / PER_PAGE));
		setPage(1);
	}, [filteredChats]);

	const fetchChats = async () => {
		setLoading(true);
		try {
			let res = await (await Nui.send('GetChatLogs', { limit: 500 })).json();
			if (res) {
				setChats(res);
			}
		} catch (e) {
			setChats([]);
		}
		setLoading(false);
	};

	const applyFilters = () => {
		let filtered = [...chats];

		if (search) {
			filtered = filtered.filter(
				(chat) =>
					chat.message?.toLowerCase().includes(search.toLowerCase()) ||
					chat.playerName?.toLowerCase().includes(search.toLowerCase()) ||
					chat.source?.toString().includes(search)
			);
		}

		if (typeFilter !== 'all') {
			filtered = filtered.filter((chat) => chat.type === typeFilter);
		}

		if (flaggedOnly) {
			filtered = filtered.filter((chat) => chat.flagged === true);
		}

		if (wordFilter) {
			const words = wordFilter.toLowerCase().split(',').map(w => w.trim());
			filtered = filtered.filter((chat) => {
				const message = chat.message?.toLowerCase() || '';
				return words.some(word => message.includes(word));
			});
		}

		// Sort by timestamp, newest first
		filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

		setFilteredChats(filtered);
	};

	const getTypeColor = (type) => {
		switch (type) {
			case 'ooc':
				return '#3b82f6';
			case 'ic':
				return '#10b981';
			case 'me':
				return '#f59e0b';
			case 'do':
				return '#8b5cf6';
			case 'advert':
				return '#ec4899';
			case 'whisper':
				return '#6b7280';
			case 'yell':
				return '#ef4444';
			default:
				return '#94a3b8';
		}
	};

	return (
		<div className={classes.wrapper}>
			<Card className={classes.card}>
				<CardContent>
					<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
						<Typography variant="h5">Chat Logs</Typography>
						<Badge badgeContent={chats.filter(c => c.flagged).length} color="error">
							<Button
								variant="outlined"
								onClick={fetchChats}
								startIcon={<FontAwesomeIcon icon={['fas', 'refresh']} />}
							>
								Refresh
							</Button>
						</Badge>
					</Box>

					<Grid container spacing={2} className={classes.filters}>
						<Grid item xs={12} md={4}>
							<TextField
								fullWidth
								variant="outlined"
								placeholder="Search chat..."
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
						<Grid item xs={12} md={3}>
							<FormControl fullWidth variant="outlined">
								<InputLabel>Chat Type</InputLabel>
								<Select
									value={typeFilter}
									onChange={(e) => setTypeFilter(e.target.value)}
									label="Chat Type"
								>
									{chatTypes.map((type) => (
										<MenuItem key={type} value={type}>
											{type.charAt(0).toUpperCase() + type.slice(1)}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={3}>
							<FormControl fullWidth variant="outlined">
								<InputLabel>Word Filter</InputLabel>
								<TextField
									fullWidth
									variant="outlined"
									placeholder="word1, word2, word3"
									value={wordFilter}
									onChange={(e) => setWordFilter(e.target.value)}
									helperText="Comma-separated words to filter"
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<FontAwesomeIcon icon={['fas', 'filter']} />
											</InputAdornment>
										),
									}}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={2}>
							<FormControlLabel
								control={
									<Switch
										checked={flaggedOnly}
										onChange={(e) => setFlaggedOnly(e.target.checked)}
									/>
								}
								label="Flagged Only"
							/>
						</Grid>
					</Grid>

					{loading ? (
						<Loader text="Loading chat logs..." />
					) : (
						<>
							<TableContainer component={Paper} variant="outlined">
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>Time</TableCell>
											<TableCell>Player</TableCell>
											<TableCell>Type</TableCell>
											<TableCell>Message</TableCell>
											<TableCell>Source</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{filteredChats
											.slice((page - 1) * PER_PAGE, page * PER_PAGE)
											.map((chat, index) => (
												<TableRow
													key={index}
													className={`${classes.chatRow} ${chat.flagged ? classes.flaggedRow : ''}`}
												>
													<TableCell className={classes.chatTime}>
														{moment(chat.timestamp * 1000).format('MM/DD HH:mm:ss')}
													</TableCell>
													<TableCell>
														<span className={classes.playerName}>
															{chat.playerName || 'Unknown'}
														</span>
														{chat.flagged && (
															<Chip
																label="FLAGGED"
																size="small"
																color="error"
																className={classes.flaggedBadge}
															/>
														)}
													</TableCell>
													<TableCell>
														<Chip
															label={chat.type || 'unknown'}
															size="small"
															style={{
																backgroundColor: getTypeColor(chat.type),
																color: '#fff',
																fontWeight: 600,
															}}
														/>
													</TableCell>
													<TableCell className={classes.chatMessage}>
														{chat.message || 'N/A'}
													</TableCell>
													<TableCell>{chat.source || 'N/A'}</TableCell>
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

