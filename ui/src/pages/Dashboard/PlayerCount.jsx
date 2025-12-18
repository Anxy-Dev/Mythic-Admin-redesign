import React from 'react';
import { Grid, Card, CardContent, Divider, Avatar, Box, LinearProgress, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
	wrapper: {
		padding: '20px 10px 20px 20px',
	},
    card: {
        textAlign: 'center',
    },
    statLabel: {
        fontSize: 14,
        color: theme.palette.text.alt,
        fontWeight: 500,
        margin: 0,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 700,
        marginBottom: 4,
        color: theme.palette.text.main,
    },
}));

export default ({ players, max, queue }) => {
	const classes = useStyles();
	const theme = useTheme();

	return (
        <Card className={classes.card} variant="outlined">
            <Box display={'flex'}>
                <Box p={2} flex={'auto'}>
                    <p className={classes.statLabel}>Online Players</p>
                    <p className={classes.statValue}>{players}</p>
                </Box>
                <Box p={2} flex={'auto'}>
                    <p className={classes.statLabel}>Players in Queue</p>
                    <p className={classes.statValue}>{queue}</p>
                </Box>
            </Box>
            <Divider light />
            <CardContent style={{ padding: 23 }}>
                <LinearProgress 
                    variant="determinate" 
                    value={Math.floor((players / max) * 100)} 
                    style={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" style={{ marginTop: 8, display: 'block', textAlign: 'center' }}>
                    {Math.floor((players / max) * 100)}% Capacity
                </Typography>
            </CardContent>
        </Card>
	);
};