function init() {
	// 创建自定义指针元素
	const div = document.createElement('div');
	div.className = 'curzr-arrow-pointer';
	div.hidden = true;
	div.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path class="inner" d="M25,30a5.82,5.82,0,0,1-1.09-.17l-.2-.07-7.36-3.48a.72.72,0,0,0-.35-.08.78.78,0,0,0-.33.07L8.24,29.54a.66.66,0,0,1-.2.06,5.17,5.17,0,0,1-1,.15,3.6,3.6,0,0,1-3.29-5L12.68,4.2a3.59,3.59,0,0,1,6.58,0l9,20.74A3.6,3.6,0,0,1,25,30Z" fill="#F2F5F8" />
      <path class="outer" d="M16,3A2.59,2.59,0,0,1,18.34,4.6l9,20.74A2.59,2.59,0,0,1,25,29a5.42,5.42,0,0,1-.86-.15l-7.37-3.48a1.84,1.84,0,0,0-.77-.17,1.69,1.69,0,0,0-.73.16l-7.4,3.31a5.89,5.89,0,0,1-.79.12,2.59,2.59,0,0,1-2.37-3.62L13.6,4.6A2.58,2.58,0,0,1,16,3m0-2h0A4.58,4.58,0,0,0,11.76,3.8L2.84,24.33A4.58,4.58,0,0,0,7,30.75a6.08,6.08,0,0,0,1.21-.17,1.87,1.87,0,0,0,.4-.13L16,27.18l7.29,3.44a1.64,1.64,0,0,0,.39.14A6.37,6.37,0,0,0,25,31a4.59,4.59,0,0,0,4.21-6.41l-9-20.75A4.62,4.62,0,0,0,16,1Z" fill="#111920" />
    </svg>
  `;
	document.body.appendChild(div);

	class ArrowPointer {
		constructor() {
			this.root = document.body;
			this.cursor = document.querySelector(".curzr-arrow-pointer");

			this.position = {
				pointerX: 0,
				pointerY: 0,
				distanceX: 0,
				distanceY: 0,
			};

			this.previousPointerX = 0;
			this.previousPointerY = 0;

			this.angle = 0;
			this.previousAngle = 0;
			this.angleDisplace = 0;
			this.degrees = 57.296;
			this.cursorSize = 20;

			this.initCursor();
		}

		initCursor() {
			Object.assign(this.cursor.style, {
				boxSizing: 'border-box',
				position: 'fixed',
				top: '0',
				left: '0',
				transform: 'translate(-50%, -50%)',
				zIndex: '2147483647',
				width: `${this.cursorSize}px`,
				height: `${this.cursorSize}px`,
				transition: '250ms, transform 100ms',
				userSelect: 'none',
				pointerEvents: 'none',
				opacity: 1
			});

			setTimeout(() => {
				this.cursor.hidden = false;
			}, 300);
		}

		move(e) {
			this.previousPointerX = this.position.pointerX;
			this.previousPointerY = this.position.pointerY;

			this.position.pointerX = e.pageX;
			this.position.pointerY = e.pageY;

			this.position.distanceX = this.previousPointerX - this.position.pointerX;
			this.position.distanceY = this.previousPointerY - this.position.pointerY;

			const w = this.cursor.offsetWidth;
			const h = this.cursor.offsetHeight;
			this.cursor.style.transform = `translate(${this.position.pointerX - w/2}px, ${this.position.pointerY - h/2}px)`;

			const movedEnough = Math.abs(this.position.distanceX) + Math.abs(this.position.distanceY) > 1;

			if (movedEnough) {
				this.rotate();
			} else {
				this.cursor.style.transform += ` rotate(${this.angleDisplace}deg)`;
			}
		}

		rotate() {
			let unsortedAngle = Math.atan(
				Math.abs(this.position.distanceY) / Math.abs(this.position.distanceX)
			) * this.degrees;

			if (this.position.distanceX <= 0 && this.position.distanceY >= 0)
				this.angle = 90 - unsortedAngle;
			else if (this.position.distanceX < 0 && this.position.distanceY < 0)
				this.angle = unsortedAngle + 90;
			else if (this.position.distanceX >= 0 && this.position.distanceY <= 0)
				this.angle = 270 - unsortedAngle;
			else if (this.position.distanceX > 0 && this.position.distanceY > 0)
				this.angle = unsortedAngle + 270;

			if (!isNaN(this.angle)) {
				if (this.angle - this.previousAngle <= -270)
					this.angleDisplace += 360 + this.angle - this.previousAngle;
				else if (this.angle - this.previousAngle >= 270)
					this.angleDisplace += this.angle - this.previousAngle - 360;
				else this.angleDisplace += this.angle - this.previousAngle;
			}

			this.previousAngle = this.angle;
			this.cursor.style.transform += ` rotate(${this.angleDisplace}deg)`;
		}
	}

	const cursor = new ArrowPointer();

	document.addEventListener("mousemove", e => cursor.move(e));
	document.addEventListener("touchmove", e => cursor.move(e.touches[0]));

	// 🔥 hover pointer 时隐藏
	document.addEventListener('mousemove', (e) => {
		const el = document.elementFromPoint(e.clientX, e.clientY);
		const style = el ? getComputedStyle(el).cursor : null;
		cursor.cursor.style.display = style === 'pointer' ? 'none' : 'block';
	});

	// 🔥 鼠标移出页面隐藏
	window.addEventListener('mouseleave', () => {
		cursor.cursor.style.display = 'none';
	});

	// 🔥 鼠标回页面显示
	window.addEventListener('mouseenter', () => {
		cursor.cursor.style.display = 'block';
	});
}

// DOM 完成后初始化
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}

