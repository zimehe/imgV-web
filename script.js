// 全局变量
let currentData = null;
let currentProvince = '';
let currentCity = '';

// 初始化函数
function initializeApp() {
    console.log('开始初始化应用');
    
    // 加载数据
    loadData();
    
    // 监听回车键进行密码验证
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
        console.log('密码输入框事件监听器已添加');
    } else {
        console.error('未找到密码输入框');
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // 如果DOM已经加载完成，直接初始化
    initializeApp();
}

// 加载数据
async function loadData() {
    try {
        // 检查是否在file://协议下运行
        if (window.location.protocol === 'file:') {
            console.warn('检测到使用file://协议，可能会有CORS问题');
            alert('检测到您直接打开了HTML文件。\n\n为了正常加载数据，请使用以下方式之一：\n\n1. 使用HTTP服务器（推荐）：\n   - 在命令行中运行：python -m http.server 8000\n   - 然后访问：http://localhost:8000\n\n2. 或者使用其他本地服务器工具\n\n如果您已经在使用HTTP服务器，请忽略此提示。');
        }
        
        // 添加时间戳防止缓存
        const timestamp = new Date().getTime();
        const response = await fetch(`data.json?v=${timestamp}`);
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        if (!text.trim()) {
            throw new Error('数据文件为空');
        }
        
        try {
            currentData = JSON.parse(text);
        } catch (parseError) {
            throw new Error(`JSON解析错误: ${parseError.message}`);
        }
        
        if (!currentData || Object.keys(currentData).length === 0) {
            throw new Error('数据文件内容为空或格式不正确');
        }
        
        populateProvinces();
        console.log('数据加载成功！');
        
    } catch (error) {
        console.error('加载数据失败:', error);
        
        let errorMessage = '数据加载失败：\n\n';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage += '网络请求失败，可能原因：\n';
            errorMessage += '1. 您可能直接打开了HTML文件（file://协议）\n';
            errorMessage += '2. 请使用HTTP服务器运行此应用\n';
            errorMessage += '3. 在命令行运行：python -m http.server 8000\n';
            errorMessage += '4. 然后访问：http://localhost:8000\n\n';
        } else if (error.message.includes('HTTP错误')) {
            errorMessage += `服务器错误：${error.message}\n`;
        } else if (error.message.includes('JSON解析错误')) {
            errorMessage += `数据格式错误：${error.message}\n`;
        } else {
            errorMessage += `未知错误：${error.message}\n`;
        }
        
        errorMessage += '\n请检查控制台获取更多详细信息。';
        alert(errorMessage);
    }
}

// 密码验证
function checkPassword() {
    const password = document.getElementById('passwordInput').value;
    const errorDiv = document.getElementById('passwordError');
    
    console.log('输入的密码:', password);
    console.log('当前数据状态:', currentData ? '已加载' : '未加载');
    
    if (password === '123456') {
        document.getElementById('passwordModal').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        
        // 自动选择第一个省份
        if (currentData && Object.keys(currentData).length > 0) {
            const firstProvince = Object.keys(currentData)[0];
            console.log('自动选择第一个省份:', firstProvince);
            document.getElementById('provinceSelect').value = firstProvince;
            onProvinceChange();
        } else {
            console.log('数据未加载或为空，尝试重新加载');
            loadData();
        }
    } else {
        errorDiv.textContent = '密码错误，请重试';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
    }
}

// 退出登录
function logout() {
    document.getElementById('passwordModal').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordError').textContent = '';
    
    // 重置选择状态
    currentProvince = '';
    currentCity = '';
    document.getElementById('provinceSelect').value = '';
    document.getElementById('cityButtons').innerHTML = '';
    document.getElementById('imageGrid').innerHTML = '';
    document.getElementById('emptyState').style.display = 'block';
}

// 填充省份选择器
function populateProvinces() {
    console.log('开始填充省份选择器');
    const provinceSelect = document.getElementById('provinceSelect');
    
    if (!provinceSelect) {
        console.error('未找到省份选择器元素');
        return;
    }
    
    provinceSelect.innerHTML = '<option value="">请选择省份</option>';
    
    if (currentData) {
        const provinces = Object.keys(currentData);
        console.log('找到省份数据:', provinces);
        
        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province;
            option.textContent = province;
            provinceSelect.appendChild(option);
        });
        
        console.log('省份选择器填充完成，共', provinces.length, '个省份');
    } else {
        console.error('currentData为空，无法填充省份');
    }
}

// 省份选择变化
function onProvinceChange() {
    const provinceSelect = document.getElementById('provinceSelect');
    currentProvince = provinceSelect.value;
    
    if (currentProvince) {
        populateCities();
        document.getElementById('emptyState').style.display = 'none';
    } else {
        document.getElementById('cityButtons').innerHTML = '';
        document.getElementById('imageGrid').innerHTML = '';
        document.getElementById('emptyState').style.display = 'block';
        currentCity = '';
    }
}

// 填充城市按钮
function populateCities() {
    const cityButtons = document.getElementById('cityButtons');
    cityButtons.innerHTML = '';
    
    if (currentData && currentData[currentProvince]) {
        const cities = Object.keys(currentData[currentProvince]);
        cities.forEach((city, index) => {
            const button = document.createElement('button');
            button.className = 'city-btn';
            button.textContent = city;
            button.onclick = () => selectCity(city);
            cityButtons.appendChild(button);
        });
        
        // 自动选择第一个城市
        if (cities.length > 0) {
            selectCity(cities[0]);
        }
    }
}

// 选择城市
function selectCity(city) {
    currentCity = city;
    
    // 更新按钮状态
    const cityButtons = document.querySelectorAll('.city-btn');
    cityButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === city) {
            btn.classList.add('active');
        }
    });
    
    // 显示景点
    displayAttractions();
}

// 显示景点
function displayAttractions() {
    const imageGrid = document.getElementById('imageGrid');
    imageGrid.innerHTML = '';
    
    if (currentData && currentData[currentProvince] && currentData[currentProvince][currentCity]) {
        const attractions = currentData[currentProvince][currentCity];
        
        attractions.forEach(attraction => {
            const card = createAttractionCard(attraction);
            imageGrid.appendChild(card);
        });
        
        document.getElementById('emptyState').style.display = 'none';
    } else {
        document.getElementById('emptyState').style.display = 'block';
    }
}

// 创建景点卡片
function createAttractionCard(attraction) {
    const card = document.createElement('div');
    card.className = 'image-card';
    card.onclick = () => showDetail(attraction);
    
    // 使用第一张图片作为封面
    const coverImage = attraction.images && attraction.images.length > 0 ? attraction.images[0] : '';
    
    card.innerHTML = `
        <img src="${coverImage}" alt="${attraction.name}" onerror="this.src='https://via.placeholder.com/300x200?text=暂无图片'">
        <div class="image-card-content">
            <h3>${attraction.name}</h3>
            <p>${attraction.description || '暂无描述'}</p>
        </div>
    `;
    
    return card;
}

// 显示详情
function showDetail(attraction) {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    
    let imagesHtml = '';
    if (attraction.images && attraction.images.length > 0) {
        imagesHtml = `
            <div class="detail-images">
                ${attraction.images.map(img => `
                    <img src="${img}" alt="${attraction.name}" onerror="this.src='https://via.placeholder.com/300x200?text=暂无图片'">
                `).join('')}
            </div>
        `;
    }
    
    let videosHtml = '';
    if (attraction.videos && attraction.videos.length > 0) {
        videosHtml = `
            <div class="detail-videos">
                <h3>相关视频</h3>
                ${attraction.videos.map(video => `
                    <video controls>
                        <source src="${video}" type="video/mp4">
                        您的浏览器不支持视频播放。
                    </video>
                `).join('')}
            </div>
        `;
    }
    
    content.innerHTML = `
        <div class="detail-content">
            <h2>${attraction.name}</h2>
            ${imagesHtml}
            <div class="detail-description">
                <p>${attraction.detailDescription || attraction.description || '暂无详细描述'}</p>
            </div>
            ${videosHtml}
        </div>
    `;
    
    modal.style.display = 'flex';
}

// 关闭详情模态框
function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const passwordModal = document.getElementById('passwordModal');
    const detailModal = document.getElementById('detailModal');
    
    if (event.target === passwordModal) {
        // 密码模态框不允许点击外部关闭
        return;
    }
    
    if (event.target === detailModal) {
        closeDetailModal();
    }
} 