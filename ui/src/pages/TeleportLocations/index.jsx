import React, { useEffect, useState } from 'react';
import {
	Grid,
	Card,
	CardContent,
	TextField,
	InputAdornment,
	IconButton,
	Button,
	Box,
	Typography,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Tabs,
	Tab,
	Divider,
	Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
	locationItem: {
		border: `1px solid ${theme.palette.border.divider}`,
		marginBottom: 8,
		borderRadius: 8,
		'&:hover': {
			backgroundColor: theme.palette.action.hover,
		},
	},
	coords: {
		fontFamily: 'monospace',
		fontSize: '0.875rem',
		color: theme.palette.text.alt,
	},
}));

export default () => {
	const classes = useStyles();
	const [locations, setLocations] = useState([]);
	const [filteredLocations, setFilteredLocations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('all');
	const [teleportDialog, setTeleportDialog] = useState({ open: false, location: null });
	const [addDialog, setAddDialog] = useState(false);
	const [newLocation, setNewLocation] = useState({
		name: '',
		category: 'general',
		x: '',
		y: '',
		z: '',
	});
	const [coordInputMode, setCoordInputMode] = useState('manual'); // 'manual' or 'vector'
	const [vectorInput, setVectorInput] = useState('');
	const [editDialog, setEditDialog] = useState({ open: false, location: null });
	const [deleteDialog, setDeleteDialog] = useState({ open: false, location: null });
	const [currentCoords, setCurrentCoords] = useState(null);
	const [loadingCoords, setLoadingCoords] = useState(false);

	useEffect(() => {
		fetchLocations();
	}, []);

	useEffect(() => {
		applyFilters();
	}, [locations, search, categoryFilter]);

	const fetchLocations = async () => {
		setLoading(true);
		try {
			let res = await (await Nui.send('GetTeleportLocations', {})).json();
			if (res) {
				setLocations(res);
			}
		} catch (e) {
			setLocations([]);
		}
		setLoading(false);
	};

	const applyFilters = () => {
		let filtered = [...locations];

		if (search) {
			filtered = filtered.filter((loc) =>
				loc.name?.toLowerCase().includes(search.toLowerCase())
			);
		}

		if (categoryFilter !== 'all') {
			filtered = filtered.filter((loc) => loc.category === categoryFilter);
		}

		setFilteredLocations(filtered);
	};

	const handleTeleport = async (location) => {
		try {
			let res = await (
				await Nui.send('TeleportToLocation', { locationId: location.id })
			).json();
			if (res && res.success) {
				toast.success(`Teleported to ${location.name}`);
				setTeleportDialog({ open: false, location: null });
			} else {
				toast.error('Failed to teleport');
			}
		} catch (e) {
			toast.error('Error teleporting');
		}
	};

	const getCurrentLocation = async () => {
		setLoadingCoords(true);
		try {
			let res = await (await Nui.send('GetCurrentCoordinates', {})).json();
			if (res && res.coords) {
				setCurrentCoords(res.coords);
				setNewLocation({
					...newLocation,
					x: res.coords.x.toString(),
					y: res.coords.y.toString(),
					z: res.coords.z.toString(),
				});
				toast.success('Current location loaded');
			} else {
				toast.error('Failed to get current location');
			}
		} catch (e) {
			toast.error('Error getting current location');
		}
		setLoadingCoords(false);
	};

	const parseVectorString = (vectorStr) => {
		// Handle format like "425.1909-98246653071112575625" or "425.1909, -982.466, 53.071"
		// Try different separators
		let parts = [];
		
		// Try comma-separated first
		if (vectorStr.includes(',')) {
			parts = vectorStr.split(',').map(p => p.trim());
		} else if (vectorStr.includes('-') && vectorStr.split('-').length === 3) {
			// Handle format like "425.1909-98246653071112575625" (x-y-z)
			parts = vectorStr.split('-');
		} else if (vectorStr.includes(' ')) {
			parts = vectorStr.split(/\s+/);
		} else {
			// Try to split by common patterns
			const match = vectorStr.match(/(-?\d+\.?\d*)/g);
			if (match && match.length >= 3) {
				parts = match.slice(0, 3);
			}
		}

		if (parts.length >= 3) {
			return {
				x: parseFloat(parts[0]) || 0,
				y: parseFloat(parts[1]) || 0,
				z: parseFloat(parts[2]) || 0,
			};
		}
		return null;
	};

	const handleVectorInput = (value) => {
		setVectorInput(value);
		const parsed = parseVectorString(value);
		if (parsed) {
			setNewLocation({
				...newLocation,
				x: parsed.x.toString(),
				y: parsed.y.toString(),
				z: parsed.z.toString(),
			});
		}
	};

	const copyCoords = (location) => {
		if (location?.coords) {
			const coordsStr = `${location.coords.x}-${location.coords.y}-${location.coords.z}`;
			Nui.copyClipboard(coordsStr);
			toast.success('Coordinates copied to clipboard');
		}
	};

	const copyVector3 = (location) => {
		if (location?.coords) {
			const vectorStr = `vector3(${location.coords.x}, ${location.coords.y}, ${location.coords.z})`;
			Nui.copyClipboard(vectorStr);
			toast.success('Vector3 copied to clipboard');
		}
	};

	const handleAddLocation = async () => {
		if (!newLocation.name) {
			toast.error('Please enter a location name');
			return;
		}

		if (!newLocation.x || !newLocation.y || !newLocation.z) {
			toast.error('Please fill in all coordinate fields');
			return;
		}

		const coords = {
			x: parseFloat(newLocation.x),
			y: parseFloat(newLocation.y),
			z: parseFloat(newLocation.z),
		};

		if (isNaN(coords.x) || isNaN(coords.y) || isNaN(coords.z)) {
			toast.error('Invalid coordinates');
			return;
		}

		try {
			let res = await (
				await Nui.send('AddTeleportLocation', {
					name: newLocation.name,
					category: newLocation.category,
					coords: coords,
				})
			).json();
			if (res && res.success) {
				toast.success('Location added successfully');
				setAddDialog(false);
				setNewLocation({ name: '', category: 'general', x: '', y: '', z: '' });
				setVectorInput('');
				setCurrentCoords(null);
				fetchLocations();
			} else {
				toast.error('Failed to add location');
			}
		} catch (e) {
			toast.error('Error adding location');
		}
	};

	const handleDeleteLocation = async () => {
		if (!deleteDialog.location) return;
		try {
			let res = await (
				await Nui.send('DeleteTeleportLocation', { locationId: deleteDialog.location.id })
			).json();
			if (res && res.success) {
				toast.success('Location deleted successfully');
				setDeleteDialog({ open: false, location: null });
				fetchLocations();
			} else {
				toast.error('Failed to delete location');
			}
		} catch (e) {
			toast.error('Error deleting location');
		}
	};

	const categories = ['all', 'general', 'spawn', 'business', 'property', 'custom'];

	return (
		<div className={classes.wrapper}>
			<Card className={classes.card}>
				<CardContent>
					<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
						<Typography variant="h5">Teleport Locations</Typography>
						<Button
							variant="contained"
							color="primary"
							startIcon={<FontAwesomeIcon icon={['fas', 'plus']} />}
							onClick={() => setAddDialog(true)}
						>
							Add Location
						</Button>
					</Box>

					<Grid container spacing={2} style={{ marginBottom: 16 }}>
						<Grid item xs={12} md={8}>
							<TextField
								fullWidth
								variant="outlined"
								placeholder="Search locations..."
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
								<InputLabel>Category</InputLabel>
								<Select
									value={categoryFilter}
									onChange={(e) => setCategoryFilter(e.target.value)}
									label="Category"
								>
									{categories.map((cat) => (
										<MenuItem key={cat} value={cat}>
											{cat.charAt(0).toUpperCase() + cat.slice(1)}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
					</Grid>

					{loading ? (
						<Loader text="Loading locations..." />
					) : (
						<List>
							{filteredLocations.map((location) => (
								<ListItem
									key={location.id}
									className={classes.locationItem}
									button
									onClick={() => setTeleportDialog({ open: true, location })}
								>
									<ListItemText
										primary={location.name}
										secondary={
											<Box>
												<span className={classes.coords}>
													X: {location.coords?.x?.toFixed(4)}, Y:{' '}
													{location.coords?.y?.toFixed(4)}, Z:{' '}
													{location.coords?.z?.toFixed(4)}
												</span>
												<br />
												<Typography variant="caption" color="textSecondary">
													{location.coords?.x}-{location.coords?.y}-{location.coords?.z}
												</Typography>
											</Box>
										}
									/>
									<ListItemSecondaryAction>
										<Chip
											label={location.category || 'general'}
											size="small"
											style={{ marginRight: 8 }}
										/>
										<Tooltip title="Copy coordinates">
											<IconButton
												size="small"
												onClick={(e) => {
													e.stopPropagation();
													copyCoords(location);
												}}
											>
												<FontAwesomeIcon icon={['fas', 'copy']} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Copy vector3">
											<IconButton
												size="small"
												onClick={(e) => {
													e.stopPropagation();
													copyVector3(location);
												}}
											>
												<FontAwesomeIcon icon={['fas', 'code']} />
											</IconButton>
										</Tooltip>
										<Button
											size="small"
											variant="contained"
											color="primary"
											onClick={(e) => {
												e.stopPropagation();
												setTeleportDialog({ open: true, location });
											}}
											style={{ marginLeft: 8 }}
										>
											Teleport
										</Button>
										<Tooltip title="Delete location">
											<IconButton
												size="small"
												color="error"
												onClick={(e) => {
													e.stopPropagation();
													setDeleteDialog({ open: true, location });
												}}
												style={{ marginLeft: 4 }}
											>
												<FontAwesomeIcon icon={['fas', 'trash']} />
											</IconButton>
										</Tooltip>
									</ListItemSecondaryAction>
								</ListItem>
							))}
						</List>
					)}
				</CardContent>
			</Card>

			<Dialog
				open={teleportDialog.open}
				onClose={() => setTeleportDialog({ open: false, location: null })}
			>
				<DialogTitle>Teleport to {teleportDialog.location?.name}</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to teleport to{' '}
						<strong>{teleportDialog.location?.name}</strong>?
					</Typography>
					{teleportDialog.location?.coords && (
						<Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
							Coordinates: {teleportDialog.location.coords.x?.toFixed(2)},{' '}
							{teleportDialog.location.coords.y?.toFixed(2)},{' '}
							{teleportDialog.location.coords.z?.toFixed(2)}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setTeleportDialog({ open: false, location: null })}>
						Cancel
					</Button>
					<Button
						onClick={() => handleTeleport(teleportDialog.location)}
						color="primary"
						variant="contained"
					>
						Teleport
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="md" fullWidth>
				<DialogTitle>Add Teleport Location</DialogTitle>
				<DialogContent>
					<TextField
						fullWidth
						label="Location Name"
						variant="outlined"
						value={newLocation.name}
						onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
						style={{ marginBottom: 16, marginTop: 8 }}
					/>
					<FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
						<InputLabel>Category</InputLabel>
						<Select
							value={newLocation.category}
							onChange={(e) =>
								setNewLocation({ ...newLocation, category: e.target.value })
							}
							label="Category"
						>
							{categories
								.filter((c) => c !== 'all')
								.map((cat) => (
									<MenuItem key={cat} value={cat}>
										{cat.charAt(0).toUpperCase() + cat.slice(1)}
									</MenuItem>
								))}
						</Select>
					</FormControl>

					{/* Coordinate Input Mode Tabs */}
					<Tabs
						value={coordInputMode}
						onChange={(e, newValue) => setCoordInputMode(newValue)}
						variant="fullWidth"
						style={{ marginBottom: 16 }}
					>
						<Tab label="Manual Input" value="manual" />
						<Tab label="Vector Format" value="vector" />
					</Tabs>

					{coordInputMode === 'manual' ? (
						<>
							<Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
								<Typography variant="subtitle2">Coordinates</Typography>
								<Button
									size="small"
									variant="outlined"
									startIcon={<FontAwesomeIcon icon={['fas', 'map-marker-alt']} />}
									onClick={getCurrentLocation}
									disabled={loadingCoords}
								>
									{loadingCoords ? 'Loading...' : 'Use Current Location'}
								</Button>
							</Box>
							{currentCoords && (
								<Box mb={2} p={1} style={{ backgroundColor: '#f5f5f5', borderRadius: 4 }}>
									<Typography variant="caption" color="textSecondary">
										Current: X: {currentCoords.x.toFixed(4)}, Y: {currentCoords.y.toFixed(4)}, Z: {currentCoords.z.toFixed(4)}
									</Typography>
								</Box>
							)}
							<Grid container spacing={2}>
								<Grid item xs={4}>
									<TextField
										fullWidth
										label="X"
										variant="outlined"
										type="number"
										value={newLocation.x}
										onChange={(e) => setNewLocation({ ...newLocation, x: e.target.value })}
										InputProps={{
											endAdornment: newLocation.x && (
												<InputAdornment position="end">
													<IconButton
														size="small"
														onClick={() => setNewLocation({ ...newLocation, x: '' })}
													>
														<FontAwesomeIcon icon={['fas', 'xmark']} size="xs" />
													</IconButton>
												</InputAdornment>
											),
										}}
									/>
								</Grid>
								<Grid item xs={4}>
									<TextField
										fullWidth
										label="Y"
										variant="outlined"
										type="number"
										value={newLocation.y}
										onChange={(e) => setNewLocation({ ...newLocation, y: e.target.value })}
										InputProps={{
											endAdornment: newLocation.y && (
												<InputAdornment position="end">
													<IconButton
														size="small"
														onClick={() => setNewLocation({ ...newLocation, y: '' })}
													>
														<FontAwesomeIcon icon={['fas', 'xmark']} size="xs" />
													</IconButton>
												</InputAdornment>
											),
										}}
									/>
								</Grid>
								<Grid item xs={4}>
									<TextField
										fullWidth
										label="Z"
										variant="outlined"
										type="number"
										value={newLocation.z}
										onChange={(e) => setNewLocation({ ...newLocation, z: e.target.value })}
										InputProps={{
											endAdornment: newLocation.z && (
												<InputAdornment position="end">
													<IconButton
														size="small"
														onClick={() => setNewLocation({ ...newLocation, z: '' })}
													>
														<FontAwesomeIcon icon={['fas', 'xmark']} size="xs" />
													</IconButton>
												</InputAdornment>
											),
										}}
									/>
								</Grid>
							</Grid>
						</>
					) : (
						<>
							<Box mb={2}>
								<Typography variant="subtitle2" style={{ marginBottom: 8 }}>
									Vector Format
								</Typography>
								<Typography variant="caption" color="textSecondary" style={{ marginBottom: 8, display: 'block' }}>
									Enter coordinates in format: "425.1909-982.466-53.071" or "425.1909, -982.466, 53.071"
								</Typography>
								<TextField
									fullWidth
									variant="outlined"
									placeholder="425.1909-982.466-53.071"
									value={vectorInput}
									onChange={(e) => handleVectorInput(e.target.value)}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<FontAwesomeIcon icon={['fas', 'code']} />
											</InputAdornment>
										),
										endAdornment: vectorInput && (
											<InputAdornment position="end">
												<IconButton size="small" onClick={() => {
													setVectorInput('');
													setNewLocation({ ...newLocation, x: '', y: '', z: '' });
												}}>
													<FontAwesomeIcon icon={['fas', 'xmark']} />
												</IconButton>
											</InputAdornment>
										),
									}}
								/>
							</Box>
							{(newLocation.x || newLocation.y || newLocation.z) && (
								<Box mb={2} p={1} style={{ backgroundColor: '#e3f2fd', borderRadius: 4 }}>
									<Typography variant="caption" color="textSecondary">
										Parsed: X: {newLocation.x || '0'}, Y: {newLocation.y || '0'}, Z: {newLocation.z || '0'}
									</Typography>
								</Box>
							)}
						</>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => {
						setAddDialog(false);
						setNewLocation({ name: '', category: 'general', x: '', y: '', z: '' });
						setVectorInput('');
						setCurrentCoords(null);
					}}>
						Cancel
					</Button>
					<Button onClick={handleAddLocation} color="primary" variant="contained">
						Add Location
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialog.open}
				onClose={() => setDeleteDialog({ open: false, location: null })}
			>
				<DialogTitle>Delete Location</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to delete <strong>{deleteDialog.location?.name}</strong>?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialog({ open: false, location: null })}>Cancel</Button>
					<Button onClick={handleDeleteLocation} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

