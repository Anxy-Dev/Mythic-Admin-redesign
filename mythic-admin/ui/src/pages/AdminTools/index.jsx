import React, { useState, useEffect } from 'react';
import {
	Grid,
	Card,
	CardContent,
	CardActions,
	Button,
	Box,
	Typography,
	Chip,
	IconButton,
	Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

import Nui from '../../util/Nui';
import { useSelector } from 'react-redux';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		padding: '24px',
		height: '100%',
		overflowY: 'auto',
	},
	toolCard: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		transition: 'all 0.3s ease',
		'&:hover': {
			transform: 'translateY(-4px)',
			boxShadow: `0 10px 20px ${theme.palette.primary.main}20`,
		},
	},
	toolIcon: {
		fontSize: 48,
		color: theme.palette.primary.main,
		marginBottom: 16,
	},
	toolName: {
		fontSize: '1.25rem',
		fontWeight: 600,
		marginBottom: 8,
	},
	toolDescription: {
		fontSize: '0.875rem',
		color: theme.palette.text.alt,
		marginBottom: 16,
		flexGrow: 1,
	},
	statusChip: {
		marginBottom: 16,
	},
	quickFeatureButton: {
		marginTop: 8,
	},
}));

const adminTools = [
	{
		id: 'invisibility',
		name: 'Invisibility',
		description: 'Toggle your visibility to other players',
		icon: ['fas', 'eye-slash'],
		permissionLevel: 100,
		callback: 'ToggleInvisible',
	},
	{
		id: 'player-ids',
		name: 'Player IDs',
		description: 'Show player IDs above their heads',
		icon: ['fas', 'id-badge'],
		permissionLevel: 0,
		callback: 'ToggleIDs',
	},
	{
		id: 'noclip',
		name: 'NoClip',
		description: 'Toggle noclip mode for free movement',
		icon: ['fas', 'ghost'],
		permissionLevel: 75,
		callback: 'ToggleNoClip',
	},
	{
		id: 'godmode',
		name: 'God Mode',
		description: 'Toggle invincibility',
		icon: ['fas', 'shield'],
		permissionLevel: 90,
		callback: 'ToggleGodMode',
	},
	{
		id: 'superjump',
		name: 'Super Jump',
		description: 'Enable enhanced jumping ability',
		icon: ['fas', 'up-long'],
		permissionLevel: 75,
		callback: 'ToggleSuperJump',
	},
	{
		id: 'fastrun',
		name: 'Fast Run',
		description: 'Increase running speed',
		icon: ['fas', 'running'],
		permissionLevel: 75,
		callback: 'ToggleFastRun',
	},
];

export default () => {
	const classes = useStyles();
	const permissionLevel = useSelector(state => state.app.permissionLevel);
	const [toolStates, setToolStates] = useState({});
	const [quickFeatures, setQuickFeatures] = useState(
		JSON.parse(localStorage.getItem('adminQuickFeatures') || '[]')
	);

	useEffect(() => {
		// Load initial states
		const states = {};
		adminTools.forEach(tool => {
			states[tool.id] = false;
		});
		setToolStates(states);
	}, []);

	const handleToggle = async (tool) => {
		try {
			const newState = !toolStates[tool.id];
			let res = await (await Nui.send(tool.callback, { active: newState })).json();
			
			if (res && res.success !== false) {
				setToolStates({ ...toolStates, [tool.id]: newState });
				toast.success(`${tool.name} ${newState ? 'enabled' : 'disabled'}`);
			} else {
				toast.error(`Failed to toggle ${tool.name}`);
			}
		} catch (e) {
			toast.error(`Error toggling ${tool.name}`);
		}
	};

	const toggleQuickFeature = (toolId) => {
		const current = [...quickFeatures];
		const index = current.indexOf(toolId);
		
		if (index > -1) {
			current.splice(index, 1);
		} else {
			current.push(toolId);
		}
		
		setQuickFeatures(current);
		localStorage.setItem('adminQuickFeatures', JSON.stringify(current));
		toast.success(
			index > -1 
				? 'Removed from quick features' 
				: 'Added to quick features'
		);
	};

	const isQuickFeature = (toolId) => {
		return quickFeatures.includes(toolId);
	};

	const availableTools = adminTools.filter(
		tool => permissionLevel >= tool.permissionLevel
	);

	return (
		<div className={classes.wrapper}>
			<Typography variant="h4" style={{ marginBottom: 24 }}>
				Admin Tools
			</Typography>
			<Typography variant="body2" color="textSecondary" style={{ marginBottom: 24 }}>
				Manage your admin tools and quick features. Quick features will appear in the top bar for easy access.
			</Typography>

			<Grid container spacing={3}>
				{availableTools.map((tool) => {
					const isActive = toolStates[tool.id] || false;
					const isQuick = isQuickFeature(tool.id);

					return (
						<Grid item xs={12} sm={6} md={4} key={tool.id}>
							<Card className={classes.toolCard}>
								<CardContent>
									<Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
										<FontAwesomeIcon icon={tool.icon} className={classes.toolIcon} />
										<Typography className={classes.toolName}>{tool.name}</Typography>
										<Typography className={classes.toolDescription}>
											{tool.description}
										</Typography>
										<Chip
											label={isActive ? 'Active' : 'Inactive'}
											color={isActive ? 'success' : 'default'}
											size="small"
											className={classes.statusChip}
										/>
										{isQuick && (
											<Chip
												label="Quick Feature"
												color="primary"
												size="small"
												icon={<FontAwesomeIcon icon={['fas', 'star']} />}
												style={{ marginBottom: 8 }}
											/>
										)}
									</Box>
								</CardContent>
								<CardActions style={{ justifyContent: 'center', paddingBottom: 16 }}>
									<Button
										variant={isActive ? 'contained' : 'outlined'}
										color={isActive ? 'success' : 'primary'}
										onClick={() => handleToggle(tool)}
										startIcon={<FontAwesomeIcon icon={isActive ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']} />}
										fullWidth
									>
										{isActive ? 'Disable' : 'Enable'}
									</Button>
									<Tooltip title={isQuick ? 'Remove from quick features' : 'Add to quick features'}>
										<IconButton
											onClick={() => toggleQuickFeature(tool.id)}
											color={isQuick ? 'primary' : 'default'}
											className={classes.quickFeatureButton}
										>
											<FontAwesomeIcon icon={['fas', isQuick ? 'star' : 'star']} />
										</IconButton>
									</Tooltip>
								</CardActions>
							</Card>
						</Grid>
					);
				})}
			</Grid>
		</div>
	);
};

