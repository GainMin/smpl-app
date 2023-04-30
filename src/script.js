import Api from './scripts/api.js'

var data = []
var lastAction = 'get'

var updateDataEvent;

(async function init(){

    const elementsApi = new Api('/_api/elements')
    const actions = [
        {action: 'update', 'title': 'Переименовать'},
        {action: 'moveforward', 'title': 'Сдвинуть вперед'},
        {action: 'moveback', 'title': 'Сдвинуть назад'},
        {action: 'delete', 'title': 'Удалить'}
    ]

    updateDataEvent = addGlobalListeners(elementsApi, actions);

    document.dispatchEvent(updateDataEvent);
    
})()

function addGlobalListeners(api, actions){

    document.addEventListener("invalidateData", async e => {
        const responce = await api.get()
        const downloaded = await api.get()

        if (lastAction !== 'delete'){
            downloaded.forEach((el, index) => {
                if (data[index]?.id !== el.id){
                    el.showing = true
                }
            })
        }
        console.log(downloaded)
        data = downloaded

        renderData(data);
        addListeners(api, actions);
    });
    

    $(document).on('click', e => {
        if (!$(e.target).closest('.element__options').length){
            $('.element__sub--menu').remove();
        }
    })

    return new Event('invalidateData', { bubbles: true })

}

function renderData(data){
    $('.page--wrapper').html('').append(data.map((el, i) => 
        `<div
            data-id='${el.id}'
            class='element__container${el.showing ? ' showing' : ''}'
            style='background:${el.bg}'
        >
            <div class='element__header'>
                <div class='element__index'>${i + 1}</div>
                <div class='element__options--container'>
                    <button class='element__options'>...</button>
                </div>
            </div>
            ${getElementTitleHTML(el.text)}
        </div>`
    ))

    $('.page--wrapper').append(`
        <div class='element__container add__button--container'>
            <button class='add__button'>
                ${getAddButtonDefaultHTML()}
            </button>
        </div>
    `)
}

function getElementTitleHTML(text){
    return `<div class='element__text'>${text}</div>`
}

function getAddButtonDefaultHTML(){
    return `<span class='big__plus'>+</span> Add element`
}

function getAddButtonFormHTML(){
    return `<input class='add__button--form__input' placeholder='Enter the text'/>`
}

function getElementOptionsHTML($el, options){
    return options
        .map(el => 
            `<button 
                class='element__sub--menu__item'
                action='${el.action}'
                ${
                    el.action === 'moveback' &&
                    $('.element__container').index($el) === 0 ? 'disabled' : ''
                }
                ${
                    el.action === 'moveforward' &&
                    $('.element__container').index($el) === $('.element__container').length - 2 ? 'disabled' : ''
                }
            >
                ${el.title}
            </button>`
        )
        .join('')
}

function addListeners(api, actions){

    $('.element__options').on('click', (e) => {
        e.preventDefault()

        var $element = $(e.target).parents('[data-id]');
        let $textElement =  $element.find('.element__text')
        let val = $textElement.text()

        if ($(e.target).parent().find('.element__sub--menu').length) {
            return $('.element__sub--menu').remove();
        }
        
        $('.element__sub--menu').remove();

        $(e.target).parent('.element__options--container').append(`
            <div class='element__sub--menu'>
                ${getElementOptionsHTML($element, actions)}
            </div>
        `)

        $('.element__sub--menu__item').on('click', async e => {
            e.preventDefault();

            let action = $(e.target).attr('action')

            if (action === 'update'){

                $textElement.html(`<input type='text' autofocus />`);
                $textElement.find('input').val(val).focus();

                return $textElement.find('input').on('blur keydown', async evt => {
                    if (
                        (evt.type === 'keydown' && evt.keyCode === 13) ||
                        evt.type === 'blur'
                    ) {
                        await api.update({
                            id: $element.attr('data-id'),
                            text: $(evt.target).val()
                        })
                        lastAction = 'update'
                        document.dispatchEvent(updateDataEvent);
                    }

                    if ((evt.type === 'keydown' && evt.keyCode === 27)){
                        lastAction = 'get'
                        document.dispatchEvent(updateDataEvent);
                    }
                })
            }

            if (action === 'moveback' || action === 'moveforward'){
                await api.update({
                    id: $element.attr('data-id'),
                    index: action === 'moveback' ? -1 : 1
                })
            }

            if (action === 'delete'){
                await new Promise(res => {
                    $element.addClass('hiding')
                    setTimeout(e => res(true), 300)
                })

                await api.delete({
                    id: $element.attr('data-id')
                })
            }
            
            lastAction = 'delete'
            document.dispatchEvent(updateDataEvent);
        })
    })

    $('.add__button').on('click', evt => {
        evt.preventDefault()

        let $element = $(evt.target).parent();

        $element.html(getAddButtonFormHTML());
        $element.find('input').focus()

        return $element.find('input').on('keydown', async evt => {
            if (evt.type === 'keydown' && evt.keyCode === 13){
                await api.create({
                    text: $(evt.target).val()
                })

                lastAction = 'create'
                document.dispatchEvent(updateDataEvent);
            }

            if ((evt.type === 'keydown' && evt.keyCode === 27)){
                lastAction = 'get'
                document.dispatchEvent(updateDataEvent);
            }
        })


    })
}


