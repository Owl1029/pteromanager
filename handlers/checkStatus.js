const axios = require('axios')
const chalk = require('chalk')

const postStatus = require('./postStatus')

module.exports = function checkStatus(client) {

	if (client.config.channel.startsWith('Put')) {
		console.log(chalk.cyan('[PteroStats] ') + chalk.red('Err! Invalid Channel ID'))
		process.exit()
	} else if (client.config.panel.url.startsWith('Put')) {
		console.log(chalk.cyan('[PteroStats] ') + chalk.red('Err! Invalid Panel URL'))
		process.exit()
	} else if (client.config.panel.key.startsWith('Put')) {
		console.log(chalk.cyan('[PteroStats] ') + chalk.red('Err! Invalid Apikey'))
		process.exit()
	} else if (!client.config.panel.url.startsWith('http')) {
		console.log(chalk.cyan('[PteroStats] ') + chalk.red('Err! Invalid Panel URL'))
		console.log(chalk.cyan('[PteroStats] ') + chalk.red('1. Make sure the panel url is starts with "https://" or "http://"'))
		process.exit()
	}

	if (client.config.panel.url.endsWith('/')) client.config.panel.url = client.config.panel.url.slice(0, -1)

	const nodes = []

	const panel = {
		status: false,
		total_servers: -1,
		total_users: -1,
	}

	const panelStats = new Promise((resolve, reject) => {
		axios(client.config.panel.url + '/api/application/users', {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + client.config.panel.key
			}
		}).then((usr) => {
			axios(client.config.panel.url + '/api/application/servers', {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + client.config.panel.key
				}
			}).then((ser) => {
				panel.total_users = usr.data.meta.pagination.total
				panel.total_servers = ser.data.meta.pagination.total
				panel.status = true

				resolve()
			})
		}).catch((err) => {
			if (err.response) {
				if (err.response.status === 403) {
					console.log(chalk.cyan('[PteroStats] ') + chalk.red('Err! Invalid apikey'))
					console.log(chalk.cyan('[PteroStats] ') + chalk.red('1. Make sure the apikey is from admin page not account page'))
					console.log(chalk.cyan('[PteroStats] ') + chalk.red('2. Make sure the apikey has read permission on all options'))
					console.log(chalk.cyan('[PteroStats] ') + chalk.red('3. Make sure the apikey is exist'))
				} else if (err.response.status === 404) {
					console.log(chalk.cyan('[PteroStats] ') + chalk.red('Err! Invalid Panel URL'))
					console.log(chalk.cyan('[PteroStats] ') + chalk.red('1. Make sure the panel url is like "https://panel.example.com"'))
				} else console.log(chalk.cyan('[PteroStats] ') + chalk.red('Err! ' + err))
			} else console.log(chalk.cyan('[PteroStats] ') + chalk.red('Err! ' + err))
			resolve()
		})
	})

	const nodeStats = new Promise((resolve, reject) => {
		axios(client.config.panel.url + '/api/application/nodes?include=servers,location,allocations', {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + client.config.panel.key
			}
		}).then((res) => {
			res.data.data.forEach((node, i) => {
				axios(client.config.panel.url + '/api/application/nodes/' + node.attributes.id + '/configuration', {
					method: 'GET',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
						Authorization: 'Bearer ' + client.config.panel.key
					}
				}).then((data) => {
					const body = {
						id: node.attributes.id,
						name: node.attributes.name,
						location: node.attributes.relationships.location.attributes.short,
						allocations: node.attributes.relationships.allocations.data.length,
						status: true,
						maintenance: node.attributes.maintenance_mode,
						total_servers: node.attributes.relationships.servers.data.length,
						memory_min: node.attributes.allocated_resources.memory,
						memory_max: node.attributes.memory,
						disk_min: node.attributes.allocated_resources.disk,
						disk_max: node.attributes.disk,
					}

					const stats = new Promise((statsResolve, statsReject) => {
						axios(node.attributes.scheme + '://' + node.attributes.fqdn + ':' + node.attributes.daemon_listen + '/api/servers', {
							method: 'GET',
							headers: {
								Accept: 'application/json',
								'Content-Type': 'application/json',
								Authorization: 'Bearer ' + data.data.token
							}
						}).then((status) => {
							return statsResolve()
						}).catch((err) => {
							body.status = false
							return statsResolve()
						})
						setTimeout(() => {
							body.status = false
							return statsResolve()
						}, 1000)
					})
					stats.then(() => {
						nodes.push(body)
						if (nodes.length === res.data.data.length) resolve()
					})
				}).catch((err) => {
					resolve()
				})
			})
		}).catch((err) => {
			resolve()
		})
	})

	panelStats.then(() => {
		nodeStats.then(() => {
			nodes.sort(function (a, b) { return a.id - b.id })
			postStatus(client, panel, nodes)
		})
	})
}