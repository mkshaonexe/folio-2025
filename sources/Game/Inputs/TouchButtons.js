import { Events } from '../Events.js'

export class TouchButtons
{
    constructor()
    {
        this.events = new Events()
        this.active = false
        this.element = document.querySelector('.js-touch-buttons')
        this.overlay = this.element.querySelector('.js-overlay')

        this.setItems()
    }

    setItems()
    {
        this.items = new Map()
        const buttons = this.element.querySelectorAll('.js-button')

        for(const button of buttons)
        {
            const item = {
                name: button.dataset.name,
                visible: false,
                element: button
            }
            
            this.items.set(item.name, item)

            item.element.addEventListener('click', () =>
            {
                this.events.trigger('click', [ item.name ])
                this.events.trigger(item.name)
            })
        }
    }

    updateItems(list = [])
    {
        let visibleCount = 0

        this.items.forEach((item) =>
        {
            if(list.indexOf(item.name) !== -1)
            {
                if(!item.visible)
                {
                    item.visible = true 
                    item.element.classList.add('is-visible')
                }

                visibleCount++
            }
            else
            {
                if(item.visible)
                {
                    item.visible = false 
                    item.element.classList.remove('is-visible')
                }
            }
        })

        if(visibleCount)
        {
            this.overlay.classList.add('is-visible')
        }
        else
        {
            this.overlay.classList.remove('is-visible')
        }
    }

    activate()
    {
        if(this.active)
            return

        this.active = true
        this.element.classList.add('is-active')
    }

    deactivate()
    {
        if(!this.active)
            return

        this.active = false
        this.element.classList.remove('is-active')
    }
}