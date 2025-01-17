import { Events } from './Events.js'
import { Game } from './Game.js'

export class Explosions
{
    constructor()
    {
        this.game = new Game()

        this.events = new Events()
    }

    explode(coordinates)
    {
        this.events.trigger('explosion', [ coordinates ])
    }
}