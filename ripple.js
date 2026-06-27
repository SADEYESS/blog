(function() {
    // 极致轻量水波效果：纯 CSS transform + radial-gradient，零 Canvas/SVG 开销
    document.addEventListener("DOMContentLoaded", () => {
        // 创建鼠标跟随的凹陷光晕层
        const rippleLayer = document.createElement('div');
        rippleLayer.className = 'mouse-ripple-layer';
        document.body.appendChild(rippleLayer);

        // 鼠标移动时更新凹陷位置（使用 CSS 变量驱动，GPU 合成）
        let ticking = false;
        window.addEventListener('mousemove', (e) => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                rippleLayer.style.setProperty('--mx', e.clientX + 'px');
                rippleLayer.style.setProperty('--my', e.clientY + 'px');
                rippleLayer.style.opacity = '1';
                ticking = false;
            });
        });

        // 鼠标离开视口时隐藏
        document.addEventListener('mouseleave', () => {
            rippleLayer.style.opacity = '0';
        });

        // 点击时产生扩散涟漪环
        window.addEventListener('click', (e) => {
            const ring = document.createElement('div');
            ring.className = 'click-ripple-ring';
            ring.style.left = e.clientX + 'px';
            ring.style.top = e.clientY + 'px';
            document.body.appendChild(ring);
            ring.addEventListener('animationend', () => ring.remove());
        });
    });
})();
