(function() {
    document.addEventListener("DOMContentLoaded", () => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const finePointer = window.matchMedia('(any-pointer: fine)');
        const hoverPointer = window.matchMedia('(hover: hover)');

        if (!finePointer.matches && !hoverPointer.matches) {
            return;
        }

        const IDLE_HIDE_DELAY = 900;
        const MAX_CLICK_RINGS = 4;
        const rippleLayer = document.createElement('div');
        const activeRings = [];
        let ticking = false;
        let latestX = -200;
        let latestY = -200;
        let idleTimer = 0;

        rippleLayer.className = 'mouse-ripple-layer';
        rippleLayer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(rippleLayer);

        function showRippleLayer() {
            window.clearTimeout(idleTimer);
            rippleLayer.classList.add('is-visible');
            idleTimer = window.setTimeout(hideRippleLayer, IDLE_HIDE_DELAY);
        }

        function hideRippleLayer() {
            rippleLayer.classList.remove('is-visible');
        }

        function renderPointerPosition() {
            rippleLayer.style.setProperty('--mx', latestX + 'px');
            rippleLayer.style.setProperty('--my', latestY + 'px');
            showRippleLayer();
            ticking = false;
        }

        window.addEventListener('pointermove', (event) => {
            latestX = event.clientX;
            latestY = event.clientY;

            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(renderPointerPosition);
            }
        }, { passive: true });

        document.addEventListener('pointerleave', hideRippleLayer, { passive: true });
        window.addEventListener('blur', hideRippleLayer, { passive: true });

        if (!reduceMotion.matches) {
            window.addEventListener('click', (event) => {
                const ring = document.createElement('div');
                ring.className = 'click-ripple-ring';
                ring.style.left = event.clientX + 'px';
                ring.style.top = event.clientY + 'px';

                activeRings.push(ring);
                document.body.appendChild(ring);

                while (activeRings.length > MAX_CLICK_RINGS) {
                    const oldRing = activeRings.shift();
                    oldRing.remove();
                }

                ring.addEventListener('animationend', () => {
                    const index = activeRings.indexOf(ring);
                    if (index >= 0) {
                        activeRings.splice(index, 1);
                    }
                    ring.remove();
                }, { once: true });
            }, { passive: true });
        }
    });
})();
