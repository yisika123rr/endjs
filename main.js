const MOCKAPI_BASE_URL = 'https://69152bca84e8bd126af8eab4.mockapi.io/v1'; 
const CART_API_URL = `${MOCKAPI_BASE_URL}/carts`;

const cartCountElement = document.querySelector('.cart-count'); 

async function addToCartAPI(productId, name, price, quantity = 1, options = 'Hot') {
    try {
        const response = await fetch(CART_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                originalProductId: productId,
                name: name,
                price: price,
                quantity: quantity,
                options: options 
            })
        });

        if (response.ok) {
            alert(`${name} (${options}) đã được thêm vào giỏ hàng.`);
            updateCartCountFromAPI(); 
        } else {
            alert('Không thể thêm sản phẩm. Vui lòng kiểm tra API MockAPI.io.');
        }
    } catch (error) {
        alert('Lỗi kết nối mạng hoặc máy chủ API.');
    }
}

async function updateCartCountFromAPI() {
    try {
        const response = await fetch(CART_API_URL);
        const items = await response.json(); 
        let newTotalCount = 0;
        if (Array.isArray(items)) {
            newTotalCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        }
        if (cartCountElement) {
            cartCountElement.textContent = newTotalCount;
            cartCountElement.style.display = newTotalCount > 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật số lượng giỏ hàng:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    updateCartCountFromAPI(); 

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                const productId = productCard.getAttribute('data-product-id') || 'ITEM_MENU';
                const name = productCard.querySelector('.card-header h4').textContent;
                const priceText = productCard.querySelector('.price-item').textContent;
                const price = parseFloat(priceText.replace(/[^\d.]/g, '')) * 1000;
                addToCartAPI(productId, name, price);
            }
        });
    });

    document.querySelectorAll('.add-to-cart-popular-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                const productId = productCard.getAttribute('data-product-id') || 'ITEM_POPULAR';
                const name = productCard.querySelector('.product-title-new').textContent; 
                const priceText = productCard.querySelector('.price-standalone-new').textContent;
                const price = parseFloat(priceText.replace(/[^\d.]/g, '')) * 1000;
                const activeOption = productCard.querySelector('.temp-btn.active')?.textContent || 'Hot';
                addToCartAPI(productId, name, price, 1, activeOption); 
            }
        });
    });

    document.querySelectorAll('.temp-options').forEach(optionsGroup => {
        optionsGroup.querySelectorAll('.temp-btn').forEach(button => {
            button.addEventListener('click', () => {
                optionsGroup.querySelectorAll('.temp-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    });

    const navLinks = document.querySelectorAll('.navbar a'); 
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href && href.startsWith('#') && href.length > 1) {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    e.preventDefault(); 
                    
                    const header = document.querySelector('.header');
                    const headerHeight = header ? (header.offsetHeight + 20) : 80;

                    navLinks.forEach(item => item.classList.remove('active'));
                    this.classList.add('active');

                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }
        });
    });

    document.querySelectorAll('a[href="#"], .btn-order-now, .btn-about-us').forEach(link => {
        link.addEventListener('click', (e) => {
            if (e.currentTarget.getAttribute('href') === '#') {
                e.preventDefault();
            }
        });
    });

    const searchInput = document.querySelector('.navbar-search-bar input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                alert('Chức năng tìm kiếm đang phát triển...');
            }
        });
    }

    const subscribeForm = document.querySelector('.subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Đăng ký nhận ưu đãi thành công!'); 
        });
    }
});