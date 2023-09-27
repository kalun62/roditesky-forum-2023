'use strict'

const linkApp = "https://script.google.com/macros/s/AKfycbxVPPlGoXoVfTN2EpqIL2F2uNL2SGKYPnTfRQAAMYPbe7W_AWZgz2I3cPKDy6bxKtBS/exec"
// актуальный день
const today = new Date();
const now = today.toLocaleString();
const currentTimeShtamp = Date.now()

const loader = document.querySelector('.loader')
const courses = document.querySelector('.courses')
const dates = document.querySelector('.dates')
const dateList = document.querySelectorAll('.dates li')
const popupInfoWrap = document.querySelector('.popup-info-wrap')
const popupInfo = document.querySelector('.popup-info')
const popupInfoClose = document.querySelector('.popup-info-close')
const popupCloseBtn = document.querySelector('.popup-close-btn')
const mask = document.querySelector('.mask')


let allButtons
let idPressBtnArr = localStorage.getItem('press') ? JSON.parse(localStorage.getItem('press')) : []
let idPressBtnSpeaker = localStorage.getItem('speaker') ? JSON.parse(localStorage.getItem('speaker')) : ''

let db = []
let clicked = []
let currentDate = 0
let scroll = ''

const id = Date.now()

let userId = ''

	if(localStorage.getItem('user-id')){
		userId = JSON.parse(localStorage.getItem('user-id'))
	}else{
		userId = id
		localStorage.setItem('user-id', id)
	} 


function currentDay(){
	if(currentTimeShtamp > 1695848400000){
		dateList.forEach(day => {
			if(day.classList.contains('current')){ 
				day.classList.remove('current')
			}
			if(day.dataset.day === now.split('.')[0]){
				day.classList.add('current')
			}
		})
	}
}

currentDay()

const getAllCourses = async () => {
	try {
	  const response = await axios.get(linkApp)
	  loader.style.display = 'none'
	  db = response.data.courses
	  clicked = response.data.clicked
	  dbChangeRole()
	  buldCourses(db)
	  btnView()
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

				: `<div id="${item.id}" data-day="${item.date.split(' ')[0]}" class="course_item ${item.date.split(' ')[0] === currentDate? 'current' : ''} ${item.access_btn === 'gray' ? 'speaker' : ''}">
						<p>${item.name}</p>

						${item.access_btn === 'red' || item.access_btn === 'gray' ? `<span class="count"></span>` : ''}
						<div class="course_info_wrap">
							<div class="course_info">
								<div class="date">${item.date}</div>
								<div class="time">${item.time}</div>
								<div class="place">${item.place}</div>
								</div>
							<div class="course_btn_block">
								${item.access_btn === 'green' ? `<span>Подробнее</span>` : ''}

								${item.access_btn === 'yellow' ? `<button data-btn_ids="${item.btn_ids}" class="record-btn">Хочу пойти</button>
																	<span>Подробнее</span>` 
																: ''}

								${item.access_btn === 'red' ? `<button data-btn_ids="${item.btn_ids}" class="record-btn red">Хочу пойти</button>
																	<span>Подробнее</span>` 
																: ''}

								${item.access_btn === 'gray' ? `<button ${currentTimeShtamp < 1696021200000 ? `disabled="disabled"` : ''} data-btn_ids="${item.btn_ids}" class="record-btn gray">Хочу пойти</button>
																<button class="record-btn be-speaker">Стать спикером</button>`
															 : ''}
							</div>	
						</div>
					</div>`
				
		
	})
  }

  function btnView () {
	allButtons = document.querySelectorAll('.record-btn')

	idPressBtnArr.map(item => {
		allButtons.forEach(btn => {
			if(!btn.classList.contains('be-speaker')){
				btn.closest('.course_item').getAttribute('id') === item.split(':')[0]
					? (btn.classList.add('press'), btn.innerText = 'Отменить') : ''
	
				btn.dataset.btn_ids === item.split(':')[1] && !btn.classList.contains('press')
					? btn.setAttribute('disabled', 'disabled') : '';
			}
		})
	})

	allButtons.forEach(btn => {
		if(idPressBtnSpeaker){
			if(btn.classList.contains('be-speaker')){
				btn.setAttribute('disabled', 'disabled')
				btn.previousElementSibling.setAttribute('disabled', 'disabled')
				btn.closest('.course_item').getAttribute('id') == idPressBtnSpeaker
					? (btn.classList.add('active'), btn.innerText = 'Я спикер' ): ''
			}
		}
	})

	countBtn()
	
}

function countBtn() {
	clicked.map(item => {
		allButtons.forEach(btn => {
			if(btn.classList.contains('red') && +item.id === +btn.closest('.course_item').getAttribute('id')){
				btn.closest('.course_item').querySelector('.count').innerHTML = item.count+"/"+ item?.max
				if(item.count >= item.max){
					btn.setAttribute('disabled', 'disabled')
					btn.innerText = 'мест нет'
				}
			}
			if(btn.classList.contains('be-speaker') && +item.id === +btn.closest('.course_item').getAttribute('id')){
				btn.closest('.course_item').querySelector('.count').innerHTML = item.count+"/"+ item?.max
				if(item.count >= item.max){
					btn.setAttribute('disabled', 'disabled')
					btn.innerText = 'Спикеры набраны'
				}
			}
		})
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

	allCourses.forEach(course => {
		const btn = course.querySelector('.course_btn_block .record-btn')
		const beSpeakerBtn = course.querySelector('.course_btn_block .be-speaker')

		btn && btn.addEventListener('click', (e) => record(e, btn))
		beSpeakerBtn && beSpeakerBtn.addEventListener('click', (e) => beSpeaker(e, beSpeakerBtn))
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
			? `<h2>${title}:</h2>${role.map(sp => sp.photo ? `<div class="info-card"><img src="${sp.photo}" alt="foto"><div><h2>${sp.name.split(',')[0]},</h2><span>${sp.name.slice(sp.name.indexOf(",") + 1)}</span></div></div>` 
															: `<div class="info-card"><div><h2>${sp.name.split('&')[0].toUpperCase().trim()},</h2><h2>${sp.name.split('&')[1]}</h2><span class="text">${sp.name.split('&')[2]}</span></div></div>`).join('')}`
			: '';
		}
		
		const moderatorsHTML = generateRoleHTML(currentItem[0]?.moderators, currentItem[0]?.moderators.length > 1 ? 'Модераторы' : 'Модератор');
		const speakersHTML = generateRoleHTML(currentItem[0]?.speakers, currentItem[0]?.speakers.length > 1 ? 'Спикеры' : 'Спикер');
		const leadersHTML = generateRoleHTML(currentItem[0]?.leaders, currentItem[0]?.leaders.length > 1 ? 'Ведущие' : 'Ведущий');
		const expertHTML = generateRoleHTML(currentItem[0]?.expert, currentItem[0]?.expert.length > 1 ? 'Эксперты' : 'Эксперт');
		
		if(item.classList.contains('speaker')){
			popupInfo.innerHTML += `
			<h1>${currentItem[0].name}</h1>
			<p>${currentItem[0].description}</p>
			${moderatorsHTML}${speakersHTML}${leadersHTML}${expertHTML}`
		}else{
			popupInfo.innerHTML += `
			<h1>${currentItem[0].name}</h1>
			<p>${currentItem[0].description}</p>
			${leadersHTML}${speakersHTML}${moderatorsHTML}${expertHTML}`
		}
	
		// if(item.id == 5){
		// 	const text = popupInfo.querySelector('h1').innerText
		// 	const firstHeader = text.split(',')[0]
		// 	const secHeader = document.createElement('h1')
		// 	secHeader.innerText = text.split(',')[1]
		// 	popupInfo.querySelector('h1').innerText = firstHeader

		// 	const h2 = popupInfo.querySelector('h2')
		// 	const infoCards = popupInfo.querySelectorAll('.info-card')
		// 	popupInfo.querySelector('h1').after(h2, infoCards[0], infoCards[1], secHeader)

		// }
	popupInfoWrap.classList.add('active')
	popupInfo.scrollTop = 0;
	mask.classList.add('active')
	document.body.classList.add('no-scroll')
  }

  function beSpeaker(e, item){
	e.preventDefault()
	e.stopPropagation()

	popupInfo.innerHTML = `<div style="text-align:left; margin-bottom:10px;">Требования к выступлению:</div> 
							<ul>
							<li>регламент выступления – 6 минут; </li>
							<li>если предполагается презентация – не более 6 слайдов в формате pptx.</li>
							</ul>
							<form>
								<input type="hidden" placeholder="" name="id_user" value="${userId}">
								<input type="hidden" placeholder="Площадка" name="place" value="${item.closest('.course_item').querySelector('p').innerText}">
								<input autocomplete="off" type="text" placeholder="Фамилия" name="surname">
								<input autocomplete="off" type="text" placeholder="Имя" name="name">
								<input autocomplete="off" type="text" placeholder="Отчество" name="lastname">
								<input autocomplete="off" type="text" placeholder="Регион" name="region">
								<input autocomplete="off" type="text" placeholder="Тема" name="theme">
								<textarea autocomplete="off" type="text" placeholder="Краткая аннотация, 2–3 предложения" name="description"></textarea>
								<button>Отправить</button>
							</form>`
	
	popupInfoWrap.classList.add('active')
	popupCloseBtn.remove()
	mask.classList.add('active')
	document.body.classList.add('no-scroll')
	const form = document.querySelector('form')
	
	form.addEventListener('submit', function(e){
		e.preventDefault()
		const inputs = document.querySelectorAll('input')
		const textarea = document.querySelectorAll('textarea')
		validate(inputs)
		validate(textarea)

		let error = document.querySelector('.error')

		if(!error){
			item.classList.add('active')
			item.innerText = 'Я спикер'

			localStorage.setItem('speaker', item.closest('.course_item').getAttribute('id'))
			
			const formData = new FormData(form)
			axios.post(linkApp, formData)

			popupInfo.innerHTML = `<div class="fin">Спасибо! Ждем вас на площадке!</div>`

			sendClick(userId, item.closest('.course_item').getAttribute('id'))
			getCount()
			setTimeout(() => {
				popupInfoWrap.classList.remove('active')
				mask.classList.remove('active')
				document.body.classList.remove('no-scroll')

				const beSpeakerAllBtn = document.querySelectorAll('.be-speaker')
				beSpeakerAllBtn.forEach(btn => {
					btn.setAttribute('disabled', 'disabled')
					btn.previousElementSibling.setAttribute('disabled', 'disabled')
				})

			},3000)
		}
	})
  }

 
	function validate(items){
		items.forEach(item => {
			(item.value === '')
				? (item.classList.add('error'), errorLabels(item))
				: item.classList.remove('error')
		
			item.addEventListener('focus', () => {
				if(item.nextElementSibling.classList.contains('label')){
					item.nextElementSibling.remove()
				}
				item.classList.remove('error')
			})		
		})	
	}

	function errorLabels(input) {
		let errorLabel = document.createElement('label')
		if(input.classList.contains('error')){
			errorLabel.setAttribute('for', input.name)
			errorLabel.classList.add('label')
			errorLabel.innerHTML = `* Заполните поле`
			if(!input.nextElementSibling.classList.contains('label')){
				input.after(errorLabel)
			}
		}else{
			errorLabel.remove()
		}
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

	const idParentBtn = item.closest('.course_item').getAttribute('id')
	const btn_ids = item.dataset.btn_ids

	const str = idParentBtn + ':' + btn_ids

	if(idPressBtnArr.length < 1){
		idPressBtnArr.push(str)		
	}else{
		const sd = idPressBtnArr.filter(item => item.split(':')[0] === idParentBtn)
	
		if(!sd.length){
			idPressBtnArr.push(str)
		}else{
			const filterIdPressBtnArr = idPressBtnArr.filter(id => id.split(':')[0] != sd[0].split(':')[0])
			idPressBtnArr = filterIdPressBtnArr
		}
	}

	localStorage.setItem('press', JSON.stringify(idPressBtnArr))
	
	sendClick(userId, idParentBtn)
	getCount()
  }


  function sendClick(userId, idCourse){
	const formData = new FormData()
		formData.append('userId' , userId )
		formData.append('idCourse', idCourse)

	axios.post(linkApp, formData)
  }

  const getCount =  async () => {
		try {
			const response = await axios.get(linkApp)
			clicked = response.data.clicked
			countBtn()
		}catch (err) {
			console.error(err)
		}
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
	if(window.innerWidth > 768){
		scroll > 1120 ? dates.classList.add('fixed') : dates.classList.remove('fixed')
	}
	if(window.innerWidth < 767){
		scroll > 331 ? dates.classList.add('fixed') : dates.classList.remove('fixed')
	}
  })
