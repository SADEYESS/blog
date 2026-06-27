(function() {
    let width = 256;
    let height = 256;
    let size = width * height;
    
    let buffer1 = new Int16Array(size);
    let buffer2 = new Int16Array(size);
    
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    let imgData = ctx.createImageData(width, height);
    
    let active = false;
    let feImage = null;
    
    // 初始化或在窗口调整大小时重新计算网格尺寸以适应视口比例
    function resize() {
        const viewportWidth = window.innerWidth || 1;
        const viewportHeight = window.innerHeight || 1;
        
        // 保证水波网格横向格子数为 256，纵向格子数按比例自适应，从而使水波保持圆形
        width = 256;
        height = Math.round(256 * (viewportHeight / viewportWidth));
        size = width * height;
        
        buffer1 = new Int16Array(size);
        buffer2 = new Int16Array(size);
        
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
        imgData = ctx.createImageData(width, height);
        
        updateFilterViewport();
        if (!active) {
            clearDisplacement();
        }
    }
    
    // 更新 SVG feImage 的尺寸与位置，使其刚好覆盖当前的可见视口（防止因页面滚动导致波纹错位或拉伸）
    function updateFilterViewport() {
        if (!feImage) feImage = document.getElementById('fe-image-map');
        if (feImage) {
            feImage.setAttribute('x', window.scrollX);
            feImage.setAttribute('y', window.scrollY);
            feImage.setAttribute('width', window.innerWidth);
            feImage.setAttribute('height', window.innerHeight);
        }
    }
    
    // 渲染无位移的中性灰色贴图
    function clearDisplacement() {
        let data = imgData.data;
        for (let i = 0; i < size; i++) {
            let pixelIndex = i * 4;
            data[pixelIndex] = 128;     // 中性 X 位移
            data[pixelIndex + 1] = 128; // 中性 Y 位移
            data[pixelIndex + 2] = 128; // 蓝色通道无影响
            data[pixelIndex + 3] = 255; // 不透明度
        }
        ctx.putImageData(imgData, 0, 0);
        try {
            const dataURL = canvas.toDataURL('image/png');
            if (feImage) feImage.setAttribute('href', dataURL);
        } catch(e) {
            console.error("Failed to set displacement map:", e);
        }
    }
    
    // 滴入水滴触发波纹
    function drip(x, y, radius, strength) {
        if (x <= radius || x >= width - radius || y <= radius || y >= height - radius) return;
        
        for (let j = -radius; j <= radius; j++) {
            for (let k = -radius; k <= radius; k++) {
                if (k * k + j * j < radius * radius) {
                    let index = (y + j) * width + (x + k);
                    if (index >= 0 && index < size) {
                        buffer1[index] += strength;
                    }
                }
            }
        }
        
        if (!active) {
            active = true;
            requestAnimationFrame(loop);
        }
    }
    
    // 渲染折射高度导数图
    function render() {
        let imgDataData = imgData.data;
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let i = y * width + x;
                
                // 计算 X 与 Y 方向上的波幅斜率
                let dx = buffer1[i - 1] - buffer1[i + 1];
                let dy = buffer1[i - width] - buffer1[i + width];
                
                // 转换为 RGB（以 128 为中性基准，微调乘积系数以获得最佳凹陷手感）
                let r = 128 + (dx >> 1);
                let g = 128 + (dy >> 1);
                
                // 边界裁切
                if (r < 0) r = 0; else if (r > 255) r = 255;
                if (g < 0) g = 0; else if (g > 255) g = 255;
                
                let pixelIndex = i * 4;
                imgDataData[pixelIndex] = r;
                imgDataData[pixelIndex + 1] = g;
                imgDataData[pixelIndex + 2] = 128;
                imgDataData[pixelIndex + 3] = 255;
            }
        }
        ctx.putImageData(imgData, 0, 0);
        try {
            const dataURL = canvas.toDataURL('image/png');
            if (feImage) feImage.setAttribute('href', dataURL);
        } catch(e) {
            console.error("Failed to update displacement map:", e);
        }
    }
    
    // 物理模拟核心循环
    function loop() {
        if (!active) return;
        
        let sum = 0;
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let i = y * width + x;
                // 经典 Hugo Elias 水波传播公式
                buffer2[i] = ((buffer1[i - 1] + buffer1[i + 1] + buffer1[i - width] + buffer1[i + width]) >> 1) - buffer2[i];
                // 阻尼衰减
                buffer2[i] -= buffer2[i] >> 5;
                sum += Math.abs(buffer2[i]);
            }
        }
        
        // 交换缓冲区
        let temp = buffer1;
        buffer1 = buffer2;
        buffer2 = temp;
        
        render();
        
        // 当波动能量接近为 0 时自动休眠，停止占用 CPU 资源
        if (sum < 15) {
            active = false;
            buffer1.fill(0);
            buffer2.fill(0);
            clearDisplacement();
        } else {
            requestAnimationFrame(loop);
        }
    }
    
    // 初始化事件绑定
    document.addEventListener("DOMContentLoaded", () => {
        feImage = document.getElementById('fe-image-map');
        resize();
        
        window.addEventListener('resize', resize);
        window.addEventListener('scroll', updateFilterViewport);
        
        // 鼠标悬停互动（小幅度持续波纹）
        let lastMove = 0;
        window.addEventListener('mousemove', (e) => {
            let now = Date.now();
            if (now - lastMove < 30) return; // 节流防抖，防止事件过于密集
            lastMove = now;
            
            let x = Math.round((e.clientX / window.innerWidth) * (width - 1));
            let y = Math.round((e.clientY / window.innerHeight) * (height - 1));
            drip(x, y, 1, 64);
        });
        
        // 鼠标点击互动（强力向外扩散涟漪）
        window.addEventListener('click', (e) => {
            let x = Math.round((e.clientX / window.innerWidth) * (width - 1));
            let y = Math.round((e.clientY / window.innerHeight) * (height - 1));
            drip(x, y, 4, 384);
        });
        
        // 触摸屏移动互动
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                let touch = e.touches[0];
                let x = Math.round((touch.clientX / window.innerWidth) * (width - 1));
                let y = Math.round((touch.clientY / window.innerHeight) * (height - 1));
                drip(x, y, 1, 64);
            }
        });
    });
})();
