function maybeMuteTab(tab) {
	chrome.storage.local.get('muteNewTabs', function(result) {
		const muteNewTabs =
			result.muteNewTabs === undefined ?
				true :
				result.muteNewTabs;
		if(muteNewTabs) {
			console.log("Muting tab:", tab);
			chrome.tabs.update(tab.id, {muted: true});
		} else {
			console.log("Not muting tab:", tab);
		}
	});
}

chrome.tabs.onCreated.addListener(maybeMuteTab);
