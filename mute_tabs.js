"use strict";

function assert(condition, message) {
	if(!condition) {
		throw message || "Assertion failed";
	}
}

function inspect(obj) {
	return JSON.stringify(obj);
}

function orTrue(v) {
	return typeof v === "boolean" ? v : true;
}

const settings = {
	muteNewTabs:           true,
	muteOnOriginChange:    true,
	muteAllTabsOnStartup:  true,
	unmuteOnVolumeControl: true
}

// Populate settings as soon as possible
chrome.storage.local.get(['muteNewTabs', 'muteOnOriginChange', 'muteAllTabsOnStartup', 'unmuteOnVolumeControl'], function(result) {
	settings.muteNewTabs           = orTrue(result.muteNewTabs);
	settings.muteOnOriginChange    = orTrue(result.muteOnOriginChange);
	settings.muteAllTabsOnStartup  = orTrue(result.muteAllTabsOnStartup);
	settings.unmuteOnVolumeControl = orTrue(result.unmuteOnVolumeControl);

	if(settings.muteAllTabsOnStartup) {
		muteAllTabs();
	}
});

function keyChanged(key, newValue) {
	assert(typeof key === "string");
	if(settings.hasOwnProperty(key)) {
		settings[key] = orTrue(newValue);
	}
}

function storageChanged(changes, namespace) {
	for(const key in changes) {
		const storageChange = changes[key];
		console.log(
			`Storage key changed: namespace=${inspect(namespace)} key=${inspect(key)} ` +
			`oldValue=${inspect(storageChange.oldValue)} ` +
			`newValue=${inspect(storageChange.newValue)}`
		);
		keyChanged(key, storageChange.newValue);
	}
}

function muteTab(tabId) {
	assert(Number.isInteger(tabId));
	chrome.tabs.update(tabId, {muted: true});
}

function unmuteTab(tabId) {
	assert(Number.isInteger(tabId));
	chrome.tabs.update(tabId, {muted: false});
}

function muteAllTabs() {
	chrome.tabs.query({}, function(tabs) {
		for(const tab of tabs) {
			muteTab(tab.id);
		}
	});
}

const tabIdToUrl = Object.create(null);

function handleNewTab(tab) {
	const tabId = tab.id;
	console.log(`Tab was created: ${tabId}`);
	// Don't bother to add the tab to tabIdToUrl because tabIdToUrl doesn't
	// reliably know about all tabs (e.g. startup or extension reloaded).
	if(settings.muteNewTabs) {
		muteTab(tabId);
	} else {
		console.log("Not muting because !settings.muteNewTabs");
	}
}

function handleCloseTab(tabId) {
	const url = tabIdToUrl[tabId];
	console.log(`Tab was closed: ${tabId} with URL ${url}`);
	delete tabIdToUrl[tabId];
}

function getOrigin(url) {
	return new URL(url).origin;
}

function navigationCommitted(details) {
	if(details.frameId !== 0) {
		// Ignore navigation in subframes
		return;
	}
	const newUrl = details.url;
	const tabId  = details.tabId;
	assert(Number.isInteger(tabId));
	if(settings.muteOnOriginChange) {
		const oldUrl = tabIdToUrl[tabId];
		const newOrigin =
			oldUrl            === undefined ||
			getOrigin(oldUrl) !== getOrigin(newUrl);
		console.log(`Tab was navigated: ${tabId} from ${oldUrl} to ${newUrl} (${newOrigin ? "new origin" : "same origin"})`);
		if(newOrigin) {
			muteTab(tabId);
		}
	}
	tabIdToUrl[tabId] = newUrl;
}

function messageFromContentScript(request, sender, sendResponse) {
	console.log(`Message from content script: sender=${inspect(sender.url)} request=${inspect(request)}`);
	if(request !== "unmute") {
		return;
	}
	if(!settings.unmuteOnVolumeControl) {
		return;
	}
	const tabId = sender.tab.id;
	assert(Number.isInteger(tabId));
	unmuteTab(tabId);
}

chrome.tabs.onCreated.addListener(handleNewTab);
chrome.tabs.onRemoved.addListener(handleCloseTab);
chrome.webNavigation.onCommitted.addListener(navigationCommitted);
chrome.runtime.onMessage.addListener(messageFromContentScript);
chrome.storage.onChanged.addListener(storageChanged);
