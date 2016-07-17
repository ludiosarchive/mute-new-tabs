function muteTab(tab) {
	console.log("Muting tab:", tab);
	chrome.tabs.update(tab.id, {muted: true});
}

chrome.tabs.onCreated.addListener(muteTab);
