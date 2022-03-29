import { loadImaSdk } from "@alugha/ima";
var adsManager;
var adsLoader;
var adDisplayContainer;
var intervalTimer;
var videoContent;
var adsLayer;
var me;
var adsPlayed;

function setUpIMA({url}) {
    // Create the ad display container.
    createAdDisplayContainer();
    // Create ads loader.
    adsLoader = new google.ima.AdsLoader(adDisplayContainer);
    // adsLoader.getSettings().setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.DISABLED);
    adsLoader.getSettings().setNumRedirects(10);
    // adsLoader.getSettings().setAutoPlayAdBreaks(false);
    // Listen and respond to ads loaded and error events.
    adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        onAdsManagerLoaded,
        false);
    adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdError,
        false);

    // An event listener to tell the SDK that our content video
    // is completed so the SDK can play any post-roll ads.
    var contentEndedListener = function () { adsLoader.contentComplete(); };
    videoContent.onended = contentEndedListener;

    // Request video ads.
    var adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = url,
    // adsRequest.adTagUrl = 'https://storage.googleapis.com/gvabox/external_sample/vpaid2jsnonlinear.xml';

    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    // adsRequest.linearAdSlotWidth = 640;
    // adsRequest.linearAdSlotHeight = 400;

    // adsRequest.nonLinearAdSlotWidth = 640;
    // adsRequest.nonLinearAdSlotHeight = 150;

    adsLoader.requestAds(adsRequest);

}


function createAdDisplayContainer() {
    // We assume the adContainer is the DOM id of the element that will house
    // the ads.
    adDisplayContainer = new google.ima.AdDisplayContainer(
        adsLayer, videoContent);
}

function playAds() {
    if (adsPlayed) return;
    adsPlayed = true;
    // Initialize the container. Must be done via a user action on mobile devices.
    // videoContent.load();
    adDisplayContainer.initialize();

    try {
        // Initialize the ads manager. Ad rules playlist will start at this time.
        adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
        // Call play to start showing the ad. Single video and overlay ads will
        // start at this time; the call will be ignored for ad rules.
        adsManager.start();
    } catch (adError) {
        console.log(adError);
        // An error may be thrown if there was a problem with the VAST response.
    }
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
    // Get the ads manager.
    var adsRenderingSettings = new google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = false;
    // videoContent should be set to the content video element.
    adsManager = adsManagerLoadedEvent.getAdsManager(
        videoContent, adsRenderingSettings);

    // Add listeners to the required events.
    adsManager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdError);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        onContentPauseRequested);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        onContentResumeRequested);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        onAdEvent);

    // Listen to any additional events, if necessary.
    adsManager.addEventListener(
        google.ima.AdEvent.Type.LOADED,
        onAdEvent);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.STARTED,
        onAdEvent);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.COMPLETE,
        onAdEvent);

    playAds();
}

function onAdEvent(adEvent) {
    // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
    // don't have ad object associated.
    var ad = adEvent.getAd();
    switch (adEvent.type) {
        case google.ima.AdEvent.Type.LOADED:
            // This is the first event sent for an ad - it is possible to
            // determine whether the ad is a video ad or an overlay.
            if (!ad.isLinear()) {
                // Position AdDisplayContainer correctly for overlay.
                // Use ad.width and ad.height.
                me.play();
            }
            break;
        case google.ima.AdEvent.Type.STARTED:
            // This event indicates the ad has started - the video player
            // can adjust the UI, for example display a pause button and
            // remaining time.
            if (ad.isLinear()) {
                // For a linear ad, a timer can be started to poll for
                // the remaining time.
                intervalTimer = setInterval(
                    function () {
                        var remainingTime = adsManager.getRemainingTime();
                    },
                    300); // every 300ms
            }
            break;
        case google.ima.AdEvent.Type.COMPLETE:
            // This event indicates the ad has finished - the video player
            // can perform appropriate UI actions, such as removing the timer for
            // remaining time detection.
            if (ad.isLinear()) {
                clearInterval(intervalTimer);
            }
            break;
    }
}

function play() {
    adsLayer.style.display = 'none';
    me.controls.style.display = 'flex';
    me.play();
}

function pause() {
    adsLayer.style.display = 'flex';
    me.controls.style.display = 'none';
    me.pause();
}

function onAdError(adErrorEvent) {
    // Handle the error logging.
    console.log(adErrorEvent.getError());
    if (adsManager) adsManager.destroy();
    play();
}

function onContentPauseRequested() {
    pause();
    // This function is where you should setup UI for showing ads (e.g.
    // display ad timer countdown, disable seeking etc.)
    // setupUIForAds();
}

function onContentResumeRequested() {
    play();
    // This function is where you should ensure that your UI is ready
    // to play content. It is the responsibility of the Publisher to
    // implement this function when necessary.
    // setupUIForContent();

}
Object.assign(MediaElementPlayer.prototype, {

    // allows other plugins to all this one
    adsLoaded: false,
	/**
	 * Feature constructor.
	 *
	 * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
	 * @param {MediaElementPlayer} player
	 * @param {HTMLElement} controls
	 * @param {HTMLElement} layers
	 */
    async buildima(player, controls, layers) {
        try {
            await loadImaSdk();
        } catch (e) {
            console.log("SDK could not be loaded. Check your ad blocker!");
            return;
        }
        const t = this;
        const url = t.options.imaAdTagUrl;

        // add layer for ad links and skipping
        player.adsLayer = document.createElement('div');
        player.ads = false;
        player.adsLayer.className = `${t.options.classPrefix}layer ${t.options.classPrefix}overlay ${t.options.classPrefix}ads`;
        me = player;
        var playLayer = layers.querySelector(`.${t.options.classPrefix}overlay-play`);
        // playLayer.style.display = 'none';

        layers.insertBefore(player.adsLayer, playLayer);
        adsLayer = player.adsLayer;
        adsLayer.style.zIndex = 1000;
        adsLayer.style.position = 'relative';
        videoContent = player.domNode;
        if (adsManager) adsManager.destroy();
        if (adsLoader) adsLoader.contentComplete();
        adsManager = null;
        adsLoader = null;
        adDisplayContainer = null;
        intervalTimer = null;
        adsPlayed = false;
        function func() {
            setUpIMA({url});
        }
        setTimeout(func, 500);
    },
});