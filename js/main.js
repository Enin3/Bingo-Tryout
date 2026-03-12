import { loadTool } from "./router.js";

document.querySelectorAll("#tool-list button").forEach(btn => {
    btn.onclick = () => {
        const tool = btn.dataset.tool;
        console.log("正在加载工具:", tool); // 增加一行日志，方便在控制台排查
        loadTool(tool);
    };
});
