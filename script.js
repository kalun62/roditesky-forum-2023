'use strict'

const linkApp = "https://script.google.com/macros/s/AKfycbxVPPlGoXoVfTN2EpqIL2F2uNL2SGKYPnTfRQAAMYPbe7W_AWZgz2I3cPKDy6bxKtBS/exec"
// актуальный день
const today = new Date();
const now = today.toLocaleString();


const loader = document.querySelector('.loader')
const courses = document.querySelector('.courses')
const dates = document.querySelector('.dates')
const dateList = document.querySelectorAll('.dates li')
const popupInfoWrap = document.querySelector('.popup-info-wrap')
const popupInfo = document.querySelector('.popup-info')
const popupInfoClose = document.querySelector('.popup-info-close')
const popupCloseBtn = document.querySelector('.popup-close-btn')
const mask = document.querySelector('.mask')

let db = []
let currentDate = 0
let scroll = ''

// function currentDay(){
// 	dateList.forEach(day => {
// 		if(day.classList.contains('current')){  // =======================доделать чтобы не работало до нужной даты=============================
// 			day.classList.remove('current')
// 		}
// 		if(day.dataset.day === now.split('.')[0]){
// 			day.classList.add('current')
// 		}
// 	})
// }

const getAllCourses = async () => {
	try {
	  const response = await axios.get(linkApp)
	  loader.style.display = 'none'
	  db = response.data.courses
	  buldCourses(db)
	  dbChangeRole()
	  clickOnCourse()
	} catch (err) {
	  console.error(err)
	}
  }
  getAllCourses()


  
dateList.forEach(date => {
	date.addEventListener('click', (e) => clickHandlerDate(date, date.dataset.day, e))
	if(date.classList.contains('current')){
		currentDate = date.dataset.day
	}
	return
})

  function buldCourses(arr){
	arr.map(item => {
		courses.innerHTML+= 
			item.header 
				? `<div data-day="${item.date.split(' ')[0]}" class="course_header ${item.date.split(' ')[0] === currentDate? 'current' : ''}">
						<h1>${item.header}</h1>
						${item.description && `<p>${item.description}</p>`}
					</div>`

				: `<div id="${item.id}" data-day="${item.date.split(' ')[0]}" class="course_item ${item.date.split(' ')[0] === currentDate? 'current' : ''}">
						<p>${item.name}</p>
						<div class="course_info_wrap">
							<div class="course_info">
								<div class="date">${item.date}</div>
								<div class="time">${item.time}</div>
								<div class="place">${item.place}</div>
								</div>
							<div class="course_btn_block">
								${item.access_btn === 'yellow' ? `<button data-btn_ids="${item.btn_ids}" class="record-btn">Хочу пойти</button>
																	<span>Подробнее</span>` 
																: ''}
								${item.access_btn === 'red' ? `<button data-btn_ids="${item.btn_ids}" class="record-btn">Хочу пойти</button>
																	<span>Подробнее</span>` 
																: ''}
								${item.access_btn === 'gray' ? `<button data-btn_ids="${item.btn_ids}" class="record-btn">Хочу пойти</button>
																<button class="record-btn be-speaker">Хочу быть спикером</button>`
															 : ''}
								
							</div>	
						</div>
					</div>`
				
		
	})
  }

  function clickHandlerDate(item, day, e) {
	e.preventDefault()
	const allCourses = document.querySelectorAll('.course_item')

	const allCourseHeader = document.querySelectorAll('.course_header')

	dateList.forEach(date => date.classList.remove('current'))

	item.classList.add('current')

	allCourseHeader.forEach(header => {
		if(header.dataset.day === day){
			header.classList.add('current')
		}else{
			header.classList.contains('current') ? header.classList.remove('current') : ''
		}
	})

	allCourses.forEach(course => {
		if(course.dataset.day === day){
			course.classList.add('current')
		}else{
			course.classList.contains('current') ? course.classList.remove('current') : ''
		}
	})

	if(scroll > 107)
		window.scrollTo({
            top: 108,
            behavior: 'smooth'
        });
  }

  function clickOnCourse(){
	const allCourses = document.querySelectorAll('.course_item')
	console.log(allCourses);
	allCourses.forEach(course => {
		const btn = course.querySelector('.course_btn_block button')
		btn && btn.addEventListener('click', (e) => record(e, btn))
		course.addEventListener('click', () => clickHandlerCourseInfo(course))
	})
  }

  function dbChangeRole(){
	
	db.map(item => {
		const processArray = (array, role) => {
		  if (array) {
			const infoArray = array.map(sp => ({
			  name: sp.split('#')[1],
			  photo: sp.split('#')[0]
			}));
			item[role] = infoArray;
		  }
		};
	  
		const speakers = item?.speakers ? item.speakers.split(';') : '';
		const moderators = item?.moderators ? item.moderators.split(';') : '';
		const leaders = item?.leaders ? item.leaders.split(';') : '';
		const expert = item?.expert ? item.expert.split(';') : '';
	  
		processArray(speakers, 'speakers');
		processArray(moderators, 'moderators');
		processArray(leaders, 'leaders');
		processArray(expert, 'expert');
	  });
	  
  }

  function clickHandlerCourseInfo(item){
	  const currentItem = db.filter(course => +course.id === +item.getAttribute('id'))
	  function generateRoleHTML(role, title) {
		  return role
			? `<h2>${title}:</h2>${role.map(sp => sp.photo ? `<img src="${sp.photo}" alt="foto"><div>${sp.name}</div>` 
															: `<div>${sp.name}</div>`).join('')}`
			: '';
		}
		
		const moderatorsHTML = generateRoleHTML(currentItem[0]?.moderators, 'Модератор');
		const speakersHTML = generateRoleHTML(currentItem[0]?.speakers,'Спикеры');
		const leadersHTML = generateRoleHTML(currentItem[0]?.leaders,'Ведущий');
		const expertHTML = generateRoleHTML(currentItem[0]?.expert,'Эксперт');
	
	popupInfo.innerHTML += `
		<h1>${currentItem[0].name}</h1>
		<p>${currentItem[0].description}</p>
		
		${moderatorsHTML}${speakersHTML}${leadersHTML}${expertHTML}`
	  
	  
	popupInfoWrap.classList.add('active')
	mask.classList.add('active')
	document.body.classList.add('no-scroll')
  }

  function record(e, item){
	e.preventDefault()
	e.stopPropagation()
	
	item.classList.toggle('press')

	const allBtnIds = document.querySelectorAll('.record-btn')

	allBtnIds.forEach(btn => {
		if(btn.dataset.btn_ids === item.dataset.btn_ids){
			if(!item.classList.contains('press')){
				btn.removeAttribute('disabled')
				item.innerText = 'Хочу пойти'
			}else{
				item.innerText = 'Отменить'
				btn.setAttribute('disabled', 'disabled')
			}
		}
	})
	item.removeAttribute('disabled')

	// отправка кликов
  }

  popupInfoClose.addEventListener('click', () => {
	popupInfoWrap.classList.remove('active')
	popupInfo.innerHTML = ''
	mask.classList.remove('active')
	document.body.classList.remove('no-scroll')
  })

  popupCloseBtn.addEventListener('click', () => popupInfoClose.click() )

  window.addEventListener('scroll', () => {
	scroll = scrollY
	scroll > 107 ? dates.classList.add('fixed') : dates.classList.remove('fixed')
  })
