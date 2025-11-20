const MOCKAPI_BASE_URL = 'https://69152bca84e8bd126af8eab4.mockapi.io/v1'; 
const CART_API_URL = `${MOCKAPI_BASE_URL}/carts`; 

const cartContentWrapper = document.querySelector('.cart-content-wrapper');

async function fetchCartItems() {
    try {
        const response = await fetch(CART_API_URL);
        if (!response.ok) throw new Error('Failed to fetch cart items');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function removeItemFromCart(itemId) {
    const DELETE_URL = `${CART_API_URL}/${itemId}`;
    try {
        const response = await fetch(DELETE_URL, { method: 'DELETE' });
        if (response.ok) {
            renderCart(); 
            if (window.opener && window.opener.updateCartCountFromAPI) {
                 window.opener.updateCartCountFromAPI();
            }
            return true; 
        } else {
            alert('Lỗi khi xóa sản phẩm.');
            return false;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function deleteSelectedItems(selectedIds) {
    if (selectedIds.length === 0) {
        alert("Vui lòng chọn ít nhất một sản phẩm để xóa.");
        return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn?`)) {
        return;
    }

    try {
        const deletePromises = selectedIds.map(id => 
            fetch(`${CART_API_URL}/${id}`, { method: 'DELETE' })
        );
        
        await Promise.all(deletePromises);
        
        alert(`Đã xóa thành công ${selectedIds.length} sản phẩm.`);
        renderCart(); 
        if (window.opener && window.opener.updateCartCountFromAPI) {
             window.opener.updateCartCountFromAPI();
        }
    } catch (error) {
        console.error(error);
        alert('Có lỗi xảy ra khi xóa một số sản phẩm. Vui lòng thử lại.');
    }
}

async function updateItemQuantity(itemId, newQuantity) {
    if (newQuantity < 1) return removeItemFromCart(itemId);

    const PUT_URL = `${CART_API_URL}/${itemId}`;
    try {
        const response = await fetch(PUT_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (response.ok) {
            if (window.opener && window.opener.updateCartCountFromAPI) {
                 window.opener.updateCartCountFromAPI();
            }
            return await response.json(); 
        } else {
            alert('Lỗi khi cập nhật số lượng.');
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

function createCartItemUI(item) {
    const priceVN = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    
    return `
        <div class="cart-item" data-item-id="${item.id}">
            <input type="checkbox" class="item-checkbox" data-id="${item.id}"> 
            <img src="./${item.image || 'default.jpg'}" alt="${item.name}" class="item-image">
            <div class="item-details">
                <div class="item-name">${item.name} (${item.options || 'N/A'})</div>
                <div class="item-price">${priceVN(item.price)}</div>
            </div>
            <div class="item-quantity">
                <button class="qty-btn decrease-qty" data-id="${item.id}" data-qty="${item.quantity}">-</button>
                <input type="number" class="qty-input" value="${item.quantity}" min="1" readonly>
                <button class="qty-btn increase-qty" data-id="${item.id}" data-qty="${item.quantity}">+</button>
            </div>
            <button class="remove-item" data-id="${item.id}">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `;
}

function createActionAreaUI(itemsCount) {
    return `
        <div class="cart-action-bar">
            <input type="checkbox" id="select-all-checkbox">
            <label for="select-all-checkbox">Chọn tất cả (${itemsCount})</label>
            
            <button id="delete-selected-btn" class="action-btn delete-btn" disabled>
                <i class="fa-solid fa-trash-can"></i> Xóa các mục đã chọn
            </button>
        </div>
        <hr style="margin-bottom: 20px; border-top: 1px solid #eee;">
    `;
}

function createCartSummaryUI(items) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 15000 : 0; 
    const total = subtotal + shipping;
    const priceVN = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    return `
        <div class="cart-summary">
            <h3>Tóm tắt đơn hàng</h3>
            <div class="summary-line">
                <span>Tổng tiền hàng:</span>
                <span class="subtotal">${priceVN(subtotal)}</span>
            </div>
            <div class="summary-line">
                <span>Phí vận chuyển:</span>
                <span class="shipping-fee">${priceVN(shipping)}</span>
            </div>
            <div class="summary-line total-line">
                <span>Tổng cộng:</span>
                <span class="total-amount">${priceVN(total)}</span>
            </div>
            
            <button class="checkout-btn">Tiến hành Thanh toán</button>
            <a href="gd.html" class="continue-shopping">Tiếp tục mua sắm</a>
        </div>
    `;
}

async function renderCart() {
    cartContentWrapper.innerHTML = '<div style="text-align: center; width: 100%; padding: 50px;">Đang tải Giỏ hàng...</div>';
    const items = await fetchCartItems();
    cartContentWrapper.innerHTML = ''; 

    if (items.length === 0) {
        cartContentWrapper.innerHTML = `<div style="text-align: center; width: 100%; padding: 50px;">
            <i class="fa-solid fa-cart-shopping" style="font-size: 3rem; color: #ddd; margin-bottom: 20px;"></i>
            <p>Giỏ hàng của bạn đang trống.</p>
            <a href="gd.html" style="color: var(--accent-color); margin-top: 10px; display: block;">Bắt đầu mua sắm ngay!</a>
        </div>`;
        return;
    }

    const actionAreaHTML = createActionAreaUI(items.length);
    const itemsHTML = items.map(createCartItemUI).join('');
    const summaryHTML = createCartSummaryUI(items);
    
    const itemsAndActionsHTML = `
        <div class="cart-left-column">
            ${actionAreaHTML}
            <div class="cart-items-container">${itemsHTML}</div>
        </div>
    `;
    
    cartContentWrapper.innerHTML = itemsAndActionsHTML + summaryHTML;

    setupEventListeners();
}

function setupEventListeners() {
    
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    const itemCheckboxes = document.querySelectorAll('.item-checkbox');
    const deleteBtn = document.getElementById('delete-selected-btn');

    function updateDeleteButtonState() {
        const selectedCount = document.querySelectorAll('.item-checkbox:checked').length;
        const totalCount = itemCheckboxes.length;
        
        deleteBtn.disabled = selectedCount === 0;
        deleteBtn.textContent = selectedCount > 0 
            ? `Xóa các mục đã chọn (${selectedCount})` 
            : 'Xóa các mục đã chọn';
        
        selectAllCheckbox.checked = selectedCount === totalCount && totalCount > 0;
    }
    
    selectAllCheckbox.addEventListener('change', (e) => {
        itemCheckboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
        updateDeleteButtonState();
    });

    itemCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateDeleteButtonState);
    });

    deleteBtn.addEventListener('click', () => {
        const selectedIds = Array.from(document.querySelectorAll('.item-checkbox:checked'))
            .map(checkbox => checkbox.getAttribute('data-id'));
            
        deleteSelectedItems(selectedIds);
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.currentTarget.getAttribute('data-id');
            if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                removeItemFromCart(itemId);
            }
        });
    });

    document.querySelectorAll('.qty-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.currentTarget.getAttribute('data-id');
            const itemElement = e.currentTarget.closest('.cart-item');
            const qtyInput = itemElement.querySelector('.qty-input');
            const currentQty = parseInt(qtyInput.value);
            
            let newQty;
            if (e.currentTarget.classList.contains('increase-qty')) {
                newQty = currentQty + 1;
            } else if (e.currentTarget.classList.contains('decrease-qty')) {
                newQty = currentQty - 1;
            }
            
            updateItemQuantity(itemId, newQty).then(() => renderCart()); 
        });
    });

    document.querySelector('.checkout-btn')?.addEventListener('click', () => {
        const selectedIds = Array.from(document.querySelectorAll('.item-checkbox:checked'))
            .map(checkbox => checkbox.getAttribute('data-id'));
            
        if (selectedIds.length === 0) {
            alert('Vui lòng chọn sản phẩm để tiến hành thanh toán.');
            return;
        }
            
        alert(`Tiến hành thanh toán cho ${selectedIds.length} mục đã chọn.`);
    });

    updateDeleteButtonState(); 
}

document.addEventListener('DOMContentLoaded', function() {
    renderCart();
});