import React, { useEffect, useState } from 'react';
import {
	List,
	ListItem,
	ListItemText,
	Grid,
	Alert,
	Button,
	Avatar,
	TextField,
	InputAdornment,
	IconButton,
	ButtonGroup,
	FormGroup,
	FormControlLabel,
	Switch,
	Chip,
	MenuItem,
	ListItemButton,
	Card,
	CardContent,
	Tabs,
	Tab,
	Box,
	Typography,
	Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { toast } from 'react-toastify';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useHistory } from 'react-router-dom';

import { Loader, Modal } from '../../components';
import Nui from '../../util/Nui';
import { useSelector } from 'react-redux';
import { round } from 'lodash';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		padding: '24px',
		height: '100%',
		overflowY: 'auto',
	},
	header: {
		marginBottom: 24,
	},
	actionButtons: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: 8,
		marginBottom: 24,
	},
	card: {
		marginBottom: 16,
	},
	tabPanel: {
		padding: '24px 0',
	},
	infoItem: {
		padding: '12px 0',
		borderBottom: `1px solid ${theme.palette.border.divider}`,
		'&:last-child': {
			borderBottom: 'none',
		},
	},
	infoLabel: {
		fontSize: '0.875rem',
		color: theme.palette.text.alt,
		marginBottom: 4,
		textTransform: 'uppercase',
		letterSpacing: '0.5px',
	},
	infoValue: {
		fontSize: '1rem',
		color: theme.palette.text.main,
		fontWeight: 500,
	},
	editorField: {
		marginBottom: 10,
	},
}));

const banLengths = [
	{
		name: '1 Day',
		value: 1,
		permissionLevel: 75,
	},
	{
		name: '2 Day',
		value: 2,
		permissionLevel: 75,
	},
	{
		name: '3 Day',
		value: 3,
		permissionLevel: 75,
	},
	{
		name: '7 Day',
		value: 7,
		permissionLevel: 75,
	},
	{
		name: '14 Day',
		value: 14,
		permissionLevel: 99,
	},
	{
		name: '30 Day',
		value: 30,
		permissionLevel: 99,
	},
	{
		name: 'Permanent',
		value: -1,
		permissionLevel: 99,
	},
]

export default ({ match }) => {
	const classes = useStyles();
	const history = useHistory();
	const user = useSelector(state => state.app.user);
	const permissionName = useSelector(state => state.app.permissionName);
	const permissionLevel = useSelector(state => state.app.permissionLevel);

	const [err, setErr] = useState(false);
	const [loading, setLoading] = useState(false);

	const [player, setPlayer] = useState(null);

	const [kick, setKick] = useState(false);
	const [pendingKick, setPendingKick] = useState('');

	const [ban, setBan] = useState(false);
	const [pendingBanReason, setPendingBanReason] = useState('');
	const [pendingBanLength, setPendingBanLength] = useState(1);
	const [activeTab, setActiveTab] = useState(0);
	const [notes, setNotes] = useState([]);
	const [newNote, setNewNote] = useState('');

	const fetch = async (forced) => {
		if (!player || player.Source != match.params.id || forced) {
			setLoading(true);
			try {
				let res = await (await Nui.send('GetPlayer', parseInt(match.params.id))).json();
	
				
				if (res) {
					setPlayer(res);
				} else toast.error('Unable to Load');
			} catch (err) {
				console.log(err);
				toast.error('Unable to Load');
				setErr(true);

				// setPlayer({
				// 	AccountID: 1,
				// 	Source: 1,
				// 	Name: 'Dr Nick',
				// 	Level: 100,
				// 	Identifier: '7888128828188291',
				// 	StaffGroup: 'Staff',
				// 	Character: {
				// 		First: 'Walter',
				// 		Last: 'Western',
				// 		SID: 3,
				// 		DOB: 662687999,
				// 		Coords: {
				// 			x: 1000.123123123,
				// 			y: 1,
				// 			z: 9,
				// 		}
				// 	},
				// 	Disconnected: true,
				// 	DisconnectedTime: 1641993114,
				// 	Reconnected: 2,
				// 	Reason: 'Exiting',
				// })
			}
			setLoading(false);
		}
	};

	useEffect(() => {
		fetch();
	}, [match]);

	const onRefresh = () => {
		fetch(true);
	};

	const openForumUrl = () => {
		Nui.copyClipboard(`https://mythicrp.com/members/${player.AccountID}/`);
		toast.success('Copied URL');
	};

	const copyCoords = () => {
		Nui.copyClipboard(`vector3(${round(player.Character.Coords?.x, 3)}, ${round(player.Character.Coords?.y, 3)}, ${round(player.Character.Coords?.z, 3)})`);
		toast.success('Copied Coordinates');
	};

	const onAction = async (action) => {
		try {
			let res = await (await Nui.send('ActionPlayer', {
				targetSource: player?.Source,
				action: action,
			})).json();

			if (res && res.success) {
				toast.success(res.message);
			} else {
				if (res && res.message) {
					toast.error(res.message);
				} else {
					toast.error('Error');
				}
			}
		} catch (err) {
			toast.error('Error');
		}
	}

	const startKick = () => {
		setPendingKick('');
		setKick(true);
	}

	const onKick = async (e) => {
		e.preventDefault();
		setKick(false);
		setLoading(true);

		try {
			let res = await (await Nui.send('KickPlayer', {
				targetSource: player?.Source,
				reason: e.target.kickReason.value,
			})).json();

			if (res && res.success) {
				toast.success(`Kicked ${player?.Name ?? 'Player'}`);
				history.goBack();
			} else {
				if (res.message) {
					toast.error(res.message);
				} else {
					toast.error('Failed to Kick Player');
				}
			}
		} catch (err) {
			toast.error('Error Kicking Player');
		}

		setLoading(false);
	};

	const startBan = () => {
		setPendingBanLength(1);
		setPendingBanReason('');
		setBan(true);
	}

	const onBan = async (e) => {
		e.preventDefault();
		setBan(false);
		setLoading(true);

		try {
			let res = await (await Nui.send('BanPlayer', {
				targetSource: player?.Source,
				reason: e.target.banReason.value,
				length: parseInt(e.target.banLength.value),
			})).json();

			if (res && res.success) {
				toast.success(`Banned ${player?.Name ?? 'Player'}`);
			} else {
				if (res.message) {
					toast.error(res.message);
				} else {
					toast.error('Failed to Ban Player');
				}
			}
		} catch (err) {
			toast.error('Error Banning Player');
		}

		setLoading(false);
	};

	const onDisconnectedClick = () => {
		if (player?.Reconnected) {
			history.push(`/player/${player.Reconnected}`);
		}
	};

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
	};

	const addNote = async () => {
		if (!newNote.trim()) return;
		try {
			let res = await (
				await Nui.send('AddPlayerNote', {
					targetSource: player?.Source,
					note: newNote,
				})
			).json();
			if (res && res.success) {
				setNotes([...notes, { note: newNote, timestamp: Date.now() / 1000, staff: user?.Name }]);
				setNewNote('');
				toast.success('Note added');
			}
		} catch (e) {
			toast.error('Failed to add note');
		}
	};

	const TabPanel = ({ children, value, index }) => {
		return (
			<div role="tabpanel" hidden={value !== index}>
				{value === index && <Box className={classes.tabPanel}>{children}</Box>}
			</div>
		);
	};

	return (
		<div>
			{loading || (!player && !err) ? (
				<div
					className={classes.wrapper}
					style={{ position: 'relative' }}
				>
					<Loader static text="Loading" />
				</div>
			) : err ? (
				<Grid className={classes.wrapper} container>
					<Grid item xs={12}>
						<Alert variant="outlined" severity="error">
							Invalid Player
						</Alert>
					</Grid>
				</Grid>
			) : (
				<div className={classes.wrapper}>
					{/* Header */}
					<Box className={classes.header}>
						<Typography variant="h4" style={{ marginBottom: 8 }}>
							{player.Character ? `${player.Character.First} ${player.Character.Last}` : player.Name}
						</Typography>
						<Typography variant="body2" color="textSecondary">
							Account ID: {player.AccountID} | Source: {player.Source}
							{player.StaffGroup && ` | Staff: ${player.StaffGroup}`}
						</Typography>
					</Box>

					{/* Action Buttons */}
					<Box className={classes.actionButtons}>
						<Button
							variant="contained"
							color="primary"
							onClick={() => onAction('goto')}
							disabled={!player?.Character || user?.Source === player.Source || player.Disconnected}
							startIcon={<FontAwesomeIcon icon={['fas', 'location-arrow']} />}
						>
							Goto
						</Button>
						<Button
							variant="contained"
							color="primary"
							onClick={() => onAction('bring')}
							disabled={!player?.Character || user?.Source === player.Source || permissionLevel < player.Level || player.Disconnected}
							startIcon={<FontAwesomeIcon icon={['fas', 'user-plus']} />}
						>
							Bring
						</Button>
						<Button
							variant="contained"
							color="success"
							onClick={() => onAction('heal')}
							disabled={!player?.Character || player.Disconnected || (user?.Source === player.Source && permissionLevel < 75)}
							startIcon={<FontAwesomeIcon icon={['fas', 'heart']} />}
						>
							Heal
						</Button>
						<Button
							variant="contained"
							color="primary"
							onClick={() => onAction('attach')}
							disabled={!player?.Character || user?.Source === player.Source || permissionLevel < player.Level || player.Disconnected}
							startIcon={<FontAwesomeIcon icon={['fas', 'eye']} />}
						>
							Spectate
						</Button>
						<Button
							variant="contained"
							color="warning"
							onClick={startKick}
							disabled={user?.Source === player.Source || permissionLevel < player.Level}
							startIcon={<FontAwesomeIcon icon={['fas', 'door-open']} />}
						>
							Kick
						</Button>
						<Button
							variant="contained"
							color="error"
							onClick={startBan}
							disabled={user?.Source === player.Source || permissionLevel < player.Level || permissionLevel < 75}
							startIcon={<FontAwesomeIcon icon={['fas', 'ban']} />}
						>
							Ban
						</Button>
						{permissionLevel >= 90 && (
							<Button
								variant="outlined"
								onClick={() => onAction('marker')}
								disabled={user?.Source === player.Source}
								startIcon={<FontAwesomeIcon icon={['fas', 'map-marker-alt']} />}
							>
								GPS Marker
							</Button>
						)}
						<Button variant="outlined" onClick={openForumUrl} startIcon={<FontAwesomeIcon icon={['fas', 'link']} />}>
							Copy Forum URL
						</Button>
						<Button variant="outlined" onClick={onRefresh} startIcon={<FontAwesomeIcon icon={['fas', 'refresh']} />}>
							Refresh
						</Button>
					</Box>

					{player.Disconnected && (
						<Alert severity="warning" style={{ marginBottom: 24 }}>
							Player disconnected {moment(player.DisconnectedTime * 1000).fromNow()}
							{player.Reconnected ? (
								<>
									{' '}and has since reconnected.{' '}
									<Button size="small" onClick={onDisconnectedClick}>
										View Reconnected Player
									</Button>
								</>
							) : (
								`. Reason: ${player.Reason}`
							)}
						</Alert>
					)}

					{/* Tabs */}
					<Card className={classes.card}>
						<Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
							<Tab label="Overview" icon={<FontAwesomeIcon icon={['fas', 'info-circle']} />} />
							<Tab label="Character" icon={<FontAwesomeIcon icon={['fas', 'user']} />} />
							<Tab label="Actions" icon={<FontAwesomeIcon icon={['fas', 'bolt']} />} />
							<Tab label="Notes" icon={<FontAwesomeIcon icon={['fas', 'sticky-note']} />} />
						</Tabs>

						<CardContent>
							<TabPanel value={activeTab} index={0}>
								<Grid container spacing={3}>
									<Grid item xs={12} md={6}>
										<Typography variant="h6" style={{ marginBottom: 16 }}>
											Account Information
										</Typography>
										<Box className={classes.infoItem}>
											<Typography className={classes.infoLabel}>Player Name</Typography>
											<Typography className={classes.infoValue}>
												{player.Name} {player.Source == user.Source ? '(You)' : ''}
											</Typography>
										</Box>
										<Box className={classes.infoItem}>
											<Typography className={classes.infoLabel}>Account ID</Typography>
											<Typography className={classes.infoValue}>{player.AccountID}</Typography>
										</Box>
										<Box className={classes.infoItem}>
											<Typography className={classes.infoLabel}>Identifier</Typography>
											<Typography className={classes.infoValue}>{player.Identifier}</Typography>
										</Box>
										{player.StaffGroup && (
											<Box className={classes.infoItem}>
												<Typography className={classes.infoLabel}>Staff Group</Typography>
												<Chip label={player.StaffGroup} color="primary" size="small" />
											</Box>
										)}
									</Grid>
									<Grid item xs={12} md={6}>
										<Typography variant="h6" style={{ marginBottom: 16 }}>
											Status
										</Typography>
										<Box className={classes.infoItem}>
											<Typography className={classes.infoLabel}>Online Status</Typography>
											<Chip
												label={player.Disconnected ? 'Offline' : 'Online'}
												color={player.Disconnected ? 'default' : 'success'}
												size="small"
											/>
										</Box>
										<Box className={classes.infoItem}>
											<Typography className={classes.infoLabel}>Permission Level</Typography>
											<Typography className={classes.infoValue}>{player.Level || 0}</Typography>
										</Box>
									</Grid>
								</Grid>
							</TabPanel>

							<TabPanel value={activeTab} index={1}>
								{player.Character ? (
									<Grid container spacing={3}>
										<Grid item xs={12} md={6}>
											<Typography variant="h6" style={{ marginBottom: 16 }}>
												Character Details
											</Typography>
											<Box className={classes.infoItem}>
												<Typography className={classes.infoLabel}>Character Name</Typography>
												<Typography className={classes.infoValue}>
													{player.Character.First} {player.Character.Last}
												</Typography>
											</Box>
											<Box className={classes.infoItem}>
												<Typography className={classes.infoLabel}>State ID</Typography>
												<Typography className={classes.infoValue}>{player.Character.SID}</Typography>
											</Box>
											<Box className={classes.infoItem}>
												<Typography className={classes.infoLabel}>Date of Birth</Typography>
												<Typography className={classes.infoValue}>
													{moment(player.Character.DOB * 1000).format('LL')}
												</Typography>
											</Box>
										</Grid>
										<Grid item xs={12} md={6}>
											<Typography variant="h6" style={{ marginBottom: 16 }}>
												Additional Info
											</Typography>
											{permissionLevel >= 90 && (
												<>
													<Box className={classes.infoItem}>
														<Typography className={classes.infoLabel}>Phone Number</Typography>
														<Typography className={classes.infoValue}>{player.Character.Phone}</Typography>
													</Box>
												</>
											)}
											{permissionLevel >= 90 && player.Character.Coords && (
												<Box className={classes.infoItem} onClick={copyCoords} style={{ cursor: 'pointer' }}>
													<Typography className={classes.infoLabel}>Coordinates (Click to Copy)</Typography>
													<Typography className={classes.infoValue}>
														vector3({round(player.Character.Coords.x, 3)}, {round(player.Character.Coords.y, 3)},{' '}
														{round(player.Character.Coords.z, 3)})
													</Typography>
												</Box>
											)}
										</Grid>
									</Grid>
								) : (
									<Alert severity="info">Player is not logged in to a character.</Alert>
								)}
							</TabPanel>

							<TabPanel value={activeTab} index={2}>
								<Typography variant="h6" style={{ marginBottom: 16 }}>
									Quick Actions
								</Typography>
								<Grid container spacing={2}>
									<Grid item xs={12} sm={6} md={4}>
										<Button
											fullWidth
											variant="outlined"
											onClick={() => onAction('goto')}
											disabled={!player?.Character || user?.Source === player.Source || player.Disconnected}
											startIcon={<FontAwesomeIcon icon={['fas', 'location-arrow']} />}
										>
											Teleport To Player
										</Button>
									</Grid>
									<Grid item xs={12} sm={6} md={4}>
										<Button
											fullWidth
											variant="outlined"
											onClick={() => onAction('bring')}
											disabled={!player?.Character || user?.Source === player.Source || permissionLevel < player.Level || player.Disconnected}
											startIcon={<FontAwesomeIcon icon={['fas', 'user-plus']} />}
										>
											Bring Player
										</Button>
									</Grid>
									<Grid item xs={12} sm={6} md={4}>
										<Button
											fullWidth
											variant="outlined"
											color="success"
											onClick={() => onAction('heal')}
											disabled={!player?.Character || player.Disconnected}
											startIcon={<FontAwesomeIcon icon={['fas', 'heart']} />}
										>
											Heal Player
										</Button>
									</Grid>
									<Grid item xs={12} sm={6} md={4}>
										<Button
											fullWidth
											variant="outlined"
											onClick={() => onAction('attach')}
											disabled={!player?.Character || user?.Source === player.Source || permissionLevel < player.Level || player.Disconnected}
											startIcon={<FontAwesomeIcon icon={['fas', 'eye']} />}
										>
											Spectate Player
										</Button>
									</Grid>
								</Grid>
							</TabPanel>

							<TabPanel value={activeTab} index={3}>
								<Typography variant="h6" style={{ marginBottom: 16 }}>
									Player Notes
								</Typography>
								<Box style={{ marginBottom: 16 }}>
									<TextField
										fullWidth
										multiline
										rows={3}
										variant="outlined"
										placeholder="Add a note about this player..."
										value={newNote}
										onChange={(e) => setNewNote(e.target.value)}
									/>
									<Button
										variant="contained"
										color="primary"
										onClick={addNote}
										style={{ marginTop: 8 }}
										startIcon={<FontAwesomeIcon icon={['fas', 'plus']} />}
									>
										Add Note
									</Button>
								</Box>
								<Divider style={{ margin: '16px 0' }} />
								{notes.length === 0 ? (
									<Typography color="textSecondary">No notes yet.</Typography>
								) : (
									<List>
										{notes.map((note, index) => (
											<ListItem key={index}>
												<ListItemText
													primary={note.note}
													secondary={`${note.staff} - ${moment(note.timestamp * 1000).format('MM/DD/YYYY HH:mm')}`}
												/>
											</ListItem>
										))}
									</List>
								)}
							</TabPanel>
						</CardContent>
					</Card>

					{/* Modals */}
					{player && (
						<>
							<Modal
								open={kick}
								title={`Kick ${player.Name}`}
								onSubmit={onKick}
								submitLang="Kick"
								onClose={() => setKick(false)}
							>
								<TextField
									fullWidth
									required
									variant="outlined"
									name="kickReason"
									value={pendingKick}
									onChange={(e) => setPendingKick(e.target.value)}
									label="Kick Reason"
									helperText="Please give a reason to kick the player."
									multiline
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												{pendingKick != '' && (
													<IconButton
														onClick={() =>
															setPendingKick('')
														}
													>
														<FontAwesomeIcon
															icon={['fas', 'xmark']}
														/>
													</IconButton>
												)}
											</InputAdornment>
										),
									}}
								/>
							</Modal>
							<Modal
								open={ban}
								title={`Ban ${player.Name}`}
								onSubmit={onBan}
								submitLang="Ban"
								onClose={() => setBan(false)}
							>
								<TextField
									select
									fullWidth
									name="banLength"
									label="Ban Length"
									className={classes.editorField}
									value={pendingBanLength}
									onChange={(e) => setPendingBanLength(e.target.value)}
									variant="outlined"
								>
									{banLengths.filter(l => (permissionLevel >= l.permissionLevel)).map((l) => (
										<MenuItem key={l.value} value={l.value}>
											{l.name}
										</MenuItem>
									))}
								</TextField>
								<TextField
									fullWidth
									required
									variant="outlined"
									name="banReason"
									value={pendingBanReason}
									onChange={(e) => setPendingBanReason(e.target.value)}
									label="Ban Reason"
									helperText="Please give a reason to ban the player."
									multiline
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												{pendingBanReason != '' && (
													<IconButton
														onClick={() =>
															setPendingBanReason('')
														}
													>
														<FontAwesomeIcon
															icon={['fas', 'xmark']}
														/>
													</IconButton>
												)}
											</InputAdornment>
										),
									}}
								/>
							</Modal>
						</>
					)}
				</div>
			)}
		</div>
	);
};
