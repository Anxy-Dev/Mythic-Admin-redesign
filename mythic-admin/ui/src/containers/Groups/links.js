export default (type) => {
	switch (type) {
	  case "Owner":
	  case "Admin":
		return admin;
	  case "Developer":
		return developer;
	  default:
		return staff;
	}
  };

const staff = [
	{
		name: 'home',
		icon: ['fas', 'house'],
		label: 'Dashboard',
		path: '/',
		exact: true,
	},
	{
		name: 'players',
		icon: ['fas', 'user-large'],
		label: 'Players',
		path: '/players',
		exact: true,
	},
	{
		name: 'disconnected-players',
		icon: ['fas', 'user-large-slash'],
		label: 'Disconnected Players',
		path: '/disconnected-players',
		exact: true,
	},
	// {
	// 	name: 'current-vehicle',
	// 	icon: ['fas', 'car-side'],
	// 	label: 'Current Vehicle',
	// 	path: '/current-vehicle',
	// 	exact:  true,
	// }
];

const admin = [
	{
		name: 'home',
		icon: ['fas', 'house'],
		label: 'Dashboard',
		path: '/',
		exact: true,
	},
    {
		name: 'players',
		icon: ['fas', 'user-large'],
		label: 'Players',
		path: '/players',
		exact: true,
	},
	{
		name: 'disconnected-players',
		icon: ['fas', 'user-large-slash'],
		label: 'Disconnected Players',
		path: '/disconnected-players',
		exact: true,
	},
	{
		name: 'ban-management',
		icon: ['fas', 'ban'],
		label: 'Ban Management',
		path: '/ban-management',
		exact: true,
	},
	{
		name: 'server-logs',
		icon: ['fas', 'file-lines'],
		label: 'Server Logs',
		path: '/server-logs',
		exact: true,
	},
	{
		name: 'teleport-locations',
		icon: ['fas', 'map-location-dot'],
		label: 'Teleport Locations',
		path: '/teleport-locations',
		exact: true,
	},
	{
		name: 'chat-logs',
		icon: ['fas', 'comments'],
		label: 'Chat Logs',
		path: '/chat-logs',
		exact: true,
	},
	{
		name: 'admin-tools',
		icon: ['fas', 'toolbox'],
		label: 'Admin Tools',
		path: '/admin-tools',
		exact: true,
	},
	{
		name: 'current-vehicle',
		icon: ['fas', 'car-side'],
		label: 'Current Vehicle',
		path: '/current-vehicle',
		exact:  true,
	}
];

const developer = [
	{
		name: 'home',
		icon: ['fas', 'house'],
		label: 'Dashboard',
		path: '/',
		exact: true,
	},
    {
		name: 'players',
		icon: ['fas', 'user-large'],
		label: 'Players',
		path: '/players',
		exact: true,
	},
	{
		name: 'disconnected-players',
		icon: ['fas', 'user-large-slash'],
		label: 'Disconnected Players',
		path: '/disconnected-players',
		exact: true,
	},
	{
		name: 'current-vehicle',
		icon: ['fas', 'car-side'],
		label: 'Current Vehicle',
		path: '/current-vehicle',
		exact:  true,
	}
];