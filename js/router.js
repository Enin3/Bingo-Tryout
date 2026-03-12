export async function loadTool(name) {
    const container = document.getElementById("tool-container");
    
    // 1. 加载 HTML
    const html = await fetch(`tools/${name}/tool.html`).then(r => r.text());
    container.innerHTML = html;

    // 2. 加载对应的 CSS (如果存在)
    const oldLink = document.getElementById('tool-style');
    if (oldLink) oldLink.remove();
    const link = document.createElement('link');
    link.id = 'tool-style';
    link.rel = 'stylesheet';
    link.href = `tools/${name}/tool.css`;
    document.head.appendChild(link);

    // 3. 动态加载 JS 模块
    // 注意：添加时间戳防止浏览器缓存，方便开发调试
    const module = await import(`../tools/${name}/tool.js?t=${Date.now()}`);
    if (module.init) {
        module.init();
    }
}