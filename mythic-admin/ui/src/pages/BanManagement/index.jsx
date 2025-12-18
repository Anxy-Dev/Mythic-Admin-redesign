import React, { useEffect, useState } from 'react';
import {
	Grid,
	Card,
	CardContent,
	TextField,
	InputAdornment,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	Chip,
	Box,
	Typography,
	Pagination,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { toast } from 'react-toastify';

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
	banRow: {
		'&:hover': {
			backgroundColor: theme.palette.action.hover,
		},
	},
	activeBan: {
		backgroundColor: theme.palette.error.main + '15',
	},
	expiredBan: {
		opacity: 0.6,
	},
	actionButton: {
		marginLeft: 8,
	},
}));

export default () => {
	const classes = useStyles();
	const [bans, setBans] = useState([]);
	const [filteredBans, setFilteredBans] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [unbanDialog, setUnbanDialog] = useState({ open: false, ban: null });
	const PER_PAGE = 20;

	useEffect(() => {
		fetchBans();
		let interval = setInterval(() => fetchBans(), 60 * 1000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		applyFilters();
	}, [bans, search]);

	useEffect(() => {
		setTotalPages(Math.ceil(filteredBans.length / PER_PAGE));
		setPage(1);
	}, [filteredBans]);

	const fetchBans = async () => {
		setLoading(true);
		try {
			let res = await (await Nui.send('GetBanList', {})).json();
			if (res) {
				setBans(res);
			}
		} catch (e) {
			setBans([]);
		}
		setLoading(false);
	};

	const applyFilters = () => {
		let filtered = [...bans];

		if (search) {
			filtered = filtered.filter(
				(ban) =>
					ban.playerName?.toLowerCase().includes(search.toLowerCase()) ||
					ban.accountId?.toString().includes(search) ||
					ban.reason?.toLowerCase().includes(search.toLowerCase()) ||
					ban.bannedBy?.toLowerCase().includes(search.toLowerCase())
			);
		}

		setFilteredBans(filtered);
	};

	const isBanActive = (ban) => {
		if (ban.length === -1) return true; // Permanent ban
		const expiryTime = ban.timestamp + ban.length * 24 * 60 * 60;
		return expiryTime > moment().unix();
	};

	const getBanStatus = (ban) => {
		if (!isBanActive(ban)) return { label: 'Expired', color: '#94a3b8' };
		if (ban.length === -1) return { label: 'Permanent', color: '#ef4444' };
		return { label: 'Active', color: '#10b981' };
	};

	const handleUnban = async () => {
		try {
			let res = await (
				await Nui.send('UnbanPlayer', { banId: unbanDialog.ban.id })
			).json();
			if (res && res.success) {
				toast.success('Player unbanned successfully');
				setUnbanDialog({ open: false, ban: null });
				fetchBans();
			} else {
				toast.error('Failed to unban player');
			}
		} catch (e) {
			toast.error('Error unbanning player');
		}
	};

	return (
		<div className={classes.wrapper}>
			<Card className={classes.card}>
				<CardContent>
					<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
						<Typography variant="h5">Ban Management</Typography>
						<Button
							variant="contained"
							color="primary"
							onClick={fetchBans}
							startIcon={<FontAwesomeIcon icon={['fas', 'refresh']} />}
						>
							Refresh
						</Button>
					</Box>

					<TextField
						fullWidth
						variant="outlined"
						placeholder="Search by name, account ID, reason, or staff..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						style={{ marginBottom: 16 }}
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

					{loading ? (
						<Loader text="Loading bans..." />
					) : (
						<>
							<TableContainer component={Paper} variant="outlined">
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>Player</TableCell>
											<TableCell>Account ID</TableCell>
											<TableCell>Reason</TableCell>
											<TableCell>Banned By</TableCell>
											<TableCell>Date</TableCell>
											<TableCell>Length</TableCell>
											<TableCell>Status</TableCell>
											<TableCell>Actions</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{filteredBans
											.slice((page - 1) * PER_PAGE, page * PER_PAGE)
											.map((ban, index) => {
												const status = getBanStatus(ban);
												const isActive = isBanActive(ban);
												return (
													<TableRow
														key={index}
														className={`${classes.banRow} ${
															isActive ? classes.activeBan : classes.expiredBan
														}`}
													>
														<TableCell>{ban.playerName || 'Unknown'}</TableCell>
														<TableCell>{ban.accountId || 'N/A'}</TableCell>
														<TableCell>{ban.reason || 'No reason provided'}</TableCell>
														<TableCell>{ban.bannedBy || 'System'}</TableCell>
														<TableCell>
															{moment(ban.timestamp * 1000).format('MM/DD/YYYY HH:mm')}
														</TableCell>
														<TableCell>
															{ban.length === -1
																? 'Permanent'
																: `${ban.length} day${ban.length !== 1 ? 's' : ''}`}
														</TableCell>
														<TableCell>
															<Chip
																label={status.label}
																size="small"
																style={{
																	backgroundColor: status.color,
																	color: '#fff',
																	fontWeight: 600,
																}}
															/>
														</TableCell>
														<TableCell>
															{isActive && (
																<Button
																	size="small"
																	color="error"
																	variant="outlined"
																	onClick={() =>
																		setUnbanDialog({ open: true, ban })
																	}
																>
																	Unban
																</Button>
															)}
														</TableCell>
													</TableRow>
												);
											})}
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

			<Dialog
				open={unbanDialog.open}
				onClose={() => setUnbanDialog({ open: false, ban: null })}
			>
				<DialogTitle>Unban Player</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to unban{' '}
						<strong>{unbanDialog.ban?.playerName || 'this player'}</strong>?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setUnbanDialog({ open: false, ban: null })}>Cancel</Button>
					<Button onClick={handleUnban} color="error" variant="contained">
						Unban
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

