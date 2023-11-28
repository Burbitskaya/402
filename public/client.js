//СЛАЙДЕР С КАРТИНКАМИ ЛАБЫ

// Function to fetch image filenames from the server
function fetchImageFilenames() {
    return fetch('/api/getImageFilenames')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Fetch error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => data.filenames)
        .catch(error => {
            console.error('Error fetching image filenames:', error.message);
            throw error; // Re-throw the error for further handling if needed
        });
}

//function to create and add image elements to the slider
function addImagesToSlider(filenames) {
    const sliderList = document.querySelector('.sim-slider-list');

    filenames.forEach(filename => {
        const imgElement = document.createElement('img');
        imgElement.src = `images/lab/${filename}`; // Assuming the folder structure is correct
        imgElement.alt = filename; // You can set alt text as the filename or customize it

        const listItem = document.createElement('li');
        listItem.classList.add("sim-slider-element");
        listItem.appendChild(imgElement);

        sliderList.appendChild(listItem);
    });
}

// Fetch image filenames and add them to the slider
fetchImageFilenames()
    .then(filenames => addImagesToSlider(filenames))
    .catch(error => console.error('Error fetching image filenames:', error))
    .finally( ()=>new Sim());

function Sim(sldrId) {

    let id = document.getElementById(sldrId);
    if(id) {
        this.sldrRoot = id
    }
    else {
        this.sldrRoot = document.querySelector('.sim-slider')
    };

    // Carousel objects
    this.sldrList = this.sldrRoot.querySelector('.sim-slider-list');
    this.sldrElements = this.sldrList.querySelectorAll('.sim-slider-element');
    this.sldrElemFirst = this.sldrList.querySelector('.sim-slider-element');
    this.leftArrow = this.sldrRoot.querySelector('.arrow.left');
    this.rightArrow = this.sldrRoot.querySelector('.arrow.right');
    this.indicatorDots = this.sldrRoot.querySelector('div.sim-slider-dots');

    // Initialization
    this.options = Sim.defaults;
    Sim.initialize(this)
};

Sim.defaults = {
    loop: true,     // Бесконечное зацикливание слайдера
    auto: true,     // Автоматическое пролистывание
    interval: 5000, // Интервал между пролистыванием элементов (мс)
    arrows: true,   // Пролистывание стрелками
    dots: true      // Индикаторные точки
};

Sim.prototype.elemPrev = function(num) {
    num = num || 1;

    let prevElement = this.currentElement;
    this.currentElement -= num;
    if(this.currentElement < 0) this.currentElement = this.elemCount-1;

    if(!this.options.loop) {
        if(this.currentElement == 0) {
            this.leftArrow.style.display = 'none'
        };
        this.rightArrow.style.display = 'block'
    };

    this.sldrElements[this.currentElement].style.opacity = '1';
    this.sldrElements[prevElement].style.opacity = '0';

    if(this.options.dots) {
        this.dotOn(prevElement); this.dotOff(this.currentElement)
    }
};

Sim.prototype.elemNext = function(num) {
    num = num || 1;

    let prevElement = this.currentElement;
    this.currentElement += num;
    if(this.currentElement >= this.elemCount) this.currentElement = 0;

    if(!this.options.loop) {
        if(this.currentElement == this.elemCount-1) {
            this.rightArrow.style.display = 'none'
        };
        this.leftArrow.style.display = 'block'
    };

    this.sldrElements[this.currentElement].style.opacity = '1';
    this.sldrElements[prevElement].style.opacity = '0';

    if(this.options.dots) {
        this.dotOn(prevElement); this.dotOff(this.currentElement)
    }
};

Sim.prototype.dotOn = function(num) {
    this.indicatorDotsAll[num].style.cssText = 'background-color:var(--blue); opacity:0.6; cursor:pointer;'
};

Sim.prototype.dotOff = function(num) {
    this.indicatorDotsAll[num].style.cssText = 'background-color:var(--blue); cursor:default;'
};

Sim.initialize = function(that) {

    // Constants
    that.elemCount = that.sldrElements.length; // Количество элементов

    // Variables
    that.currentElement = 0;
    let bgTime = getTime();

    // Functions
    function getTime() {
        return new Date().getTime();
    };
    function setAutoScroll() {
        that.autoScroll = setInterval(function() {
            let fnTime = getTime();
            if(fnTime - bgTime + 10 > that.options.interval) {
                bgTime = fnTime; that.elemNext()
            }
        }, that.options.interval)
    };

    // Start initialization
    if(that.elemCount <= 1) {   // Отключить навигацию
        that.options.auto = false; that.options.arrows = false; that.options.dots = false;
        that.leftArrow.style.display = 'none'; that.rightArrow.style.display = 'none'
    };
    if(that.elemCount >= 1) {   // показать первый элемент
        that.sldrElemFirst.style.opacity = '1';
    };

    if(!that.options.loop) {
        that.leftArrow.style.display = 'none';  // отключить левую стрелку
        that.options.auto = false; // отключить автопркрутку
    }
    else if(that.options.auto) {   // инициализация автопрокруки
        setAutoScroll();
        // Остановка прокрутки при наведении мыши на элемент
        that.sldrList.addEventListener('mouseenter', function() {clearInterval(that.autoScroll)}, false);
        that.sldrList.addEventListener('mouseleave', setAutoScroll, false)
    };

    if(that.options.arrows) {  // инициализация стрелок
        that.leftArrow.addEventListener('click', function() {
            let fnTime = getTime();
            if(fnTime - bgTime > 1000) {
                bgTime = fnTime; that.elemPrev()
            }
        }, false);
        that.rightArrow.addEventListener('click', function() {
            let fnTime = getTime();
            if(fnTime - bgTime > 1000) {
                bgTime = fnTime; that.elemNext()
            }
        }, false)
    }
    else {
        that.leftArrow.style.display = 'none'; that.rightArrow.style.display = 'none'
    };

    if(that.options.dots) {  // инициализация индикаторных точек
        let sum = '', diffNum;
        for(let i=0; i<that.elemCount; i++) {
            sum += '<span class="sim-dot"></span>'
        };
        that.indicatorDots.innerHTML = sum;
        that.indicatorDotsAll = that.sldrRoot.querySelectorAll('span.sim-dot');
        // Назначаем точкам обработчик события 'click'
        for(let n=0; n<that.elemCount; n++) {
            that.indicatorDotsAll[n].addEventListener('click', function() {
                diffNum = Math.abs(n - that.currentElement);
                if(n < that.currentElement) {
                    bgTime = getTime(); that.elemPrev(diffNum)
                }
                else if(n > that.currentElement) {
                    bgTime = getTime(); that.elemNext(diffNum)
                }
                // Если n == that.currentElement ничего не делаем
            }, false)
        };
        that.dotOff(0);  // точка[0] выключена, остальные включены
        for(let i=1; i<that.elemCount; i++) {
            that.dotOn(i)
        }
    }
};


//АКТИВНЫЕ ССЫЛКИ ПРИ ПРОКРУТКЕ СТРАНИЦЫ
const menuItems = document.querySelectorAll(".menu a");
const sections = document.querySelectorAll(".anchor");

window.addEventListener("scroll", () => {

    let current = "";

    // Определение активного раздела
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (pageYOffset >= sectionTop -( (sectionHeight<window.innerHeight) ? window.innerHeight/1.3: sectionHeight/5)) {
            current = section.getAttribute("id");
        }
    });

    menuItems.forEach((item) => {
        item.classList.remove("active");

        if (item.getAttribute("href").substring(1) === current) {
            item.classList.add("active");
        }
    });
});


//ОТПРАВКА ПОЧТЫ НА СЕРВЕР И ВАЛИДАЦИЯ ФОРМЫ
const emailInput = document.getElementById("email");

emailInput.addEventListener("focusout", function () {
    const email = emailInput.value;
    // Проверка валидности email
    if (!isValidEmail(email)) {
        emailInput.value = "";
    }
});

// Вспомогательная функция для валидации email
function isValidEmail(email) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    return emailRegex.test(email);
}

document.getElementById("contact-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const nameInput = document.getElementById("name");
    const name=nameInput.value;
    const emailInput = document.getElementById("email");
    const email = emailInput.value;
    const messageInput = document.getElementById("message");
    const message = messageInput.value;

    if(!name){
        nameInput.focus();
        return;
    }

    if (!isValidEmail(email)) {
        emailInput.value = "";
        emailInput.focus();
        return;
    }

    const modal = document.getElementById("myModal");
    const modalMessage = document.getElementById("modalMessage");
    const modalContent = document.getElementById("modalContent");

    fetch("/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Очищаем поля
                nameInput.value = "";
                emailInput.value = "";
                messageInput.value = "";

                modalContent.classList.add("success-message");
                modalMessage.textContent = 'Ваше письмо отправлено! С вами свяжутся в ближайшее время';
                modal.style.display = "flex";

            } else {
                modalContent.classList.add("error-message");
                modalMessage.textContent = "Ошибка!";
                modal.style.display = "flex";
                console.error("Ошибка при отправке данных:", data.error);
            }
        })
        .catch((error) => {
            modalContent.classList.add("error-message");
            modalMessage.textContent = "Ошибка подключения к серверу!";
            modal.style.display = "flex";
            console.error("Ошибка при отправке данных:", error);
        });
});

// Закрывает модальное окно
function closeModal() {
    const modal = document.getElementById("myModal");
    modal.style.display = "none";
}

// Обработчик клика по кнопке закрытия модального окна
document.getElementById("closeModal").addEventListener("click", closeModal);


// ЧТЕНИЕ СТАТЕЙ ИЗ JSON
fetch('articles.json')
    .then(response => response.json())
    .then(data => {
        // Get the container where the articles will be displayed
        const articleContainer = document.getElementById('articles');

        // Loop through the articles and create a block for each
        data.forEach(article => {
            const articleBlock = document.createElement('div');
            articleBlock.classList.add('article');

            const articleHead = document.createElement('div');
            articleHead.classList.add('art_head');

            const imageDiv = document.createElement('div');
            const articleImage = document.createElement('img');
            articleImage.src = 'images/atricle.png'; // Set the image source as needed
            imageDiv.appendChild(articleImage);

            const titleDiv = document.createElement('div');
            const articleTitle = document.createElement('h3');
            articleTitle.textContent = article.title;
            titleDiv.appendChild(articleTitle);

            articleHead.appendChild(imageDiv);
            articleHead.appendChild(titleDiv);

            const articleText = document.createElement('p');
            articleText.textContent = article.text;
            articleText.classList.add('art_text');

            const divLink = document.createElement('div');
            divLink.classList.add('art_div');

            const readMoreLink = document.createElement('a');
            readMoreLink.href = article.link;
            readMoreLink.textContent = 'Читать далее...';
            readMoreLink.classList.add('art_link');

            divLink.appendChild(readMoreLink);
            articleBlock.appendChild(articleHead);
            articleBlock.appendChild(articleText);
            articleBlock.appendChild(divLink);

            articleContainer.appendChild(articleBlock);
        });
    })
    .catch(error => console.error('Error fetching articles:', error));


// ЧТЕНИЕ преподавателей ИЗ JSON
fetch('teachers.json')
    .then(response => response.json())
    .then(async data => {
        // Get the container where the instructor profiles will be displayed
        const instructorContainer = document.getElementById('prep_grid');

        // Loop through the instructors and create a profile for each
        for (const instructor of data) {
            const instructorProfile = document.createElement('div');
            instructorProfile.classList.add('prep_item');
            const promises = [];
            const img = document.createElement('img');
            img.classList.add('avatar');
            img.src = 'images/person.png';

            const imageUrl = `images/teachers/${instructor.image}`;

            const imagePromise = checkImageExists(imageUrl)
                .then(imageExists => {
                    if (imageExists) {
                        img.src = imageUrl;
                    } else {
                        img.src = 'images/person.png'; // Set a placeholder image or handle the missing image case
                    }
                })
                .catch(error => {
                    console.error('Error checking image existence:', error);
                    img.src = 'images/person.png'; // Handle errors by using a placeholder image
                })
                .finally(() => {
                    const name = document.createElement('h3');
                    name.classList.add('name');
                    name.textContent = instructor.name;

                    const jobTitle = document.createElement('p');
                    jobTitle.classList.add('job_title');
                    jobTitle.textContent = instructor.job_title;

                    const info = document.createElement('p');
                    info.classList.add('prep_info');
                    info.textContent = instructor.info;

                    instructorProfile.appendChild(img);
                    instructorProfile.appendChild(name);
                    instructorProfile.appendChild(jobTitle);
                    instructorProfile.appendChild(info);

                    instructorContainer.appendChild(instructorProfile);
                    promises.push(imagePromise);
                });
            await Promise.all(promises);
        };
    })
    .catch(error => console.error('Error fetching instructors:', error));


function checkImageExists(imageUrl) {
    return fetch(imageUrl, { method: 'HEAD' })
        .then(response => {
            return response.ok; // Image exists if the response status is OK (200)
        })
        .catch(error => {
            return false; // Image doesn't exist or there was an error
        });
}

function closeMenu(e){
    if (document.getElementById('side-menu').checked){
        document.getElementById('side-menu').checked=false;
    }

}
