//------------------------------------------------------------------------------------------------------------//
//-------------------------------------СЛАЙДЕР С КАРТИНКАМИ ЛАБЫ----------------------------------------------//
//------------------------------------------------------------------------------------------------------------//

// Забрать картинки с сервера
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

//Создание элементов с картинками лабы и добавление их на страницу
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

// Обработчик функции взятия элементов с сервера
fetchImageFilenames()
    .then(filenames => addImagesToSlider(filenames))
    .catch(error => console.error('Error fetching image filenames:', error))
    .finally( ()=>new Sim());

//Логика слайдера
function Sim() {

    this.sldrRoot = document.querySelector('.sim-slider');

    this.sldrList = this.sldrRoot.querySelector('.sim-slider-list');
    this.sldrElements = this.sldrList.querySelectorAll('.sim-slider-element');
    this.sldrElemFirst = this.sldrList.querySelector('.sim-slider-element');
    this.leftArrow = this.sldrRoot.querySelector('.arrow.left');
    this.rightArrow = this.sldrRoot.querySelector('.arrow.right');
    this.indicatorDots = this.sldrRoot.querySelector('div.sim-slider-dots');

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

    that.elemCount = that.sldrElements.length; // Количество элементов

    that.currentElement = 0;
    let bgTime = getTime();

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



//------------------------------------------------------------------------------------------------------------//
//-------------------------------АКТИВНЫЕ ССЫЛКИ ПРИ ПРОКРУТКЕ СТРАНИЦЫ--------------------------------------//
//------------------------------------------------------------------------------------------------------------//

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




//------------------------------------------------------------------------------------------------------------//
//------------------------------ОТПРАВКА ПОЧТЫ НА СЕРВЕР И ВАЛИДАЦИЯ ФОРМ------------------------------------//
//------------------------------------------------------------------------------------------------------------//

// Вспомогательная функция для валидации email
function isValidEmail(email) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    return emailRegex.test(email);
}

let myInputs = document.getElementsByTagName('input');
let myEmails = document.getElementsByName('email');

// Проходим по всем элементам коллекции
for (let i = 0; i < myInputs.length; i++) {
    let currentInput = myInputs[i];

    // Добавляем обработчик события input
    currentInput.addEventListener('focusout', function() {
        checkBlur(currentInput);
    });
}

for (let i = 0; i < myEmails.length; i++) {
    let currentInput = myEmails[i];

    // Добавляем обработчик события input
    currentInput.addEventListener('input', function() {
        isValidEmail(currentInput.value) ? currentInput.classList.remove('inval') : currentInput.classList.add('inval');
    });
}

// Функция для добавления/удаления класса при вводе текста
function checkBlur(input) {
    if (input.value.trim() !== '') {
        input.classList.add('non-empty');
    } else {
        input.classList.remove('non-empty');
    }
}

// Обработчик события submit для верхней формы(отправка на сервер)
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

    for (let i = 0; i < myInputs.length; i++) {
        let currentInput = myInputs[i];
        currentInput.classList.remove('non-empty');
    }

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

                modalContent.classList.add("success-message");
                modalMessage.textContent = 'Ваше письмо отправлено! С вами свяжутся в ближайшее время';
                modal.style.display = "flex";

                // Очищаем поля
                nameInput.value = "";
                emailInput.value = "";
                messageInput.value = "";

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

// Обработчик события submit для нижней формы(отправка на сервер)
document.getElementById("contact-form0").addEventListener("submit", function (e) {
    e.preventDefault();

    const nameInput = document.getElementById("name0");
    const name=nameInput.value;
    const emailInput = document.getElementById("email0");
    const email = emailInput.value;
    const messageInput = document.getElementById("message0");
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

    for (let i = 0; i < myInputs.length; i++) {
        let currentInput = myInputs[i];

        currentInput.classList.remove('non-empty');
    }

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
                modalContent.classList.add("success-message");
                modalMessage.textContent = 'Ваше письмо отправлено! С вами свяжутся в ближайшее время';
                modal.style.display = "flex";

                // Очищаем поля
                nameInput.value = "";
                emailInput.value = "";
                messageInput.value = "";

            } else {
                modalContent.classList.add("error-message");
                modalMessage.textContent = "Ошибка! Нет подключения к сети";
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






//------------------------------------------------------------------------------------------------------------//
//-------------------------------------------ЧТЕНИЕ СТАТЕЙ ИЗ JSON--------------------------------------------//
//------------------------------------------------------------------------------------------------------------//

fetch('data/articles.json')
    .then(response => response.json())
    .then(data => {

        const articleContainer = document.getElementById('articles');

        data.forEach(article => {
            const articleBlock = document.createElement('div');
            articleBlock.classList.add('article');

            const articleImage = document.createElement('img');
            articleImage.src = 'images/atricle.png'; // Set the image source as needed

            const titleDiv = document.createElement('div');
            const articleHead = document.createElement('h3');
            articleHead.classList.add('art_head');


            articleHead.appendChild(articleImage);
            let textNode = document.createTextNode(article.title);
            articleHead.appendChild(textNode);
            titleDiv.appendChild(articleHead);

            const articleText = document.createElement('p');
            articleText.textContent = article.text;
            articleText.classList.add('art_text');

            const articleAvtor = document.createElement('p');
            articleAvtor.textContent = article.avtor;
            articleAvtor.classList.add('art_avtor');

            const readMoreLink = document.createElement('a');
            readMoreLink.href = article.link;
            readMoreLink.classList.add('art_link');

            readMoreLink.appendChild(articleBlock);
            articleBlock.appendChild(articleHead);
            articleBlock.appendChild(articleText);
            articleBlock.appendChild(articleAvtor);

            articleContainer.appendChild(readMoreLink);
        });
    })
    .catch(error => console.error('Error fetching articles:', error));






//------------------------------------------------------------------------------------------------------------//
//----------------------------------------ЧТЕНИЕ преподавателей ИЗ JSON---------------------------------------//
//------------------------------------------------------------------------------------------------------------//

fetch('data/teachers.json')
    .then(response => response.json())
    .then(async data => {

        const instructorContainer = document.getElementById('prep_grid');
        const promises = [];

        for (const instructor of data) {
            const instructorProfile = document.createElement('div');
            instructorProfile.classList.add('prep_item');

            const img_div = document.createElement('div');
            const img = document.createElement('img');
            img.classList.add('avatar');
            img_div.classList.add('avatar_conteiner');
            img_div.appendChild(img);
            img.src = 'images/person.png';

            const imageUrl = `images/teachers/${instructor.image}`;
            const imagePromise = checkImageExists(imageUrl)
                .then(imageExists => {
                    if (imageExists) {
                        img.src = imageUrl;
                    } else {
                        img.src = 'images/person.png';
                    }
                })
                .catch(error => {
                    console.error('Error checking image existence:', error);
                    img.src = 'images/person.png';
                });

            const name = document.createElement('h3');
            name.classList.add('name');
            name.textContent = instructor.name;

            const jobTitle = document.createElement('p');
            jobTitle.classList.add('job_title');
            jobTitle.textContent = instructor.job_title;

            const inf_div= document.createElement('div');
            const info = document.createElement('p');
            inf_div.classList.add('prep_info');
            inf_div.appendChild(info);
            info.textContent = instructor.info;

            instructorProfile.appendChild(img_div);
            instructorProfile.appendChild(name);
            instructorProfile.appendChild(jobTitle);
            instructorProfile.appendChild(inf_div);

            instructorContainer.appendChild(instructorProfile);

            promises.push(imagePromise);
        }

        await Promise.all(promises);
    })
    .catch(error => console.error('Error fetching instructors:', error));





//------------------------------------------------------------------------------------------------------------//
//--------------------------------ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ-ПРОВЕРКА ИЗОБРАЖЕНИЯ--------------------------------//
//------------------------------------------------------------------------------------------------------------//

function checkImageExists(imageUrl) {
    return fetch(imageUrl, { method: 'HEAD' })
        .then(response => {
            return response.ok;
        })
        .catch(error => {
            return false;
        });
}




//------------------------------------------------------------------------------------------------------------//
//-------------------------------------ЗАКРЫТИЕ МЕНЮ В МОБИЛЬНЫХ БРАУЗЕРАХ------------------------------------//
//------------------------------------------------------------------------------------------------------------//

function closeMenu(e){
    if (document.getElementById('side-menu').checked){
        document.getElementById('side-menu').checked=false;
    }

}





//------------------------------------------------------------------------------------------------------------//
//---------------------------------------------ЧТЕНИЕ НОВОСТЕЙ ИЗ JSON----------------------------------------//
//------------------------------------------------------------------------------------------------------------//

fetch('data/news.json')
    .then(response => response.json())
    .then(async data => {

        const sliderWrapper = document.getElementById('sliderWrapper');
        const promises = [];

        for (const news of data) {
            const slide = document.createElement('div');
            slide.classList.add('slide');

            sliderWrapper.appendChild(slide);

            const news_date = document.createElement('p');
            news_date.classList.add('new_date');
            news_date.textContent = news.date;

            slide.appendChild(news_date);

            if (news.image) {
                const imageUrl = `images/news/${news.image}`;
                const imagePromise = checkImageExists(imageUrl)
                    .then(imageExists => {
                        if (imageExists) {
                            const div_img = document.createElement('div');
                            div_img.classList.add('im');
                            const news_img = document.createElement('img');
                            news_img.src= imageUrl;
                            div_img.appendChild(news_img);
                            slide.appendChild(div_img);
                        } else {
                            console.error('Image is not exist');
                        }
                    })
                    .catch(error => {
                        console.error('Error checking image existence:', error);
                    });
                promises.push(imagePromise);
            }

            await Promise.all(promises);

            const news_text = document.createElement('p');
            news_text.classList.add('new_text');
            if(news.link) {
                news_text.classList.add('with');
            }
            news_text.textContent = news.text;


            if (news.link) {
                const news_link = document.createElement('a');
                news_link.href = news.link;
                news_text.appendChild(news_link);
            }

            slide.appendChild(news_text);
        }
    })
    .catch(error => console.error('Error fetching news:', error))
    .finally(()=>{
        updateSlidesPerView();
        createDots();
    });


//------------------------------------------------------------------------------------------------------------//
//------------------------------------------------СЛАЙДЕР НОВОСТЕЙ--------------------------------------------//
//------------------------------------------------------------------------------------------------------------//

let currentSlide = 0;
let slidesPerView = 0;

function updateSlidesPerView() {
    const wrapperWidth = document.querySelector('.slider_wrapper').offsetWidth;
    const slide = document.querySelector('.slide');
    const slideWidth = slide.offsetWidth;

    slidesPerView = Math.max(1, Math.floor((wrapperWidth+20) / slideWidth));
}

function showSlide(index) {
    const slides = document.querySelector('.slider_wrapper');
    const totalSlides = document.querySelectorAll('.slide').length;
    const dots = document.querySelector('.dots');

    if (index >= totalSlides) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = totalSlides - slidesPerView;
    } else {
        currentSlide = index;
    }

    const transformValue = -currentSlide * (100 / slidesPerView) + '%';
    slides.style.transform = 'translateX(' + transformValue + ')';

    // Обновляем активные точки
    const dotElements = Array.from(dots.children);
    dotElements.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide / slidesPerView);
    });
}

function nextSlide() {
    showSlide(currentSlide + slidesPerView);
}

function prevSlide() {
    showSlide(currentSlide - slidesPerView);
}

function createDots() {
    const sliderNav = document.getElementById('sliderNavigation');
    const dotsContainer = document.getElementById('dots');
    const dotElements = Array.from(dotsContainer.children);

    const totalSlides = document.querySelectorAll('.slide').length;
    const dotsNeeded = Math.ceil(totalSlides / slidesPerView);
    if(dotsNeeded<=1){
        dotsContainer.style.display = 'none';
        sliderNav.style.display = 'none';
    } else{
        dotsContainer.style.display = 'flex';
        sliderNav.style.display = 'flex';

        // Удаляем лишние точки
        if (dotsNeeded < dotElements.length) {
            for (let i = dotsNeeded; i < dotElements.length; i++) {
                dotElements[i].remove();
            }
        }

        // Добавляем новые точки при необходимости
        for (let i = dotElements.length; i < dotsNeeded; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.addEventListener('click', () => showSlide(i * slidesPerView));
            dotsContainer.appendChild(dot);
        }
    }

    showSlide(currentSlide);
}

// Обновляем количество видимых слайдов при изменении размера окна
document.addEventListener('DOMContentLoaded', ()=> {
    window.addEventListener('resize', () => {
        updateSlidesPerView();
        createDots();
        console.log('yes');
    });
});