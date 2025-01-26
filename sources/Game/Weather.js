import { Game } from './Game.js'

export class Weather
{
    constructor()
    {
        this.game = Game.getInstance()
        
        this.timestamp = Date.now()

        this.yearFirstDay = new Date(new Date().getFullYear(), 0, 1)
        this.yearProgress = (((this.timestamp - this.yearFirstDay) / (1000 * 60 * 60 * 24)) / 365)
    }
}