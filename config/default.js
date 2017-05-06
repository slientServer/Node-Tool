module.exports= {
	loginInfo: {
		loginUrl: 'https://jira.successfactors.com/login.jsp',
		logoutUrl: 'https://jira.successfactors.com/logout',
		employeeId: ,
		password: ,
	},
	querySelector: 'project = CDP AND issuetype in (Defect, Performance, Security, Task) AND affectedVersion = b1705 ORDER BY key DESC',
	queryCondition: {
		key: ['Defect type'],
		oldValue: ['Regression'],
		newValue: ['Escape', 'New']
	}

}