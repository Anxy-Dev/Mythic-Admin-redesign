import '@babel/polyfill';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
	ThemeProvider,
	createTheme,
	StyledEngineProvider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { HashRouter } from 'react-router-dom';

import 'react-image-lightbox/style.css';

import Panel from '../Panel';

library.add(fab, fas);

export default () => {
	const theme = 'dark';
	const job = useSelector(state => state.app.govJob);
	const hidden = useSelector(state => state.app.hidden);

	useEffect(() => {
		if (hidden) {
			document.body.style.display = 'none';
			document.body.style.visibility = 'hidden';
			document.body.style.opacity = '0';
			document.body.style.pointerEvents = 'none';
		} else {
			document.body.style.display = 'block';
			document.body.style.visibility = 'visible';
			document.body.style.opacity = '1';
			document.body.style.pointerEvents = 'auto';
		}
	}, [hidden]);

	const muiTheme = createTheme({
		typography: {
			fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'],
			fontWeightRegular: 400,
			fontWeightMedium: 500,
			fontWeightBold: 700,
			h1: {
				fontSize: '2.5rem',
				fontWeight: 700,
			},
			h2: {
				fontSize: '2rem',
				fontWeight: 600,
			},
			h3: {
				fontSize: '1.75rem',
				fontWeight: 600,
			},
			h4: {
				fontSize: '1.5rem',
				fontWeight: 600,
			},
			h5: {
				fontSize: '1.25rem',
				fontWeight: 500,
			},
			h6: {
				fontSize: '1rem',
				fontWeight: 500,
			},
		},
		palette: {
			primary: {
				main: '#6366f1',
				light: '#818cf8',
				dark: '#4f46e5',
				contrastText: '#ffffff',
			},
			secondary: {
				main: '#1e293b',
				light: '#334155',
				dark: '#0f172a',
				contrastText: '#ffffff',
			},
			error: {
				main: '#ef4444',
				light: '#f87171',
				dark: '#dc2626',
			},
			success: {
				main: '#10b981',
				light: '#34d399',
				dark: '#059669',
			},
			warning: {
				main: '#f59e0b',
				light: '#fbbf24',
				dark: '#d97706',
			},
			info: {
				main: '#3b82f6',
				light: '#60a5fa',
				dark: '#2563eb',
			},
			text: {
				main: theme === 'dark' ? '#f1f5f9' : '#1e293b',
				alt: theme === 'dark' ? 'rgba(241, 245, 249, 0.7)' : '#64748b',
				info: theme === 'dark' ? '#94a3b8' : '#94a3b8',
				light: '#ffffff',
				dark: '#0f172a',
			},
			alt: {
				green: '#10b981',
				greenDark: '#059669',
			},
			border: {
				main: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
				light: '#ffffff',
				dark: '#1e293b',
				input:
					theme === 'dark'
						? 'rgba(255, 255, 255, 0.2)'
						: 'rgba(0, 0, 0, 0.2)',
				divider:
					theme === 'dark'
						? 'rgba(255, 255, 255, 0.1)'
						: 'rgba(0, 0, 0, 0.1)',
			},
			background: {
				default: theme === 'dark' ? '#0f172a' : '#f8fafc',
				paper: theme === 'dark' ? '#1e293b' : '#ffffff',
			},
			mode: theme,
		},
		components: {
			MuiTooltip: {
				styleOverrides: {
					tooltip: {
						fontSize: 16,
						backgroundColor: '#151515',
						border: '1px solid rgba(255, 255, 255, 0.23)',
						boxShadow: `0 0 10px #000`,
					},
				},
			},
			MuiPaper: {
				styleOverrides: {
					root: {
						background: theme === 'dark' ? '#1e293b' : '#ffffff',
						backgroundImage: 'none',
					},
				},
			},
			MuiButton: {
				styleOverrides: {
					root: {
						textTransform: 'none',
						borderRadius: 8,
						fontWeight: 500,
						padding: '8px 16px',
					},
					contained: {
						boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
						'&:hover': {
							boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
						},
					},
				},
			},
			MuiCard: {
				styleOverrides: {
					root: {
						borderRadius: 12,
						boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
					},
				},
			},
			MuiAutocomplete: {
				styleOverrides: {
					paper: {
						boxShadow: '0 0 25px #000',
					},
				},
			},
			MuiBackdrop: {
				styleOverrides: {
					root: {
						height: '90%',
						width: '60%',
						margin: 'auto',
					},
				},
			},
			MuiCssBaseline: {
				styleOverrides: {
					'.Toastify__toast-container--bottom-right': {
						bottom: '0.5em !important',
						right: '0.5em !important',
						position: 'absolute !important',
					},
					'.tox-dialog-wrap__backdrop': {
						height: '90% !important',
						width: '90% !important',
						margin: 'auto !important',
						background: '#151515bf !important',
					},
					'.tox-statusbar__branding': {
						display: 'none !important',
					},
					'*': {
						'&::-webkit-scrollbar': {
							width: 6,
						},
						'&::-webkit-scrollbar-thumb': {
							background: 'rgba(0, 0, 0, 0.5)',
							transition: 'background ease-in 0.15s',
						},
						'&::-webkit-scrollbar-thumb:hover': {
							background: '#ffffff17',
						},
						'&::-webkit-scrollbar-track': {
							background: 'transparent',
						},
					},
					html: {
						background: 'transparent',
						'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
							WebkitAppearance: 'none',
							margin: 0,
						},
					},
					body: {
						position: 'relative',
						zIndex: -15,
						backgroundColor: theme === 'dark' ? '#0f172a' : '#f1f5f9',
						position: 'absolute',
						top: 0,
						bottom: 0,
						left: 0,
						right: 0,
						margin: 'auto',
						height: '90%',
						width: '65%',
						borderRadius: 16,
						overflowY: 'auto',
						overflowX: 'hidden',
						paddingRight: '0px !important',
						boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
						transition: 'opacity 0.3s ease, visibility 0.3s ease',

						'.item-enter': {
							opacity: 0,
						},
						'.item-enter-active': {
							opacity: 1,
							transition: 'opacity 500ms ease-in',
						},
						'.item-exit': {
							opacity: 1,
						},
						'.item-exit-active': {
							opacity: 0,
							transition: 'opacity 500ms ease-in',
						},
						'.fade-enter': {
							opacity: 0,
						},
						'.fade-exit': {
							opacity: 1,
						},
						'.fade-enter-active': {
							opacity: 1,
						},
						'.fade-exit-active': {
							opacity: 0,
						},
						'.fade-enter-active, .fade-exit-active': {
							transition: 'opacity 500ms',
						},
					},
					'a': {
						textDecoration: 'none',
						color: '#fff',
					},
					'#root': {
						position: 'relative',
						zIndex: -10,
					},
					'@keyframes bouncing': {
						'0%': {
							bottom: 0,
							opacity: 0.25,
						},
						'100%': {
							bottom: 50,
							opacity: 1.0,
						},
					},
					'@keyframes ripple': {
						'0%': {
							transform: 'scale(.8)',
							opacity: 1,
						},
						'100%': {
							transform: 'scale(2.4)',
							opacity: 0,
						},
					},
				},
			},
		},
	});

	return (
		<StyledEngineProvider injectFirst>
			<ThemeProvider theme={muiTheme}>
				<CssBaseline />
				<HashRouter>
					<Panel />
				</HashRouter>
			</ThemeProvider>
		</StyledEngineProvider>
	);
};
