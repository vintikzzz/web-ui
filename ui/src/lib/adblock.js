export function checkAdBlock() {
    return new Promise((resolve, reject) => {
        let adBlockEnabled = false;
        let testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        document.body.appendChild(testAd);
        setTimeout(function() {
            if (testAd.offsetHeight === 0) {
                adBlockEnabled = true;
            }
            testAd.remove();
            resolve(adBlockEnabled);
        }, 100);
    });
};
