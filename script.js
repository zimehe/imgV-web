// 全局变量
let currentData = null;
let currentProvince = '';
let currentCity = '';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    
    // 监听回车键进行密码验证
    document.getElementById('passwordInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
});

// 加载数据
async function loadData() {
    try {
        // 添加时间戳防止缓存
        const timestamp = new Date().getTime();
        const response = await fetch(`data.json?v=${timestamp}`);
        currentData = await response.json();
        populateProvinces();
    } catch (error) {
        console.error('加载数据失败:', error);
        alert('数据加载失败，请刷新页面重试');
    }
}

// 密码验证
function checkPassword() {
    const password = document.getElementById('passwordInput').value;
    const errorDiv = document.getElementById('passwordError');
    
    if (password === '123456') {
        document.getElementById('passwordModal').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        
        // 自动选择第一个省份
        if (currentData && Object.keys(currentData).length > 0) {
            const firstProvince = Object.keys(currentData)[0];
            document.getElementById('provinceSelect').value = firstProvince;
            onProvinceChange();
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
    const provinceSelect = document.getElementById('provinceSelect');
    provinceSelect.innerHTML = '<option value="">请选择省份</option>';
    
    if (currentData) {
        Object.keys(currentData).forEach(province => {
            const option = document.createElement('option');
            option.value = province;
            option.textContent = province;
            provinceSelect.appendChild(option);
        });
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