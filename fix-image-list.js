// 修复图片列表的脚本
// 将这段代码添加到 admin/public/js/admin.js 文件的末尾

// 1. 重写 loadImages 函数，使其正确生成图片列表并绑定事件
window.loadImages = async function(postName) {
    try {
        const response = await fetch(`/api/upload/${encodeURIComponent(postName)}`);
        const data = await response.json();
        
        const imageList = document.getElementById('imageList');
        if (!imageList) {
            console.error('未找到 #imageList 元素');
            return;
        }
        
        if (!data.success || !data.images || data.images.length === 0) {
            imageList.innerHTML = '<p class="empty">暂无图片</p>';
            return;
        }
        
        // 清空现有的内容
        imageList.innerHTML = '';
        
        // 遍历每个图片，创建对应的DOM元素
        data.images.forEach(img => {
            // 创建图片卡片容器
            const card = document.createElement('div');
            card.className = 'image-list-item';
            
            // 创建图片元素
            const imgElement = document.createElement('img');
            imgElement.src = img.path;
            imgElement.alt = img.filename;
            imgElement.onerror = function() {
                this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><rect fill="%23f0f0f0" width="100%" height="100%"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%2399999">图片加载失败</text></svg>';
            };
            card.appendChild(imgElement);
            
            // 创建信息区域
            const info = document.createElement('div');
            info.className = 'image-list-item-info';
            
            // 文件名
            const nameDiv = document.createElement('div');
            nameDiv.className = 'image-list-item-name';
            nameDiv.textContent = img.filename;
            info.appendChild(nameDiv);
            
            // Markdown路径
            const pathDiv = document.createElement('div');
            pathDiv.className = 'image-list-item-path';
            pathDiv.textContent = img.markdown;
            info.appendChild(pathDiv);
            
            card.appendChild(info);
            
            // 创建操作按钮区域
            const actions = document.createElement('div');
            actions.className = 'image-list-item-actions';
            
            // 插入文章按钮
            const insertBtn = document.createElement('button');
            insertBtn.className = 'image-action-btn insert-btn';
            insertBtn.title = '插入到文章';
            insertBtn.innerHTML = '<i class="fas fa-file-alt"></i>';
            insertBtn.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (window.insertImage) {
                    window.insertImage(img.markdown, e);
                } else {
                    console.error('insertImage 函数不存在');
                    showToast('插入图片失败', 'error');
                }
            };
            actions.appendChild(insertBtn);
            
            // 设为封面按钮
            const coverBtn = document.createElement('button');
            coverBtn.className = 'image-action-btn set-cover-btn';
            coverBtn.title = '设为封面';
            coverBtn.innerHTML = '<i class="fas fa-image"></i>';
            coverBtn.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (window.setAsCover) {
                    window.setAsCover(img.path, e);
                } else {
                    console.error('setAsCover 函数不存在');
                    showToast('设为封面失败', 'error');
                }
            };
            actions.appendChild(coverBtn);
            
            // 删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'image-action-btn delete-btn';
            deleteBtn.title = '删除图片';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (window.deleteImage) {
                    window.deleteImage(postName, img.filename, e);
                } else {
                    console.error('deleteImage 函数不存在');
                    showToast('删除图片失败', 'error');
                }
            };
            actions.appendChild(deleteBtn);
            
            card.appendChild(actions);
            imageList.appendChild(card);
        });
        
        console.log('图片列表加载完成，共 ' + data.images.length + ' 张图片');
        
    } catch (error) {
        console.error('加载图片失败:', error);
        const imageList = document.getElementById('imageList');
        if (imageList) {
            imageList.innerHTML = '<p class="empty">加载失败，请刷新重试</p>';
        }
    }
};

// 2. 确保 setAsCover 函数存在且正确
if (!window.setAsCover) {
    window.setAsCover = function(imagePath, event) {
        console.log('setAsCover 被调用，图片路径：', imagePath);
        
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        
        const coverInput = document.getElementById('postCover');
        
        if (!coverInput) {
            console.error('未找到封面输入框 #postCover');
            showToast('未找到封面输入框，无法设置封面', 'error');
            return;
        }
        
        // 设置封面输入框的值
        coverInput.value = imagePath;
        
        // 触发 input 和 change 事件
        coverInput.dispatchEvent(new Event('input', { bubbles: true }));
        coverInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        // 显示成功提示
        showToast('封面设置成功', 'success');
        console.log('封面输入框的值已设置为:', coverInput.value);
    };
}

// 3. 确保 insertImage 函数存在且正确
if (!window.insertImage) {
    window.insertImage = function(markdown, event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        
        // 查找编辑器实例
        if (state.editor && state.editor.codemirror) {
            const cm = state.editor.codemirror;
            const cursor = cm.getCursor();
            
            // 在光标位置插入图片Markdown语法
            cm.replaceRange(`\n![图片描述](${markdown})\n`, cursor);
            
            // 聚焦到编辑器
            cm.focus();
            
            showToast('图片已插入到文章中', 'success');
        } else {
            showToast('未找到编辑器，无法插入图片', 'error');
        }
    };
}

// 4. 确保 deleteImage 函数存在且正确
if (!window.deleteImage) {
    window.deleteImage = function(postName, filename, event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        
        if (!postName || !filename) {
            console.error('缺少必要参数: postName或filename为空');
            showToast('删除图片失败：缺少必要参数', 'error');
            return;
        }
        
        if (!confirm(`确定要删除图片 "${filename}" 吗？\n\n注意：文章中引用此图片的地方需要手动修改。`)) {
            return;
        }
        
        fetch(`/api/upload/${encodeURIComponent(postName)}/${encodeURIComponent(filename)}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(`图片 "${filename}" 删除成功`, 'success');
                // 重新加载图片列表
                window.loadImages(postName);
            } else {
                throw new Error(data.error || '删除失败');
            }
        })
        .catch(error => {
            console.error('删除图片失败:', error);
            showToast(`删除图片失败: ${error.message}`, 'error');
        });
    };
}
