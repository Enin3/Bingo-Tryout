export function init() {
    const { createApp, ref, computed, watch, onMounted } = Vue;

    createApp({
        setup() {
            const gridSize = ref(4);
            const grid = ref([]);
            const doneColor = ref('#10b981'); // 默认完成填色

            // 1. 初始示例数据 (已精简)
            const tree = ref(JSON.parse(localStorage.getItem('BINGO_TREE')) || [
                {
                    id: 'f1', name: '核心目标', type: 'folder', color: '#6366f1', isOpen: true,
                    children: [
                        { id: 't1', name: '继承颜色的任务', type: 'task', weight: 10 },
                        { id: 't2', name: '自定颜色任务', type: 'task', color: '#f59e0b', weight: 20 }
                    ]
                }
            ]);

            // 2. 模拟 Heatmap 数据
            const heatDays = ref(Array.from({ length: 98 }, (_, i) => ({
                level: Math.floor(Math.random() * 5),
                date: i
            })));

            // 3. 核心：颜色继承与数据扁平化算法
            const getTaskFinalColor = (task, parentColor = null) => {
                if (task.color) return task.color; // 任务自定色号优先
                return parentColor || '#94a3b8'; // 继承父级色号，否则默认灰色
            };

            // 4. 矩阵初始化 (包含持久化恢复)
            const initGrid = () => {
                const count = gridSize.value * gridSize.value;
                const saved = localStorage.getItem(`BINGO_GRID_${gridSize.value}`);
                grid.value = saved ? JSON.parse(saved) : Array(count).fill().map(() => ({
                    task: null, done: false, weight: 10
                }));
            };
            watch(gridSize, initGrid, { immediate: true });

            // 5. 交互：创建逻辑
            // 5. 交互：创建逻辑修复
            const addFolder = () => {
                const name = prompt("请输入文件夹名称：");
                if (name) {
                    // 必须确保包含所有模板用到的 key：color, isOpen, children
                    const newFolder = {
                        id: Date.now(),
                        name: name,
                        type: 'folder',
                        color: '#6366f1', // 默认紫色
                        isOpen: true,
                        children: []
                    };
                    tree.value.push(newFolder);
                    console.log("文件夹已创建:", newFolder);
                }
            };

            const addTask = () => {
                const name = prompt("请输入任务名称：");
                if (name) {
                    // 必须确保包含 weight 和默认 color (null 则继承)
                    const newTask = {
                        id: Date.now(),
                        name: name,
                        type: 'task',
                        weight: 10,
                        color: null
                    };
                    tree.value.push(newTask);
                    console.log("任务已创建:", newTask);
                }
            };

            // 6. 交互：拖拽与点击
            const onDragStart = (evt, item, parentColor) => {
                const finalTask = { ...item, finalColor: getTaskFinalColor(item, parentColor) };
                evt.dataTransfer.setData('bingo_task', JSON.stringify(finalTask));
            };

            const onDrop = (evt, idx) => {
                evt.preventDefault();
                const data = evt.dataTransfer.getData('bingo_task');
                if (data) {
                    const task = JSON.parse(data);
                    grid.value[idx].task = task;
                    grid.value[idx].weight = task.weight || 10; // 绑定权重
                }
            };

            const toggleCell = (idx) => {
                if (grid.value[idx].task) {
                    grid.value[idx].done = !grid.value[idx].done;
                    if (grid.value[idx].done && window.confetti) window.confetti();
                }
            };

            // 7. 进度计算 (基于权重的加权平均)
            const progress = computed(() => {
                const activeCells = grid.value.filter(c => c.task);
                const totalWeight = activeCells.reduce((s, c) => s + (Number(c.weight) || 0), 0);
                const doneWeight = activeCells.filter(c => c.done).reduce((s, c) => s + (Number(c.weight) || 0), 0);
                return totalWeight ? Math.round((doneWeight / totalWeight) * 100) : 0;
            });

            // 自动保存
            watch([tree, grid], () => {
                localStorage.setItem('BINGO_TREE', JSON.stringify(tree.value));
                localStorage.setItem(`BINGO_GRID_${gridSize.value}`, JSON.stringify(grid.value));
            }, { deep: true });

            onMounted(() => {
                setTimeout(() => document.getElementById('bingo-app').style.opacity = '1', 100);
            });

            return {
                gridSize, grid, tree, heatDays, doneColor, progress,
                addFolder, addTask, onDragStart, onDrop, toggleCell
            };
        }
    }).mount('#bingo-app');
}
