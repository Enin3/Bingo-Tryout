export function init() {
    // 从全局 Vue 对象解构，确保 Vue 已在 index.html 加载
    const { createApp, ref, computed, watch, onMounted } = Vue;

    const app = createApp({
        components: {
            // 确保 index.html 引入了 vuedraggable
            draggable: window.vuedraggable
        },
        setup() {
            // --- 状态定义 ---
            const gridSize = ref(4);
            const grid = ref([]);
            const tree = ref(JSON.parse(localStorage.getItem('BINGO_TREE')) || [
                { id: 1, name: '阅读任务', type: 'task' },
                { id: 2, name: '代码重构', type: 'task' }
            ]);
            const menu = ref({ show: false, x: 0, y: 0, cellIdx: null });

            // --- 核心逻辑 ---
            const initGrid = () => {
                const count = gridSize.value * gridSize.value;
                const saved = localStorage.getItem(`BINGO_GRID_${gridSize.value}`);
                grid.value = saved ? JSON.parse(saved) : Array(count).fill().map(() => ({ task: null, done: false }));
            };

            // 监听尺寸变化以重置格子
            watch(gridSize, initGrid, { immediate: true });

            const addTask = () => {
                const name = prompt("请输入任务名称:");
                if (name) tree.value.push({ id: Date.now(), name, type: 'task' });
            };

            const addFolder = () => {
                const name = prompt("请输入文件夹名称:");
                if (name) tree.value.push({ id: Date.now(), name, type: 'folder', children: [] });
            };

            const toggleCell = (idx) => {
                if (grid.value[idx]) {
                    grid.value[idx].done = !grid.value[idx].done;
                    if (grid.value[idx].done && window.confetti) window.confetti();
                }
            };

            // 自动保存数据
            watch([tree, grid], () => {
                localStorage.setItem('BINGO_TREE', JSON.stringify(tree.value));
                localStorage.setItem(`BINGO_GRID_${gridSize.value}`, JSON.stringify(grid.value));
            }, { deep: true });

            onMounted(() => {
                setTimeout(() => {
                    const el = document.getElementById('bingo-app');
                    if (el) el.style.opacity = '1';
                }, 100);
            });

            // --- 返回给模板的数据和方法 ---
            return {
                gridSize, grid, tree, menu,
                addTask, addFolder, toggleCell,
                progress: computed(() => {
                    if (!grid.value.length) return 0;
                    const done = grid.value.filter(c => c.done).length;
                    return Math.round((done / grid.value.length) * 100);
                }),
                bingoLines: ref(0),
                heatDays: ref(Array(50).fill({}))
            };
        } // setup 结束
    });

    app.mount('#bingo-app');
}
