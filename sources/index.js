import { Game } from './Game/Game.js'
import('@dimforge/rapier3d').then(RAPIER =>
{
    window.RAPIER = RAPIER
    window.game = new Game()
})
